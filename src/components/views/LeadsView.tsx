'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import { LeadStatus } from '@/types/crm';
import {
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  ChevronRight,
  Landmark,
  Coins,
  Code2,
  Award
} from 'lucide-react';

export default function LeadsView() {
  const {
    customers,
    updateCustomerStatus,
    setSelectedCustomer,
    setIsBookingModalOpen
  } = useCRM();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) => {
    if (statusFilter !== 'ALL' && c.leadStatus !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && !c.selectedCategories?.includes(categoryFilter as any)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.servicesInterested.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const allStatuses: LeadStatus[] = [
    'New Lead', 'Contacted', 'Requirement Collected', 'Eligibility Checking',
    'Documents Pending', 'Documents Received', 'Under Processing', 'Proposal Sent',
    'Payment Pending', 'Service Booked', 'In Progress', 'Completed', 'Rejected', 'Lost'
  ];

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Leads & Prospects</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage inquiries for Government Schemes, Grants, Loans & IT Services ({filtered.length} leads)
          </p>
        </div>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Customer Booking</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:bg-white focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="ALL">All Statuses ({customers.length})</option>
            {allStatuses.map((st) => (
              <option key={st} value={st}>
                {st} ({customers.filter((c) => c.leadStatus === st).length})
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="ALL">All Services</option>
            <option value="GOVERNMENT_SCHEMES">Govt Schemes</option>
            <option value="GOVERNMENT_GRANTS">Govt Grants</option>
            <option value="BUSINESS_LOANS">Business Loans</option>
            <option value="IT_SERVICES">IT Services</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3.5 px-4">Customer & Entity</th>
                <th className="py-3.5 px-3">Services Interested</th>
                <th className="py-3.5 px-3">Lead Status</th>
                <th className="py-3.5 px-3">Priority</th>
                <th className="py-3.5 px-3">Source</th>
                <th className="py-3.5 px-3">Assigned Rep</th>
                <th className="py-3.5 px-3 text-right">Expected Value</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No matching leads found
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer"
                    onClick={() => setSelectedCustomer(c)}
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                          {c.companyName} • {c.city}, {c.state}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {c.servicesInterested.map((s) => (
                          <span
                            key={s}
                            className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={c.leadStatus}
                        onChange={(e) => updateCustomerStatus(c.id, e.target.value as LeadStatus)}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold border-0 cursor-pointer ${
                          c.leadStatus === 'Service Booked' || c.leadStatus === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : c.leadStatus === 'Under Processing' || c.leadStatus === 'Eligibility Checking'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            : c.leadStatus === 'Documents Pending' || c.leadStatus === 'Payment Pending'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {allStatuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          c.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : c.priority === 'High'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-500">{c.customerSource}</td>

                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {c.assignedSalespersonName}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(c.expectedValue)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(c);
                        }}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        View Profile →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
