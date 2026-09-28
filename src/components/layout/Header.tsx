'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { UserRole } from '@/types/crm';
import {
  Search,
  Moon,
  Sun,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Briefcase,
  Users,
  Code2,
  X,
  ChevronDown,
  Building,
  Crown,
  UserCheck,
  Building2,
  CalendarDays,
  Home,
  LogOut
} from 'lucide-react';

export default function Header() {
  const {
    currentUser,
    theme,
    toggleTheme,
    setIsCommandPaletteOpen,
    setIsBookingModalOpen,
    setIsWFHModalOpen,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    attendance,
    checkInAttendance,
    checkOutAttendance,
    setActiveView,
    isDbConnected,
    dbError,
    logout
  } = useCRM();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const myAttendance = attendance.find(
    (a) => (a.employeeName === currentUser.name || a.employeeId === currentUser.id) && a.date === todayStr
  );
  const isPunchedIn = Boolean(myAttendance?.checkIn && !myAttendance?.checkOut);

  const handleAttendanceToggle = () => {
    if (isPunchedIn) {
      checkOutAttendance(currentUser.id);
    } else {
      checkInAttendance(currentUser.id);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          bg: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-900/40',
          icon: ShieldCheck,
          label: 'Super Admin'
        };
      case 'RM':
        return {
          bg: 'bg-purple-500/10 text-purple-700 border-purple-200 dark:border-purple-900/40',
          icon: Building2,
          label: 'RM (Regional Mgr)'
        };
      case 'BRANCH_MANAGER':
        return {
          bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:border-indigo-900/40',
          icon: Building,
          label: 'Branch Manager'
        };
      case 'TL':
        return {
          bg: 'bg-amber-500/10 text-amber-700 border-amber-200 dark:border-amber-900/40',
          icon: Crown,
          label: 'Team Leader (TL)'
        };
      case 'BDM':
        return {
          bg: 'bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-900/40',
          icon: UserCheck,
          label: 'BDM (Manager)'
        };
      case 'BDE':
        return {
          bg: 'bg-teal-500/10 text-teal-700 border-teal-200 dark:border-teal-900/40',
          icon: Briefcase,
          label: 'BDE (Executive)'
        };
      case 'HR':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/40',
          icon: Users,
          label: 'HR Manager'
        };
      case 'TECH':
        return {
          bg: 'bg-sky-500/10 text-sky-600 border-sky-200 dark:border-sky-900/40',
          icon: Code2,
          label: 'Tech / IT'
        };
    }
  };

  const roleMeta = getRoleBadge(currentUser.role);
  const RoleIcon = roleMeta.icon;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/90 lg:px-6">
      {/* Left side: Search bar & Quick Booking button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="group flex h-9 items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-500 shadow-xs transition hover:border-indigo-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          <span className="hidden sm:inline">Search clients, bookings, schemes, loans...</span>
          <span className="inline sm:hidden">Search...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-2xs dark:border-slate-700 dark:bg-slate-900">
            ⌘K
          </kbd>
        </button>

        {/* Quick New Booking Button */}
        {['SUPER_ADMIN', 'RM', 'BRANCH_MANAGER', 'TL', 'BDM', 'BDE'].includes(currentUser.role) && (
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95"
          >
            <span className="text-sm leading-none">+</span>
            <span>New Booking</span>
          </button>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2.5">
        {/* Attendance Punch-in Widget */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={handleAttendanceToggle}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              isPunchedIn
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
            title={isPunchedIn ? 'Click to punch out' : 'Click to punch in'}
          >
            <Clock className={`h-3.5 w-3.5 ${isPunchedIn ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            <span>{isPunchedIn ? `Checked In (${myAttendance?.workingHours || 'Active'})` : 'Punch In'}</span>
          </button>

          {/* Quick Apply Leave Button */}
          <button
            onClick={() => setActiveView('leaves')}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300 transition"
            title="Apply for Leave / View Balance"
          >
            <CalendarDays className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Apply Leave</span>
          </button>

          {/* Quick Apply WFH Button */}
          <button
            onClick={() => setIsWFHModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50/70 px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300 transition"
            title="Apply for Work From Home (WFH)"
          >
            <Home className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>Apply WFH</span>
          </button>
        </div>

        {/* Database Status Indicator */}
        {isDbConnected ? (
          <button
            onClick={() => setActiveView('integrations')}
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-2xs hover:bg-emerald-100 transition"
            title="Live Supabase Database Connected. Click to view Integrations."
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Supabase Live</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveView('integrations')}
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 shadow-2xs hover:bg-amber-100 transition"
            title={dbError || 'Supabase Key Required in .env.local'}
          >
            <span className="inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            <span>DB Key Pending</span>
          </button>
        )}

        {/* Authenticated Official Role Badge (Non-simulated) */}
        <div
          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold select-none ${roleMeta.bg}`}
          title={`Official Role: ${roleMeta.label}`}
        >
          <RoleIcon className="h-3.5 w-3.5" />
          <span className="hidden md:inline">{roleMeta.label}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Bell className="h-3.5 w-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-2xs">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-1 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-2 max-h-80 overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">No notifications yet</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.link) {
                          setActiveView(notif.link);
                          setIsNotifOpen(false);
                        }
                      }}
                      className={`group flex items-start gap-3 p-2 rounded-xl cursor-pointer transition ${
                        notif.read
                          ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          : 'bg-indigo-50/60 hover:bg-indigo-50 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60'
                      }`}
                    >
                      <div className="mt-0.5">
                        {notif.type === 'payment' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : notif.type === 'booking' ? (
                          <Briefcase className="h-4 w-4 text-indigo-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{notif.title}</p>
                          <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                        </div>
                        <p className="mt-0.5 text-slate-500 dark:text-slate-400">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current User Info Dropdown */}
        <div className="relative pl-1.5 border-l border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition dark:hover:border-slate-800 dark:hover:bg-slate-800/60 cursor-pointer"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
            <div className="hidden xl:block text-left leading-tight">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400">{currentUser.designation}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/30"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate">{currentUser.email}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-block rounded-md bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {currentUser.role}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">{currentUser.branch || 'Corporate HQ'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <button
                  onClick={() => {
                    setActiveView('user-management');
                    setIsProfileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span>User Management</span>
                  <span className="text-[10px] text-slate-400">Team Directory</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('system-config');
                    setIsProfileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span>System Settings</span>
                  <span className="text-[10px] text-slate-400">Config</span>
                </button>

                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out of Workspace</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
