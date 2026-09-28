'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { Home, X, Check, Calendar, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

export default function WFHModal() {
  const { isWFHModalOpen, setIsWFHModalOpen, currentUser, applyWFH } = useCRM();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [date, setDate] = useState<string>(tomorrowStr);
  const [shiftType, setShiftType] = useState<'Full Day' | 'Half Day (1st Half)' | 'Half Day (2nd Half)'>('Full Day');
  const [reason, setReason] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isWFHModalOpen) return null;

  const quickReasons = [
    'Remote Client Calling & High-Volume Follow-ups',
    'Client Field Visit & Outstation Coordination',
    'Deep Work: Tech Architecture & Code Delivery',
    'Commute / Severe Traffic Delay on Highway',
    'Mild Health Issue / Doctor Consultation',
    'Urgent Family Support Required at Home'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    applyWFH({
      employeeId: currentUser.id,
      employeeName: `${currentUser.name} (${currentUser.role})`,
      department: currentUser.department || 'Sales',
      role: currentUser.role,
      date,
      reason: `${shiftType !== 'Full Day' ? `[${shiftType}] ` : ''}${reason.trim()}`
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsWFHModalOpen(false);
      setReason('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              <Home className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Apply for Work From Home (WFH)
              </h3>
              <p className="text-[11px] text-slate-400">
                Official remote work application for supervisor &amp; RM approval
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsWFHModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              WFH Application Submitted!
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Your WFH application for {date} has been sent to your supervisor / RM for 1-click approval.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            {/* Applicant Card */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.designation} • {currentUser.department || 'Sales'}</p>
              </div>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {currentUser.role}
              </span>
            </div>

            {/* Target Date & Quick Date Pills */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Target Date for Remote Work *
                </label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDate(todayStr)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                      date === todayStr
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDate(tomorrowStr)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                      date === tomorrowStr
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Shift Type (Full Day / Half Day) */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Shift Coverage
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Full Day', 'Half Day (1st Half)', 'Half Day (2nd Half)'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setShiftType(st)}
                    className={`rounded-xl border p-2 text-center text-xs font-semibold transition ${
                      shiftType === st
                        ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Reason Suggestions */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Quick Reason Suggestions (Click to fill)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickReasons.map((qr) => (
                  <button
                    key={qr}
                    type="button"
                    onClick={() => setReason(qr)}
                    className="rounded-lg border border-slate-200 bg-slate-50/70 px-2 py-1 text-[11px] text-slate-600 hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 transition text-left"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Details */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Reason &amp; Work Plan for Remote Shift *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Describe your remote deliverables, client meetings scheduled, or reason for WFH..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Approver Routing Info Note */}
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2 dark:bg-slate-800/40 dark:border-slate-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Request routes directly to your Team Lead / Branch Manager and RM for 1-click authorization.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsWFHModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-2 font-bold text-white shadow-xs hover:from-sky-700 hover:to-indigo-700 transition"
              >
                Submit WFH Application
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
