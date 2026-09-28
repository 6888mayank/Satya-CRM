'use client';

import React from 'react';
import { useCRM } from '@/context/crm-context';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, TrendingUp, DollarSign, Users, PieChart as PieIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function ReportsSalesView() {
  const { customers, bookings } = useCRM();

  // Category counts and revenue
  const categoryStats = [
    {
      category: 'Government Schemes',
      leads: customers.filter((c) => c.selectedCategories?.includes('GOVERNMENT_SCHEMES')).length,
      revenue: 175000,
      color: '#6366f1'
    },
    {
      category: 'Government Grants',
      leads: customers.filter((c) => c.selectedCategories?.includes('GOVERNMENT_GRANTS')).length,
      revenue: 240000,
      color: '#10b981'
    },
    {
      category: 'Business Loans',
      leads: customers.filter((c) => c.selectedCategories?.includes('BUSINESS_LOANS')).length,
      revenue: 60000,
      color: '#f59e0b'
    },
    {
      category: 'IT / Tech Services',
      leads: customers.filter((c) => c.selectedCategories?.includes('IT_SERVICES')).length,
      revenue: 325000,
      color: '#0ea5e9'
    },
  ];

  // Lead sources data
  const leadSourceData = [
    { name: 'Google Ads / SEO', value: 38 },
    { name: 'Website Direct', value: 24 },
    { name: 'Referral / CA', value: 20 },
    { name: 'Facebook / Meta', value: 12 },
    { name: 'Cold Call / Field', value: 6 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#ec4899'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sales & Revenue Reports</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Analytics for Government Schemes, Grants, Business Loans, and IT software revenue performance
        </p>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Pipeline Bookings</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(bookings.reduce((s, b) => s + b.expectedAmount, 0))}
          </p>
          <span className="text-[11px] text-indigo-600 font-medium">{bookings.length} total orders</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Realized Collections</span>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">
            {formatCurrency(bookings.reduce((s, b) => s + b.paidAmount, 0))}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Bank cleared</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Pending Collections</span>
          <p className="mt-2 text-2xl font-extrabold text-rose-600">
            {formatCurrency(bookings.reduce((s, b) => s + b.pendingAmount, 0))}
          </p>
          <span className="text-[11px] text-rose-500 font-medium">Receivables balance</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Average Deal Size</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">₹1,47,500</p>
          <span className="text-[11px] text-slate-400 font-medium">Per corporate client</span>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Category Revenue Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Revenue by Service Category</h3>
          <p className="text-xs text-slate-400 mb-4">Total booked amount in INR</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="category" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', background: '#0f172a', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Acquisition */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Lead Source Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Customer acquisition channels (%)</p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadSourceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={4}
                >
                  {leadSourceData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => `${val}%`}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', background: '#0f172a', border: 'none', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs font-medium">
            {leadSourceData.map((s, idx) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-600 dark:text-slate-400">{s.name} ({s.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
