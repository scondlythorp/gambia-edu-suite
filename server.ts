import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { db } from './src/server/db';
import {
  Student, Parent, Teacher, AttendanceRecord, ResultMark, Payment,
  Expense, OnlineApplication, Announcement, AuditLog, School, User, PromotionRecord
} from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'edumanage_secret_key_2026';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Request logger middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Helper for audit logging
  const logAudit = (schoolId: string, userName: string, userRole: string, action: string, entity: string, details: string, req: Request, entityId?: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      schoolId: schoolId || 'SCH-001',
      userName: userName || 'System User',
      userRole: userRole || 'GUEST',
      action,
      entity,
      entityId,
      timestamp: new Date().toISOString(),
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
      details
    };
    db.auditLogs.unshift(newLog);
  };

  // Auth Middleware
  const authenticateToken = (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      (req as any).user = decoded;
      next();
    } catch (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  };

  // --------------------------------------------------------------------------
  // AUTHENTICATION API ROUTES
  // --------------------------------------------------------------------------
  app.post('/api/auth/login', (req, res) => {
    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // If role specified, try finding by role
      if (role) {
        user = db.users.find(u => u.role === role);
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'Account not found. Please check credentials or select a demo role.' });
    }

    const school = db.schools.find(s => s.id === user?.schoolId) || db.schools[0];
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        fullName: user.fullName,
        studentId: user.studentId,
        parentId: user.parentId,
        teacherId: user.teacherId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logAudit(user.schoolId, user.fullName, user.role, 'USER_LOGIN', 'User', `User logged in from login portal.`, req, user.id);

    return res.json({
      token,
      user,
      school
    });
  });

  app.get('/api/auth/me', authenticateToken, (req, res) => {
    const decoded = (req as any).user;
    const user = db.users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const school = db.schools.find(s => s.id === user.schoolId) || db.schools[0];
    return res.json({ user, school });
  });

  // --------------------------------------------------------------------------
  // SCHOOLS API
  // --------------------------------------------------------------------------
  app.get('/api/schools', (req, res) => {
    res.json(db.schools);
  });

  app.get('/api/schools/:id', (req, res) => {
    const school = db.schools.find(s => s.id === req.params.id);
    if (!school) return res.status(404).json({ error: 'School not found' });
    res.json(school);
  });

  app.put('/api/schools/:id', authenticateToken, (req, res) => {
    const idx = db.schools.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'School not found' });
    db.schools[idx] = { ...db.schools[idx], ...req.body };
    const user = (req as any).user;
    logAudit(db.schools[idx].id, user.fullName, user.role, 'SCHOOL_UPDATE', 'School', `Updated school details for ${db.schools[idx].name}`, req, req.params.id);
    res.json(db.schools[idx]);
  });

  // --------------------------------------------------------------------------
  // USERS API
  // --------------------------------------------------------------------------
  app.get('/api/users', authenticateToken, (req, res) => {
    const user = (req as any).user;
    let list = db.users;
    if (user.role !== 'SUPER_ADMIN') {
      list = list.filter(u => u.schoolId === user.schoolId);
    }
    res.json(list);
  });

  app.post('/api/users', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const newUser: User = {
      id: `USR-${Date.now()}`,
      schoolId: req.body.schoolId || currentUser.schoolId,
      email: req.body.email,
      fullName: req.body.fullName,
      role: req.body.role || 'TEACHER',
      phone: req.body.phone,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    db.users.unshift(newUser);
    logAudit(newUser.schoolId, currentUser.fullName, currentUser.role, 'USER_CREATE', 'User', `Created user account ${newUser.email}`, req, newUser.id);
    res.status(201).json(newUser);
  });

  // --------------------------------------------------------------------------
  // STUDENTS API
  // --------------------------------------------------------------------------
  app.get('/api/students', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    let list = db.students.filter(s => s.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN');

    // Filter by parent if PARENT role
    if (currentUser.role === 'PARENT' && currentUser.parentId) {
      const parent = db.parents.find(p => p.id === currentUser.parentId);
      if (parent) {
        list = list.filter(s => parent.childrenIds.includes(s.id));
      }
    } else if (currentUser.role === 'STUDENT' && currentUser.studentId) {
      list = list.filter(s => s.id === currentUser.studentId);
    }

    const { search, classId, status } = req.query;
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(s => s.fullName.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q));
    }
    if (classId) {
      list = list.filter(s => s.classId === String(classId));
    }
    if (status) {
      list = list.filter(s => s.status === String(status));
    }

    res.json(list);
  });

  app.get('/api/students/:id', authenticateToken, (req, res) => {
    const student = db.students.find(s => s.id === req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  });

  app.post('/api/students', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const stdNo = req.body.studentNumber || req.body.admissionNo || `STU-2026-000${db.students.length + 1}`;
    const newStudent: Student = {
      id: `STD-${Date.now()}`,
      schoolId: currentUser.schoolId,
      studentNumber: stdNo,
      admissionNo: stdNo,
      firstName: req.body.firstName,
      middleName: req.body.middleName || '',
      lastName: req.body.lastName,
      fullName: `${req.body.firstName} ${req.body.middleName ? req.body.middleName + ' ' : ''}${req.body.lastName}`,
      gender: req.body.gender || 'MALE',
      dateOfBirth: req.body.dateOfBirth || '2010-01-01',
      photo: req.body.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      address: req.body.address || '',
      nationality: req.body.nationality || 'Gambian',
      classId: req.body.classId,
      className: req.body.className || 'Grade 10 Science A',
      section: req.body.section || 'A',
      parentId: req.body.parentId || 'PAR-001',
      parentName: req.body.parentName || 'Alhagie Touray',
      parentPhone: req.body.parentPhone || '+220 7712345',
      admissionDate: new Date().toISOString().split('T')[0],
      academicYear: '2026/2027',
      status: 'ACTIVE'
    };
    db.students.unshift(newStudent);
    logAudit(currentUser.schoolId, currentUser.fullName, currentUser.role, 'STUDENT_CREATE', 'Student', `Admitted new student ${newStudent.fullName} (${newStudent.studentNumber})`, req, newStudent.id);
    res.status(201).json(newStudent);
  });

  // --------------------------------------------------------------------------
  // PROMOTION & GRADUATION ENDPOINTS
  // --------------------------------------------------------------------------
  app.post('/api/students/promote', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    if (currentUser.role !== 'SCHOOL_ADMIN' && currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'PRINCIPAL' && currentUser.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Permission denied: Only Teachers, Principals, and Admins can process promotions.' });
    }

    const { promotions } = req.body; // Array of { studentId, targetClassId, action: 'PROMOTE' | 'RETAIN' | 'REVIEW' | 'GRADUATE', academicYear, reason }
    if (!Array.isArray(promotions)) {
      return res.status(400).json({ error: 'Invalid promotions list' });
    }

    const processedHistory: PromotionRecord[] = [];

    promotions.forEach((p: any) => {
      const student = db.students.find(s => s.id === p.studentId && (s.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN'));
      if (!student) return;

      const previousClass = db.classes.find(c => c.id === student.classId);
      const targetClass = p.targetClassId ? db.classes.find(c => c.id === p.targetClassId) : null;

      let newStatus: 'PROMOTED' | 'RETAINED' | 'GRADUATED' = 'PROMOTED';

      if (p.action === 'GRADUATE' || (previousClass && previousClass.name.includes('Grade 12') && p.action !== 'RETAIN' && p.action !== 'REVIEW')) {
        student.status = 'GRADUATED';
        newStatus = 'GRADUATED';
      } else if (p.action === 'RETAIN' || p.action === 'REPEAT') {
        newStatus = 'RETAINED';
      } else if (p.action === 'REVIEW') {
        newStatus = 'RETAINED'; // Pending review
      } else if (targetClass) {
        student.classId = targetClass.id;
        student.className = `${targetClass.name} (${targetClass.section})`;
        student.section = targetClass.section;
        student.status = 'ACTIVE';
        newStatus = 'PROMOTED';
      }

      const rec: PromotionRecord = {
        id: `PRM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        schoolId: currentUser.schoolId,
        studentId: student.id,
        studentNumber: student.studentNumber || student.admissionNo,
        studentName: student.fullName,
        previousClassId: previousClass?.id || '',
        previousClassName: previousClass ? `${previousClass.name} (${previousClass.section})` : 'N/A',
        newClassId: targetClass?.id || (newStatus === 'GRADUATED' ? 'GRADUATED' : student.classId),
        newClassName: newStatus === 'GRADUATED' ? 'Alumni / Graduated' : targetClass ? `${targetClass.name} (${targetClass.section})` : student.className,
        academicYear: p.academicYear || '2026/2027',
        status: newStatus,
        promotedAt: new Date().toISOString(),
        promotedBy: `${currentUser.fullName} (${currentUser.teacherId || currentUser.role})`,
        reason: p.reason || 'Annual academic review decision'
      };

      db.promotionHistory.unshift(rec);
      processedHistory.push(rec);
    });

    logAudit(
      currentUser.schoolId,
      currentUser.fullName,
      currentUser.role,
      'STUDENTS_PROMOTED',
      'StudentPromotion',
      `Processed academic promotions/graduation for ${processedHistory.length} students by ${currentUser.fullName}.`,
      req
    );

    res.json({ message: 'Student promotions processed successfully', count: processedHistory.length, history: processedHistory });
  });

  app.get('/api/promotion-history', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const history = db.promotionHistory.filter(p => p.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN');
    res.json(history);
  });

  app.put('/api/students/:id', authenticateToken, (req, res) => {
    const idx = db.students.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Student not found' });
    db.students[idx] = { ...db.students[idx], ...req.body };
    if (req.body.firstName || req.body.lastName) {
      const s = db.students[idx];
      s.fullName = `${s.firstName} ${s.middleName ? s.middleName + ' ' : ''}${s.lastName}`;
    }
    const currentUser = (req as any).user;
    logAudit(currentUser.schoolId, currentUser.fullName, currentUser.role, 'STUDENT_UPDATE', 'Student', `Updated student profile for ${db.students[idx].fullName}`, req, req.params.id);
    res.json(db.students[idx]);
  });

  app.delete('/api/students/:id', authenticateToken, (req, res) => {
    const idx = db.students.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Student not found' });
    const student = db.students[idx];
    student.status = 'WITHDRAWN'; // Soft archiving
    const currentUser = (req as any).user;
    logAudit(currentUser.schoolId, currentUser.fullName, currentUser.role, 'STUDENT_ARCHIVE', 'Student', `Archived student ${student.fullName}`, req, req.params.id);
    res.json({ message: 'Student archived successfully', student });
  });

  // --------------------------------------------------------------------------
  // PARENTS API
  // --------------------------------------------------------------------------
  app.get('/api/parents', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    res.json(db.parents.filter(p => p.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN'));
  });

  app.post('/api/parents', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const newParent: Parent = {
      id: `PAR-${Date.now()}`,
      schoolId: currentUser.schoolId,
      fullName: req.body.fullName,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address || '',
      occupation: req.body.occupation || '',
      relationship: req.body.relationship || 'Guardian',
      childrenIds: req.body.childrenIds || [],
      childrenNames: req.body.childrenNames || []
    };
    db.parents.unshift(newParent);
    res.status(201).json(newParent);
  });

  // --------------------------------------------------------------------------
  // TEACHERS API
  // --------------------------------------------------------------------------
  app.get('/api/teachers', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    res.json(db.teachers.filter(t => t.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN'));
  });

  app.post('/api/teachers', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const newTeacher: Teacher = {
      id: `TCH-${Date.now()}`,
      schoolId: currentUser.schoolId,
      teacherCode: `TCH-00${db.teachers.length + 1}`,
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      qualification: req.body.qualification || 'B.Ed',
      specialization: req.body.specialization || 'General',
      gender: req.body.gender || 'MALE',
      employmentDate: new Date().toISOString().split('T')[0],
      assignedClassIds: req.body.assignedClassIds || [],
      assignedSubjectIds: req.body.assignedSubjectIds || [],
      status: 'ACTIVE'
    };
    db.teachers.unshift(newTeacher);
    res.status(201).json(newTeacher);
  });

  // --------------------------------------------------------------------------
  // CLASSES & SUBJECTS API
  // --------------------------------------------------------------------------
  app.get('/api/classes', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    res.json(db.classes.filter(c => c.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN'));
  });

  app.post('/api/classes', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const newClass = {
      id: `CLS-${Date.now()}`,
      schoolId: currentUser.schoolId,
      name: req.body.name,
      section: req.body.section || 'A',
      capacity: req.body.capacity || 35,
      classTeacherId: req.body.classTeacherId,
      classTeacherName: req.body.classTeacherName,
      subjectIds: req.body.subjectIds || []
    };
    db.classes.push(newClass);
    res.status(201).json(newClass);
  });

  app.get('/api/subjects', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    res.json(db.subjects.filter(s => s.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN'));
  });

  app.post('/api/subjects', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const newSubject = {
      id: `SUB-${Date.now()}`,
      schoolId: currentUser.schoolId,
      code: req.body.code || `SUB${db.subjects.length + 1}`,
      name: req.body.name,
      classIds: req.body.classIds || [],
      maxMarks: req.body.maxMarks || 100,
      passMarks: req.body.passMarks || 50
    };
    db.subjects.push(newSubject);
    res.status(201).json(newSubject);
  });

  // --------------------------------------------------------------------------
  // ATTENDANCE API
  // --------------------------------------------------------------------------
  app.get('/api/attendance', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    let list = db.attendance.filter(a => a.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN');

    const { classId, date, studentId } = req.query;
    if (classId) list = list.filter(a => a.classId === String(classId));
    if (date) list = list.filter(a => a.date === String(date));
    if (studentId) list = list.filter(a => a.studentId === String(studentId));

    res.json(list);
  });

  app.post('/api/attendance/bulk', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const { records } = req.body; // array of attendance objects
    if (!Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid attendance array' });
    }

    records.forEach((rec: any) => {
      // Find existing or add
      const existingIdx = db.attendance.findIndex(a => a.studentId === rec.studentId && a.date === rec.date);
      if (existingIdx !== -1) {
        db.attendance[existingIdx].status = rec.status;
        if (rec.remarks) db.attendance[existingIdx].remarks = rec.remarks;
      } else {
        db.attendance.unshift({
          id: `ATT-${Date.now()}-${Math.random()}`,
          schoolId: currentUser.schoolId,
          studentId: rec.studentId,
          studentName: rec.studentName,
          classId: rec.classId,
          className: rec.className,
          date: rec.date,
          status: rec.status,
          term: rec.term || 'Term 1',
          academicYear: '2026/2027',
          remarks: rec.remarks
        });
      }
    });

    logAudit(currentUser.schoolId, currentUser.fullName, currentUser.role, 'ATTENDANCE_BULK_MARK', 'Attendance', `Marked attendance for ${records.length} students on ${records[0]?.date}`, req);
    res.json({ message: 'Attendance marked successfully', count: records.length });
  });

  // --------------------------------------------------------------------------
  // EXAMS & RESULTS API
  // --------------------------------------------------------------------------
  app.get('/api/exams', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    res.json(db.exams.filter(e => e.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN'));
  });

  app.post('/api/exams', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const newExam = {
      id: `EXM-${Date.now()}`,
      schoolId: currentUser.schoolId,
      name: req.body.name,
      type: req.body.type || 'FINAL_EXAM',
      term: req.body.term || 'Term 1',
      academicYear: '2026/2027',
      classId: req.body.classId,
      className: req.body.className,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      status: 'UPCOMING'
    };
    db.exams.unshift(newExam as any);
    res.status(201).json(newExam);
  });

  app.get('/api/results', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    let list = db.results.filter(r => r.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN');

    const { studentId, classId, examId, subjectId } = req.query;
    if (studentId) list = list.filter(r => r.studentId === String(studentId));
    if (classId) list = list.filter(r => r.classId === String(classId));
    if (examId) list = list.filter(r => r.examId === String(examId));
    if (subjectId) list = list.filter(r => r.subjectId === String(subjectId));

    res.json(list);
  });

  app.post('/api/results/save', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const { examId, studentId, studentName, classId, subjectId, subjectName, caScore, examScore } = req.body;

    const ca = Number(caScore) || 0;
    const ex = Number(examScore) || 0;
    const total = ca + ex;

    let grade = 'F';
    let gpa = 0.0;
    let remarks = 'Needs Improvement';

    if (total >= 80) { grade = 'A'; gpa = 4.0; remarks = 'Excellent'; }
    else if (total >= 70) { grade = 'B'; gpa = 3.5; remarks = 'Very Good'; }
    else if (total >= 60) { grade = 'C'; gpa = 3.0; remarks = 'Good'; }
    else if (total >= 50) { grade = 'D'; gpa = 2.0; remarks = 'Pass'; }
    else { grade = 'F'; gpa = 0.0; remarks = 'Fail'; }

    const existingIdx = db.results.findIndex(r => r.examId === examId && r.studentId === studentId && r.subjectId === subjectId);
    let item: ResultMark;

    if (existingIdx !== -1) {
      db.results[existingIdx] = {
        ...db.results[existingIdx],
        caScore: ca,
        examScore: ex,
        totalScore: total,
        grade,
        gpa,
        remarks
      };
      item = db.results[existingIdx];
    } else {
      item = {
        id: `RES-${Date.now()}`,
        schoolId: currentUser.schoolId,
        examId,
        examName: 'Term 1 Examination',
        studentId,
        studentName,
        classId,
        subjectId,
        subjectName,
        caScore: ca,
        examScore: ex,
        totalScore: total,
        grade,
        gpa,
        remarks,
        term: 'Term 1',
        academicYear: '2026/2027',
        status: 'SUBMITTED',
        isApproved: false
      };
      db.results.push(item);
    }

    logAudit(currentUser.schoolId, currentUser.fullName, currentUser.role, 'RESULT_ENTRY', 'ResultMark', `Entered score for ${studentName} in ${subjectName}: ${total}/100 (${grade})`, req, item.id);
    res.json(item);
  });

  app.post('/api/results/approve', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const { classId, examId } = req.body;

    db.results.forEach(r => {
      if (r.classId === classId && r.examId === examId) {
        r.isApproved = true;
      }
    });

    logAudit(currentUser.schoolId, currentUser.fullName, currentUser.role, 'RESULTS_APPROVED', 'ResultMark', `Approved examination results for class ${classId}`, req);
    res.json({ message: 'Results officially approved' });
  });

  // Report Card Compilation Endpoint
  app.get('/api/report-cards/:studentId', authenticateToken, (req, res) => {
    const { studentId } = req.params;
    const student = db.students.find(s => s.id === studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const school = db.schools.find(s => s.id === student.schoolId) || db.schools[0];
    const classRoom = db.classes.find(c => c.id === student.classId) || db.classes[0];
    const results = db.results.filter(r => r.studentId === studentId);

    // Calculate total & average
    const totalScore = results.reduce((sum, r) => sum + r.totalScore, 0);
    const averageScore = results.length > 0 ? Number((totalScore / results.length).toFixed(1)) : 0;

    // Class position calculation
    const allStudentsInClass = db.students.filter(s => s.classId === student.classId);
    const scoresMap = allStudentsInClass.map(st => {
      const stResults = db.results.filter(r => r.studentId === st.id);
      const stTotal = stResults.reduce((sum, r) => sum + r.totalScore, 0);
      return { id: st.id, total: stTotal };
    });
    scoresMap.sort((a, b) => b.total - a.total);
    const position = scoresMap.findIndex(x => x.id === studentId) + 1 || 1;

    // Attendance stats
    const stAtt = db.attendance.filter(a => a.studentId === studentId);
    const attendancePresent = stAtt.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;

    res.json({
      student,
      classRoom,
      school,
      term: 'Term 1',
      academicYear: '2026/2027',
      results,
      totalScore,
      averageScore,
      position,
      totalStudentsInClass: allStudentsInClass.length,
      attendancePresent,
      attendanceTotal: Math.max(stAtt.length, 60),
      teacherComment: averageScore >= 80 ? 'An exemplary student who demonstrates outstanding academic brilliance and discipline.' : 'Demonstrates consistent effort with great potential for further improvement.',
      principalComment: averageScore >= 80 ? 'Commendable academic result. Keep leading by example!' : 'Promising progress. Encouraged to focus more on core subjects.',
      promotedTo: 'Grade 11 Science A'
    });
  });

  // --------------------------------------------------------------------------
  // FEES & PAYMENTS API
  // --------------------------------------------------------------------------
  app.get('/api/fees', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    res.json(db.fees.filter(f => f.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN'));
  });

  app.post('/api/fees', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const newFee = {
      id: `FEE-${Date.now()}`,
      schoolId: currentUser.schoolId,
      title: req.body.title,
      feeType: req.body.feeType || 'TUITION',
      classId: req.body.classId,
      className: req.body.className,
      term: 'Term 1',
      academicYear: '2026/2027',
      amount: Number(req.body.amount) || 0,
      dueDate: req.body.dueDate || '2026-10-01'
    };
    db.fees.unshift(newFee as any);
    res.status(201).json(newFee);
  });

  app.get('/api/payments', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    let list = db.payments.filter(p => p.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN');

    if (currentUser.role === 'PARENT' && currentUser.parentId) {
      const parent = db.parents.find(p => p.id === currentUser.parentId);
      if (parent) {
        list = list.filter(p => parent.childrenIds.includes(p.studentId));
      }
    } else if (currentUser.role === 'STUDENT' && currentUser.studentId) {
      list = list.filter(p => p.studentId === currentUser.studentId);
    }

    res.json(list);
  });

  app.post('/api/payments', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const { studentId, feeStructureId, amountPaid, paymentMethod, referenceNo, notes } = req.body;

    const student = db.students.find(s => s.id === studentId);
    const fee = db.fees.find(f => f.id === feeStructureId);

    const receiptNo = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: Payment = {
      id: `PAY-${Date.now()}`,
      schoolId: currentUser.schoolId,
      receiptNo,
      studentId,
      studentName: student?.fullName || 'Student',
      admissionNo: student?.admissionNo || 'N/A',
      className: student?.className || 'N/A',
      feeStructureId: feeStructureId || 'FEE-001',
      feeTitle: fee?.title || 'Tuition Fee',
      amountPaid: Number(amountPaid) || 0,
      paymentMethod: paymentMethod || 'CASH',
      referenceNo: referenceNo || `REF-${Date.now()}`,
      paymentDate: new Date().toISOString().split('T')[0],
      term: 'Term 1',
      academicYear: '2026/2027',
      receivedBy: currentUser.fullName,
      notes
    };

    db.payments.unshift(newPayment);

    logAudit(currentUser.schoolId, currentUser.fullName, currentUser.role, 'FEE_PAYMENT_RECORD', 'Payment', `Recorded payment of GMD ${newPayment.amountPaid} for ${newPayment.studentName} (Receipt: ${receiptNo})`, req, newPayment.id);
    res.status(201).json(newPayment);
  });

  // --------------------------------------------------------------------------
  // EXPENSES API
  // --------------------------------------------------------------------------
  app.get('/api/expenses', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    res.json(db.expenses.filter(e => e.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN'));
  });

  app.post('/api/expenses', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const newExpense: Expense = {
      id: `EXP-${Date.now()}`,
      schoolId: currentUser.schoolId,
      title: req.body.title,
      category: req.body.category || 'OTHER',
      amount: Number(req.body.amount) || 0,
      date: req.body.date || new Date().toISOString().split('T')[0],
      paymentMethod: req.body.paymentMethod || 'CASH',
      vendor: req.body.vendor || 'N/A',
      approvedBy: currentUser.fullName,
      notes: req.body.notes
    };
    db.expenses.unshift(newExpense);
    logAudit(currentUser.schoolId, currentUser.fullName, currentUser.role, 'EXPENSE_RECORD', 'Expense', `Recorded expense: ${newExpense.title} (GMD ${newExpense.amount})`, req, newExpense.id);
    res.status(201).json(newExpense);
  });

  // --------------------------------------------------------------------------
  // ONLINE APPLICATIONS API
  // --------------------------------------------------------------------------
  app.get('/api/applications', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    res.json(db.applications.filter(a => a.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN'));
  });

  app.post('/api/applications/public', (req, res) => {
    const newApp: OnlineApplication = {
      id: `APP-${Date.now()}`,
      schoolId: req.body.schoolId || 'SCH-001',
      applicationNo: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentFirstName: req.body.studentFirstName,
      studentLastName: req.body.studentLastName,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender || 'MALE',
      requestedClassId: req.body.requestedClassId || 'CLS-001',
      requestedClassName: req.body.requestedClassName || 'Grade 7',
      parentName: req.body.parentName,
      parentEmail: req.body.parentEmail,
      parentPhone: req.body.parentPhone,
      previousSchool: req.body.previousSchool || '',
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    };
    db.applications.unshift(newApp);
    res.status(201).json(newApp);
  });

  app.put('/api/applications/:id/status', authenticateToken, (req, res) => {
    const appItem = db.applications.find(a => a.id === req.params.id);
    if (!appItem) return res.status(404).json({ error: 'Application not found' });

    appItem.status = req.body.status;
    const currentUser = (req as any).user;

    // If APPROVED, auto-enroll student!
    if (req.body.status === 'ENROLLED' || req.body.status === 'APPROVED') {
      const admissionNo = `GIA-2026-${Math.floor(100 + Math.random() * 900)}`;
      const newStudent: Student = {
        id: `STD-${Date.now()}`,
        schoolId: appItem.schoolId,
        admissionNo: admissionNo,
        studentNumber: admissionNo,
        firstName: appItem.studentFirstName,
        lastName: appItem.studentLastName,
        fullName: `${appItem.studentFirstName} ${appItem.studentLastName}`,
        gender: appItem.gender,
        dateOfBirth: appItem.dateOfBirth,
        address: 'Registered online applicant address',
        nationality: 'Gambian',
        classId: appItem.requestedClassId,
        className: appItem.requestedClassName,
        section: 'A',
        parentId: 'PAR-001',
        parentName: appItem.parentName,
        parentPhone: appItem.parentPhone,
        admissionDate: new Date().toISOString().split('T')[0],
        academicYear: '2026/2027',
        status: 'ACTIVE'
      };
      db.students.unshift(newStudent);
      logAudit(appItem.schoolId, currentUser.fullName, currentUser.role, 'APPLICATION_ENROLLED', 'OnlineApplication', `Converted application ${appItem.applicationNo} to enrolled student ${newStudent.fullName}`, req, appItem.id);
    }

    res.json(appItem);
  });

  // --------------------------------------------------------------------------
  // ANNOUNCEMENTS & NOTIFICATIONS API
  // --------------------------------------------------------------------------
  app.get('/api/announcements', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    let list = db.announcements.filter(a => a.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN');

    if (currentUser.role === 'TEACHER') {
      list = list.filter(a => a.targetAudience === 'ALL' || a.targetAudience === 'TEACHERS');
    } else if (currentUser.role === 'PARENT') {
      list = list.filter(a => a.targetAudience === 'ALL' || a.targetAudience === 'PARENTS');
    } else if (currentUser.role === 'STUDENT') {
      list = list.filter(a => a.targetAudience === 'ALL' || a.targetAudience === 'STUDENTS');
    }

    res.json(list);
  });

  app.post('/api/announcements', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const newAnc: Announcement = {
      id: `ANC-${Date.now()}`,
      schoolId: currentUser.schoolId,
      title: req.body.title,
      content: req.body.content,
      targetAudience: req.body.targetAudience || 'ALL',
      authorName: `${currentUser.fullName} (${currentUser.role})`,
      date: new Date().toISOString().split('T')[0],
      priority: req.body.priority || 'NORMAL'
    };
    db.announcements.unshift(newAnc);
    logAudit(currentUser.schoolId, currentUser.fullName, currentUser.role, 'ANNOUNCEMENT_CREATE', 'Announcement', `Published announcement: ${newAnc.title}`, req, newAnc.id);
    res.status(201).json(newAnc);
  });

  app.get('/api/notifications', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    res.json(db.notifications.filter(n => n.userId === currentUser.id));
  });

  app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
    const notif = db.notifications.find(n => n.id === req.params.id);
    if (notif) notif.read = true;
    res.json({ message: 'Marked as read' });
  });

  // --------------------------------------------------------------------------
  // TIMETABLE & CALENDAR API
  // --------------------------------------------------------------------------
  app.get('/api/timetable', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    let list = db.timetable.filter(t => t.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN');
    if (req.query.classId) list = list.filter(t => t.classId === String(req.query.classId));
    res.json(list);
  });

  app.get('/api/calendar', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    res.json(db.calendar.filter(c => c.schoolId === currentUser.schoolId || currentUser.role === 'SUPER_ADMIN'));
  });

  // --------------------------------------------------------------------------
  // AUDIT LOGS & REPORTS API
  // --------------------------------------------------------------------------
  app.get('/api/audit-logs', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    let list = db.auditLogs;
    if (currentUser.role !== 'SUPER_ADMIN') {
      list = list.filter(l => l.schoolId === currentUser.schoolId);
    }
    res.json(list);
  });

  app.get('/api/reports/summary', authenticateToken, (req, res) => {
    const currentUser = (req as any).user;
    const schoolId = currentUser.schoolId;

    const schoolStudents = db.students.filter(s => s.schoolId === schoolId);
    const schoolTeachers = db.teachers.filter(t => t.schoolId === schoolId);
    const schoolParents = db.parents.filter(p => p.schoolId === schoolId);
    const schoolClasses = db.classes.filter(c => c.schoolId === schoolId);
    const schoolPayments = db.payments.filter(p => p.schoolId === schoolId);
    const schoolExpenses = db.expenses.filter(e => e.schoolId === schoolId);

    const totalRevenue = schoolPayments.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalExpenses = schoolExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Attendance rate
    const schoolAtt = db.attendance.filter(a => a.schoolId === schoolId);
    const presentCount = schoolAtt.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendanceRate = schoolAtt.length > 0 ? Math.round((presentCount / schoolAtt.length) * 100) : 94;

    res.json({
      totalStudents: schoolStudents.length,
      totalTeachers: schoolTeachers.length,
      totalParents: schoolParents.length,
      totalClasses: schoolClasses.length,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      attendanceRate,
      recentPayments: schoolPayments.slice(0, 5),
      recentStudents: schoolStudents.slice(0, 5),
      recentAnnouncements: db.announcements.slice(0, 3)
    });
  });

  // --------------------------------------------------------------------------
  // VITE / STATIC SERVING
  // --------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EduManage] Full-stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[EduManage] Server startup error:', err);
});
