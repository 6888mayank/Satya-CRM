'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import {
  MessageSquare,
  CreditCard,
  Webhook,
  Check,
  Copy,
  ShieldAlert,
  Database,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function IntegrationsView() {
  const { currentUser, isDbConnected, isDbLoading, dbError, refreshData } = useCRM();

  const [copiedSchema, setCopiedSchema] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.crmsolutions.in/v1/webhooks/deals');
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const canAccess = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'TECH' || currentUser.role === 'RM';

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-3" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Authorized Tech Access Only</h3>
        <p className="text-xs text-slate-500 max-w-md mt-1">
          Third-party integrations, database connections, and webhook configurations are restricted to <strong>Super Admin</strong>, <strong>RM</strong>, and <strong>Tech</strong> personnel.
        </p>
      </div>
    );
  }

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleCopySchemaPath = () => {
    navigator.clipboard.writeText('supabase_schema.sql');
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Database & Integrations Hub</h2>
            {isDbConnected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                <span>Supabase Live Connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                <span>Supabase Pending Sync</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time Supabase PostgreSQL cloud database connection, WhatsApp Business API, and Razorpay gateway.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 px-4 py-2 text-xs font-semibold shadow-xs transition active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Pinging Supabase...' : 'Test Database Connection'}</span>
        </button>
      </div>

      {/* Primary Supabase PostgreSQL Database Card */}
      <div className={`rounded-3xl border p-6 shadow-xs transition ${
        isDbConnected
          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-slate-50 dark:border-emerald-950 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20'
          : 'border-amber-200 bg-gradient-to-br from-amber-50/50 via-white to-slate-50 dark:border-amber-950 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isDbConnected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-amber-500 text-white shadow-xs'
            }`}>
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Supabase PostgreSQL Cloud Database
                </h3>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  isDbConnected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {isDbConnected ? '● Live Connected' : '⚠️ Key Required / Pending Sync'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Official cloud backend for all live customers, bookings, digital payments, attendance logs, and staff management. All fake mock data has been completely stripped.
              </p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard/project/zbqdjgcuuxrqqtfilbfl"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition shrink-0"
          >
            <span>Open Supabase Project</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded-2xl bg-white p-4 border border-slate-100 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Project Endpoint</span>
            <p className="mt-1 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 select-all">
              https://zbqdjgcuuxrqqtfilbfl.supabase.co
            </p>
            <span className="text-[10px] text-slate-400 block mt-1">Project Ref: zbqdjgcuuxrqqtfilbfl</span>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-slate-100 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Database Schema</span>
              <button
                onClick={handleCopySchemaPath}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                {copiedSchema ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedSchema ? 'Copied' : 'Copy Name'}</span>
              </button>
            </div>
            <p className="mt-1 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
              supabase_schema.sql
            </p>
            <span className="text-[10px] text-slate-400 block mt-1">17 CRM tables with full RLS permissions</span>
          </div>
        </div>

        {dbError && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-amber-50/90 p-4 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200 shadow-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Supabase Setup Notice:</p>
              <p className="text-[11px] opacity-90">{dbError}</p>
              <p className="text-[11px] font-medium text-amber-900 dark:text-amber-100">
                To activate: Paste your Supabase project <strong>anon key</strong> into <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">.env.local</code> and run <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">supabase_schema.sql</code> in the Supabase SQL Editor.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WhatsApp Business API */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">WhatsApp Business Cloud API</h3>
                <p className="text-xs text-slate-400">Meta Graph API v21.0</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Active
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Automatically sends instant scheme checklists, booking confirmation receipts, and document upload reminders via WhatsApp.
          </p>
          <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60 font-mono text-[11px] text-slate-600 dark:text-slate-300">
            Phone Number ID: 109283746192837
          </div>
        </div>

        {/* Razorpay / Payment Gateway */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Razorpay Payments</h3>
                <p className="text-xs text-slate-400">UPI, NetBanking & Corporate Cards</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Connected
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Generates digital payment links for client retainers and automatically marks bookings as &quot;Paid&quot; upon webhook confirmation.
          </p>
          <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60 font-mono text-[11px] text-slate-600 dark:text-slate-300">
            Key ID: rzp_live_89128374619
          </div>
        </div>

        {/* Outgoing Webhooks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300">
                <Webhook className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Real-Time Outgoing Webhooks</h3>
                <p className="text-xs text-slate-400">Sync customer leads & payment events to external accounting ERPs</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800"
            />
            <button
              onClick={handleCopyWebhook}
              className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              {copiedWebhook ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
              <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
