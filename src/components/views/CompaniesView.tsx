'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { formatCurrency } from '@/lib/utils';
import { Building2, Search, Users, MapPin, ExternalLink } from 'lucide-react';

export default function CompaniesView() {
  const { customers, setSelectedCustomer } = useCRM();
  const [search, setSearch] = useState('');

  const companies = customers.map((c) => ({
    id: c.id,
    companyName: c.companyName,
    primaryContact: c.name,
    structure: c.businessDetails.businessStructure,
    turnover: c.businessDetails.annualTurnover,
    industry: c.businessDetails.industry,
    employees: c.businessDetails.employeeCount,
    location: `${c.city}, ${c.state}`,
    services: c.servicesInterested,
    status: c.businessDetails.currentStatus,
    customerRef: c
  }));

  const filtered = companies.filter(
    (comp) =>
      comp.companyName.toLowerCase().includes(search.toLowerCase()) ||
      comp.industry.toLowerCase().includes(search.toLowerCase()) ||
      comp.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Company Accounts</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Corporate entities, manufacturing units, and startups engaged across multiple services ({filtered.length})
          </p>
        </div>
      </div>

      <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <Search className="h-4 w-4 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Filter by company name, industry, or state..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 focus:outline-hidden dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedCustomer(c.customerRef)}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{c.companyName}</h3>
                <p className="text-xs text-slate-400 truncate">{c.industry}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <div>
                <span className="text-[10px] text-slate-400 block">Structure</span>
                <strong className="text-slate-800 dark:text-slate-200">{c.structure}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Turnover</span>
                <strong className="text-slate-800 dark:text-slate-200">{c.turnover}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Employees</span>
                <strong className="text-slate-800 dark:text-slate-200">{c.employees} Staff</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Status</span>
                <strong className="text-emerald-600">{c.status}</strong>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-400">
              <span className="truncate">Contact: {c.primaryContact}</span>
              <span className="text-indigo-600 font-semibold flex items-center gap-1">
                View <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
