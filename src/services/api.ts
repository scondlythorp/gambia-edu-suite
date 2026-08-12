import {
  User, School, Student, Parent, Teacher, ClassRoom, Subject,
  AttendanceRecord, Exam, ResultMark, FeeStructure, Payment, Expense,
  OnlineApplication, Announcement, Notification, TimetableSlot, CalendarEvent,
  AuditLog, PromotionRecord
} from '../types';

const getToken = () => localStorage.getItem('edumanage_token');

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errMessage = 'API Request Failed';
    try {
      const errData = await res.json();
      errMessage = errData.error || errData.message || errMessage;
    } catch (e) {
      // ignore
    }
    throw new Error(errMessage);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, role?: string) => fetchApi<{ token: string; user: User; school: School }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, role })
  }),
  getMe: () => fetchApi<{ user: User; school: School }>('/auth/me'),

  // Schools & Users
  getSchools: () => fetchApi<School[]>('/schools'),
  updateSchool: (id: string, data: Partial<School>) => fetchApi<School>(`/schools/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getUsers: () => fetchApi<User[]>('/users'),
  createUser: (data: Partial<User>) => fetchApi<User>('/users', { method: 'POST', body: JSON.stringify(data) }),

  // Students
  getStudents: (params?: { search?: string; classId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.classId) query.append('classId', params.classId);
    if (params?.status) query.append('status', params.status);
    return fetchApi<Student[]>(`/students?${query.toString()}`);
  },
  getStudentById: (id: string) => fetchApi<Student>(`/students/${id}`),
  createStudent: (data: Partial<Student>) => fetchApi<Student>('/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: string, data: Partial<Student>) => fetchApi<Student>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  archiveStudent: (id: string) => fetchApi<{ message: string }>(`/students/${id}`, { method: 'DELETE' }),

  // Promotion & Graduation
  promoteStudents: (promotions: any[]) => fetchApi<{ message: string; count: number; history: PromotionRecord[] }>('/students/promote', { method: 'POST', body: JSON.stringify({ promotions }) }),
  getPromotionHistory: () => fetchApi<PromotionRecord[]>('/promotion-history'),

  // Parents & Teachers
  getParents: () => fetchApi<Parent[]>('/parents'),
  createParent: (data: Partial<Parent>) => fetchApi<Parent>('/parents', { method: 'POST', body: JSON.stringify(data) }),
  getTeachers: () => fetchApi<Teacher[]>('/teachers'),
  createTeacher: (data: Partial<Teacher>) => fetchApi<Teacher>('/teachers', { method: 'POST', body: JSON.stringify(data) }),

  // Classes & Subjects
  getClasses: () => fetchApi<ClassRoom[]>('/classes'),
  createClass: (data: Partial<ClassRoom>) => fetchApi<ClassRoom>('/classes', { method: 'POST', body: JSON.stringify(data) }),
  getSubjects: () => fetchApi<Subject[]>('/subjects'),
  createSubject: (data: Partial<Subject>) => fetchApi<Subject>('/subjects', { method: 'POST', body: JSON.stringify(data) }),

  // Attendance
  getAttendance: (params?: { classId?: string; date?: string; studentId?: string }) => {
    const query = new URLSearchParams();
    if (params?.classId) query.append('classId', params.classId);
    if (params?.date) query.append('date', params.date);
    if (params?.studentId) query.append('studentId', params.studentId);
    return fetchApi<AttendanceRecord[]>(`/attendance?${query.toString()}`);
  },
  saveBulkAttendance: (records: Partial<AttendanceRecord>[]) => fetchApi<{ message: string; count: number }>('/attendance/bulk', {
    method: 'POST',
    body: JSON.stringify({ records })
  }),

  // Exams & Results
  getExams: () => fetchApi<Exam[]>('/exams'),
  createExam: (data: Partial<Exam>) => fetchApi<Exam>('/exams', { method: 'POST', body: JSON.stringify(data) }),
  getResults: (params?: { studentId?: string; classId?: string; examId?: string; subjectId?: string }) => {
    const query = new URLSearchParams();
    if (params?.studentId) query.append('studentId', params.studentId);
    if (params?.classId) query.append('classId', params.classId);
    if (params?.examId) query.append('examId', params.examId);
    if (params?.subjectId) query.append('subjectId', params.subjectId);
    return fetchApi<ResultMark[]>(`/results?${query.toString()}`);
  },
  saveResultMark: (data: { examId: string; studentId: string; studentName: string; classId: string; subjectId: string; subjectName: string; caScore: number; examScore: number }) =>
    fetchApi<ResultMark>('/results/save', { method: 'POST', body: JSON.stringify(data) }),
  approveResults: (classId: string, examId: string) => fetchApi<{ message: string }>('/results/approve', { method: 'POST', body: JSON.stringify({ classId, examId }) }),
  getReportCard: (studentId: string) => fetchApi<any>(`/report-cards/${studentId}`),

  // Fees & Payments
  getFees: () => fetchApi<FeeStructure[]>('/fees'),
  createFee: (data: Partial<FeeStructure>) => fetchApi<FeeStructure>('/fees', { method: 'POST', body: JSON.stringify(data) }),
  getPayments: () => fetchApi<Payment[]>('/payments'),
  recordPayment: (data: Partial<Payment>) => fetchApi<Payment>('/payments', { method: 'POST', body: JSON.stringify(data) }),

  // Expenses
  getExpenses: () => fetchApi<Expense[]>('/expenses'),
  createExpense: (data: Partial<Expense>) => fetchApi<Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) }),

  // Applications
  getApplications: () => fetchApi<OnlineApplication[]>('/applications'),
  submitPublicApplication: (data: Partial<OnlineApplication>) => fetchApi<OnlineApplication>('/applications/public', { method: 'POST', body: JSON.stringify(data) }),
  updateApplicationStatus: (id: string, status: string) => fetchApi<OnlineApplication>(`/applications/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Announcements & Notifications
  getAnnouncements: () => fetchApi<Announcement[]>('/announcements'),
  createAnnouncement: (data: Partial<Announcement>) => fetchApi<Announcement>('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  getNotifications: () => fetchApi<Notification[]>('/notifications'),
  markNotificationRead: (id: string) => fetchApi<{ message: string }>(`/notifications/${id}/read`, { method: 'PUT' }),

  // Timetable, Calendar, Audit & Reports
  getTimetable: (classId?: string) => fetchApi<TimetableSlot[]>(`/timetable${classId ? '?classId=' + classId : ''}`),
  getCalendar: () => fetchApi<CalendarEvent[]>('/calendar'),
  getAuditLogs: () => fetchApi<AuditLog[]>('/audit-logs'),
  getReportSummary: () => fetchApi<any>('/reports/summary')
};
