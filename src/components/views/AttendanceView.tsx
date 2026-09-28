'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/crm-context';
import { formatDate } from '@/lib/utils';
import { calculateEmployeeMTD } from '@/lib/attendance-calculator';
import {
  exportDailyAttendanceToExcel,
  exportEmployeeMonthlyAttendanceToExcel,
  exportAllStaffMonthlyToExcel
} from '@/lib/export-excel';
import { Employee } from '@/types/crm';
import AttendanceExportModal from '@/components/modals/AttendanceExportModal';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  UserCheck,
  Building,
  Home,
  FileSpreadsheet,
  Plus,
  Check,
  X,
  ShieldCheck,
  Filter,
  CalendarDays,
  CalendarCheck,
  User,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Download
} from 'lucide-react';

export default function AttendanceView() {
  const {
    attendance,
    employees,
    currentUser,
    checkInAttendance,
    checkOutAttendance,
    wfhRequests,
    applyWFH,
    updateWFHStatus,
    leaves
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'biometric' | 'mtd-register' | 'wfh'>('mtd-register');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [wfhStatusFilter, setWfhStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [isWfhModalOpen, setIsWfhModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalDefaultMode, setExportModalDefaultMode] = useState<'daily' | 'monthly-all' | 'monthly-individual'>('daily');

  // Selected employee for Month-Till-Date register (defaults to logged-in user)
  const [selectedMtdEmpId, setSelectedMtdEmpId] = useState<string>(currentUser.id);
  const [mtdViewMode, setMtdViewMode] = useState<'individual' | 'all-staff'>('individual');

  // WFH Form State
  const [wfhForm, setWfhForm] = useState({
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    reason: ''
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const myRecord = attendance.find(
    (a) => (a.employeeName === currentUser.name || a.employeeId === currentUser.id) && a.date === todayStr
  );
  const isPunchedIn = Boolean(myRecord?.checkIn && !myRecord?.checkOut);

  const filteredAttendance = attendance.filter((a) => a.date === filterDate);

  const presentCount = attendance.filter((a) => (a.status === 'Present' || a.status === 'WFH') && a.date === todayStr).length;
  const lateCount = attendance.filter((a) => a.status === 'Late' && a.date === todayStr).length;
  const leaveCount = attendance.filter((a) => a.status === 'Leave' && a.date === todayStr).length;
  const wfhCount = attendance.filter((a) => a.status === 'WFH' && a.date === todayStr).length;
  const totalStaff = employees.length;

  // Managerial approval authority: restricted to SUPER_ADMIN, RM, and HR
  const canApprove =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'RM' ||
    currentUser.role === 'HR';

  // Selected Employee object for MTD inspection
  const selectedEmp = employees.find((e) => e.id === selectedMtdEmpId) || {
    id: currentUser.id,
    name: currentUser.name,
    designation: currentUser.designation,
    role: currentUser.role,
    department: currentUser.department || 'Sales',
    avatar: currentUser.avatar
  };

  // Calculate MTD stats for selected employee
  const selectedMtdStats = useMemo(() => {
    return calculateEmployeeMTD(
      selectedEmp.id,
      selectedEmp.name,
      attendance,
      leaves,
      wfhRequests
    );
  }, [selectedEmp.id, selectedEmp.name, attendance, leaves, wfhRequests]);

  // Calculate MTD stats for ALL staff for the comparison table
  const allStaffMtdSummary = useMemo(() => {
    return employees.map((emp) => {
      const stats = calculateEmployeeMTD(emp.id, emp.name, attendance, leaves, wfhRequests);
      return {
        emp,
        stats
      };
    });
  }, [employees, attendance, leaves, wfhRequests]);

  // Filtered WFH requests
  const filteredWfh = wfhRequests.filter((req) => {
    if (wfhStatusFilter === 'All') return true;
    return req.status === wfhStatusFilter;
  });

  const pendingWfhCount = wfhRequests.filter((r) => r.status === 'Pending').length;

  const handleApplyWFH = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wfhForm.reason.trim()) return;

    applyWFH({
      employeeId: currentUser.id,
      employeeName: `${currentUser.name} (${currentUser.role})`,
      department: currentUser.department || 'Sales',
      role: currentUser.role,
      date: wfhForm.date,
      reason: wfhForm.reason.trim()
    });

    setWfhForm({
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      reason: ''
    });
    setIsWfhModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Attendance & Remote Work Terminal</h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Biometric + MTD
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time biometric punch tracking, Month-Till-Date (MTD) absence & presence records, and WFH governance
          </p>
        </div>

        {/* Header Actions & Tab Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setExportModalDefaultMode(
                activeTab === 'biometric'
                  ? 'daily'
                  : mtdViewMode === 'all-staff'
                  ? 'monthly-all'
                  : 'monthly-individual'
              );
              setIsExportModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95 shrink-0"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Export to Excel</span>
          </button>

          {/* Tab Controls */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('mtd-register')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'mtd-register'
                ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>Month-Till-Date (MTD)</span>
          </button>
          <button
            onClick={() => setActiveTab('biometric')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'biometric'
                ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Daily Biometric Log</span>
          </button>
          <button
            onClick={() => setActiveTab('wfh')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'wfh'
                ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>WFH Requests</span>
            {pendingWfhCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                {pendingWfhCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>

      {/* ========================================================================= */}
      {/* TAB 1: MONTH-TILL-DATE (MTD) ATTENDANCE REGISTER */}
      {/* ========================================================================= */}
      {activeTab === 'mtd-register' && (
        <div className="space-y-6">
          {/* Employee Selector Bar (Visible to all, with selection dropdown for Leaders) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-sm">
                {selectedEmp.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedEmp.name}
                  </h3>
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {selectedEmp.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{selectedEmp.designation} • {selectedEmp.department}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {canApprove && (
                <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs">
                  <button
                    onClick={() => setMtdViewMode('individual')}
                    className={`rounded-lg px-3 py-1 font-semibold transition ${
                      mtdViewMode === 'individual'
                        ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-900 dark:text-indigo-400'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                    }`}
                  >
                    Day-by-Day Sheet
                  </button>
                  <button
                    onClick={() => setMtdViewMode('all-staff')}
                    className={`rounded-lg px-3 py-1 font-semibold transition ${
                      mtdViewMode === 'all-staff'
                        ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-900 dark:text-indigo-400'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                    }`}
                  >
                    All Staff Overview ({employees.length})
                  </button>
                </div>
              )}

              {canApprove && mtdViewMode === 'individual' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold">Inspect Staff:</span>
                  <select
                    value={selectedMtdEmpId}
                    onChange={(e) => setSelectedMtdEmpId(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {mtdViewMode === 'individual' ? (
                <button
                  type="button"
                  onClick={() => exportEmployeeMonthlyAttendanceToExcel(selectedEmp as Employee, selectedMtdStats)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95 shrink-0"
                  title="Download individual monthly Excel sheet"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download {selectedEmp.name.split(' ')[0]}'s Excel</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => exportAllStaffMonthlyToExcel(selectedMtdStats.monthName, allStaffMtdSummary)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95 shrink-0"
                  title="Download all-staff monthly Excel sheet"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download All-Staff Excel</span>
                </button>
              )}
            </div>
          </div>

          {/* MTD SCORECARD BANNER */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Working Days (MTD)</span>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {selectedMtdStats.workingDaysTillDate}
              </p>
              <span className="text-[11px] text-slate-400 font-medium">Excluding Sundays</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Days Present</span>
              <p className="mt-2 text-2xl font-extrabold text-emerald-600">
                {selectedMtdStats.presentDays}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">In-office biometric</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Days WFH</span>
              <p className="mt-2 text-2xl font-extrabold text-sky-600">
                {selectedMtdStats.wfhDays}
              </p>
              <span className="text-[11px] text-sky-600 font-medium">Approved remote</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Days on Leave</span>
              <p className="mt-2 text-2xl font-extrabold text-amber-600">
                {selectedMtdStats.leaveDays}
              </p>
              <span className="text-[11px] text-amber-600 font-medium">CL / SL / EL approved</span>
            </div>

            <div className={`rounded-2xl border p-4 shadow-xs ${
              selectedMtdStats.absentDays > 0
                ? 'border-rose-300 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-500 uppercase">Days Absent</span>
                {selectedMtdStats.absentDays > 0 && <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />}
              </div>
              <p className="mt-2 text-2xl font-extrabold text-rose-600">
                {selectedMtdStats.absentDays}
              </p>
              <span className="text-[11px] font-medium text-rose-600">
                {selectedMtdStats.absentDays > 0 ? 'Loss of Pay (Unaccounted)' : 'Zero absences'}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Attendance Score</span>
              <p className="mt-2 text-2xl font-extrabold text-indigo-600">
                {selectedMtdStats.attendancePercentage}%
              </p>
              <span className="text-[11px] text-indigo-600 font-medium">
                {selectedMtdStats.lateDays} late marks
              </span>
            </div>
          </div>

          {/* VIEW MODE 1: DAY-BY-DAY ATTENDANCE SHEET */}
          {mtdViewMode === 'individual' && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedEmp.name} — {selectedMtdStats.monthName} Daily Roster Sheet
                  </h3>
                  <p className="text-xs text-slate-400">
                    Day-by-day attendance punches, working hours, remote shifts, and absence audit from Day 1 to Day {selectedMtdStats.passedDaysTillDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    🟢 Present
                  </span>
                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    🔵 WFH
                  </span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    🟡 Leave
                  </span>
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    🔴 Absent
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                    <tr>
                      <th className="py-3.5 px-4">Date & Day</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-3">Biometric Check In</th>
                      <th className="py-3.5 px-3">Biometric Check Out</th>
                      <th className="py-3.5 px-3">Total Working Hours</th>
                      <th className="py-3.5 px-4">Activity Remarks / Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {selectedMtdStats.dailyRecords.map((d) => (
                      <tr
                        key={d.date}
                        className={`transition ${
                          d.isToday
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/30 font-semibold'
                            : d.status === 'Absent'
                            ? 'bg-rose-50/40 dark:bg-rose-950/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{formatDate(d.date)}</span>
                            <span className="text-[11px] font-normal text-slate-400">({d.dayName})</span>
                            {d.isToday && (
                              <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                                Today
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              d.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : d.status === 'WFH'
                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                                : d.status === 'Late'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : d.status === 'Leave'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : d.status === 'Absent'
                                ? 'bg-rose-600 text-white shadow-2xs font-extrabold'
                                : d.status === 'Weekly Off'
                                ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {d.status === 'Absent' ? '🔴 ABSENT (LOP)' : d.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          {d.checkIn || '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-500">{d.checkOut || '—'}</td>
                        <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                          {d.workingHours}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-sm truncate" title={d.notes}>
                          <span className={d.status === 'Absent' ? 'text-rose-600 font-semibold' : ''}>
                            {d.notes}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: ALL STAFF COMPARISON TABLE (For Managers, RM, BM, HR) */}
          {mtdViewMode === 'all-staff' && canApprove && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Branch Staff Month-Till-Date Attendance Comparison
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comprehensive view of every staff member&apos;s working days, active presence, remote work, approved leaves, and unauthorized absences
                  </p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg dark:bg-indigo-950 dark:text-indigo-300">
                  {selectedMtdStats.monthName} (Till Date)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                    <tr>
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-3">Dept & Role</th>
                      <th className="py-3.5 px-3 text-center">Working Days (MTD)</th>
                      <th className="py-3.5 px-3 text-center">Present Days</th>
                      <th className="py-3.5 px-3 text-center">WFH Days</th>
                      <th className="py-3.5 px-3 text-center">Leave Days</th>
                      <th className="py-3.5 px-3 text-center">Absent Days</th>
                      <th className="py-3.5 px-3 text-center">Score %</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {allStaffMtdSummary.map(({ emp, stats }) => (
                      <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div>
                            <p>{emp.name}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{emp.designation}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {emp.department} • {emp.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                          {stats.workingDaysTillDate}
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-emerald-600">
                          {stats.presentDays}
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-sky-600">
                          {stats.wfhDays}
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-amber-600">
                          {stats.leaveDays}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {stats.absentDays > 0 ? (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              {stats.absentDays} Days (LOP)
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center font-black text-indigo-600 dark:text-indigo-400">
                          {stats.attendancePercentage}%
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedMtdEmpId(emp.id);
                              setMtdViewMode('individual');
                            }}
                            className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400 transition"
                          >
                            View Sheet
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DAILY BIOMETRIC LOG & LIVE PUNCH TERMINAL */}
      {/* ========================================================================= */}
      {activeTab === 'biometric' && (
        <>
          {/* Live Punch Card & Today's Attendance KPIs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Personal Punch Card */}
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white p-5 shadow-xs dark:border-indigo-900/40 dark:from-slate-900 dark:to-indigo-950/20">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Live Punch Terminal
                </span>
                <Clock className={`h-4 w-4 ${isPunchedIn ? 'text-emerald-600 animate-spin' : 'text-slate-400'}`} />
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                {currentUser.name}
              </h3>
              <p className="text-xs text-slate-500">{currentUser.designation}</p>

              <div className="mt-4 rounded-xl bg-white p-3 border border-indigo-100 dark:border-slate-800 dark:bg-slate-900 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Punch In:</span>
                  <strong className="text-slate-900 dark:text-white">{myRecord?.checkIn || 'Not punched in'}</strong>
                </div>
                <div className="flex justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Punch Out:</span>
                  <strong className="text-slate-900 dark:text-white">{myRecord?.checkOut || 'Pending'}</strong>
                </div>
                <div className="flex justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Active Working Hours:</span>
                  <strong className="text-emerald-600">{myRecord?.workingHours || '0h 00m'}</strong>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {!isPunchedIn ? (
                  <button
                    onClick={() => checkInAttendance(currentUser.id, 'Office Check-In')}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95"
                  >
                    Punch In (Start Shift)
                  </button>
                ) : (
                  <button
                    onClick={() => checkOutAttendance(currentUser.id)}
                    className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition active:scale-95"
                  >
                    Punch Out (End Shift)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsWfhModalOpen(true)}
                  className="rounded-xl border border-sky-300 bg-sky-50 px-3.5 py-2.5 text-xs font-bold text-sky-700 hover:bg-sky-100 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300 transition flex items-center gap-1.5 active:scale-95 shrink-0"
                  title="Apply for Work From Home (WFH)"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Request WFH</span>
                </button>
              </div>
            </div>

            {/* Company-wide KPIs */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Headcount</span>
                <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{totalStaff}</p>
                <span className="text-[11px] text-slate-400 font-medium">Registered staff</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Present / Active</span>
                <p className="mt-2 text-2xl font-extrabold text-emerald-600">{presentCount}</p>
                <span className="text-[11px] text-emerald-600 font-medium">In office / WFH</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-bold text-slate-400 uppercase">WFH Today</span>
                <p className="mt-2 text-2xl font-extrabold text-sky-600">{wfhCount}</p>
                <span className="text-[11px] text-sky-600 font-medium">Remote staff</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Late / Absent</span>
                <p className="mt-2 text-2xl font-extrabold text-amber-600">{lateCount + leaveCount}</p>
                <span className="text-[11px] text-amber-600 font-medium">Late or on leave</span>
              </div>
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Daily Attendance Records: {formatDate(filterDate)}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Inspect Date:</span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => exportDailyAttendanceToExcel(filterDate, attendance, employees, leaves, wfhRequests)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95 shrink-0"
                  title="Download Daily Attendance Excel Sheet"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Daily Excel</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-3">Date</th>
                    <th className="py-3.5 px-3">Check In</th>
                    <th className="py-3.5 px-3">Check Out</th>
                    <th className="py-3.5 px-3">Working Hours</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No attendance records for {formatDate(filterDate)}
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {rec.employeeName}
                        </td>
                        <td className="py-3.5 px-3 text-slate-500">{formatDate(rec.date)}</td>
                        <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          {rec.checkIn || '—'}
                        </td>
                        <td className="py-3.5 px-3 text-slate-500">{rec.checkOut || '—'}</td>
                        <td className="py-3.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">{rec.workingHours}</td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              rec.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : rec.status === 'Late'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : rec.status === 'WFH'
                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{rec.remarks || 'Standard punch'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WFH REQUESTS & APPROVALS */}
      {/* ========================================================================= */}
      {activeTab === 'wfh' && (
        <div className="space-y-6">
          {/* Top Actions & Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
              <div className="flex gap-1.5">
                {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setWfhStatusFilter(st)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      wfhStatusFilter === st
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsWfhModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Apply for WFH</span>
            </button>
          </div>

          {/* WFH Requests Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Remote Work & WFH Applications
                </h3>
                <p className="text-xs text-slate-400">
                  RM and HR have full authority to approve or reject employee remote work requests.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">{filteredWfh.length} applications</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-3">Dept & Role</th>
                    <th className="py-3.5 px-3">WFH Target Date</th>
                    <th className="py-3.5 px-3">Reason</th>
                    <th className="py-3.5 px-3">Applied On</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Approval Authority</th>
                    {canApprove && <th className="py-3.5 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredWfh.length === 0 ? (
                    <tr>
                      <td colSpan={canApprove ? 8 : 7} className="py-12 text-center text-slate-400">
                        No WFH requests found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredWfh.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {req.employeeName}
                        </td>
                        <td className="py-3.5 px-3 text-slate-500">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {req.department} • {req.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-indigo-600 dark:text-indigo-400">
                          {formatDate(req.date)}
                        </td>
                        <td className="py-3.5 px-3 max-w-xs truncate text-slate-600 dark:text-slate-300" title={req.reason}>
                          {req.reason}
                        </td>
                        <td className="py-3.5 px-3 text-slate-400">{formatDate(req.appliedDate)}</td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              req.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : req.status === 'Pending'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500">
                          {req.approvedBy ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                              <ShieldCheck className="h-3 w-3" />
                              {req.approvedBy}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Pending review</span>
                          )}
                        </td>
                        {canApprove && (
                          <td className="py-3.5 px-4 text-right">
                            {req.status === 'Pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => updateWFHStatus(req.id, 'Approved')}
                                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-2xs hover:bg-emerald-700 transition"
                                >
                                  <Check className="h-3 w-3" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateWFHStatus(req.id, 'Rejected')}
                                  className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-2xs hover:bg-rose-700 transition"
                                >
                                  <X className="h-3 w-3" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold uppercase">Closed</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Apply WFH Modal */}
      {isWfhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <Home className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Apply for Work From Home (WFH)
                </h3>
              </div>
              <button
                onClick={() => setIsWfhModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleApplyWFH} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Applicant
                </label>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500">{currentUser.department || 'Sales'} • {currentUser.role}</p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Requested Date for WFH *
                </label>
                <input
                  type="date"
                  required
                  value={wfhForm.date}
                  onChange={(e) => setWfhForm({ ...wfhForm, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Remote Work *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Remote client meetings, travel, high-speed network requirement, family emergency..."
                  value={wfhForm.reason}
                  onChange={(e) => setWfhForm({ ...wfhForm, reason: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsWfhModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Attendance Excel Export Modal */}
      <AttendanceExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultMode={exportModalDefaultMode}
        defaultEmployeeId={selectedEmp.id}
        defaultDate={filterDate}
      />
    </div>
  );
}
