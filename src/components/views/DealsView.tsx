'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Briefcase, Plus, Search, Filter } from 'lucide-react';

export default function DealsView() {
  const { customers, setSelectedCustomer, setIsBookingModalOpen } = useCRM();
  const [search, setSearch] = useState('');

  const deals = customers.map((c) => ({
    id: `deal-${c.id}`,
    dealName: `${c.companyName} — ${c.servicesInterested[0] || 'Service Contract'}`,
    clientName: c.name,
    company: c.companyName,
    value: c.expectedValue,
    stage: c.leadStatus,
    priority: c.priority,
    salesperson: c.assignedSalespersonName,
    closeDate: '2026-10-31',
    customerRef: c
  }));

  const filtered = deals.filter(
    (d) =>
      d.dealName.toLowerCase().includes(search.toLowerCase()) ||
      d.clientName.toLowerCase().includes(search.toLowerCase()) ||
      d.salesperson.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Deals & Proposals</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            High-value grant applications, loan processing mandates & IT deliverables ({filtered.length})
          </p>
        </div>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Customer Booking</span>
        </button>
      </div>

      <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <Search className="h-4 w-4 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Search deals, company, or sales rep..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 focus:outline-hidden dark:text-white"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3.5 px-4">Deal Proposal</th>
                <th className="py-3.5 px-3">Company</th>
                <th className="py-3.5 px-3">Stage</th>
                <th className="py-3.5 px-3">Priority</th>
                <th className="py-3.5 px-3">Owner</th>
                <th className="py-3.5 px-3">Target Close</th>
                <th className="py-3.5 px-4 text-right">Deal Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setSelectedCustomer(d.customerRef)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{d.dealName}</td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{d.company}</td>
                  <td className="py-3.5 px-3">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {d.stage}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {d.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">{d.salesperson}</td>
                  <td className="py-3.5 px-3 text-slate-500">{formatDate(d.closeDate)}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(d.value)}
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
