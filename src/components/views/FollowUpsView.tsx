'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { formatDate } from '@/lib/utils';
import { FollowUp } from '@/types/crm';
import {
  PhoneCall,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Users2,
  Mail,
  FileCheck2,
  DollarSign,
  X
} from 'lucide-react';

export default function FollowUpsView() {
  const { followups, addFollowUp, completeFollowUp, customers, currentUser } = useCRM();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Completed'>('Pending');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New follow-up state
  const [newCustId, setNewCustId] = useState(customers[0]?.id || '');
  const [newType, setNewType] = useState<FollowUp['type']>('Call');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('02:30 PM');
  const [newNotes, setNewNotes] = useState('');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High'>('High');

  const filtered = followups.filter((f) => {
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === newCustId) || customers[0];

    addFollowUp({
      customerId: cust.id,
      customerName: `${cust.name} (${cust.companyName})`,
      service: cust.servicesInterested[0] || 'General Assistance',
      date: newDate,
      time: newTime,
      type: newType,
      assignedEmployee: cust.assignedSalespersonName || currentUser.name,
      notes: newNotes || 'Follow-up discussion',
      status: 'Pending',
      priority: newPriority
    });

    setIsModalOpen(false);
    setNewNotes('');
  };

  const getTypeIcon = (type: FollowUp['type']) => {
    switch (type) {
      case 'Call': return PhoneCall;
      case 'WhatsApp': return MessageSquare;
      case 'Email': return Mail;
      case 'Meeting': return Users2;
      case 'Document Collection': return FileCheck2;
      case 'Payment Follow-up': return DollarSign;
      default: return Calendar;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Follow-up Schedule & Communications</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep track of client calls, WhatsApp updates, document collections, and payment reminders ({filtered.length})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(['Pending', 'Completed', 'ALL'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === st
                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {/* Follow-ups List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            No follow-ups matching current filter
          </div>
        ) : (
          filtered.map((f) => {
            const Icon = getTypeIcon(f.type);
            const isDone = f.status === 'Completed';

            return (
              <div
                key={f.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition ${
                  isDone
                    ? 'border-slate-200 bg-slate-50/50 opacity-70 dark:border-slate-800 dark:bg-slate-900/40'
                    : 'border-slate-200 bg-white shadow-xs hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    f.type === 'WhatsApp' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300' :
                    f.type === 'Payment Follow-up' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300' :
                    f.type === 'Document Collection' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {f.customerName}
                      </h4>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {f.type}
                      </span>
                      <span className={`rounded-full px-2 py-0.2 text-[9px] font-bold ${
                        f.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {f.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                      {f.notes}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(f.date)} at {f.time}
                      </span>
                      <span>• Rep: {f.assignedEmployee}</span>
                      <span>• Service: {f.service}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isDone ? (
                    <button
                      onClick={() => completeFollowUp(f.id)}
                      className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Mark Done</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Follow-up Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Schedule New Follow-up</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Customer</label>
                <select
                  value={newCustId}
                  onChange={(e) => setNewCustId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.companyName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Follow-up Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="Call">Phone Call</option>
                    <option value="WhatsApp">WhatsApp Message</option>
                    <option value="Email">Email Communication</option>
                    <option value="Meeting">Physical / Office Meeting</option>
                    <option value="Document Collection">Document Collection</option>
                    <option value="Payment Follow-up">Payment Follow-up</option>
                    <option value="Eligibility Follow-up">Eligibility Follow-up</option>
                    <option value="Loan Follow-up">Loan Follow-up</option>
                    <option value="IT Requirement Meeting">IT Requirement Meeting</option>
                    <option value="Demo">Software Demo</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Notes & Purpose *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Discussion points or document submission agenda..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
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
                  Schedule Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
