import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Users, GraduationCap, Wallet, CalendarCheck, TrendingUp,
  Award, ArrowUpRight, Bell, AlertTriangle, CheckCircle2, DollarSign,
  Clock, BookOpen, ShieldCheck, FileText, ArrowRight
} from 'lucide-react';
import { ReportCardView } from '../components/ReportCardView';

export const DashboardPage: React.FC<{ onNavigate: (module: string) => void }> = ({ onNavigate }) => {
  const { user, school } = useAuth();
  const role = user?.role || 'SCHOOL_ADMIN';
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReportSummary()
      .then(res => setSummary(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <div className="text-xs font-semibold">Loading Gambia Education Dashboard Analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ROLE: {role.replace('_', ' ')} &bull; {school?.name}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Welcome back, {user?.fullName}!
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {role === 'SUPER_ADMIN' ? 'SaaS Platform Central Command: Overseeing educational institutions and audit events.' :
               role === 'STUDENT' ? 'Access your academic report cards, daily timetable, and fee status.' :
               role === 'PARENT' ? 'Track your children\'s attendance, exam scores, and fee payment receipts.' :
               role === 'TEACHER' ? 'Manage assigned classes, mark daily attendance, and enter student scores.' :
               role === 'ACCOUNTANT' ? 'Track fee payments, issue official receipts, and log school operating expenses.' :
               'All-in-one management of students, teachers, results, fees, and school operations.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('announcements')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              View Notices
            </button>
            {(role === 'SCHOOL_ADMIN' || role === 'SUPER_ADMIN') && (
              <button
                onClick={() => onNavigate('students')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                Manage Students
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Total Students</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{summary?.totalStudents || 4}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +12%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active enrolled in current term</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Total Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              GMD {(summary?.totalRevenue || 36000).toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" /> Paid
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Fee collections this term</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Attendance Rate</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{summary?.attendanceRate || 95}%</span>
            <span className="text-xs font-semibold text-indigo-600">Daily Register</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Present & Late attendance average</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Active Teachers</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{summary?.totalTeachers || 2}</span>
            <span className="text-xs font-semibold text-purple-600">{summary?.totalClasses || 6} Classes</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Assigned faculty members</p>
        </div>
      </div>

      {/* Role Specific Action Cards / Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Section (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Access Action Shortcuts */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Quick Action Shortcuts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => onNavigate('attendance')}
                className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold transition-all text-left flex flex-col justify-between h-24"
              >
                <CalendarCheck className="w-5 h-5 text-indigo-600" />
                <span>Mark Attendance</span>
              </button>

              <button
                onClick={() => onNavigate('exams')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold transition-all text-left flex flex-col justify-between h-24"
              >
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Enter Marks & Results</span>
              </button>

              <button
                onClick={() => onNavigate('fees')}
                className="p-3 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold transition-all text-left flex flex-col justify-between h-24"
              >
                <Wallet className="w-5 h-5 text-amber-600" />
                <span>Record Fee Payment</span>
              </button>

              <button
                onClick={() => onNavigate('applications')}
                className="p-3 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold transition-all text-left flex flex-col justify-between h-24"
              >
                <FileText className="w-5 h-5 text-purple-600" />
                <span>Admissions Portal</span>
              </button>
            </div>
          </div>

          {/* Recent Student Registrations Table */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recent Enrolled Students
              </h3>
              <button
                onClick={() => onNavigate('students')}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {summary?.recentStudents?.map((st: any) => (
                <div key={st.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={st.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                      alt={st.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{st.fullName}</div>
                      <div className="text-[11px] text-slate-500">{st.className} &bull; {st.admissionNo}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Column (1 Col) */}
        <div className="space-y-6">
          {/* Recent Fee Receipts */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recent Payments Logged
              </h3>
              <button
                onClick={() => onNavigate('fees')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                View Fees
              </button>
            </div>

            <div className="space-y-3">
              {summary?.recentPayments?.map((p: any) => (
                <div key={p.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{p.studentName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.receiptNo} &bull; {p.paymentMethod}</div>
                  </div>
                  <div className="text-xs font-black text-emerald-600 font-mono">
                    +GMD {p.amountPaid.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* School Announcements Preview */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Latest Announcements
              </h3>
              <Bell className="w-4 h-4 text-amber-500" />
            </div>

            <div className="space-y-3">
              {summary?.recentAnnouncements?.map((anc: any) => (
                <div key={anc.id} className="p-3 bg-amber-50/50 rounded-lg border border-amber-100 text-xs">
                  <div className="font-bold text-slate-900">{anc.title}</div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{anc.content}</p>
                  <div className="text-[10px] text-slate-400 mt-2 font-medium">{anc.authorName} &bull; {anc.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
