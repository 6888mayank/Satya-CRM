'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/crm-context';
import {
  exportDailyAttendanceToExcel,
  exportEmployeeMonthlyAttendanceToExcel,
  exportAllStaffMonthlyToExcel
} from '@/lib/export-excel';
import { calculateEmployeeMTD } from '@/lib/attendance-calculator';
import { Employee } from '@/types/crm';
import {
  FileSpreadsheet,
  Calendar,
  User,
  Users2,
  Download,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';

interface AttendanceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'daily' | 'monthly-all' | 'monthly-individual';
  defaultEmployeeId?: string;
  defaultDate?: string;
}

export default function AttendanceExportModal({
  isOpen,
  onClose,
  defaultMode = 'daily',
  defaultEmployeeId,
  defaultDate
}: AttendanceExportModalProps) {
  const { employees, attendance, leaves, wfhRequests, currentUser } = useCRM();

  const [mode, setMode] = useState<'daily' | 'monthly-all' | 'monthly-individual'>(defaultMode);
  const [selectedDate, setSelectedDate] = useState<string>(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 8 is September
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    defaultEmployeeId || employees[0]?.id || currentUser.id
  );

  // Sync default params if modal opens with different props
  React.useEffect(() => {
    if (isOpen) {
      if (defaultMode) setMode(defaultMode);
      if (defaultEmployeeId) setSelectedEmpId(defaultEmployeeId);
      if (defaultDate) setSelectedDate(defaultDate);
    }
  }, [isOpen, defaultMode, defaultEmployeeId, defaultDate]);

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];

  // Calculate MTD stats for selected individual employee
  const selectedEmpStats = useMemo(() => {
    if (!selectedEmployee) return null;
    return calculateEmployeeMTD(
      selectedEmployee.id,
      selectedEmployee.name,
      attendance,
      leaves,
      wfhRequests,
      selectedYear,
      selectedMonth
    );
  }, [selectedEmployee, attendance, leaves, wfhRequests, selectedYear, selectedMonth]);

  // Calculate MTD stats for all staff
  const allStaffMtdSummary = useMemo(() => {
    return employees.map((emp) => {
      const stats = calculateEmployeeMTD(
        emp.id,
        emp.name,
        attendance,
        leaves,
        wfhRequests,
        selectedYear,
        selectedMonth
      );
      return { emp, stats };
    });
  }, [employees, attendance, leaves, wfhRequests, selectedYear, selectedMonth]);

  // Daily stats breakdown for the selected date
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
          a.date === selectedDate
      );
      const onLeave = leaves.find(
        (l) =>
          (l.employeeId === emp.id || l.employeeName.toLowerCase().includes(cleanEmpName)) &&
          l.status === 'Approved' &&
          selectedDate >= l.startDate &&
          selectedDate <= l.endDate
      );
      const onWFH = wfhRequests.find(
        (w) =>
          (w.employeeId === emp.id || w.employeeName.toLowerCase().includes(cleanEmpName)) &&
          w.status === 'Approved' &&
          w.date === selectedDate
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
  }, [employees, attendance, leaves, wfhRequests, selectedDate]);

  if (!isOpen) return null;

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

  const handleDownloadDaily = () => {
    exportDailyAttendanceToExcel(selectedDate, attendance, employees, leaves, wfhRequests);
    onClose();
  };

  const handleDownloadMonthlyAll = () => {
    const monthName = `${monthOptions.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`;
    exportAllStaffMonthlyToExcel(monthName, allStaffMtdSummary);
    onClose();
  };

  const handleDownloadMonthlyIndividual = () => {
    if (!selectedEmployee || !selectedEmpStats) return;
    exportEmployeeMonthlyAttendanceToExcel(selectedEmployee, selectedEmpStats);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  HR Attendance Excel Export Center
                </h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  .CSV / Excel
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Download biometric daily attendance, all-staff monthly summaries, or individual employee sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setMode('daily')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-bold transition ${
              mode === 'daily'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>1. Daily Sheet</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('monthly-all')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-bold transition ${
              mode === 'monthly-all'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Users2 className="h-4 w-4" />
            <span>2. Monthly (All Staff)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('monthly-individual')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-bold transition ${
              mode === 'monthly-individual'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <User className="h-4 w-4" />
            <span>3. Single Employee</span>
          </button>
        </div>

        {/* Tab 1: Daily Attendance */}
        {mode === 'daily' && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Select Date for Daily Attendance Report:
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="rounded-xl bg-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 transition"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate('2026-09-20')}
                  className="rounded-xl bg-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 transition"
                >
                  Yesterday
                </button>
              </div>
            </div>

            {/* Daily Preview KPIs */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5 dark:border-emerald-950 dark:bg-emerald-950/20">
                <span className="text-[10px] font-bold uppercase text-emerald-600">Present</span>
                <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                  {dailyBreakdown.present}
                </p>
              </div>
              <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-2.5 dark:border-sky-950 dark:bg-sky-950/20">
                <span className="text-[10px] font-bold uppercase text-sky-600">WFH</span>
                <p className="text-lg font-extrabold text-sky-700 dark:text-sky-400">
                  {dailyBreakdown.wfh}
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 dark:border-amber-950 dark:bg-amber-950/20">
                <span className="text-[10px] font-bold uppercase text-amber-600">Leave</span>
                <p className="text-lg font-extrabold text-amber-700 dark:text-amber-400">
                  {dailyBreakdown.leave}
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-2.5 dark:border-rose-950 dark:bg-rose-950/20">
                <span className="text-[10px] font-bold uppercase text-rose-600">Absent (LOP)</span>
                <p className="text-lg font-extrabold text-rose-700 dark:text-rose-400">
                  {dailyBreakdown.absent}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                📄 What will be included in the Excel file:
              </p>
              <ul className="mt-1.5 list-disc list-inside space-y-1 text-[11px]">
                <li>All <strong>{employees.length} employees</strong> of the branch</li>
                <li>Biometric Check-In and Check-Out times</li>
                <li>Total working hours and punch status (Present, Late, WFH, Leave, Absent)</li>
                <li>Leave type justification and remote work reasoning notes</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleDownloadDaily}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white shadow-md transition active:scale-98"
            >
              <Download className="h-4 w-4" />
              <span>Download Daily Attendance Excel Sheet ({selectedDate})</span>
            </button>
          </div>
        )}

        {/* Tab 2: Monthly Attendance for All Staff */}
        {mode === 'monthly-all' && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Select Month & Year:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {monthOptions.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value={2026}>2026</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preview Statistics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Staff Headcount</span>
                <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                  {employees.length} Members
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Working Days (MTD)</span>
                <p className="mt-1 text-xl font-extrabold text-indigo-600">
                  {allStaffMtdSummary[0]?.stats.workingDaysTillDate || 18} Days
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Branch Rate</span>
                <p className="mt-1 text-xl font-extrabold text-emerald-600">
                  {Math.round(
                    allStaffMtdSummary.reduce((acc, curr) => acc + curr.stats.attendancePercentage, 0) /
                      (allStaffMtdSummary.length || 1)
                  )}
                  %
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                📊 What will be included in the All-Staff Monthly Summary:
              </p>
              <ul className="mt-1.5 list-disc list-inside space-y-1 text-[11px]">
                <li>Employee Code, Full Name, Designation & Department</li>
                <li>Reporting Manager and System Role</li>
                <li>Total working days till date (excluding Sundays)</li>
                <li>Present days, Approved WFH days, Approved Leave days</li>
                <li>Loss of Pay (LOP) Unaccounted Absences & Late punch marks</li>
                <li>Cumulative Month-Till-Date Attendance Score %</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleDownloadMonthlyAll}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white shadow-md transition active:scale-98"
            >
              <Download className="h-4 w-4" />
              <span>
                Download All-Staff Monthly Register (
                {monthOptions.find((m) => m.value === selectedMonth)?.label} {selectedYear})
              </span>
            </button>
          </div>
        )}

        {/* Tab 3: Monthly Attendance for a Particular Employee */}
        {mode === 'monthly-individual' && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Select Particular Employee:
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.designation} ({emp.department} • {emp.role}) [{emp.employeeCode || emp.id}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Month:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {monthOptions.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Year:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value={2026}>2026</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Individual Employee Preview Card */}
            {selectedEmployee && selectedEmpStats && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedEmployee.avatar}
                    alt={selectedEmployee.name}
                    className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {selectedEmployee.name}
                    </h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      {selectedEmployee.designation} • {selectedEmployee.department}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
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
                    <span className="text-[9px] font-bold text-amber-600 uppercase">Leave</span>
                    <p className="text-sm font-extrabold text-amber-600">
                      {selectedEmpStats.leaveDays}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-2 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] font-bold text-rose-600 uppercase">Absent</span>
                    <p className="text-sm font-extrabold text-rose-600">
                      {selectedEmpStats.absentDays}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-2 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] font-bold text-indigo-600 uppercase">Score</span>
                    <p className="text-sm font-extrabold text-indigo-600">
                      {selectedEmpStats.attendancePercentage}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                👤 What will be included in this Employee's Excel sheet:
              </p>
              <ul className="mt-1.5 list-disc list-inside space-y-1 text-[11px]">
                <li>Employee Header profile (Code, Department, Role, Reporting Manager)</li>
                <li>Comprehensive <strong>day-by-day 30-day chronological breakdown</strong></li>
                <li>Every calendar day marked with exact Day, Biometric In/Out, and Hours</li>
                <li>Specific reason remarks for Approved Leaves, WFH shifts, or Loss-of-Pay</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleDownloadMonthlyIndividual}
              disabled={!selectedEmployee}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white shadow-md transition active:scale-98 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>
                Download {selectedEmployee?.name || 'Employee'}'s Monthly Attendance Excel Sheet
              </span>
            </button>
          </div>
        )}

        {/* Compatibility Footer Note */}
        <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Format: UTF-8 BOM CSV (Native Microsoft Excel & Google Sheets support)</span>
          </div>
          <span className="font-medium text-slate-500">Satya CRM HR Suite</span>
        </div>
      </div>
    </div>
  );
}
