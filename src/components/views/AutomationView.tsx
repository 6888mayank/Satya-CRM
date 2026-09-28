'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { Sparkles, Plus, ToggleLeft, ToggleRight, Zap, ArrowRight, ShieldAlert, X } from 'lucide-react';
import { AutomationRule } from '@/types/crm';

export default function AutomationView() {
  const { automations, toggleAutomation, addAutomation, currentUser } = useCRM();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [ruleName, setRuleName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('Lead Status Changed');
  const [condition, setCondition] = useState('Status equals "Documents Received"');
  const [actionDesc, setActionDesc] = useState('Create task for assigned sales consultant & notify processing team');

  const canAccess = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'TECH';

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-3" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Authorized Tech Access Only</h3>
        <p className="text-xs text-slate-500 max-w-md mt-1">
          Automations and webhook triggers are restricted to <strong>Authorized Tech</strong> and <strong>Super Admin</strong>.
        </p>
      </div>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addAutomation({
      name: ruleName,
      triggerEvent,
      triggerCondition: condition,
      actionDescription: actionDesc,
      active: true
    });
    setIsModalOpen(false);
    setRuleName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Visual Automation Engine</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create trigger-action workflows for lead promotion, document verification notices, and payment auto-booking
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Automation Rule</span>
        </button>
      </div>

      <div className="space-y-3">
        {automations.map((rule) => (
          <div
            key={rule.id}
            className={`rounded-2xl border p-5 transition ${
              rule.active
                ? 'border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900'
                : 'border-slate-200 bg-slate-50/60 opacity-60 dark:border-slate-800 dark:bg-slate-900/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{rule.name}</h3>
                  <p className="text-[11px] text-slate-400">
                    Fired {rule.triggerCount} times {rule.lastTriggered && `• Last active: ${rule.lastTriggered}`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleAutomation(rule.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                {rule.active ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Active
                  </span>
                ) : (
                  <span className="text-slate-400">Paused</span>
                )}
              </button>
            </div>

            {/* Visual WHEN -> THEN Blocks */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-950 dark:bg-indigo-950/20">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block mb-1">
                  WHEN (Trigger Event)
                </span>
                <p className="font-bold text-slate-900 dark:text-white">{rule.triggerEvent}</p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{rule.triggerCondition}</p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-950 dark:bg-emerald-950/20">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                  THEN (Automated Action)
                </span>
                <p className="font-semibold text-slate-900 dark:text-white">{rule.actionDescription}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Automation Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Create Automation Trigger</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Booking Auto-Promotion on Full Payment"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Trigger Event</label>
                <select
                  value={triggerEvent}
                  onChange={(e) => setTriggerEvent(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Lead Status Changed">Lead Status Changed</option>
                  <option value="Payment Status Changed">Payment Status Changed</option>
                  <option value="New Lead Created">New Lead Created</option>
                  <option value="Document Uploaded">Document Uploaded</option>
                  <option value="Scheduled Time Reached">Scheduled Time Reached</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">WHEN Condition Expression *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead becomes 'Documents Received'"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">THEN Actions *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Create task for assigned rep & notify operations team"
                  value={actionDesc}
                  onChange={(e) => setActionDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700"
                >
                  Save Automation Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
