'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Plus, Building, Phone, Mail, ChevronRight, UserCheck } from 'lucide-react';

export default function CustomersView() {
  const { customers, bookings, setSelectedCustomer, setIsBookingModalOpen } = useCRM();
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.companyName.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Customers Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registered business clients with ongoing grants, loan sanctions, and software contracts ({filtered.length})
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

      {/* Search Input */}
      <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <Search className="h-4 w-4 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Search by client name, company, city, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 focus:outline-hidden dark:text-white"
        />
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const custBookings = bookings.filter((b) => b.customerId === c.id);
          const totalVal = custBookings.reduce((sum, b) => sum + b.expectedAmount, c.expectedValue || 0);
          const totalPaid = custBookings.reduce((sum, b) => sum + b.paidAmount, 0);

          return (
            <div
              key={c.id}
              onClick={() => setSelectedCustomer(c)}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-2xs">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {c.companyName}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {c.customerType}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-3 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] block">Location</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {c.city}, {c.state}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Turnover</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {c.businessDetails.annualTurnover}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Total Deal Value</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(totalVal)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Paid Amount</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {c.servicesInterested.slice(0, 2).map((srv) => (
                  <span
                    key={srv}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {srv}
                  </span>
                ))}
                {c.servicesInterested.length > 2 && (
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800">
                    +{c.servicesInterested.length - 2} more
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between pt-2 text-[11px] text-slate-400">
                <span>Rep: <strong className="text-slate-700 dark:text-slate-300">{c.assignedSalespersonName}</strong></span>
                <span className="flex items-center text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                  View 360° <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
