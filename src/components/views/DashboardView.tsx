'use client';

import React from 'react';
import { useCRM } from '@/context/crm-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users2,
  TrendingUp,
  Landmark,
  Coins,
  Code2,
  PhoneCall,
  Calendar,
  DollarSign,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Activity,
  ArrowUpRight,
  Sparkles,
  Server,
  Layers,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export default function DashboardView() {
  const {
    currentUser,
    customers,
    bookings,
    payments,
    followups,
    attendance,
    leaves,
    employees,
    teams,
    auditLogs,
    customFields,
    automations,
    setSelectedCustomer,
    setIsBookingModalOpen,
    setActiveView
  } = useCRM();

  const role = currentUser.role;
  const isSalesRole = role === 'BRANCH_MANAGER' || role === 'TL' || role === 'BDM' || role === 'BDE';
  const canSeeSalesMetrics = role === 'SUPER_ADMIN' || role === 'RM' || isSalesRole;

  // General Metrics
  const totalLeads = customers.length;
  const newLeads = customers.filter((c) => c.leadStatus === 'New Lead').length;
  const activeCustomers = customers.filter((c) => c.customerType === 'Existing' || c.leadStatus === 'Service Booked' || c.leadStatus === 'In Progress').length;
  
  const govtSchemeLeads = customers.filter((c) => c.selectedCategories?.includes('GOVERNMENT_SCHEMES')).length;
  const grantLeads = customers.filter((c) => c.selectedCategories?.includes('GOVERNMENT_GRANTS')).length;
  const loanLeads = customers.filter((c) => c.selectedCategories?.includes('BUSINESS_LOANS')).length;
  const itLeads = customers.filter((c) => c.selectedCategories?.includes('IT_SERVICES')).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysFollowups = followups.filter((f) => f.date === todayStr && f.status === 'Pending');
  const pendingDocsCount = customers.filter((c) => c.leadStatus === 'Documents Pending').length;

  const totalRevenue = bookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalExpected = bookings.reduce((sum, b) => sum + b.expectedAmount, 0);
  const totalPendingPayments = bookings.reduce((sum, b) => sum + b.pendingAmount, 0);
  const activeBookingsCount = bookings.filter((b) => b.serviceStatus !== 'Completed' && b.serviceStatus !== 'Delivered').length;
  const completedServicesCount = bookings.filter((b) => b.serviceStatus === 'Completed' || b.serviceStatus === 'Delivered').length;

  // Chart Data: Category Breakdown computed dynamically from database bookings
  const categoryAnalyticsData = [
    {
      name: 'Govt Schemes',
      leads: govtSchemeLeads,
      revenue: bookings.filter((b) => b.category === 'GOVERNMENT_SCHEMES').reduce((s, b) => s + b.paidAmount, 0),
      color: '#6366f1'
    },
    {
      name: 'Govt Grants',
      leads: grantLeads,
      revenue: bookings.filter((b) => b.category === 'GOVERNMENT_GRANTS').reduce((s, b) => s + b.paidAmount, 0),
      color: '#10b981'
    },
    {
      name: 'Business Loans',
      leads: loanLeads,
      revenue: bookings.filter((b) => b.category === 'BUSINESS_LOANS').reduce((s, b) => s + b.paidAmount, 0),
      color: '#f59e0b'
    },
    {
      name: 'IT Services',
      leads: itLeads,
      revenue: bookings.filter((b) => b.category === 'IT_SERVICES').reduce((s, b) => s + b.paidAmount, 0),
      color: '#0ea5e9'
    },
  ];

  // Dynamic monthly sales data (defaults to current month realized revenue)
  const currentMonthName = new Date().toLocaleString('default', { month: 'short' });
  const monthlySalesData = [
    { month: 'Apr', target: 0, achieved: 0 },
    { month: 'May', target: 0, achieved: 0 },
    { month: 'Jun', target: 0, achieved: 0 },
    { month: 'Jul', target: 0, achieved: 0 },
    { month: 'Aug', target: 0, achieved: 0 },
    { month: currentMonthName, target: totalExpected, achieved: totalRevenue },
  ];

  // Sales Executive Performance computed dynamically from registered employees & real bookings
  const salesLeaderboard = employees
    .filter((e) => e.department === 'Sales' || e.role === 'BDE' || e.role === 'BDM' || e.role === 'TL')
    .map((sp) => {
      const empLeads = customers.filter(
        (c) => c.assignedSalespersonId === sp.id || c.assignedSalespersonName?.toLowerCase().includes(sp.name.toLowerCase().split(' ')[0])
      ).length;
      const empBookings = bookings.filter(
        (b) => b.assignedSalesperson?.toLowerCase().includes(sp.name.toLowerCase().split(' ')[0])
      );
      const rev = empBookings.reduce((sum, b) => sum + b.paidAmount, 0);
      const pending = empBookings.reduce((sum, b) => sum + b.pendingAmount, 0);
      const rate = empLeads > 0 ? `${Math.round((empBookings.length / empLeads) * 100)}%` : '0%';

      return {
        name: sp.name,
        leads: empLeads,
        contacted: empLeads,
        bookings: empBookings.length,
        convRate: rate,
        revenue: rev,
        pending,
        avatar: sp.avatar
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      {/* Dynamic Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, {currentUser.name}
            </h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {role === 'SUPER_ADMIN' && 'Complete operational overview: Government schemes, business loans, IT delivery & personnel.'}
            {role === 'RM' && 'Regional Command: 360° cross-departmental operations, live employee rosters, and revenue targets.'}
            {isSalesRole && 'Sales pipeline: Leads, active customer bookings, team targets, and today’s client follow-ups.'}
            {role === 'HR' && 'Human Resources: Employee directory, real-time attendance, and leave management.'}
            {role === 'TECH' && 'System architecture: CRM field configuration, automation triggers, webhooks & audit logs.'}
          </p>
        </div>

        {/* Header Action Button */}
        {canSeeSalesMetrics && (
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition active:scale-95"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span>New Customer Booking</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. SUPER ADMIN / RM / SALES DASHBOARD METRICS */}
      {/* ========================================================================= */}
      {canSeeSalesMetrics && (
        <>
          {/* Main KPI Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase">Total Leads</span>
                <Users2 className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{totalLeads}</p>
              <span className="mt-1 inline-block text-[11px] text-emerald-600 font-medium">+{newLeads} new this week</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase">Active Bookings</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{activeBookingsCount}</p>
              <span className="mt-1 inline-block text-[11px] text-slate-400 font-medium">{completedServicesCount} completed</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase">Collected Revenue</span>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-emerald-600">{formatCurrency(totalRevenue)}</p>
              <span className="mt-1 inline-block text-[11px] text-slate-400 font-medium">Of {formatCurrency(totalExpected)} total</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase">Pending Payments</span>
                <AlertCircle className="h-4 w-4 text-rose-500" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-rose-600">{formatCurrency(totalPendingPayments)}</p>
              <span className="mt-1 inline-block text-[11px] text-rose-500 font-medium">Requires follow-up</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase">Today's Follow-ups</span>
                <PhoneCall className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{todaysFollowups.length}</p>
              <span className="mt-1 inline-block text-[11px] text-indigo-600 font-medium">Scheduled today</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase">Docs Pending</span>
                <FileCheck className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-amber-600">{pendingDocsCount}</p>
              <span className="mt-1 inline-block text-[11px] text-amber-600 font-medium">Awaiting upload</span>
            </div>
          </div>

          {/* Service Category Split Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900/30 dark:bg-indigo-950/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Govt Schemes</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">{govtSchemeLeads} Leads</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Govt Grants</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">{grantLeads} Leads</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/40 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Business Loans</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">{loanLeads} Leads</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/40 p-4 dark:border-sky-900/30 dark:bg-sky-950/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">IT Services</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">{itLeads} Leads</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Monthly Target vs Achieved Sales Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Monthly Sales & Bookings</h3>
                  <p className="text-xs text-slate-400">Target vs Realized Revenue (INR)</p>
                </div>
                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
                  +18.4% QoQ
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
                    <YAxis fontSize={11} stroke="#94a3b8" tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip
                      formatter={(val: any) => formatCurrency(Number(val))}
                      contentStyle={{ borderRadius: '12px', fontSize: '11px', background: '#0f172a', border: 'none', color: '#fff' }}
                    />
                    <Bar dataKey="achieved" name="Achieved" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="target" name="Target" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Business Category Revenue Analytics */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Business Category Revenue</h3>
                  <p className="text-xs text-slate-400">Distribution across Grants, Schemes, Loans & IT</p>
                </div>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryAnalyticsData}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      paddingAngle={4}
                    >
                      {categoryAnalyticsData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatCurrency(Number(val))}
                      contentStyle={{ borderRadius: '12px', fontSize: '11px', background: '#0f172a', border: 'none', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs font-medium">
                {categoryAnalyticsData.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{c.name}</span>
                    <strong className="text-slate-900 dark:text-white">{formatCurrency(c.revenue)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sales Leaderboard & Performance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Sales Executive Performance</h3>
                <p className="text-xs text-slate-400">Leads assigned, conversion rate, and revenue achieved</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                    <th className="pb-3">Salesperson</th>
                    <th className="pb-3 text-center">Assigned</th>
                    <th className="pb-3 text-center">Contacted</th>
                    <th className="pb-3 text-center">Bookings</th>
                    <th className="pb-3 text-center">Conv. Rate</th>
                    <th className="pb-3 text-right">Revenue</th>
                    <th className="pb-3 text-right">Pending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {salesLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No sales executive activity recorded yet. Add sales team members in the Employees Directory!
                      </td>
                    </tr>
                  ) : (
                    salesLeaderboard.map((sp) => (
                    <tr key={sp.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 flex items-center gap-2.5">
                        <img src={sp.avatar} alt={sp.name} className="h-7 w-7 rounded-full object-cover" />
                        <span className="font-bold text-slate-900 dark:text-white">{sp.name}</span>
                      </td>
                      <td className="py-3 text-center">{sp.leads}</td>
                      <td className="py-3 text-center">{sp.contacted}</td>
                      <td className="py-3 text-center">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {sp.bookings}
                        </span>
                      </td>
                      <td className="py-3 text-center font-bold text-indigo-600">{sp.convRate}</td>
                      <td className="py-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(sp.revenue)}</td>
                      <td className="py-3 text-right text-rose-500">{formatCurrency(sp.pending)}</td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 16 Teams Target vs Achieved Leaderboard (Super Admin & RM Radar) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>16 Teams Target &amp; Quota Leaderboard</span>
                  <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {teams.length} Active Sales Pods
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Live tracking of monthly revenue achievement against Super Admin targets across all 16 teams
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('teams')}
                className="text-xs font-semibold text-indigo-600 hover:underline shrink-0"
              >
                Manage All 16 Teams →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {teams.slice(0, 16).map((t) => {
                const pct = t.targetRevenue > 0
                  ? Math.min(100, Math.round((t.achievedRevenue / t.targetRevenue) * 100))
                  : 0;

                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40 text-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[130px]" title={t.name}>
                        {t.name}
                      </span>
                      <span className="font-mono font-bold text-emerald-600">{pct}%</span>
                    </div>
                    <p className="text-[10px] text-slate-400">TL: {t.teamLeadName} • {t.members?.length || 0} members</p>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>Target: {formatCurrency(t.targetRevenue)}</span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold">{formatCurrency(t.achievedRevenue)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. HR ROLE SPECIFIC DASHBOARD */}
      {/* ========================================================================= */}
      {role === 'HR' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Employees</span>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{employees.length}</p>
              <span className="text-[11px] text-emerald-600 font-medium">Active Headcount</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Present Today</span>
              <p className="mt-2 text-2xl font-extrabold text-emerald-600">
                {attendance.filter((a) => a.status === 'Present' || a.status === 'WFH').length}
              </p>
              <span className="text-[11px] text-slate-400 font-medium">92% attendance rate</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Late Arrivals</span>
              <p className="mt-2 text-2xl font-extrabold text-amber-600">
                {attendance.filter((a) => a.status === 'Late').length}
              </p>
              <span className="text-[11px] text-amber-600 font-medium">After 09:30 AM</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Pending Leaves</span>
              <p className="mt-2 text-2xl font-extrabold text-rose-600">
                {leaves.filter((l) => l.status === 'Pending').length}
              </p>
              <span className="text-[11px] text-rose-500 font-medium">Awaiting HR review</span>
            </div>
          </div>

          {/* Quick Attendance Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Today&apos;s Attendance Log</h3>
            <div className="space-y-2">
              {attendance.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 dark:border-slate-800">
                  <div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white">{a.employeeName}</p>
                    <p className="text-[10px] text-slate-400">
                      In: {a.checkIn || '-'} • Hours: {a.workingHours} • {a.remarks}
                    </p>
                  </div>
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TECH / IT ROLE SPECIFIC DASHBOARD */}
      {/* ========================================================================= */}
      {role === 'TECH' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">System Status</span>
              <p className="mt-2 text-lg font-bold text-emerald-600 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </p>
              <span className="text-[11px] text-slate-400">Latency: 28ms</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Custom Fields</span>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{customFields.length}</p>
              <span className="text-[11px] text-indigo-600">Active schema fields</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Automations</span>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{automations.length}</p>
              <span className="text-[11px] text-emerald-600">All rules active</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Audit Events</span>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{auditLogs.length}</p>
              <span className="text-[11px] text-slate-400">Security logged</span>
            </div>
          </div>

          {/* Recent Audit Logs Snapshot */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Sensitive Operations</h3>
              <button onClick={() => setActiveView('audit-logs')} className="text-xs text-indigo-600 font-semibold hover:underline">
                View All Logs
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">By {log.actor} ({log.actorRole})</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
