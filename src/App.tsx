import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { ParentsPage } from './pages/ParentsPage';
import { TeachersPage } from './pages/TeachersPage';
import { ClassesSubjectsPage } from './pages/ClassesSubjectsPage';
import { AttendancePage } from './pages/AttendancePage';
import { ExamsResultsPage } from './pages/ExamsResultsPage';
import { FeesPaymentsPage } from './pages/FeesPaymentsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { PromotionsPage } from './pages/PromotionsPage';
import { Megaphone, Calendar, ShieldAlert, Settings, Building2, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, school, updateSchoolInfo } = useAuth();
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: school?.name || 'Gambia International Academy',
    code: school?.code || 'GIA-2026',
    address: school?.address || 'Kairaba Avenue, Fajara, The Gambia',
    phone: school?.phone || '+220 4495000',
    email: school?.email || 'info@gia.edu.gm',
    academicYear: school?.academicYear || '2026/2027',
    currentTerm: school?.currentTerm || 'Term 1'
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardPage onNavigate={(mod) => setActiveModule(mod)} />;
      case 'students':
        return <StudentsPage />;
      case 'parents':
        return <ParentsPage />;
      case 'teachers':
        return <TeachersPage />;
      case 'classes':
        return <ClassesSubjectsPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'exams':
        return <ExamsResultsPage />;
      case 'promotions':
        return <PromotionsPage />;
      case 'fees':
        return <FeesPaymentsPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'applications':
        return <ApplicationsPage />;
      case 'announcements':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900">School Notices & Broadcasts</h2>
                <p className="text-xs text-slate-500">Official circulars and announcements sent to teachers, parents, and students.</p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs">
                + Publish Announcement
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-full border border-indigo-200">ACADEMIC NOTICE</span>
                  <span className="text-[11px] text-slate-400 font-medium">Aug 10, 2026 &bull; By Principal Office</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Term 1 Examination Schedule & Hall Allocations</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All teachers and students are hereby advised that Term 1 Continuous Assessment examinations will commence on Monday, August 20, 2026. Hall numbers and seat arrangements have been pinned on the bulletin board.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 font-bold text-[10px] rounded-full border border-amber-200">BURSARY NOTICE</span>
                  <span className="text-[11px] text-slate-400 font-medium">Aug 05, 2026 &bull; By Bursar's Office</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">School Fee Deadline Reminder</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Parents and guardians are kindly reminded that 50% minimum fee settlement is required before student entry into examination halls. Please visit the accounts counter or utilize bank transfers.
                </p>
              </div>
            </div>
          </div>
        );
      case 'timetable':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Class Timetable & Academic Schedule</h2>
                <p className="text-xs text-slate-500">Weekly class periods, subject distribution, and room assignments.</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200">Grade 10 Science A</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-3 border-r border-slate-800">Time / Day</th>
                      <th className="p-3 border-r border-slate-800">Monday</th>
                      <th className="p-3 border-r border-slate-800">Tuesday</th>
                      <th className="p-3 border-r border-slate-800">Wednesday</th>
                      <th className="p-3 border-r border-slate-800">Thursday</th>
                      <th className="p-3">Friday</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-mono font-bold bg-slate-50 text-slate-700">08:00 - 09:00 AM</td>
                      <td className="p-3 bg-indigo-50/50 text-indigo-900 font-semibold">Mathematics (Room 12)</td>
                      <td className="p-3 bg-emerald-50/50 text-emerald-900 font-semibold">Physics Lab</td>
                      <td className="p-3 bg-indigo-50/50 text-indigo-900 font-semibold">Mathematics (Room 12)</td>
                      <td className="p-3 bg-amber-50/50 text-amber-900 font-semibold">English Language</td>
                      <td className="p-3 bg-purple-50/50 text-purple-900 font-semibold">Chemistry</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold bg-slate-50 text-slate-700">09:00 - 10:00 AM</td>
                      <td className="p-3 bg-emerald-50/50 text-emerald-900 font-semibold">Physics (Lab 2)</td>
                      <td className="p-3 bg-amber-50/50 text-amber-900 font-semibold">English Literature</td>
                      <td className="p-3 bg-purple-50/50 text-purple-900 font-semibold">Chemistry Lab</td>
                      <td className="p-3 bg-indigo-50/50 text-indigo-900 font-semibold">Mathematics</td>
                      <td className="p-3 bg-blue-50/50 text-blue-900 font-semibold">Biology</td>
                    </tr>
                    <tr className="bg-slate-100">
                      <td className="p-2 text-center font-bold text-slate-500 uppercase text-[10px]" colSpan={6}>10:00 - 10:30 AM &bull; Morning Assembly & Break</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold bg-slate-50 text-slate-700">10:30 - 11:30 AM</td>
                      <td className="p-3 bg-blue-50/50 text-blue-900 font-semibold">Biology (Bio Lab)</td>
                      <td className="p-3 bg-indigo-50/50 text-indigo-900 font-semibold">Further Mathematics</td>
                      <td className="p-3 bg-emerald-50/50 text-emerald-900 font-semibold">Physics</td>
                      <td className="p-3 bg-teal-50/50 text-teal-900 font-semibold">Computer Studies</td>
                      <td className="p-3 bg-amber-50/50 text-amber-900 font-semibold">Islamic/Christian Studies</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900">Analytics & Institutional Reports</h2>
              <p className="text-xs text-slate-500">Comprehensive exportable data logs for ministry compliance and financial audits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Student Enrollment Master Report</h3>
                <p className="text-xs text-slate-500">Complete demographic, class breakdown, and gender distribution summaries.</p>
                <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors">
                  Generate PDF Summary
                </button>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Fee Bursary Ledger Export</h3>
                <p className="text-xs text-slate-500">Detailed financial receipts, outstanding fee balances, and payment method totals.</p>
                <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors">
                  Export Excel Sheet
                </button>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Exam Score Ledger</h3>
                <p className="text-xs text-slate-500">Cumulative student score distribution, pass rates, and class ranking tables.</p>
                <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors">
                  Generate Gradebook Report
                </button>
              </div>
            </div>
          </div>
        );
      case 'audit-logs':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Security Audit Logs & Activity Ledger</h2>
                <p className="text-xs text-slate-500">Immutable audit record of system state modifications and user actions.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">System Monitoring Active</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recent Admin & Teacher Operations
              </div>
              <div className="divide-y divide-slate-100 text-xs font-mono">
                <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <span className="text-indigo-600 font-bold">[RESULT_ENTERED]</span> Teacher Fatou Jammeh submitted C.A. scores for Mathematics Grade 10
                  </div>
                  <span className="text-slate-400 text-[10px]">2026-08-11 11:42:05</span>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <span className="text-emerald-600 font-bold">[PAYMENT_RECORDED]</span> Bursar Ousman Touray recorded GMD 15,000 cash for Student Modou Lamin Thorp (Receipt #REC-2026-101)
                  </div>
                  <span className="text-slate-400 text-[10px]">2026-08-11 10:15:30</span>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <span className="text-purple-600 font-bold">[STUDENT_ADMITTED]</span> Admin Alhagie Jawara created new student profile Lamin Touray (ADM-2026-004)
                  </div>
                  <span className="text-slate-400 text-[10px]">2026-08-10 16:20:12</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900">School Profile & Configuration</h2>
              <p className="text-xs text-slate-500">Configure institutional credentials, academic year, and official letterhead header.</p>
            </div>

            {settingsSaved && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                School information successfully updated!
              </div>
            )}

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">School Full Name</label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">School Code / Ministry Reg #</label>
                  <input
                    type="text"
                    value={settingsForm.code}
                    onChange={e => setSettingsForm({ ...settingsForm, code: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={settingsForm.academicYear}
                    onChange={e => setSettingsForm({ ...settingsForm, academicYear: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Term</label>
                  <select
                    value={settingsForm.currentTerm}
                    onChange={e => setSettingsForm({ ...settingsForm, currentTerm: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <button
                onClick={async () => {
                  await updateSchoolInfo(settingsForm);
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 3000);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Save School Configuration
              </button>
            </div>
          </div>
        );
      case 'super-admin':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold uppercase rounded border border-indigo-500/30">
                    SaaS CENTRAL OS
                  </span>
                  <h2 className="text-xl font-bold mt-2">Gambia Education Multi-Tenant Platform Dashboard</h2>
                  <p className="text-xs text-slate-400 mt-1">Global oversight of subscribing schools, subscription plans, and platform database state.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
                  5 Subscribed Schools
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs ring-1 ring-black/5">
                <div className="flex justify-between items-start mb-4">
                  <span className="p-2 bg-slate-50 rounded-lg text-slate-600 font-mono text-xs">#1</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded">Starter</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Boutique Learning</h3>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed">Designed for small private learning centers.</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>Max 100 students</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>Basic Gradebook</li>
                </ul>
              </div>

              <div className="bg-white border-2 border-indigo-500 rounded-xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
                <div className="flex justify-between items-start mb-4">
                  <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600 font-mono text-xs">#2</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded">Professional</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Growing Schools</h3>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed">Optimized for expanding institutions with departmental needs.</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>Max 500 students</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>Advanced Reporting & Bursary</li>
                </ul>
              </div>

              <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-6 shadow-xs">
                <div className="flex justify-between items-start mb-4">
                  <span className="p-2 bg-slate-800 rounded-lg text-slate-400 font-mono text-xs">#3</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold uppercase rounded">Enterprise</span>
                </div>
                <h3 className="text-lg font-bold text-white">Large Institutions</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">Bespoke infrastructure for multi-campus school districts.</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full"></div>Unlimited students & campuses</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full"></div>Audit Security & Custom DB</li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardPage onNavigate={(mod) => setActiveModule(mod)} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          activeModule={activeModule}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderModuleContent()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
