import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  School, Bell, User, LogOut, ChevronDown, ShieldCheck,
  GraduationCap, BookOpen, Wallet, Users, Eye, Menu, X, Check
} from 'lucide-react';
import { api } from '../services/api';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeModule: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, activeModule }) => {
  const { user, school, logout, quickSwitchRole } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const rolesList: { role: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', icon: <ShieldCheck className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800' },
    { role: 'SCHOOL_ADMIN', label: 'School Admin', icon: <School className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800' },
    { role: 'PRINCIPAL', label: 'Principal', icon: <BookOpen className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-800' },
    { role: 'TEACHER', label: 'Teacher', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-800' },
    { role: 'ACCOUNTANT', label: 'Accountant', icon: <Wallet className="w-4 h-4" />, color: 'bg-amber-100 text-amber-800' },
    { role: 'RECEPTIONIST', label: 'Receptionist', icon: <Users className="w-4 h-4" />, color: 'bg-teal-100 text-teal-800' },
    { role: 'PARENT', label: 'Parent / Guardian', icon: <Users className="w-4 h-4" />, color: 'bg-cyan-100 text-cyan-800' },
    { role: 'STUDENT', label: 'Student', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-rose-100 text-rose-800' }
  ];

  const currentRoleInfo = rolesList.find(r => r.role === user?.role) || rolesList[1];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30">
      {/* Left Section: Mobile Menu & School Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 focus:outline-hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs overflow-hidden shrink-0">
            {school?.logo ? (
              <img src={school.logo} alt={school.name} className="w-full h-full object-cover" />
            ) : (
              <School className="w-5 h-5" />
            )}
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight tracking-tight flex items-center gap-2">
              {school?.name || 'Gambia Education Suite'}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              {school?.academicYear || '2026/2027'} &bull; {school?.currentTerm || 'Term 1'} &bull; {school?.motto || 'Institutional School System'}
            </p>
          </div>
        </div>
      </div>

      {/* Right Section: Quick Role Switcher, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-medium text-slate-700"
            title="Click to switch persona role view"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline text-slate-500 font-normal">Role:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${currentRoleInfo.color}`}>
              {currentRoleInfo.label}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Switch Persona / Role View
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={async () => {
                      setShowRoleDropdown(false);
                      await quickSwitchRole(r.role);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      user?.role === r.role ? 'bg-indigo-50/50 text-indigo-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded ${r.color}`}>{r.icon}</span>
                      <span>{r.label}</span>
                    </div>
                    {user?.role === r.role && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-md text-slate-600 hover:bg-slate-100 relative transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <NotificationCenter onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs overflow-hidden border border-indigo-200">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              user?.fullName.charAt(0) || 'U'
            )}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-none">{user?.fullName}</div>
            <div className="text-[10px] text-slate-500 truncate max-w-[120px] mt-0.5">{user?.email}</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
