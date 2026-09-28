'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { Sliders, ShieldAlert, Check, Bell } from 'lucide-react';

export default function SystemConfigView() {
  const { currentUser } = useCRM();
  const [companyName, setCompanyName] = useState('SATYA Financial & IT Solutions Pvt Ltd');
  const [defaultCurrency, setDefaultCurrency] = useState('INR (₹)');
  const [fiscalYear, setFiscalYear] = useState('April - March (India Standard)');
  const [autoAssignLeads, setAutoAssignLeads] = useState(true);
  const [saved, setSaved] = useState(false);

  const canAccess = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'TECH';

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-3" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">System Settings Restricted</h3>
        <p className="text-xs text-slate-500 max-w-md mt-1">
          Technical system configuration is restricted strictly to <strong>Super Admin</strong> and authorized <strong>Tech</strong> administrators.
        </p>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">CRM System Configuration</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          General business rules, currency standards, fiscal year preferences, and system defaults
        </p>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4 text-xs">
        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Company Legal Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">Base Currency</label>
            <input
              type="text"
              disabled
              value={defaultCurrency}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 p-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">Financial Fiscal Year</label>
            <input
              type="text"
              disabled
              value={fiscalYear}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 p-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={autoAssignLeads}
              onChange={(e) => setAutoAssignLeads(e.target.checked)}
              className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Enable Round-Robin automatic lead distribution among sales executives</span>
          </label>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
          >
            {saved ? <Check className="h-4 w-4" /> : null}
            <span>{saved ? 'Settings Saved' : 'Save System Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
