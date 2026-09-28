'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/crm-context';
import {
  exportDailyAttendanceToExcel,
  exportEmployeeMonthlyAttendanceToExcel,
  exportAllStaffMonthlyToExcel
} from '@/lib/export-excel';
import { calculateEmployeeMTD } from '@/lib/attendance-calculator';
import {
  Users2,
  Calendar,
  FileSpreadsheet,
  Building,
  Download,
  CheckCircle2,
  Clock,
  User,
  CalendarDays,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import AttendanceExportModal from '@/components/modals/AttendanceExportModal';

export default function ReportsHRView() {
  const { employees, leaves, attendance, wfhRequests, currentUser } = useCRM();

  // Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // In-page Excel Export state
  const [exportTab, setExportTab] = useState<'daily' | 'monthly-all' | 'monthly-emp'>('daily');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetMonth, setTargetMonth] = useState<number>(8); // 8 is September
  const [targetYear, setTargetYear] = useState<number>(2026);
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || currentUser.id);

  const selectedEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];

  const monthOptions = [
    { label: 'January', value: 0 },
    { label: 'February', value: 1 },
    { label: 'March', value: 2 },
    { label: 'April', value: 3 },
    { label: 'May', value: 4 },
    { label: 'June', value: 5 },
    { label: 'July', value: 6 },
    { label: 'August', value: 7 },
    { label: 'September', value: 8 },
    { label: 'October', value: 9 },
    { label: 'November', value: 10 },
    { label: 'December', value: 11 }
  ];

  // Calculate MTD stats for selected employee
  const selectedEmpStats = useMemo(() => {
    if (!selectedEmp) return null;
    return calculateEmployeeMTD(
      selectedEmp.id,
      selectedEmp.name,
      attendance,
      leaves,
      wfhRequests,
      targetYear,
      targetMonth
    );
  }, [selectedEmp, attendance, leaves, wfhRequests, targetYear, targetMonth]);

  // Calculate MTD stats for all staff
  const allStaffMtdSummary = useMemo(() => {
    return employees.map((emp) => {
      const stats = calculateEmployeeMTD(
        emp.id,
        emp.name,
        attendance,
        leaves,
        wfhRequests,
        targetYear,
        targetMonth
      );
      return { emp, stats };
    });
  }, [employees, attendance, leaves, wfhRequests, targetYear, targetMonth]);

  // Daily stats breakdown for target date
  const dailyBreakdown = useMemo(() => {
    let present = 0;
    let wfh = 0;
    let leave = 0;
    let absent = 0;

    employees.forEach((emp) => {
      const cleanEmpName = emp.name.split('(')[0].trim().toLowerCase();
      const att = attendance.find(
        (a) =>
          (a.employeeId === emp.id || a.employeeName.toLowerCase().includes(cleanEmpName)) &&
          a.date === targetDate
      );
      const onLeave = leaves.find(
        (l) =>
          (l.employeeId === emp.id || l.employeeName.toLowerCase().includes(cleanEmpName)) &&
          l.status === 'Approved' &&
          targetDate >= l.startDate &&
          targetDate <= l.endDate
      );
      const onWFH = wfhRequests.find(
        (w) =>
          (w.employeeId === emp.id || w.employeeName.toLowerCase().includes(cleanEmpName)) &&
          w.status === 'Approved' &&
          w.date === targetDate
      );

      if (att) {
        if (att.status === 'Present' || att.status === 'Late') present++;
        else if (att.status === 'WFH') wfh++;
        else if (att.status === 'Leave') leave++;
        else absent++;
      } else if (onLeave) {
        leave++;
      } else if (onWFH) {
        wfh++;
      } else {
        absent++;
      }
    });

    return { present, wfh, leave, absent };
  }, [employees, attendance, leaves, wfhRequests, targetDate]);

  const handleDownloadDaily = () => {
    exportDailyAttendanceToExcel(targetDate, attendance, employees, leaves, wfhRequests);
  };

  const handleDownloadMonthlyAll = () => {
    const monthName = `${monthOptions.find((m) => m.value === targetMonth)?.label} ${targetYear}`;
    exportAllStaffMonthlyToExcel(monthName, allStaffMtdSummary);
  };

  const handleDownloadMonthlyEmp = () => {
    if (!selectedEmp || !selectedEmpStats) return;
    exportEmployeeMonthlyAttendanceToExcel(selectedEmp, selectedEmpStats);
  };

  const deptCounts = [
    { name: 'Sales', count: employees.filter((e) => e.department === 'Sales').length },
    { name: 'Tech', count: employees.filter((e) => e.department === 'Tech').length },
    { name: 'HR', count: employees.filter((e) => e.department === 'HR').length },
    { name: 'Operations', count: employees.filter((e) => e.department === 'Operations').length },
    { name: 'Executive', count: employees.filter((e) => e.department === 'Executive').length },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Human Resources Analytics & Reports</h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Excel Export Enabled
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Workforce distribution, biometric attendance exports, and employee monthly registers
          </p>
        </div>

        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95 shrink-0"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Open Full Export Center</span>
        </button>
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Staff Headcount</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{employees.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium">100% active retention</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Leave Applications</span>
          <p className="mt-2 text-2xl font-extrabold text-indigo-600">{leaves.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">This month</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Avg Attendance Punctuality</span>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">94.8%</p>
          <span className="text-[11px] text-emerald-600 font-medium">Within 09:30 AM window</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED ATTENDANCE EXCEL EXPORT CENTER */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 p-6 shadow-xs dark:border-emerald-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Attendance Excel Download Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly export daily attendance, monthly branch summaries, or particular employee sheets as Excel-compatible .CSV files
              </p>
            </div>
          </div>

          {/* Export Mode Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
            <button
              onClick={() => setExportTab('daily')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                exportTab === 'daily'
                  ? 'bg-white text-emerald-700 shadow-2xs dark:bg-slate-900 dark:text-emerald-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Daily Attendance</span>
            </button>

            <button
              onClick={() => setExportTab('monthly-all')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                exportTab === 'monthly-all'
                  ? 'bg-white text-emerald-700 shadow-2xs dark:bg-slate-900 dark:text-emerald-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Users2 className="h-3.5 w-3.5" />
              <span>Monthly (All Staff)</span>
            </button>

            <button
              onClick={() => setExportTab('monthly-emp')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                exportTab === 'monthly-emp'
                  ? 'bg-white text-emerald-700 shadow-2xs dark:bg-slate-900 dark:text-emerald-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Particular Employee</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Daily Attendance Controls */}
        {exportTab === 'daily' && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-2xs border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Attendance Date:
                </span>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
                <button
                  onClick={() => setTargetDate(new Date().toISOString().split('T')[0])}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition"
                >
                  Today
                </button>
                <button
                  onClick={() => setTargetDate('2026-09-20')}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition"
                >
                  Yesterday
                </button>
              </div>

              <button
                onClick={handleDownloadDaily}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
              >
                <Download className="h-4 w-4" />
                <span>Download Daily Excel (.csv)</span>
              </button>
            </div>

            {/* Daily Status Breakdown Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-center dark:border-emerald-950 dark:bg-emerald-950/20">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Present / Late</span>
                <p className="mt-1 text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  {dailyBreakdown.present}
                </p>
                <span className="text-[10px] text-emerald-600">On duty</span>
              </div>
              <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3 text-center dark:border-sky-950 dark:bg-sky-950/20">
                <span className="text-[10px] font-bold text-sky-600 uppercase">WFH Remote</span>
                <p className="mt-1 text-xl font-extrabold text-sky-700 dark:text-sky-400">
                  {dailyBreakdown.wfh}
                </p>
                <span className="text-[10px] text-sky-600">Approved remote</span>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-center dark:border-amber-950 dark:bg-amber-950/20">
                <span className="text-[10px] font-bold text-amber-600 uppercase">Approved Leave</span>
                <p className="mt-1 text-xl font-extrabold text-amber-700 dark:text-amber-400">
                  {dailyBreakdown.leave}
                </p>
                <span className="text-[10px] text-amber-600">CL / SL / EL</span>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-center dark:border-rose-950 dark:bg-rose-950/20">
                <span className="text-[10px] font-bold text-rose-600 uppercase">Absent (LOP)</span>
                <p className="mt-1 text-xl font-extrabold text-rose-700 dark:text-rose-400">
                  {dailyBreakdown.absent}
                </p>
                <span className="text-[10px] text-rose-600">Unexcused</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Monthly (All Staff) Controls */}
        {exportTab === 'monthly-all' && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-2xs border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Month & Year:
                </span>
                <select
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {monthOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>

              <button
                onClick={handleDownloadMonthlyAll}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
              >
                <Download className="h-4 w-4" />
                <span>Download All-Staff Monthly Summary (.csv)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Staff Count</span>
                <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                  {employees.length} Active Employees
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Working Days (MTD)</span>
                <p className="mt-1 text-lg font-extrabold text-indigo-600">
                  {allStaffMtdSummary[0]?.stats.workingDaysTillDate || 18} Days (Excluding Sundays)
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Average Attendance Rate</span>
                <p className="mt-1 text-lg font-extrabold text-emerald-600">
                  {Math.round(
                    allStaffMtdSummary.reduce((acc, curr) => acc + curr.stats.attendancePercentage, 0) /
                      (allStaffMtdSummary.length || 1)
                  )}
                  %
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Particular Employee Monthly Controls */}
        {exportTab === 'monthly-emp' && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-2xs border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Employee:
                </span>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 max-w-xs"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.designation} ({e.department})
                    </option>
                  ))}
                </select>

                <select
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {monthOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleDownloadMonthlyEmp}
                disabled={!selectedEmp}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95 shrink-0 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>Download {selectedEmp?.name.split(' ')[0]}'s Sheet (.csv)</span>
              </button>
            </div>

            {/* Individual Scorecard Preview */}
            {selectedEmp && selectedEmpStats && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedEmp.avatar}
                      alt={selectedEmp.name}
                      className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {selectedEmp.name}
                      </h4>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                        {selectedEmp.designation} • {selectedEmp.department} • Code: {selectedEmp.employeeCode || selectedEmp.id}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    MTD Score: {selectedEmpStats.attendancePercentage}%
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-white p-2 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Working Days</span>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {selectedEmpStats.workingDaysTillDate}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-2 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] font-bold text-emerald-600 uppercase">Present</span>
                    <p className="text-sm font-extrabold text-emerald-600">
                      {selectedEmpStats.presentDays}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-2 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] font-bold text-sky-600 uppercase">WFH</span>
                    <p className="text-sm font-extrabold text-sky-600">
                      {selectedEmpStats.wfhDays}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-2 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] font-bold text-amber-600 uppercase">Leaves</span>
                    <p className="text-sm font-extrabold text-amber-600">
                      {selectedEmpStats.leaveDays}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-2 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] font-bold text-rose-600 uppercase">Absent (LOP)</span>
                    <p className="text-sm font-extrabold text-rose-600">
                      {selectedEmpStats.absentDays}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Department Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Department Headcount Allocation</h3>
        <div className="space-y-3 text-xs">
          {deptCounts.map((dept) => (
            <div key={dept.name} className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                <span>{dept.name}</span>
                <span>{dept.count} Members ({Math.round((dept.count / employees.length) * 100)}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${(dept.count / employees.length) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Modal */}
      <AttendanceExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

