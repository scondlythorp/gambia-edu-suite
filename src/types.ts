export type UserRole = 
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'PRINCIPAL'
  | 'TEACHER'
  | 'ACCOUNTANT'
  | 'RECEPTIONIST'
  | 'PARENT'
  | 'STUDENT';

export interface School {
  id: string;
  name: string;
  code: string;
  logo: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  region: string;
  website: string;
  schoolType: string;
  academicYear: string;
  currentTerm: string;
  motto: string;
  principalName: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface User {
  id: string;
  schoolId: string;
  schoolName?: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  studentId?: string;
  parentId?: string;
  teacherId?: string;
}

export interface Student {
  id: string;
  schoolId: string;
  studentNumber: string; // e.g. STU-2026-0001
  admissionNo: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  photo?: string;
  address: string;
  nationality: string;
  classId: string;
  className: string;
  section: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  admissionDate: string;
  academicYear: string;
  status: 'ACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'SUSPENDED' | 'WITHDRAWN';
}

export interface Parent {
  id: string;
  schoolId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  occupation: string;
  relationship: string;
  childrenIds: string[];
  childrenNames?: string[];
}

export interface Teacher {
  id: string;
  schoolId: string;
  teacherCode: string;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  gender: 'MALE' | 'FEMALE';
  employmentDate: string;
  assignedClassIds: string[];
  assignedClassNames?: string[];
  assignedSubjectIds: string[];
  assignedSubjectNames?: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ClassRoom {
  id: string;
  schoolId: string;
  name: string; // e.g. "Grade 10"
  section: string; // e.g. "Science A"
  capacity: number;
  classTeacherId?: string;
  classTeacherName?: string;
  subjectIds: string[];
}

export interface Subject {
  id: string;
  schoolId: string;
  code: string;
  name: string;
  classIds: string[];
  maxMarks: number;
  passMarks: number;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string;
  status: AttendanceStatus;
  term: string;
  academicYear: string;
  remarks?: string;
}

export interface Exam {
  id: string;
  schoolId: string;
  name: string;
  type: 'CONTINUOUS_ASSESSMENT' | 'MID_TERM' | 'FINAL_EXAM';
  term: string;
  academicYear: string;
  classId: string;
  className: string;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'PUBLISHED';
}

export interface ResultMark {
  id: string;
  schoolId: string;
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  studentNumber?: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  caScore: number; // Max 30
  examScore: number; // Max 70
  totalScore: number; // ca + exam
  grade: string;
  gpa: number;
  remarks: string;
  term: string;
  academicYear: string;
  isApproved: boolean;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'LOCKED';
}

export interface PromotionRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  previousClassId: string;
  previousClassName: string;
  newClassId: string;
  newClassName: string;
  academicYear: string;
  status: 'PROMOTED' | 'RETAINED' | 'GRADUATED';
  promotedAt: string;
  promotedBy: string;
  reason?: string;
}

export interface MarksUploadPreviewRow {
  studentNumber: string;
  studentName: string;
  studentId?: string;
  caScore: number;
  testScore: number;
  assignmentScore: number;
  examScore: number;
  totalScore: number;
  status: 'VALID' | 'INVALID';
  errorMessage?: string;
}

export interface StudentReportCard {
  student: Student;
  classRoom: ClassRoom;
  school: School;
  term: string;
  academicYear: string;
  results: ResultMark[];
  totalScore: number;
  averageScore: number;
  position: number;
  totalStudentsInClass: number;
  attendancePresent: number;
  attendanceTotal: number;
  teacherComment: string;
  principalComment: string;
  promotedTo?: string;
}

export interface FeeStructure {
  id: string;
  schoolId: string;
  title: string;
  feeType: 'TUITION' | 'REGISTRATION' | 'EXAMINATION' | 'TRANSPORT' | 'LAB' | 'OTHER';
  classId: string;
  className: string;
  term: string;
  academicYear: string;
  amount: number;
  dueDate: string;
}

export interface Payment {
  id: string;
  schoolId: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  feeStructureId: string;
  feeTitle: string;
  amountPaid: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CARD';
  referenceNo: string;
  paymentDate: string;
  term: string;
  academicYear: string;
  receivedBy: string;
  notes?: string;
}

export interface Expense {
  id: string;
  schoolId: string;
  title: string;
  category: 'SALARIES' | 'ELECTRICITY' | 'WATER' | 'INTERNET' | 'SUPPLIES' | 'MAINTENANCE' | 'TRANSPORT' | 'RENT' | 'OTHER';
  amount: number;
  date: string;
  paymentMethod: string;
  vendor: string;
  approvedBy: string;
  notes?: string;
}

export interface OnlineApplication {
  id: string;
  schoolId: string;
  applicationNo: string;
  studentFirstName: string;
  studentLastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  requestedClassId: string;
  requestedClassName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  previousSchool?: string;
  applicationDate: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ENROLLED';
}

export interface Announcement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  targetAudience: 'ALL' | 'TEACHERS' | 'PARENTS' | 'STUDENTS';
  authorName: string;
  date: string;
  expiryDate?: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ANNOUNCEMENT' | 'FEE_DUE' | 'RESULT_PUBLISHED' | 'ATTENDANCE_ALERT' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

export interface TimetableSlot {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherName: string;
  room: string;
}

export interface CalendarEvent {
  id: string;
  schoolId: string;
  title: string;
  type: 'EXAM' | 'HOLIDAY' | 'MEETING' | 'ACTIVITY' | 'DEADLINE';
  startDate: string;
  endDate: string;
  description: string;
}

export interface AuditLog {
  id: string;
  schoolId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  timestamp: string;
  ipAddress: string;
  details: string;
}

export interface GradeScale {
  id: string;
  minScore: number;
  maxScore: number;
  grade: string;
  gpa: number;
  remark: string;
}
