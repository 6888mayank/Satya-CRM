'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ShieldAlert,
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Home,
  Calendar,
  DollarSign,
  Briefcase,
  Search,
  Filter,
  Check,
  Building,
  UserCheck,
  Code2
} from 'lucide-react';

export default function RMCockpitView() {
  const {
    currentUser,
    employees,
    attendance,
    leaves,
    wfhRequests,
    teams,
    bookings,
    updateLeaveStatus,
    updateWFHStatus,
    setActiveView
  } = useCRM();

  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const canAccess = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'RM';

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-3" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Regional Manager (RM) Access Required</h3>
        <p className="text-xs text-slate-500 max-w-md mt-1">
          The 360° Branch Oversight Cockpit is restricted to <strong>Regional Manager (RM)</strong> and <strong>Super Admin</strong>.
        </p>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Pending items
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');
  const pendingWFH = wfhRequests.filter((w) => w.status === 'Pending');

  // Branch Stats
  const totalStaff = employees.length;
  const activeToday = attendance.filter((a) => (a.status === 'Present' || a.status === 'WFH') && a.date === todayStr).length;
  const wfhToday = attendance.filter((a) => a.status === 'WFH' && a.date === todayStr).length;
  const branchRevenue = bookings.reduce((sum, b) => sum + b.paidAmount, 0);

  // Filter employees for "Ek Ek Banda" table
  const filteredEmployees = employees.filter((emp) => {
    if (departmentFilter !== 'ALL' && emp.department !== departmentFilter) return false;
    const att = attendance.find((a) => a.employeeId === emp.id && a.date === todayStr);
    const empStatus = att?.status || (emp.status === 'On Leave' ? 'Leave' : 'Not Punched');
    if (statusFilter !== 'ALL' && empStatus !== statusFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q) ||
        (emp.teamName && emp.teamName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-900 to-slate-900 p-6 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-500/30 px-2.5 py-0.5 text-xs font-bold text-indigo-200 border border-indigo-400/30">
              RM 360° Command Center
            </span>
            <span className="text-xs text-indigo-300">West Region & Pune Branch Hub</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1.5">
            Branch Operations & Staff Radar
          </h1>
          <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
            Live oversight of every single employee across Sales (BM, TL, BDM, BDE), Tech, and HR. Full authority over live sales, biometric attendance, WFH requests & leave approvals.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setActiveView('teams')}
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-900 hover:bg-indigo-50 shadow-sm transition active:scale-95"
          >
            <Users className="h-4 w-4" />
            <span>Manage Teams & Hierarchy</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Branch Revenue Realized</span>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600 font-mono">{formatCurrency(branchRevenue)}</p>
          <span className="text-[11px] text-slate-400 font-medium font-mono">
            Target: {formatCurrency(teams.reduce((s, t) => s + t.targetRevenue, 0))} ({teams.length} Teams)
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Personnel</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{totalStaff}</p>
          <span className="text-[11px] text-emerald-600 font-medium">{activeToday} on duty today</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">WFH Personnel Today</span>
          <p className="mt-2 text-2xl font-extrabold text-sky-600">{wfhToday}</p>
          <span className="text-[11px] text-sky-600 font-medium">Approved remote stations</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending RM Approvals</span>
          <p className="mt-2 text-2xl font-extrabold text-rose-600">{pendingLeaves.length + pendingWFH.length}</p>
          <span className="text-[11px] text-rose-500 font-medium">Leaves ({pendingLeaves.length}) • WFH ({pendingWFH.length})</span>
        </div>
      </div>

      {/* Dual Approvals Box: WFH Requests + Leave Requests */}
      {(pendingWFH.length > 0 || pendingLeaves.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pending WFH Approvals */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50/30 p-4 dark:border-sky-900/40 dark:bg-sky-950/20 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-sky-900/60">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-sky-600" />
                <h3 className="font-bold text-xs text-sky-950 dark:text-sky-200 uppercase tracking-wider">
                  Pending WFH Requests ({pendingWFH.length})
                </h3>
              </div>
              <span className="text-[10px] text-sky-600 font-semibold">1-Click RM Action</span>
            </div>

            <div className="mt-3 space-y-2">
              {pendingWFH.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No pending WFH requests</p>
              ) : (
                pendingWFH.map((w) => (
                  <div key={w.id} className="flex items-center justify-between rounded-xl bg-white p-3 border border-sky-100 dark:border-slate-800 dark:bg-slate-900 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{w.employeeName}</span>
                        <span className="rounded-md bg-sky-100 px-1.5 py-0.2 text-[9px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                          {w.role}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{w.reason}</p>
                      <span className="text-[10px] text-slate-400">Date: {formatDate(w.date)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateWFHStatus(w.id, 'Approved')}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                      >
                        <Check className="h-3 w-3" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => updateWFHStatus(w.id, 'Rejected')}
                        className="rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Leave Approvals */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-4 dark:border-rose-900/40 dark:bg-rose-950/20 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-900/60">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-rose-600" />
                <h3 className="font-bold text-xs text-rose-950 dark:text-rose-200 uppercase tracking-wider">
                  Pending Leave Requests ({pendingLeaves.length})
                </h3>
              </div>
              <span className="text-[10px] text-rose-600 font-semibold">1-Click RM Action</span>
            </div>

            <div className="mt-3 space-y-2">
              {pendingLeaves.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No pending leave requests</p>
              ) : (
                pendingLeaves.map((l) => (
                  <div key={l.id} className="flex items-center justify-between rounded-xl bg-white p-3 border border-rose-100 dark:border-slate-800 dark:bg-slate-900 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{l.employeeName}</span>
                        <span className="text-[10px] text-indigo-600 font-semibold">({l.leaveType})</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{l.reason}</p>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(l.startDate)} to {formatDate(l.endDate)} ({l.days} days)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateLeaveStatus(l.id, 'Approved')}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                      >
                        <Check className="h-3 w-3" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => updateLeaveStatus(l.id, 'Rejected')}
                        className="rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* "Ek-Ek Banda" Master Staff Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Ek-Ek Bande Ka Complete Status (Sales, Tech, HR, Ops)
            </h3>
            <p className="text-xs text-slate-400">
              Live tracking: shifts, punches, working hours, WFH status, individual revenue & deals
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="ALL">All Departments</option>
              <option value="Sales">Sales (BM, TL, BDM, BDE)</option>
              <option value="Tech">Tech / Engineering</option>
              <option value="HR">Human Resources</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-3">Role & Hierarchy</th>
                <th className="py-3.5 px-3">Team Assigned</th>
                <th className="py-3.5 px-3">Today's Attendance</th>
                <th className="py-3.5 px-3">Punch In / Hours</th>
                <th className="py-3.5 px-3 text-center">Leads</th>
                <th className="py-3.5 px-3 text-center">Bookings</th>
                <th className="py-3.5 px-3 text-right">Revenue Sold</th>
                <th className="py-3.5 px-3 text-center">Conv. %</th>
                <th className="py-3.5 px-4 text-right">RM Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredEmployees.map((emp) => {
                const att = attendance.find((a) => a.employeeId === emp.id && a.date === todayStr);
                const isLate = att?.status === 'Late';
                const isWFH = att?.status === 'WFH';
                const isPresent = att?.status === 'Present';

                return (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 flex items-center gap-2.5">
                      <img src={emp.avatar} alt={emp.name} className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/10" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{emp.name}</p>
                        <span className="text-[10px] text-slate-400">{emp.email}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          emp.role === 'BRANCH_MANAGER'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : emp.role === 'TL'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            : emp.role === 'BDM'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : emp.role === 'BDE'
                            ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                            : emp.role === 'RM'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {emp.role}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-normal">{emp.designation}</p>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {emp.teamName || 'Direct Reporting'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {isWFH ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                          <Home className="h-3 w-3" /> WFH Approved
                        </span>
                      ) : isPresent ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Present (Office)
                        </span>
                      ) : isLate ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          Late Punch
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">
                          {emp.status === 'On Leave' ? 'Approved Leave' : 'Not Punched'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {att?.checkIn || '—'}
                      </span>
                      <span className="text-[10px] text-slate-400">{att?.workingHours || '0h'}</span>
                    </td>

                    <td className="py-3 px-3 text-center font-bold">
                      {emp.leadsHandled !== undefined ? emp.leadsHandled : '—'}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-emerald-600">
                      {emp.bookingsCount !== undefined ? emp.bookingsCount : '—'}
                    </td>

                    <td className="py-3 px-3 text-right font-extrabold text-slate-900 dark:text-white">
                      {emp.revenueGenerated ? formatCurrency(emp.revenueGenerated) : '—'}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-indigo-600">
                      {emp.conversionRate || '—'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert(`Reviewing complete audit history for ${emp.name}`)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
