'use client';

import React from 'react';
import { useCRM } from '@/context/crm-context';
import { Bell, CheckCircle2, AlertCircle, Briefcase, Check } from 'lucide-react';

export default function NotificationsView() {
  const { notifications, markNotificationRead, clearAllNotifications, setActiveView } = useCRM();

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notification Center</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            System announcements, lead assignments, payment receipts, and document status updates
          </p>
        </div>

        <button
          onClick={clearAllNotifications}
          className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => {
              markNotificationRead(n.id);
              if (n.link) setActiveView(n.link);
            }}
            className={`flex items-start justify-between gap-3 p-3.5 rounded-xl cursor-pointer transition text-xs ${
              n.read
                ? 'bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-850'
                : 'bg-indigo-50/70 border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/60 hover:bg-indigo-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {n.type === 'payment' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : n.type === 'booking' ? (
                  <Briefcase className="h-5 w-5 text-indigo-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{n.title}</h4>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
              </div>
            </div>

            {!n.read && (
              <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
