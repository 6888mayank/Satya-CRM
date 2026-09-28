'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { History, Search, ShieldAlert, User, ShieldCheck } from 'lucide-react';

export default function AuditLogsView() {
  const { auditLogs, currentUser } = useCRM();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');

  const canAccess = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'TECH';

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-3" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Security Log Access Restricted</h3>
        <p className="text-xs text-slate-500 max-w-md mt-1">
          Compliance and sensitive audit trails are visible strictly to <strong>Super Admin</strong> and authorized <strong>Tech</strong> administrators.
        </p>
      </div>
    );
  }

  const filtered = auditLogs.filter((log) => {
    if (entityFilter !== 'ALL' && log.entityType !== entityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.actor.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const entities = ['Booking', 'Payment', 'Customer', 'Lead', 'User', 'CRM Configuration', 'Sales Pipeline', 'HR Leave'];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Security & Audit Trail</h2>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Immutable Log
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographically sealed audit records of all user actions, status modifications, role adjustments & payments
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search actor, action, booking #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:bg-white focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="ALL">All Entity Types ({auditLogs.length})</option>
            {entities.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Trail List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-3">Actor & Role</th>
                <th className="py-3.5 px-3">Action Type</th>
                <th className="py-3.5 px-3">Entity Reference</th>
                <th className="py-3.5 px-4">Event Details</th>
                <th className="py-3.5 px-4">Delta (Old → New)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {log.timestamp}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{log.actor}</span>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {log.actorRole}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                    {log.action}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {log.entityType} #{log.entityId}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-sm">
                    {log.details}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-[11px]">
                    {log.oldValue && log.newValue ? (
                      <div className="flex items-center gap-1.5">
                        <span className="line-through text-rose-500">{log.oldValue}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-bold text-emerald-600">{log.newValue}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
