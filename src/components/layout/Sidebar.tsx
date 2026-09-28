'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import {
  LayoutDashboard,
  UserCheck,
  Building2,
  BookmarkCheck,
  KanbanSquare,
  PhoneCall,
  CheckSquare,
  Activity,
  Users2,
  Clock,
  CalendarDays,
  Palmtree,
  BarChart3,
  FileSpreadsheet,
  UserCog,
  Sliders,
  Sparkles,
  Layers,
  Webhook,
  Bell,
  History,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Zap,
  Radar,
  Network,
  Laptop,
  Terminal,
  Trophy,
  Crown
} from 'lucide-react';

export default function Sidebar() {
  const { currentUser, activeView, setActiveView, setIsBookingModalOpen } = useCRM();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const role = currentUser.role;

  // Determine role-based visibility
  const canSeeRM = role === 'SUPER_ADMIN' || role === 'RM';
  const canSeeSales =
    role === 'SUPER_ADMIN' ||
    role === 'TECH' ||
    role === 'RM' ||
    role === 'BRANCH_MANAGER' ||
    role === 'TL' ||
    role === 'BDM' ||
    role === 'BDE';
  const canSeeHR = role === 'SUPER_ADMIN' || role === 'RM' || role === 'HR';
  const canSeeUserMgmt =
    role === 'SUPER_ADMIN' ||
    role === 'RM' ||
    role === 'HR' ||
    role === 'TECH' ||
    role === 'BRANCH_MANAGER';
  const canSeeSystem = role === 'SUPER_ADMIN' || role === 'TECH';
  const canSeeTLHub =
    role === 'SUPER_ADMIN' ||
    role === 'RM' ||
    role === 'BRANCH_MANAGER' ||
    role === 'TL';

  const salesNavItems = [
    ...(canSeeTLHub
      ? [
          {
            id: 'tl-team-hub',
            label: role === 'TL' ? 'My Team Hub & Rankings' : 'Team Hub & Rankings',
            icon: Trophy,
            badge: 'Leaderboard'
          }
        ]
      : []),
    { id: 'leads', label: 'Leads', icon: UserCheck },
    { id: 'customers', label: 'Customers', icon: Users2 },
    { id: 'bookings', label: 'Bookings', icon: BookmarkCheck, badge: 'Key' },
    { id: 'teams', label: 'Teams & Hierarchy', icon: Network, badge: '16 Teams' },
    { id: 'followups', label: 'Follow-ups', icon: PhoneCall },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  ];

  const hrNavItems = [
    { id: 'employees', label: 'Employees Directory', icon: Users2 },
    { id: 'attendance', label: 'Attendance & MTD', icon: Clock, badge: 'Excel' },
    { id: 'leaves', label: 'Leaves & WFH Approvals', icon: CalendarDays },
    { id: 'holidays', label: 'Holidays', icon: Palmtree },
  ];

  const myWorkspaceNavItems = [
    { id: 'attendance', label: 'My Attendance & MTD', icon: Clock, badge: 'Punches' },
    { id: 'leaves', label: 'Apply Leave & WFH', icon: CalendarDays, badge: 'New' },
    { id: 'holidays', label: 'Company Holidays', icon: Palmtree },
  ];

  const reportNavItems = [
    ...(canSeeSales ? [{ id: 'reports-sales', label: 'Sales Reports', icon: BarChart3 }] : []),
    ...(canSeeHR ? [
      { id: 'reports-hr', label: 'HR & Attendance Exports', icon: FileSpreadsheet, badge: 'Excel' },
      { id: 'reports-attendance', label: 'Attendance Reports', icon: Clock }
    ] : []),
  ];

  const systemNavItems = [
    { id: 'tech-cockpit', label: 'Tech Master Cockpit', icon: Terminal, badge: 'Tech' },
    { id: 'system-config', label: 'CRM Configuration', icon: Sliders },
    { id: 'custom-fields', label: 'Custom Fields', icon: Layers },
    { id: 'automation', label: 'Automation Builder', icon: Sparkles },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'api-webhooks', label: 'API / Webhooks', icon: Webhook },
    { id: 'notifications-page', label: 'Notifications', icon: Bell },
    { id: 'audit-logs', label: 'Audit Logs', icon: History },
  ];

  const renderNavGroup = (title: string, items: typeof salesNavItems) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        {!isCollapsed && (
          <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {title}
          </div>
        )}
        <div className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs dark:bg-indigo-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex flex-1 items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside
      className={`sticky top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-xs font-bold text-base tracking-wider">
              S
            </div>
            <div className="leading-tight truncate">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">SATYA CRM</h2>
              <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">Gov Schemes & IT Services</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-xs font-bold text-base">
            S
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Booking CTA Button (Sales & Super Admin) */}
      {!isCollapsed && canSeeSales && (
        <div className="p-3 pb-1">
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98]"
          >
            <span className="text-base leading-none font-bold">+</span>
            <span>New Customer Booking</span>
          </button>
        </div>
      )}

      {/* Navigation Links (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* Main Dashboard */}
        <div className="mb-4">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
              activeView === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard
              className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                activeView === 'dashboard' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
              }`}
            />
            {!isCollapsed && <span>Dashboard</span>}
          </button>
        </div>

        {/* Regional Command Cockpit (RM & Super Admin) */}
        {canSeeRM && (
          <div className="mb-4">
            {!isCollapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Regional Command
              </div>
            )}
            <button
              onClick={() => setActiveView('rm-cockpit')}
              title={isCollapsed ? 'RM 360° Branch Cockpit' : undefined}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                activeView === 'rm-cockpit'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
                  : 'text-amber-700 bg-amber-50/80 hover:bg-amber-100 hover:text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60'
              }`}
            >
              <Radar
                className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                  activeView === 'rm-cockpit' ? 'text-white' : 'text-amber-600 dark:text-amber-400'
                }`}
              />
              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">RM 360° Cockpit</span>
                  <span className="rounded-full bg-amber-200/60 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                    Live
                  </span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Dedicated Team Leader Portal (TL Role) */}
        {role === 'TL' && (
          <div className="mb-4">
            {!isCollapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Team Leader Portal
              </div>
            )}
            <button
              onClick={() => setActiveView('tl-team-hub')}
              title={isCollapsed ? 'My Team Hub & Rankings' : undefined}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                activeView === 'tl-team-hub'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                  : 'text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 hover:text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60'
              }`}
            >
              <Trophy
                className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                  activeView === 'tl-team-hub' ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'
                }`}
              />
              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">My Team & Rankings</span>
                  <span className="rounded-full bg-indigo-200/60 px-1.5 py-0.5 text-[9px] font-bold uppercase text-indigo-900 dark:bg-indigo-900 dark:text-indigo-200">
                    Leaderboard
                  </span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Sales Group */}
        {canSeeSales && renderNavGroup('Sales', salesNavItems)}

        {/* HR Group or Employee Attendance/Leaves Group */}
        {canSeeHR ? (
          renderNavGroup('HR & Operations', hrNavItems)
        ) : (
          renderNavGroup('Attendance & Leaves', myWorkspaceNavItems)
        )}

        {/* Reports Group */}
        {reportNavItems.length > 0 && renderNavGroup('Reports', reportNavItems)}

        {/* User Management */}
        {canSeeUserMgmt && (
          <div className="mb-4">
            {!isCollapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                User Management
              </div>
            )}
            <button
              onClick={() => setActiveView('user-management')}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                activeView === 'user-management'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white'
              }`}
            >
              <UserCog
                className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                  activeView === 'user-management' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              {!isCollapsed && <span>Users & Roles</span>}
            </button>
          </div>
        )}

        {/* System Group */}
        {canSeeSystem && renderNavGroup('System', systemNavItems)}
      </div>

      {/* Role Indicator Footer */}
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 text-xs dark:bg-slate-800/60">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <ShieldAlert className="h-3.5 w-3.5" />
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{currentUser.role.replace('_', ' ')}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              title={`Active: ${currentUser.role}`}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
