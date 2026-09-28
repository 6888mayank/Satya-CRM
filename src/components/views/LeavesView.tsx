'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/crm-context';
import { formatDate } from '@/lib/utils';
import { LeaveRequest, WFHRequest } from '@/types/crm';
import { calculateEmployeeMTD, calculateEmployeeLeaveAccrual } from '@/lib/attendance-calculator';
import {
  CalendarDays,
  Plus,
  Check,
  XCircle,
  AlertCircle,
  X,
  Clock,
  Home,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  FileCheck2,
  CalendarCheck,
  Filter,
  Sparkles
} from 'lucide-react';

export default function LeavesView() {
  const {
    leaves,
    applyLeave,
    updateLeaveStatus,
    currentUser,
    attendance,
    wfhRequests,
    applyWFH,
    updateWFHStatus,
    setIsWFHModalOpen
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'my-applications' | 'team-approvals'>('my-applications');
  const [appTypeFilter, setAppTypeFilter] = useState<'All' | 'Leaves' | 'WFH'>('All');
  const [teamTypeFilter, setTeamTypeFilter] = useState<'All' | 'Leaves' | 'WFH'>('All');

  // Application Modal state
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'leave' | 'wfh'>('leave');

  // Leave Form State (Unified 1.5 Days/Month Model)
  const [leaveDurationMode, setLeaveDurationMode] = useState<'FULL_DAY' | 'HALF_DAY' | 'MULTI_DAY'>('FULL_DAY');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState('');
  const [showLedgerModal, setShowLedgerModal] = useState(false);

  // WFH Form State
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const [wfhDate, setWfhDate] = useState<string>(tomorrowStr);
  const [wfhShiftType, setWfhShiftType] = useState<'Full Day' | 'Half Day (1st Half)' | 'Half Day (2nd Half)'>('Full Day');
  const [wfhReason, setWfhReason] = useState('');

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Authority check: Strictly restricted to RM, SUPER_ADMIN, and HR
  const canApprove =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'RM' ||
    currentUser.role === 'HR';

  // Calculate Month-Till-Date stats for the current user
  const mtd = useMemo(() => {
    return calculateEmployeeMTD(currentUser.id, currentUser.name, attendance, leaves, wfhRequests);
  }, [currentUser.id, currentUser.name, attendance, leaves, wfhRequests]);

  // Calculate unified 1.5 Days/Month Leave Accrual & Cumulative Carry-Forward
  const leaveAccrual = useMemo(() => {
    return calculateEmployeeLeaveAccrual(currentUser.id, currentUser.name, leaves);
  }, [currentUser.id, currentUser.name, leaves]);

  // Calculate days dynamically from start and end dates
  const calculatedDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    if (e < s) return 1;
    return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
  }, [startDate, endDate]);

  const requestedLeaveDays = useMemo(() => {
    if (leaveDurationMode === 'HALF_DAY') return 0.5;
    if (leaveDurationMode === 'FULL_DAY') return 1;
    return calculatedDays;
  }, [leaveDurationMode, calculatedDays]);

  const handleOpenApply = (mode: 'leave' | 'wfh') => {
    setModalMode(mode);
    setIsApplyOpen(true);
  };

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    applyLeave({
      employeeId: currentUser.id,
      employeeName: `${currentUser.name} (${currentUser.role})`,
      leaveType: 'Paid Leave',
      startDate,
      endDate: leaveDurationMode === 'MULTI_DAY' ? endDate : startDate,
      days: requestedLeaveDays,
      reason: leaveReason.trim()
    });

    setIsApplyOpen(false);
    setLeaveReason('');
    setFeedbackMessage(`Leave application (${requestedLeaveDays} Day) submitted successfully! Routed to Regional Manager (RM), Super Admin & HR for approval.`);
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleSubmitWFH = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wfhReason.trim()) return;

    applyWFH({
      employeeId: currentUser.id,
      employeeName: `${currentUser.name} (${currentUser.role})`,
      department: currentUser.department || 'Sales',
      role: currentUser.role,
      date: wfhDate,
      reason: `${wfhShiftType !== 'Full Day' ? `[${wfhShiftType}] ` : ''}${wfhReason.trim()}`
    });

    setIsApplyOpen(false);
    setWfhReason('');
    setFeedbackMessage('Work From Home (WFH) request submitted successfully! Routed to Regional Manager (RM), Super Admin & HR for approval.');
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // User's own applications
  const cleanEmpName = currentUser.name.split('(')[0].trim().toLowerCase();
  const myLeaves = leaves.filter(
    (l) => l.employeeId === currentUser.id || l.employeeName.toLowerCase().includes(cleanEmpName)
  );
  const myWfh = wfhRequests.filter(
    (w) => w.employeeId === currentUser.id || w.employeeName.toLowerCase().includes(cleanEmpName)
  );

  // Filtered personal applications
  const personalItems = useMemo(() => {
    const list: Array<
      | { type: 'LEAVE'; data: LeaveRequest; sortDate: string }
      | { type: 'WFH'; data: WFHRequest; sortDate: string }
    > = [];

    if (appTypeFilter === 'All' || appTypeFilter === 'Leaves') {
      myLeaves.forEach((l) => list.push({ type: 'LEAVE', data: l, sortDate: l.appliedDate }));
    }
    if (appTypeFilter === 'All' || appTypeFilter === 'WFH') {
      myWfh.forEach((w) => list.push({ type: 'WFH', data: w, sortDate: w.appliedDate }));
    }

    return list.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  }, [myLeaves, myWfh, appTypeFilter]);

  // Team pending applications
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');
  const pendingWfh = wfhRequests.filter((w) => w.status === 'Pending');

  const pendingTeamItems = useMemo(() => {
    const list: Array<
      | { type: 'LEAVE'; data: LeaveRequest; sortDate: string }
      | { type: 'WFH'; data: WFHRequest; sortDate: string }
    > = [];

    if (teamTypeFilter === 'All' || teamTypeFilter === 'Leaves') {
      pendingLeaves.forEach((l) => list.push({ type: 'LEAVE', data: l, sortDate: l.appliedDate }));
    }
    if (teamTypeFilter === 'All' || teamTypeFilter === 'WFH') {
      pendingWfh.forEach((w) => list.push({ type: 'WFH', data: w, sortDate: w.appliedDate }));
    }

    return list.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  }, [pendingLeaves, pendingWfh, teamTypeFilter]);

  const totalPendingTeamCount = pendingLeaves.length + pendingWfh.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Leave &amp; Remote Work (WFH) Portal
            </h2>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Self Service + Approvals
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Submit leave applications, apply for Work From Home (WFH), track Month-Till-Date presence, and authorize team requests
          </p>
        </div>

        {/* Dual Action Buttons: Apply Leave & Apply WFH */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenApply('wfh')}
            className="flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300 shadow-2xs transition active:scale-95"
          >
            <Home className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>Apply for WFH</span>
          </button>

          <button
            onClick={() => handleOpenApply('leave')}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:from-indigo-700 hover:to-indigo-800 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-emerald-600" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* MONTH-TILL-DATE ATTENDANCE & ABSENCE SCORECARD */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-900/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                Month-Till-Date Attendance: {currentUser.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mtd.monthName} (Day 1 to Day {mtd.passedDaysTillDate} of {mtd.totalCalendarDaysInMonth})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              {mtd.attendancePercentage}% Attendance Rate
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-xl bg-white/5 p-3 backdrop-blur-xs border border-white/10">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Working Days (MTD)</span>
            <p className="mt-1 text-2xl font-black text-white">{mtd.workingDaysTillDate}</p>
            <span className="text-[10px] text-slate-400">Excl. Sundays</span>
          </div>

          <div className="rounded-xl bg-emerald-500/10 p-3 backdrop-blur-xs border border-emerald-500/20">
            <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">Days Present</span>
            <p className="mt-1 text-2xl font-black text-emerald-400">{mtd.presentDays}</p>
            <span className="text-[10px] text-emerald-400/80">In-office punches</span>
          </div>

          <div className="rounded-xl bg-sky-500/10 p-3 backdrop-blur-xs border border-sky-500/20">
            <span className="text-[10px] font-semibold text-sky-300 uppercase tracking-wider">Days WFH</span>
            <p className="mt-1 text-2xl font-black text-sky-400">{mtd.wfhDays}</p>
            <span className="text-[10px] text-sky-400/80">Approved remote</span>
          </div>

          <div className="rounded-xl bg-amber-500/10 p-3 backdrop-blur-xs border border-amber-500/20">
            <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider">Days on Leave</span>
            <p className="mt-1 text-2xl font-black text-amber-400">{mtd.leaveDays}</p>
            <span className="text-[10px] text-amber-400/80">Approved leaves</span>
          </div>

          <div className={`rounded-xl p-3 backdrop-blur-xs border ${
            mtd.absentDays > 0
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            <span className="text-[10px] font-semibold uppercase tracking-wider">Days Absent</span>
            <p className={`mt-1 text-2xl font-black ${mtd.absentDays > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {mtd.absentDays}
            </p>
            <span className="text-[10px]">{mtd.absentDays > 0 ? 'Loss of Pay (LOP)' : 'Zero Unexcused'}</span>
          </div>

          <div className="rounded-xl bg-white/5 p-3 backdrop-blur-xs border border-white/10">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Late Punches</span>
            <p className="mt-1 text-2xl font-black text-amber-300">{mtd.lateDays}</p>
            <span className="text-[10px] text-slate-400">After 09:30 AM</span>
          </div>
        </div>
      </div>

      {/* 1.5 DAYS/MONTH LEAVE ACCRUAL & ROLLOVER SCORECARD */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Annual Paid Leave Quota (1.5 Days / Month Accrual)</span>
            </h3>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Auto-Cumulative Rollover Active
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowLedgerModal(!showLedgerModal)}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{showLedgerModal ? 'Hide Monthly Ledger' : 'View Monthly Carry-Forward Ledger'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Monthly Accrual Rate */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Monthly Accrual</span>
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">Fixed</span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              1.5 <span className="text-xs font-medium text-slate-400">Days / Month</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Annual entitlement: <strong className="text-slate-700 dark:text-slate-300">{leaveAccrual.annualQuota} Days</strong> (1.5d × 12 mo)
            </p>
          </div>

          {/* Card 2: Cumulative Accrued Till Date */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-xs dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Accrued Till Date</span>
              <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                Month {leaveAccrual.currentMonthIndex} of 12
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {leaveAccrual.totalAccruedTillDate} <span className="text-xs font-medium text-slate-500">Days Credited</span>
            </p>
            <p className="text-[11px] text-indigo-900/70 dark:text-indigo-300/70 mt-1">
              {leaveAccrual.currentMonthIndex} months × 1.5d (Unused carries forward)
            </p>
          </div>

          {/* Card 3: Availed in Current Year */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Leaves Availed</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">{leaveAccrual.currentYear}</span>
            </div>
            <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
              {leaveAccrual.totalApprovedAvailed} <span className="text-xs font-medium text-slate-400">Day(s) Taken</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {leaveAccrual.totalPendingDays > 0 ? `${leaveAccrual.totalPendingDays}d pending approval` : 'All requests processed'}
            </p>
          </div>

          {/* Card 4: Available Leave Balance */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Available Balance</span>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">Active</span>
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {leaveAccrual.currentAvailableBalance} <span className="text-xs font-medium text-slate-500">Days Left</span>
            </p>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-1">
              +{leaveAccrual.remainingYearAccrual}d remaining to accrue in {leaveAccrual.currentYear}
            </p>
          </div>
        </div>

        {/* CARRY FORWARD POLICY BANNER */}
        <div className="rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-sky-50/60 to-emerald-50/80 p-3 text-xs text-indigo-950 dark:border-indigo-900/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-emerald-950/30 dark:text-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
              <strong>1.5 Days Monthly Accrual Rule:</strong> Har mahine staff ko <strong>1.5 din</strong> ki paid leave credit hoti hai (total 18 din/year). Agar aap kisi mahine leave nahi lete hain, toh unavailed leave balance end me automatic agle mahine me add aur accumulate ho jata hai.
            </p>
          </div>
          <span className="text-[10px] font-bold text-indigo-700 bg-white/80 dark:bg-slate-800 px-2.5 py-1 rounded-lg shrink-0 border border-indigo-200 dark:border-indigo-800">
            Current Pool: {leaveAccrual.currentAvailableBalance} Days
          </span>
        </div>

        {/* MONTHLY LEDGER EXPANDED VIEW */}
        {showLedgerModal && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Monthly Leave Accrual &amp; Rollover Breakdown ({leaveAccrual.currentYear})
                </h4>
                <p className="text-[11px] text-slate-400">
                  Month-by-month credit of 1.5 days and cumulative carry-forward balance for {currentUser.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLedgerModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                  <tr>
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3">Credited</th>
                    <th className="py-2.5 px-3">Cumulative Accrued</th>
                    <th className="py-2.5 px-3">Leaves Availed</th>
                    <th className="py-2.5 px-3">Rolled Over</th>
                    <th className="py-2.5 px-3">Closing Balance</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {leaveAccrual.ledger.map((row) => (
                    <tr
                      key={row.monthIndex}
                      className={
                        row.status === 'Current'
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }
                    >
                      <td className="py-2 px-3 text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{row.monthName}</span>
                        {row.status === 'Current' && (
                          <span className="rounded bg-indigo-600 px-1.5 py-0.2 text-[9px] text-white">Current</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-emerald-600 font-bold">+{row.creditedDays}d</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{row.cumulativeCredited}d</td>
                      <td className="py-2 px-3 text-amber-600">{row.availedDays}d</td>
                      <td className="py-2 px-3 text-indigo-600">+{row.unavailedRollover}d</td>
                      <td className="py-2 px-3 font-extrabold text-slate-900 dark:text-white">{row.cumulativeBalance}d</td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            row.status === 'Current'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                              : row.status === 'Past'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {row.status === 'Past' ? 'Added & Carried' : row.status === 'Current' ? 'Active Month' : 'Upcoming'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* TAB NAVIGATION: MY APPLICATIONS VS TEAM APPROVALS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('my-applications')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'my-applications'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>My Leaves &amp; WFH History ({myLeaves.length + myWfh.length})</span>
          </button>

          {canApprove && (
            <button
              onClick={() => setActiveTab('team-approvals')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'team-approvals'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Team Approval Requests</span>
              {totalPendingTeamCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  {totalPendingTeamCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">Filter:</span>
          {(['All', 'Leaves', 'WFH'] as const).map((filterVal) => {
            const currentFilter = activeTab === 'my-applications' ? appTypeFilter : teamTypeFilter;
            const isSelected = currentFilter === filterVal;
            return (
              <button
                key={filterVal}
                onClick={() => {
                  if (activeTab === 'my-applications') {
                    setAppTypeFilter(filterVal);
                  } else {
                    setTeamTypeFilter(filterVal);
                  }
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {filterVal}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MY APPLICATIONS (LEAVES + WFH) */}
      {/* ========================================================================= */}
      {activeTab === 'my-applications' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              My Personal Leave &amp; WFH History
            </h3>
            <span className="text-xs text-slate-400 font-medium">{personalItems.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="py-3.5 px-4">Application Type</th>
                  <th className="py-3.5 px-3">Date / Schedule</th>
                  <th className="py-3.5 px-3">Duration</th>
                  <th className="py-3.5 px-3">Reason / Plan</th>
                  <th className="py-3.5 px-3">Applied On</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Approval Authority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {personalItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No applications found for this filter. Use the buttons above to apply for Leave or WFH.
                    </td>
                  </tr>
                ) : (
                  personalItems.map((item) => {
                    const isLeave = item.type === 'LEAVE';
                    const leave = isLeave ? (item.data as LeaveRequest) : null;
                    const wfh = !isLeave ? (item.data as WFHRequest) : null;

                    const status = isLeave ? leave!.status : wfh!.status;
                    const approvedBy = isLeave ? leave!.approvedBy : wfh!.approvedBy;

                    return (
                      <tr key={item.data.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {isLeave ? (
                              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                🌴 {leave!.leaveType}
                              </span>
                            ) : (
                              <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                                🏠 Work From Home (WFH)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-700 dark:text-slate-200 font-semibold">
                          {isLeave
                            ? `${formatDate(leave!.startDate)} to ${formatDate(leave!.endDate)}`
                            : formatDate(wfh!.date)}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                          {isLeave ? `${leave!.days} Day(s)` : 'Full/Half Day'}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={item.data.reason}>
                          {item.data.reason}
                        </td>
                        <td className="py-3.5 px-3 text-slate-400">{formatDate(item.data.appliedDate)}</td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : status === 'Rejected'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-500">
                          {approvedBy ? (
                            <span className="flex items-center justify-end gap-1 font-semibold text-emerald-600 text-[11px]">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {approvedBy}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Pending review</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TEAM APPROVALS (LEAVES + WFH) */}
      {/* ========================================================================= */}
      {activeTab === 'team-approvals' && canApprove && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Team Applications Awaiting Managerial Review
                </h3>
                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  RM • Super Admin • HR Authority Only
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official review terminal: Leave &amp; WFH approvals are restricted exclusively to Regional Manager (RM), Super Admin, and HR.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{pendingTeamItems.length} Pending</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-3">Scheduled Date</th>
                  <th className="py-3.5 px-3">Duration</th>
                  <th className="py-3.5 px-3">Reason / Justification</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Approval Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {pendingTeamItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Zero pending applications. All team leaves &amp; WFH requests are up to date!
                    </td>
                  </tr>
                ) : (
                  pendingTeamItems.map((item) => {
                    const isLeave = item.type === 'LEAVE';
                    const leave = isLeave ? (item.data as LeaveRequest) : null;
                    const wfh = !isLeave ? (item.data as WFHRequest) : null;

                    return (
                      <tr key={item.data.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {item.data.employeeName}
                        </td>
                        <td className="py-3.5 px-3">
                          {isLeave ? (
                            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                              🌴 {leave!.leaveType}
                            </span>
                          ) : (
                            <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                              🏠 WFH Request
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-semibold">
                          {isLeave
                            ? `${formatDate(leave!.startDate)} to ${formatDate(leave!.endDate)}`
                            : formatDate(wfh!.date)}
                        </td>
                        <td className="py-3.5 px-3 font-bold">
                          {isLeave ? `${leave!.days} Days` : 'Full/Half Day'}
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 max-w-xs truncate" title={item.data.reason}>
                          {item.data.reason}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            Pending
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                if (isLeave) {
                                  updateLeaveStatus(leave!.id, 'Approved');
                                } else {
                                  updateWFHStatus(wfh!.id, 'Approved');
                                }
                              }}
                              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-2xs hover:bg-emerald-700 transition"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                if (isLeave) {
                                  updateLeaveStatus(leave!.id, 'Rejected');
                                } else {
                                  updateWFHStatus(wfh!.id, 'Rejected');
                                }
                              }}
                              className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-2xs hover:bg-rose-700 transition"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMBINED APPLY MODAL (LEAVE & WFH) */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-150">
            {/* Header & Mode Switcher */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  modalMode === 'leave'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                }`}>
                  {modalMode === 'leave' ? <CalendarDays className="h-4 w-4" /> : <Home className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {modalMode === 'leave' ? 'Apply for Leave' : 'Apply for Work From Home (WFH)'}
                  </h3>
                  <p className="text-[10px] text-slate-400">Formal application submitted for supervisor approval</p>
                </div>
              </div>
              <button onClick={() => setIsApplyOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setModalMode('leave')}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-bold transition ${
                  modalMode === 'leave'
                    ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-900 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <span>🌴 Leave Application</span>
              </button>
              <button
                type="button"
                onClick={() => setModalMode('wfh')}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-bold transition ${
                  modalMode === 'wfh'
                    ? 'bg-white text-sky-600 shadow-2xs dark:bg-slate-900 dark:text-sky-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <span>🏠 Work From Home (WFH)</span>
              </button>
            </div>

            {/* LEAVE FORM */}
            {modalMode === 'leave' ? (
              <form onSubmit={handleSubmitLeave} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Applicant
                  </label>
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
                    <p className="font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500">{currentUser.department || 'Sales'} • {currentUser.role}</p>
                  </div>
                </div>

                {/* Unified Leave Type Info */}
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider dark:text-indigo-400">Leave Category</span>
                      <p className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">Paid Leave (Monthly Accrual: 1.5 Days / Month)</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-slate-500">Available Balance</span>
                      <p className="font-black text-sm text-emerald-600 dark:text-emerald-400">{leaveAccrual.currentAvailableBalance} Days</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    * Unused 1.5 days carry forward each month and accumulate in your balance.
                  </p>
                </div>

                {/* Duration Mode Selector */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Leave Duration *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setLeaveDurationMode('FULL_DAY')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        leaveDurationMode === 'FULL_DAY'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      Full Day (1.0d)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaveDurationMode('HALF_DAY')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        leaveDurationMode === 'HALF_DAY'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      Half Day (0.5d)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaveDurationMode('MULTI_DAY')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        leaveDurationMode === 'MULTI_DAY'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      Multiple Days
                    </button>
                  </div>
                </div>

                {leaveDurationMode === 'MULTI_DAY' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date *</label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date *</label>
                      <input
                        type="date"
                        required
                        min={startDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Leave Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setEndDate(e.target.value);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                )}

                <div className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-200 dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Leave Days to Deduct:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">{requestedLeaveDays} Day(s)</strong>
                  </div>
                  <div className="mt-1 flex justify-between items-center text-[11px] text-slate-500">
                    <span>Remaining Balance After:</span>
                    <span className={`font-bold ${leaveAccrual.currentAvailableBalance < requestedLeaveDays ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {Math.max(0, Math.round((leaveAccrual.currentAvailableBalance - requestedLeaveDays) * 10) / 10)} Day(s)
                    </span>
                  </div>

                  {requestedLeaveDays > leaveAccrual.currentAvailableBalance && (
                    <div className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>Note: Requested duration exceeds your current accrued balance ({leaveAccrual.currentAvailableBalance}d). Additional days will require manager exception or be marked as unpaid.</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason for Leave *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Urgent family matter, medical checkup, doctor recommended rest, travel..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsApplyOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
                  >
                    Submit Leave Application
                  </button>
                </div>
              </form>
            ) : (
              /* WFH FORM */
              <form onSubmit={handleSubmitWFH} className="mt-4 space-y-4 text-xs">
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Target Date for Remote Work *
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setWfhDate(todayStr)}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                          wfhDate === todayStr ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setWfhDate(tomorrowStr)}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                          wfhDate === tomorrowStr ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Tomorrow
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    required
                    value={wfhDate}
                    onChange={(e) => setWfhDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Shift Coverage
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Full Day', 'Half Day (1st Half)', 'Half Day (2nd Half)'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setWfhShiftType(st)}
                        className={`rounded-xl border p-2 text-center text-xs font-semibold transition ${
                          wfhShiftType === st
                            ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300'
                            : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Reason &amp; Work Deliverable Plan *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Remote client meetings, travel, high-speed network requirement, family emergency..."
                    value={wfhReason}
                    onChange={(e) => setWfhReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsApplyOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-sky-600 px-5 py-2 font-bold text-white hover:bg-sky-700 shadow-xs transition"
                  >
                    Submit WFH Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
