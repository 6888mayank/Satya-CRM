'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { Clock, CheckCircle2, AlertTriangle, Home, FileSpreadsheet, Download } from 'lucide-react';
import AttendanceExportModal from '@/components/modals/AttendanceExportModal';

export default function ReportsAttendanceView() {
  const { attendance } = useCRM();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const present = attendance.filter((a) => a.status === 'Present').length;
  const late = attendance.filter((a) => a.status === 'Late').length;
  const wfh = attendance.filter((a) => a.status === 'WFH').length;
  const leave = attendance.filter((a) => a.status === 'Leave').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Attendance Performance Reports</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Biometric punctuality trends, work-from-home ratios, and Excel compliance export
          </p>
        </div>

        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95 shrink-0"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export to Excel (.csv)</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">On-Time Present</span>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">{present}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Punctual arrival</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Late Arrivals</span>
          <p className="mt-2 text-2xl font-extrabold text-amber-600">{late}</p>
          <span className="text-[11px] text-amber-600 font-medium">After 09:30 AM</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">WFH Remote</span>
          <p className="mt-2 text-2xl font-extrabold text-sky-600">{wfh}</p>
          <span className="text-[11px] text-sky-600 font-medium">Approved remote</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Absence / Leave</span>
          <p className="mt-2 text-2xl font-extrabold text-rose-600">{leave}</p>
          <span className="text-[11px] text-rose-600 font-medium">Documented leave</span>
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
