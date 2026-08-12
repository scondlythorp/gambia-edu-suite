import {
  School, User, Student, Parent, Teacher, ClassRoom, Subject,
  AttendanceRecord, Exam, ResultMark, FeeStructure, Payment, Expense,
  OnlineApplication, Announcement, Notification, TimetableSlot, CalendarEvent, AuditLog, PromotionRecord
} from '../types';

export class DatabaseStore {
  schools: School[] = [];
  users: User[] = [];
  students: Student[] = [];
  parents: Parent[] = [];
  teachers: Teacher[] = [];
  classes: ClassRoom[] = [];
  subjects: Subject[] = [];
  attendance: AttendanceRecord[] = [];
  exams: Exam[] = [];
  results: ResultMark[] = [];
  fees: FeeStructure[] = [];
  payments: Payment[] = [];
  expenses: Expense[] = [];
  applications: OnlineApplication[] = [];
  announcements: Announcement[] = [];
  notifications: Notification[] = [];
  timetable: TimetableSlot[] = [];
  calendar: CalendarEvent[] = [];
  auditLogs: AuditLog[] = [];
  promotionHistory: PromotionRecord[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    // 1. Schools
    this.schools = [
      {
        id: 'SCH-001',
        name: 'Gambia International Academy',
        code: 'GIA',
        logo: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=200&q=80',
        email: 'info@gia.edu.gm',
        phone: '+220 4392000',
        address: 'Kairaba Avenue, Fajara',
        country: 'The Gambia',
        region: 'Kanifing Municipal',
        website: 'https://gia.edu.gm',
        schoolType: 'K-12 Private Academy',
        academicYear: '2026/2027',
        currentTerm: 'Term 1',
        motto: 'Excellence, Discipline, Leadership',
        principalName: 'Dr. Alieu Baah',
        status: 'ACTIVE',
        createdAt: '2025-01-10T08:00:00Z'
      },
      {
        id: 'SCH-002',
        name: 'St. Augustine High School',
        code: 'SAHS',
        logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=200&q=80',
        email: 'admin@staugustine.edu.gm',
        phone: '+220 4227311',
        address: 'Box Bar Road, Banjul',
        country: 'The Gambia',
        region: 'Banjul City',
        website: 'https://staugustine.edu.gm',
        schoolType: 'Senior Secondary',
        academicYear: '2026/2027',
        currentTerm: 'Term 1',
        motto: 'Recta Directa',
        principalName: 'Fr. Joseph Mendy',
        status: 'ACTIVE',
        createdAt: '2025-02-01T08:00:00Z'
      }
    ];

    // 2. Classes (Grade 1 through Grade 12)
    this.classes = [
      { id: 'CLS-101', schoolId: 'SCH-001', name: 'Grade 1', section: 'Section A', capacity: 30, subjectIds: ['SUB-001', 'SUB-002'] },
      { id: 'CLS-102', schoolId: 'SCH-001', name: 'Grade 2', section: 'Section A', capacity: 30, subjectIds: ['SUB-001', 'SUB-002'] },
      { id: 'CLS-103', schoolId: 'SCH-001', name: 'Grade 3', section: 'Section A', capacity: 30, subjectIds: ['SUB-001', 'SUB-002', 'SUB-003'] },
      { id: 'CLS-104', schoolId: 'SCH-001', name: 'Grade 4', section: 'Section A', capacity: 30, subjectIds: ['SUB-001', 'SUB-002', 'SUB-003', 'SUB-004'] },
      { id: 'CLS-105', schoolId: 'SCH-001', name: 'Grade 5', section: 'Section A', capacity: 30, subjectIds: ['SUB-001', 'SUB-002', 'SUB-003', 'SUB-004'] },
      { id: 'CLS-106', schoolId: 'SCH-001', name: 'Grade 6', section: 'Section A', capacity: 30, subjectIds: ['SUB-001', 'SUB-002', 'SUB-003', 'SUB-004'] },
      { id: 'CLS-001', schoolId: 'SCH-001', name: 'Grade 7', section: 'Section A', capacity: 35, subjectIds: ['SUB-001', 'SUB-002', 'SUB-003', 'SUB-004'] },
      { id: 'CLS-002', schoolId: 'SCH-001', name: 'Grade 8', section: 'Section A', capacity: 35, subjectIds: ['SUB-001', 'SUB-002', 'SUB-003', 'SUB-004'] },
      { id: 'CLS-003', schoolId: 'SCH-001', name: 'Grade 9', section: 'Section B', capacity: 30, subjectIds: ['SUB-001', 'SUB-002', 'SUB-003', 'SUB-004'] },
      { id: 'CLS-004', schoolId: 'SCH-001', name: 'Grade 10', section: 'Science A', capacity: 32, classTeacherId: 'TCH-001', classTeacherName: 'Fatou Jammeh', subjectIds: ['SUB-001', 'SUB-002', 'SUB-005', 'SUB-006', 'SUB-008'] },
      { id: 'CLS-005', schoolId: 'SCH-001', name: 'Grade 11', section: 'Arts A', capacity: 28, classTeacherId: 'TCH-002', classTeacherName: 'Modou Secka', subjectIds: ['SUB-002', 'SUB-004', 'SUB-007', 'SUB-009'] },
      { id: 'CLS-006', schoolId: 'SCH-001', name: 'Grade 12', section: 'Science A', capacity: 30, subjectIds: ['SUB-001', 'SUB-002', 'SUB-005', 'SUB-006', 'SUB-008'] }
    ];

    // 3. Subjects
    this.subjects = [
      { id: 'SUB-001', schoolId: 'SCH-001', code: 'MATH101', name: 'Mathematics', classIds: ['CLS-001', 'CLS-002', 'CLS-004', 'CLS-006'], maxMarks: 100, passMarks: 50 },
      { id: 'SUB-002', schoolId: 'SCH-001', code: 'ENG101', name: 'English Language', classIds: ['CLS-001', 'CLS-002', 'CLS-003', 'CLS-004', 'CLS-005', 'CLS-006'], maxMarks: 100, passMarks: 50 },
      { id: 'SUB-003', schoolId: 'SCH-001', code: 'SCI101', name: 'Integrated Science', classIds: ['CLS-001', 'CLS-002', 'CLS-003'], maxMarks: 100, passMarks: 45 },
      { id: 'SUB-004', schoolId: 'SCH-001', code: 'SOC101', name: 'Social Studies', classIds: ['CLS-001', 'CLS-002', 'CLS-003', 'CLS-005'], maxMarks: 100, passMarks: 45 },
      { id: 'SUB-005', schoolId: 'SCH-001', code: 'PHY201', name: 'Physics', classIds: ['CLS-004', 'CLS-006'], maxMarks: 100, passMarks: 50 },
      { id: 'SUB-006', schoolId: 'SCH-001', code: 'CHM201', name: 'Chemistry', classIds: ['CLS-004', 'CLS-006'], maxMarks: 100, passMarks: 50 },
      { id: 'SUB-007', schoolId: 'SCH-001', code: 'ACC201', name: 'Financial Accounting', classIds: ['CLS-005'], maxMarks: 100, passMarks: 45 },
      { id: 'SUB-008', schoolId: 'SCH-001', code: 'ICT101', name: 'Information & Communication Tech', classIds: ['CLS-004', 'CLS-006'], maxMarks: 100, passMarks: 50 },
      { id: 'SUB-009', schoolId: 'SCH-001', code: 'IRS101', name: 'Islamic Religious Studies', classIds: ['CLS-001', 'CLS-005'], maxMarks: 100, passMarks: 40 }
    ];

    // 4. Parents
    this.parents = [
      {
        id: 'PAR-001',
        schoolId: 'SCH-001',
        fullName: 'Alhagie Touray',
        phone: '+220 7712345',
        email: 'parent.touray@gia.edu.gm',
        address: 'Banjulinding, West Coast Region',
        occupation: 'Senior Customs Officer',
        relationship: 'Father',
        childrenIds: ['STD-001'],
        childrenNames: ['Lamin Touray']
      },
      {
        id: 'PAR-002',
        schoolId: 'SCH-001',
        fullName: 'Kebba Jallow',
        phone: '+220 9988776',
        email: 'kebba.jallow@gmail.com',
        address: 'Pipeline, Kanifing Municipal',
        occupation: 'Bank Manager',
        relationship: 'Father',
        childrenIds: ['STD-002'],
        childrenNames: ['Isatou Jallow']
      }
    ];

    // 5. Teachers
    this.teachers = [
      {
        id: 'TCH-001',
        schoolId: 'SCH-001',
        teacherCode: 'TCH-001',
        fullName: 'Fatou Jammeh',
        email: 'teacher.fatou@gia.edu.gm',
        phone: '+220 3123456',
        qualification: 'M.Sc. Physics & B.Ed. Mathematics',
        specialization: 'Physics & Pure Mathematics',
        gender: 'FEMALE',
        employmentDate: '2021-09-01',
        assignedClassIds: ['CLS-004', 'CLS-006'],
        assignedClassNames: ['Grade 10 Science A', 'Grade 12 Science A'],
        assignedSubjectIds: ['SUB-001', 'SUB-005'],
        assignedSubjectNames: ['Mathematics', 'Physics'],
        status: 'ACTIVE'
      },
      {
        id: 'TCH-002',
        schoolId: 'SCH-001',
        teacherCode: 'TCH-002',
        fullName: 'Modou Secka',
        email: 'modou.secka@gia.edu.gm',
        phone: '+220 3344556',
        qualification: 'B.A. English & Education',
        specialization: 'English Literature & Grammar',
        gender: 'MALE',
        employmentDate: '2022-01-15',
        assignedClassIds: ['CLS-004', 'CLS-005'],
        assignedClassNames: ['Grade 10 Science A', 'Grade 11 Arts A'],
        assignedSubjectIds: ['SUB-002'],
        assignedSubjectNames: ['English Language'],
        status: 'ACTIVE'
      }
    ];

    // 6. Students
    this.students = [
      {
        id: 'STD-001',
        schoolId: 'SCH-001',
        studentNumber: 'STU-2026-0001',
        admissionNo: 'STU-2026-0001',
        firstName: 'Lamin',
        middleName: 'Kebba',
        lastName: 'Touray',
        fullName: 'Lamin Kebba Touray',
        gender: 'MALE',
        dateOfBirth: '2009-05-14',
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
        address: 'Banjulinding, WCR',
        nationality: 'Gambian',
        classId: 'CLS-004',
        className: 'Grade 10 Science A',
        section: 'Science A',
        parentId: 'PAR-001',
        parentName: 'Alhagie Touray',
        parentPhone: '+220 7712345',
        admissionDate: '2024-09-10',
        academicYear: '2026/2027',
        status: 'ACTIVE'
      },
      {
        id: 'STD-002',
        schoolId: 'SCH-001',
        studentNumber: 'STU-2026-0002',
        admissionNo: 'STU-2026-0002',
        firstName: 'Isatou',
        middleName: 'Binta',
        lastName: 'Jallow',
        fullName: 'Isatou Binta Jallow',
        gender: 'FEMALE',
        dateOfBirth: '2009-11-20',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
        address: 'Pipeline, KMC',
        nationality: 'Gambian',
        classId: 'CLS-004',
        className: 'Grade 10 Science A',
        section: 'Science A',
        parentId: 'PAR-002',
        parentName: 'Kebba Jallow',
        parentPhone: '+220 9988776',
        admissionDate: '2024-09-10',
        academicYear: '2026/2027',
        status: 'ACTIVE'
      },
      {
        id: 'STD-003',
        schoolId: 'SCH-001',
        studentNumber: 'STU-2026-0003',
        admissionNo: 'STU-2026-0003',
        firstName: 'Omar',
        lastName: 'Ceesay',
        fullName: 'Omar Ceesay',
        gender: 'MALE',
        dateOfBirth: '2010-02-04',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        address: 'Brusubi Phase 1',
        nationality: 'Gambian',
        classId: 'CLS-004',
        className: 'Grade 10 Science A',
        section: 'Science A',
        parentId: 'PAR-001',
        parentName: 'Alhagie Touray',
        parentPhone: '+220 7712345',
        admissionDate: '2024-09-12',
        academicYear: '2026/2027',
        status: 'ACTIVE'
      },
      {
        id: 'STD-004',
        schoolId: 'SCH-001',
        studentNumber: 'STU-2026-0004',
        admissionNo: 'STU-2026-0004',
        firstName: 'Mariama',
        lastName: 'Bah',
        fullName: 'Mariama Bah',
        gender: 'FEMALE',
        dateOfBirth: '2010-08-18',
        photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
        address: 'Latrikunda Sabiji',
        nationality: 'Gambian',
        classId: 'CLS-003',
        className: 'Grade 9 Section B',
        section: 'Section B',
        parentId: 'PAR-002',
        parentName: 'Kebba Jallow',
        parentPhone: '+220 9988776',
        admissionDate: '2024-09-15',
        academicYear: '2026/2027',
        status: 'ACTIVE'
      },
      {
        id: 'STD-005',
        schoolId: 'SCH-001',
        studentNumber: 'STU-2026-0005',
        admissionNo: 'STU-2026-0005',
        firstName: 'Ebrima',
        lastName: 'Sanyang',
        fullName: 'Ebrima Sanyang',
        gender: 'MALE',
        dateOfBirth: '2008-04-10',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        address: 'Sukuta, WCR',
        nationality: 'Gambian',
        classId: 'CLS-006',
        className: 'Grade 12 Science A',
        section: 'Science A',
        parentId: 'PAR-001',
        parentName: 'Alhagie Touray',
        parentPhone: '+220 7712345',
        admissionDate: '2022-09-10',
        academicYear: '2026/2027',
        status: 'ACTIVE'
      }
    ];

    // 7. Users
    this.users = [
      {
        id: 'USR-000',
        schoolId: 'SCH-001',
        schoolName: 'Platform Central Admin',
        email: 'superadmin@edumanage.com',
        fullName: 'System Super Admin',
        role: 'SUPER_ADMIN',
        phone: '+220 7000000',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 'USR-001',
        schoolId: 'SCH-001',
        schoolName: 'Gambia International Academy',
        email: 'admin@gia.edu.gm',
        fullName: 'Mustapha Camara',
        role: 'SCHOOL_ADMIN',
        phone: '+220 4392001',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        status: 'ACTIVE',
        createdAt: '2025-01-10T08:00:00Z'
      },
      {
        id: 'USR-002',
        schoolId: 'SCH-001',
        schoolName: 'Gambia International Academy',
        email: 'principal@gia.edu.gm',
        fullName: 'Dr. Alieu Baah',
        role: 'PRINCIPAL',
        phone: '+220 4392002',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        status: 'ACTIVE',
        createdAt: '2025-01-11T08:00:00Z'
      },
      {
        id: 'USR-003',
        schoolId: 'SCH-001',
        schoolName: 'Gambia International Academy',
        email: 'teacher.fatou@gia.edu.gm',
        fullName: 'Fatou Jammeh',
        role: 'TEACHER',
        teacherId: 'TCH-001',
        phone: '+220 3123456',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        status: 'ACTIVE',
        createdAt: '2025-01-12T08:00:00Z'
      },
      {
        id: 'USR-004',
        schoolId: 'SCH-001',
        schoolName: 'Gambia International Academy',
        email: 'accountant.ousman@gia.edu.gm',
        fullName: 'Ousman Dibba',
        role: 'ACCOUNTANT',
        phone: '+220 3991122',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        status: 'ACTIVE',
        createdAt: '2025-01-15T08:00:00Z'
      },
      {
        id: 'USR-005',
        schoolId: 'SCH-001',
        schoolName: 'Gambia International Academy',
        email: 'receptionist.mariama@gia.edu.gm',
        fullName: 'Mariama Njie',
        role: 'RECEPTIONIST',
        phone: '+220 3556677',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        status: 'ACTIVE',
        createdAt: '2025-01-16T08:00:00Z'
      },
      {
        id: 'USR-006',
        schoolId: 'SCH-001',
        schoolName: 'Gambia International Academy',
        email: 'parent.touray@gia.edu.gm',
        fullName: 'Alhagie Touray',
        role: 'PARENT',
        parentId: 'PAR-001',
        phone: '+220 7712345',
        avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80',
        status: 'ACTIVE',
        createdAt: '2025-01-20T08:00:00Z'
      },
      {
        id: 'USR-007',
        schoolId: 'SCH-001',
        schoolName: 'Gambia International Academy',
        email: 'student.lamin@gia.edu.gm',
        fullName: 'Lamin Kebba Touray',
        role: 'STUDENT',
        studentId: 'STD-001',
        phone: '+220 7889900',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
        status: 'ACTIVE',
        createdAt: '2025-01-22T08:00:00Z'
      }
    ];

    // 8. Attendance Records
    const dates = ['2026-08-07', '2026-08-08', '2026-08-09', '2026-08-10', '2026-08-11'];
    let attId = 100;
    this.students.forEach(st => {
      dates.forEach(d => {
        attId++;
        this.attendance.push({
          id: `ATT-${attId}`,
          schoolId: 'SCH-001',
          studentId: st.id,
          studentName: st.fullName,
          classId: st.classId,
          className: st.className,
          date: d,
          status: (attId % 7 === 0) ? 'LATE' : (attId % 11 === 0) ? 'ABSENT' : 'PRESENT',
          term: 'Term 1',
          academicYear: '2026/2027',
          remarks: (attId % 11 === 0) ? 'Sick leave note provided' : undefined
        });
      });
    });

    // 9. Exams & Results
    this.exams = [
      {
        id: 'EXM-001',
        schoolId: 'SCH-001',
        name: 'Term 1 Mid-Term Assessment',
        type: 'CONTINUOUS_ASSESSMENT',
        term: 'Term 1',
        academicYear: '2026/2027',
        classId: 'CLS-004',
        className: 'Grade 10 Science A',
        startDate: '2026-07-15',
        endDate: '2026-07-22',
        status: 'PUBLISHED'
      },
      {
        id: 'EXM-002',
        schoolId: 'SCH-001',
        name: 'Term 1 Final Examination',
        type: 'FINAL_EXAM',
        term: 'Term 1',
        academicYear: '2026/2027',
        classId: 'CLS-004',
        className: 'Grade 10 Science A',
        startDate: '2026-08-01',
        endDate: '2026-08-10',
        status: 'PUBLISHED'
      }
    ];

    // Results for Lamin, Isatou, Omar
    this.results = [
      // Lamin Touray
      { id: 'RES-001', schoolId: 'SCH-001', examId: 'EXM-002', examName: 'Term 1 Final Examination', studentId: 'STD-001', studentName: 'Lamin Kebba Touray', classId: 'CLS-004', subjectId: 'SUB-001', subjectName: 'Mathematics', caScore: 28, examScore: 64, totalScore: 92, grade: 'A', gpa: 4.0, remarks: 'Excellent', term: 'Term 1', academicYear: '2026/2027', status: 'PUBLISHED', isApproved: true },
      { id: 'RES-002', schoolId: 'SCH-001', examId: 'EXM-002', examName: 'Term 1 Final Examination', studentId: 'STD-001', studentName: 'Lamin Kebba Touray', classId: 'CLS-004', subjectId: 'SUB-002', subjectName: 'English Language', caScore: 25, examScore: 58, totalScore: 83, grade: 'A', gpa: 4.0, remarks: 'Very Good', term: 'Term 1', academicYear: '2026/2027', status: 'PUBLISHED', isApproved: true },
      { id: 'RES-003', schoolId: 'SCH-001', examId: 'EXM-002', examName: 'Term 1 Final Examination', studentId: 'STD-001', studentName: 'Lamin Kebba Touray', classId: 'CLS-004', subjectId: 'SUB-005', subjectName: 'Physics', caScore: 27, examScore: 61, totalScore: 88, grade: 'A', gpa: 4.0, remarks: 'Outstanding problem solving', term: 'Term 1', academicYear: '2026/2027', status: 'PUBLISHED', isApproved: true },
      { id: 'RES-004', schoolId: 'SCH-001', examId: 'EXM-002', examName: 'Term 1 Final Examination', studentId: 'STD-001', studentName: 'Lamin Kebba Touray', classId: 'CLS-004', subjectId: 'SUB-006', subjectName: 'Chemistry', caScore: 24, examScore: 52, totalScore: 76, grade: 'B', gpa: 3.5, remarks: 'Good performance', term: 'Term 1', academicYear: '2026/2027', status: 'PUBLISHED', isApproved: true },
      { id: 'RES-005', schoolId: 'SCH-001', examId: 'EXM-002', examName: 'Term 1 Final Examination', studentId: 'STD-001', studentName: 'Lamin Kebba Touray', classId: 'CLS-004', subjectId: 'SUB-008', subjectName: 'ICT', caScore: 29, examScore: 66, totalScore: 95, grade: 'A', gpa: 4.0, remarks: 'Top scorer in practicals', term: 'Term 1', academicYear: '2026/2027', status: 'PUBLISHED', isApproved: true },

      // Isatou Jallow
      { id: 'RES-006', schoolId: 'SCH-001', examId: 'EXM-002', examName: 'Term 1 Final Examination', studentId: 'STD-002', studentName: 'Isatou Binta Jallow', classId: 'CLS-004', subjectId: 'SUB-001', subjectName: 'Mathematics', caScore: 26, examScore: 56, totalScore: 82, grade: 'A', gpa: 4.0, remarks: 'Very Good', term: 'Term 1', academicYear: '2026/2027', status: 'PUBLISHED', isApproved: true },
      { id: 'RES-007', schoolId: 'SCH-001', examId: 'EXM-002', examName: 'Term 1 Final Examination', studentId: 'STD-002', studentName: 'Isatou Binta Jallow', classId: 'CLS-004', subjectId: 'SUB-002', subjectName: 'English Language', caScore: 28, examScore: 65, totalScore: 93, grade: 'A', gpa: 4.0, remarks: 'Exceptional writing skills', term: 'Term 1', academicYear: '2026/2027', status: 'PUBLISHED', isApproved: true },
      { id: 'RES-008', schoolId: 'SCH-001', examId: 'EXM-002', examName: 'Term 1 Final Examination', studentId: 'STD-002', studentName: 'Isatou Binta Jallow', classId: 'CLS-004', subjectId: 'SUB-005', subjectName: 'Physics', caScore: 25, examScore: 55, totalScore: 80, grade: 'A', gpa: 4.0, remarks: 'Strong analytical skills', term: 'Term 1', academicYear: '2026/2027', status: 'PUBLISHED', isApproved: true }
    ];

    // 10. Fees & Payments
    this.fees = [
      {
        id: 'FEE-001',
        schoolId: 'SCH-001',
        title: 'Grade 10 Tuition Fee (Term 1)',
        feeType: 'TUITION',
        classId: 'CLS-004',
        className: 'Grade 10 Science A',
        term: 'Term 1',
        academicYear: '2026/2027',
        amount: 21000, // GMD 21,000
        dueDate: '2026-09-30'
      },
      {
        id: 'FEE-002',
        schoolId: 'SCH-001',
        title: 'Science Lab & ICT Maintenance Fee',
        feeType: 'LAB',
        classId: 'CLS-004',
        className: 'Grade 10 Science A',
        term: 'Term 1',
        academicYear: '2026/2027',
        amount: 4500, // GMD 4,500
        dueDate: '2026-09-30'
      }
    ];

    this.payments = [
      {
        id: 'PAY-001',
        schoolId: 'SCH-001',
        receiptNo: 'RCP-2026-0891',
        studentId: 'STD-001',
        studentName: 'Lamin Kebba Touray',
        admissionNo: 'GIA-2024-001',
        className: 'Grade 10 Science A',
        feeStructureId: 'FEE-001',
        feeTitle: 'Grade 10 Tuition Fee (Term 1)',
        amountPaid: 15000,
        paymentMethod: 'MOBILE_MONEY',
        referenceNo: 'AFR-MM-992104',
        paymentDate: '2026-08-02',
        term: 'Term 1',
        academicYear: '2026/2027',
        receivedBy: 'Ousman Dibba',
        notes: 'Partial payment via Africell Wave / QMoney'
      },
      {
        id: 'PAY-002',
        schoolId: 'SCH-001',
        receiptNo: 'RCP-2026-0892',
        studentId: 'STD-002',
        studentName: 'Isatou Binta Jallow',
        admissionNo: 'GIA-2024-002',
        className: 'Grade 10 Science A',
        feeStructureId: 'FEE-001',
        feeTitle: 'Grade 10 Tuition Fee (Term 1)',
        amountPaid: 21000,
        paymentMethod: 'BANK_TRANSFER',
        referenceNo: 'GTB-TRF-448102',
        paymentDate: '2026-08-04',
        term: 'Term 1',
        academicYear: '2026/2027',
        receivedBy: 'Ousman Dibba',
        notes: 'Full tuition fee cleared'
      }
    ];

    // 11. Expenses
    this.expenses = [
      {
        id: 'EXP-001',
        schoolId: 'SCH-001',
        title: 'Academic Staff Salaries - July 2026',
        category: 'SALARIES',
        amount: 145000,
        date: '2026-07-28',
        paymentMethod: 'BANK_TRANSFER',
        vendor: 'Staff Direct Deposit (EcoBank)',
        approvedBy: 'Dr. Alieu Baah',
        notes: 'Monthly payroll processing'
      },
      {
        id: 'EXP-002',
        schoolId: 'SCH-001',
        title: 'NAWEC Electricity & Water Bill',
        category: 'ELECTRICITY',
        amount: 18500,
        date: '2026-08-01',
        paymentMethod: 'CASH',
        vendor: 'NAWEC The Gambia',
        approvedBy: 'Mustapha Camara'
      },
      {
        id: 'EXP-003',
        schoolId: 'SCH-001',
        title: 'Science Laboratory Reagents & Glassware',
        category: 'SUPPLIES',
        amount: 12400,
        date: '2026-08-05',
        paymentMethod: 'MOBILE_MONEY',
        vendor: 'Banjul Scientific Supplies Ltd',
        approvedBy: 'Fatou Jammeh'
      }
    ];

    // 12. Online Applications
    this.applications = [
      {
        id: 'APP-001',
        schoolId: 'SCH-001',
        applicationNo: 'APP-2026-104',
        studentFirstName: 'Sainabou',
        studentLastName: 'Njie',
        dateOfBirth: '2011-04-12',
        gender: 'FEMALE',
        requestedClassId: 'CLS-001',
        requestedClassName: 'Grade 7 Section A',
        parentName: 'Pa Modou Njie',
        parentEmail: 'pamodou.njie@gmail.com',
        parentPhone: '+220 7332211',
        previousSchool: 'Marina International Lower Basic School',
        applicationDate: '2026-08-08',
        status: 'PENDING'
      },
      {
        id: 'APP-002',
        schoolId: 'SCH-001',
        applicationNo: 'APP-2026-105',
        studentFirstName: 'Baboucarr',
        studentLastName: 'Sanneh',
        dateOfBirth: '2009-09-03',
        gender: 'MALE',
        requestedClassId: 'CLS-004',
        requestedClassName: 'Grade 10 Science A',
        parentName: 'Kaddy Sanneh',
        parentEmail: 'kaddy.sanneh@yahoo.com',
        parentPhone: '+220 9110022',
        previousSchool: 'Nusrat Senior Secondary School',
        applicationDate: '2026-08-09',
        status: 'UNDER_REVIEW'
      }
    ];

    // 13. Announcements
    this.announcements = [
      {
        id: 'ANC-001',
        schoolId: 'SCH-001',
        title: 'Term 1 Examination Timetable Released',
        content: 'All teachers and students are hereby informed that the official Term 1 examination schedule is now active. Please ensure all outstanding fees are settled prior to permit distribution.',
        targetAudience: 'ALL',
        authorName: 'Dr. Alieu Baah (Principal)',
        date: '2026-08-01',
        priority: 'HIGH'
      },
      {
        id: 'ANC-002',
        schoolId: 'SCH-001',
        title: 'Parent-Teacher Association (PTA) General Meeting',
        content: 'There will be a mandatory PTA meeting on Saturday, 15th August at 10:00 AM in the School Main Hall to discuss academic progress and campus infrastructure expansion.',
        targetAudience: 'PARENTS',
        authorName: 'Mustapha Camara (School Admin)',
        date: '2026-08-05',
        priority: 'NORMAL'
      }
    ];

    // 14. Notifications
    this.notifications = [
      {
        id: 'NTF-001',
        userId: 'USR-006',
        title: 'Payment Received',
        message: 'Your payment of GMD 15,000 for Lamin Kebba Touray has been successfully logged under Receipt #RCP-2026-0891.',
        type: 'FEE_DUE',
        read: false,
        createdAt: '2026-08-02T10:15:00Z'
      },
      {
        id: 'NTF-002',
        userId: 'USR-007',
        title: 'Term 1 Exam Results Published',
        message: 'Your results for Term 1 Final Examinations have been verified and published by your class teacher.',
        type: 'RESULT_PUBLISHED',
        read: true,
        createdAt: '2026-08-10T14:30:00Z'
      }
    ];

    // 15. Timetable
    this.timetable = [
      { id: 'TT-001', schoolId: 'SCH-001', classId: 'CLS-004', className: 'Grade 10 Science A', day: 'MONDAY', startTime: '08:30', endTime: '09:30', subjectName: 'Mathematics', teacherName: 'Fatou Jammeh', room: 'Lab 2' },
      { id: 'TT-002', schoolId: 'SCH-001', classId: 'CLS-004', className: 'Grade 10 Science A', day: 'MONDAY', startTime: '09:30', endTime: '10:30', subjectName: 'Physics', teacherName: 'Fatou Jammeh', room: 'Physics Lab' },
      { id: 'TT-003', schoolId: 'SCH-001', classId: 'CLS-004', className: 'Grade 10 Science A', day: 'MONDAY', startTime: '10:45', endTime: '11:45', subjectName: 'English Language', teacherName: 'Modou Secka', room: 'Room 10A' },
      { id: 'TT-004', schoolId: 'SCH-001', classId: 'CLS-004', className: 'Grade 10 Science A', day: 'TUESDAY', startTime: '08:30', endTime: '09:30', subjectName: 'Chemistry', teacherName: 'Binta Darboe', room: 'Chemistry Lab' },
      { id: 'TT-005', schoolId: 'SCH-001', classId: 'CLS-004', className: 'Grade 10 Science A', day: 'WEDNESDAY', startTime: '11:00', endTime: '12:00', subjectName: 'ICT', teacherName: 'Ousman Dibba', room: 'Computer Lab' }
    ];

    // 16. Calendar
    this.calendar = [
      { id: 'CAL-001', schoolId: 'SCH-001', title: 'Mid-Term Examinations', type: 'EXAM', startDate: '2026-08-20', endDate: '2026-08-25', description: 'Comprehensive assessment for all classes.' },
      { id: 'CAL-002', schoolId: 'SCH-001', title: 'Assumption of Mary Public Holiday', type: 'HOLIDAY', startDate: '2026-08-15', endDate: '2026-08-15', description: 'School closed for official national holiday.' },
      { id: 'CAL-003', schoolId: 'SCH-001', title: 'PTA Executive Committee Meeting', type: 'MEETING', startDate: '2026-08-28', endDate: '2026-08-28', description: 'Quarterly financial and strategy review.' }
    ];

    // 17. Audit Logs
    this.auditLogs = [
      { id: 'LOG-001', schoolId: 'SCH-001', userName: 'Mustapha Camara', userRole: 'SCHOOL_ADMIN', action: 'SCHOOL_SETTINGS_UPDATE', entity: 'School', entityId: 'SCH-001', timestamp: '2026-08-01T09:00:00Z', ipAddress: '197.234.221.10', details: 'Updated school contact information and academic term setting.' },
      { id: 'LOG-002', schoolId: 'SCH-001', userName: 'Fatou Jammeh', userRole: 'TEACHER', action: 'EXAM_MARKS_ENTRY', entity: 'ResultMark', entityId: 'EXM-002', timestamp: '2026-08-08T11:20:00Z', ipAddress: '197.234.221.14', details: 'Entered physics final exam marks for Grade 10 Science A.' },
      { id: 'LOG-003', schoolId: 'SCH-001', userName: 'Ousman Dibba', userRole: 'ACCOUNTANT', action: 'FEE_PAYMENT_RECORDED', entity: 'Payment', entityId: 'PAY-001', timestamp: '2026-08-02T10:14:00Z', ipAddress: '197.234.221.18', details: 'Issued Receipt #RCP-2026-0891 for Lamin Kebba Touray (GMD 15,000).' }
    ];
  }
}

export const db = new DatabaseStore();
