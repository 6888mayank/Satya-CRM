'use client';

import React from 'react';
import { useCRM } from '@/context/crm-context';
import { Activity, Clock, ShieldAlert, CheckCircle2, User, FileText } from 'lucide-react';

export default function ActivitiesView() {
  const { auditLogs } = useCRM();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">CRM Activity Feed</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Real-time activity logs covering client updates, document verifications, calls, and status promotions
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="relative border-l-2 border-slate-200 pl-5 space-y-6 dark:border-slate-800">
          {auditLogs.map((log) => (
            <div key={log.id} className="relative group">
              <div className="absolute -left-[27px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900 text-white text-[9px]">
                •
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                    <span className="rounded-md bg-indigo-50 px-2 py-0.2 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {log.entityType}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium">{log.details}</p>

                {log.oldValue && log.newValue && (
                  <div className="mt-2 flex items-center gap-2 text-[11px] rounded-lg bg-white p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                    <span className="text-slate-400">Changed:</span>
                    <span className="line-through text-rose-500">{log.oldValue}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-bold text-emerald-600">{log.newValue}</span>
                  </div>
                )}

                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>By <strong>{log.actor}</strong> ({log.actorRole})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
