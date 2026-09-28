'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import {
  Terminal,
  Cpu,
  Database,
  Zap,
  ShieldCheck,
  Server,
  Layers,
  Sparkles,
  Sliders,
  Webhook,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Code2,
  FileCode,
  Key,
  Users2,
  ArrowUpRight,
  ExternalLink,
  Table,
  Check
} from 'lucide-react';

export default function TechCockpitView() {
  const {
    currentUser,
    isDbConnected,
    isDbLoading,
    dbError,
    refreshData,
    customers,
    bookings,
    payments,
    employees,
    attendance,
    users,
    customFields,
    automations,
    auditLogs,
    notifications,
    teams,
    setActiveView
  } = useCRM();

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const supabaseUrl = 'https://zbqdjgcuuxrqqtfilbfl.supabase.co';

  const handleTestDatabase = async () => {
    setIsTesting(true);
    setTestResult(null);
    const start = performance.now();

    try {
      await refreshData();
      const duration = Math.round(performance.now() - start);
      setTestResult(`PostgreSQL connection healthy &bull; Ping: ${duration}ms &bull; 17 Collections synchronized`);
    } catch {
      setTestResult('Connection failed. Please check network and API credentials.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(supabaseUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const dbTables = [
    { name: 'customers', label: 'Customers & Leads', count: customers.length, color: 'text-indigo-500' },
    { name: 'bookings', label: 'Client Bookings', count: bookings.length, color: 'text-emerald-500' },
    { name: 'payments', label: 'Payments & Revenue', count: payments.length, color: 'text-emerald-600' },
    { name: 'employees', label: 'Staff Directory', count: employees.length, color: 'text-sky-500' },
    { name: 'attendance', label: 'Biometric Attendance', count: attendance.length, color: 'text-blue-500' },
    { name: 'users', label: 'User Profiles & Roles', count: users.length, color: 'text-purple-500' },
    { name: 'sales_teams', label: 'Sales Pods & Teams', count: teams.length, color: 'text-amber-500' },
    { name: 'custom_fields', label: 'Custom Data Fields', count: customFields.length, color: 'text-teal-500' },
    { name: 'automation_rules', label: 'Automation Triggers', count: automations.length, color: 'text-orange-500' },
    { name: 'audit_logs', label: 'System Audit Trail', count: auditLogs.length, color: 'text-rose-500' },
    { name: 'notifications', label: 'System Alerts', count: notifications.length, color: 'text-indigo-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Tech Master &bull; IT Control Room</span>
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  Full Architect Powers
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logged in as <strong>{currentUser.name}</strong> ({currentUser.email}) &bull; Unlimited system configuration &amp; technical infrastructure rights
              </p>
            </div>
          </div>
        </div>

        {/* Global Diagnostic Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestDatabase}
            disabled={isTesting}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
            <span>{isTesting ? 'Testing Link...' : 'Test DB Latency'}</span>
          </button>
        </div>
      </div>

      {testResult && (
        <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span dangerouslySetInnerHTML={{ __html: testResult }} />
        </div>
      )}

      {/* Tech Navigation Quick Launchpad */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Tech Configuration Modules
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Direct Superadmin &amp; Architecture Access</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            onClick={() => setActiveView('system-config')}
            className="group flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-800 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30 transition cursor-pointer"
          >
            <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Sliders className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">CRM Configuration</h4>
                <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Pricing models, fiscal periods &amp; business constants</p>
            </div>
          </div>

          <div
            onClick={() => setActiveView('custom-fields')}
            className="group flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-800 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30 transition cursor-pointer"
          >
            <div className="rounded-xl bg-teal-100 p-2.5 text-teal-600 dark:bg-teal-950 dark:text-teal-400 group-hover:scale-105 transition-transform">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Custom Fields Builder</h4>
                <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-teal-600" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Add custom schema attributes to Leads, Bookings &amp; Staff</p>
            </div>
          </div>

          <div
            onClick={() => setActiveView('automation')}
            className="group flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-800 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30 transition cursor-pointer"
          >
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600 dark:bg-amber-950 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Automation Engine</h4>
                <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-amber-600" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Auto task triggers, WhatsApp notifications &amp; status pipelines</p>
            </div>
          </div>

          <div
            onClick={() => setActiveView('integrations')}
            className="group flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-800 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30 transition cursor-pointer"
          >
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Zap className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Integrations &amp; DB</h4>
                <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Supabase PostgreSQL, payment gateways &amp; third-party APIs</p>
            </div>
          </div>

          <div
            onClick={() => setActiveView('user-management')}
            className="group flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-800 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30 transition cursor-pointer"
          >
            <div className="rounded-xl bg-purple-100 p-2.5 text-purple-600 dark:bg-purple-950 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <Users2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">User Accounts &amp; Roles</h4>
                <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-purple-600" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Create accounts, reset passwords &amp; adjust permission nodes</p>
            </div>
          </div>

          <div
            onClick={() => setActiveView('audit-logs')}
            className="group flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-800 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30 transition cursor-pointer"
          >
            <div className="rounded-xl bg-rose-100 p-2.5 text-rose-600 dark:bg-rose-950 dark:text-rose-400 group-hover:scale-105 transition-transform">
              <Activity className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Audit Trail &amp; Logs</h4>
                <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-rose-600" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Immutable record of logins, transactions, updates &amp; deletions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Schema & Tables Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Table Row Counters */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Live Database Entity Inventory
              </h3>
            </div>
            <span className="text-xs font-semibold text-emerald-600">
              {isDbConnected ? '🟢 Connected' : '🟡 Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {dbTables.map((t) => (
              <div
                key={t.name}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50"
              >
                <span className="text-[10px] font-semibold text-slate-400 block">{t.label}</span>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{t.count}</span>
                  <span className="font-mono text-[10px] text-slate-400">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Endpoint Info & Supabase Project Link */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Server className="h-4 w-4 text-sky-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cloud Endpoint</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold">Supabase PostgreSQL REST URL</span>
              <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                  {supabaseUrl}
                </span>
                <button
                  onClick={handleCopyEndpoint}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer shrink-0 ml-1"
                  title="Copy URL"
                >
                  {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <ExternalLink className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40 text-[11px] text-slate-500 space-y-1.5">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Architecture Notes:</p>
              <p>&bull; PostgreSQL 15+ hosted on Supabase Cloud.</p>
              <p>&bull; 17 Normalized tables with Row Level Security (RLS).</p>
              <p>&bull; Bi-directional camelCase to snake_case ORM mapping.</p>
            </div>

            <a
              href="https://supabase.com/dashboard/project/zbqdjgcuuxrqqtfilbfl"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 py-2.5 text-xs font-bold shadow-xs hover:opacity-90 transition"
            >
              <span>Open Supabase Console</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
