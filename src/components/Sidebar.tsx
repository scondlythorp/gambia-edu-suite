import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  LayoutDashboard, Users, UserCheck, GraduationCap, BookOpen,
  CalendarCheck, Award, Wallet, Receipt, FileText, Megaphone,
  Calendar, ShieldAlert, Settings, Building2, ClipboardList, Clock, Layers, TrendingUp
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onSelectModule: (module: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpenMobile,
  onCloseMobile
}) => {
  const { user } = useAuth();
  const role = user?.role || 'SCHOOL_ADMIN';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'RECEPTIONIST', 'PARENT', 'STUDENT']
    },
    {
      id: 'super-admin',
      label: 'Platform Administration',
      icon: <Building2 className="w-4 h-4" />,
      allowedRoles: ['SUPER_ADMIN']
    },
    {
      id: 'students',
      label: 'Students Directory',
      icon: <Users className="w-4 h-4" />,
      allowedRoles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'RECEPTIONIST', 'PARENT', 'STUDENT']
    },
    {
      id: 'parents',
      label: 'Parents & Guardians',
      icon: <UserCheck className="w-4 h-4" />,
      allowedRoles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'RECEPTIONIST']
    },
    {
      id: 'teachers',
      label: 'Staff & Teachers',
      icon: <GraduationCap className="w-4 h-4" />,
      allowedRoles: ['SCHOOL_ADMIN', 'PRINCIPAL']
    },
    {
      id: 'classes',
      label: 'Classes & Subjects',
      icon: <BookOpen className="w-4 h-4" />,
      allowedRoles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER']
    },
    {
      id: 'attendance',
      label: 'Attendance Register',
      icon: <CalendarCheck className="w-4 h-4" />,
      allowedRoles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT']
    },
    {
      id: 'exams',
      label: 'Exams & Marks Entry',
      icon: <Award className="w-4 h-4" />,
      allowedRoles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT']
    },
    {
      id: 'promotions',
      label: 'Student Promotion',
      icon: <TrendingUp className="w-4 h-4" />,
      allowedRoles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER']
    },
    {
      id: 'fees',
      label: 'Fees & Payments',
      icon: <Wallet className="w-4 h-4" />,
      allowedRoles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST', 'PARENT', 'STUDENT']
    },
    {
      id: 'expenses',
      label: 'School Expenses',
      icon: <Receipt className="w-4 h-4" />,
      allowedRoles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT']
    },
    {
      id: 'applications',
      label: 'Admissions & Applications',
      icon: <FileText className="w-4 h-4" />,
      allowedRoles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'RECEPTIONIST']
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: <Megaphone className="w-4 h-4" />,
      allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'RECEPTIONIST', 'PARENT', 'STUDENT']
    },
    {
      id: 'timetable',
      label: 'Timetable & Calendar',
      icon: <Calendar className="w-4 h-4" />,
      allowedRoles: ['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT']
    },
    {
      id: 'reports',
      label: 'Analytics & Reports',
      icon: <ClipboardList className="w-4 h-4" />,
      allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT']
    },
    {
      id: 'audit-logs',
      label: 'Security Audit Logs',
      icon: <ShieldAlert className="w-4 h-4" />,
      allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN']
    },
    {
      id: 'settings',
      label: 'School Configuration',
      icon: <Settings className="w-4 h-4" />,
      allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN']
    }
  ];

  const filteredItems = menuItems.filter(item => item.allowedRoles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-base shadow-sm">
            G
          </div>
          <div>
            <span className="text-white font-bold tracking-tight text-sm block">Gambia Education Suite</span>
            <span className="text-[10px] text-indigo-400 font-mono font-semibold block">Institutional Platform v3.0</span>
          </div>
        </div>

        {/* User Badge Info */}
        <div className="px-4 py-3 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <div className="text-xs font-medium text-slate-300 truncate max-w-[140px]">
              {user?.fullName}
            </div>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase">
            {role.split('_')[0]}
          </span>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Architecture
          </div>
          {filteredItems.map(item => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className={isActive ? 'text-indigo-400' : 'text-slate-400'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info box */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="bg-indigo-900/30 border border-indigo-500/20 rounded-lg p-3">
            <p className="text-[10px] text-indigo-300 font-medium uppercase tracking-wider">System Operational</p>
            <p className="text-xs text-slate-400 mt-1">Ready for multi-school active session</p>
          </div>
        </div>
      </aside>
    </>
  );
};
