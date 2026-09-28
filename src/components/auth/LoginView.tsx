'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Landmark,
  Coins,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  KeyRound,
  Sparkles,
  Laptop
} from 'lucide-react';

export default function LoginView() {
  const { login, isDbConnected } = useCRM();

  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailOrId.trim()) {
      setErrorMessage('Please enter your Work Email or User ID');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your Password');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(emailOrId, password, rememberMe);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMessage('An unexpected error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (email: string) => {
    setEmailOrId(email);
    setPassword('akash@802');
    setErrorMessage(null);
  };

  const officialAccounts = [
    { role: 'Super Admin', email: 'cso@satyasupport.co.in', name: 'Satya Sharma', color: 'border-rose-500/40 text-rose-300 bg-rose-950/40' },
    { role: 'Regional Mgr (RM)', email: 'rm@satyasupport.co.in', name: 'Rajesh Nair', color: 'border-purple-500/40 text-purple-300 bg-purple-950/40' },
    { role: 'Branch Manager', email: 'bm@satyasupport.co.in', name: 'Pooja Deshmukh', color: 'border-indigo-500/40 text-indigo-300 bg-indigo-950/40' },
    { role: 'Team Lead (TL)', email: 'tl@satyasupport.co.in', name: 'Vikram Rathore', color: 'border-amber-500/40 text-amber-300 bg-amber-950/40' },
    { role: 'BDM (Manager)', email: 'bdm@satyasupport.co.in', name: 'Neha Mehta', color: 'border-blue-500/40 text-blue-300 bg-blue-950/40' },
    { role: 'BDE (Executive)', email: 'bde@satyasupport.co.in', name: 'Rohan Patil', color: 'border-teal-500/40 text-teal-300 bg-teal-950/40' },
    { role: 'HR Manager', email: 'hr@satyasupport.co.in', name: 'Priya Iyer', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40' },
    { role: 'Tech Admin', email: 'tech@satyasupport.co.in', name: 'Aman Verma', color: 'border-sky-500/40 text-sky-300 bg-sky-950/40' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col justify-center bg-slate-950 text-slate-100 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Gradients & Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand & Value Pillars */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/60 px-3.5 py-1 text-xs font-medium text-indigo-300 backdrop-blur-md shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              <span>Enterprise CRM & Revenue Operating System</span>
              <span className="h-1 w-1 rounded-full bg-indigo-400" />
              <span className="text-[11px] font-semibold text-emerald-400">
                {isDbConnected ? 'Supabase Live' : 'Database Ready'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/20">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    SATYA <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">ENTERPRISE</span>
                  </h1>
                  <p className="text-xs text-slate-400 font-medium">Government Schemes • Business Loans • IT Services</p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Sign in to your centralized enterprise workspace. Manage government grants, corporate subsidies, term loans, IT deliverables, sales pods, attendance, and branch operations.
              </p>
            </div>

            {/* Core Capability Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 backdrop-blur-sm">
                <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                  <Landmark className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-semibold text-slate-200">Govt Schemes & Grants</h4>
                  <p className="text-[11px] text-slate-400">PMEGP, MSME, CGTMSE, Startup India</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 backdrop-blur-sm">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                  <Coins className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-semibold text-slate-200">Business Loans</h4>
                  <p className="text-[11px] text-slate-400">Term loans, credit lines & funding</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 backdrop-blur-sm">
                <div className="rounded-lg bg-sky-500/10 p-2 text-sky-400">
                  <Cpu className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-semibold text-slate-200">IT & AI Services</h4>
                  <p className="text-[11px] text-slate-400">Web, Apps, Software & Automation</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 backdrop-blur-sm">
                <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-semibold text-slate-200">Role-Based Access</h4>
                  <p className="text-[11px] text-slate-400">RM, BM, TL, BDM, BDE, HR & Tech</p>
                </div>
              </div>
            </div>

            {/* Official Staff Accounts Directory */}
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/40 p-4 backdrop-blur-sm flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-200">
                  <KeyRound className="h-4 w-4 text-indigo-400" />
                  <span>Official Staff Accounts</span>
                </div>
                <span className="text-[10px] text-amber-300 bg-amber-950/80 border border-amber-600/40 px-2 py-0.5 rounded-full font-semibold">
                  Role Simulation Disabled
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">
                Each user must sign in using their unique Work Email or User ID and Password. Click any account below to autofill its credentials:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {officialAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickFill(acc.email)}
                    className="flex flex-col text-left p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/90 hover:border-indigo-500/50 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition">
                        {acc.role}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-mono">akash@802</span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">{acc.name}</span>
                    <span className="text-[10px] font-mono text-indigo-400 truncate">{acc.email}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 italic">
                * Default password for all official seeded staff accounts is <span className="font-mono text-indigo-300 font-semibold">akash@802</span>. Custom passwords apply for accounts created via User Management.
              </p>
            </div>
          </div>

          {/* Right Column: High-End Login Card */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
              <div className="mb-6 space-y-1 text-left">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Sign In to Account</h2>
                <p className="text-xs text-slate-400">Enter your official credentials to access the CRM portal.</p>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-200 animate-in fade-in slide-in-from-top-2 duration-200">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="flex-1">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Work Email / User ID */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span>Work Email or User ID</span>
                    <span className="text-[10px] text-slate-500">e.g. cso@satyasupport.co.in</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={emailOrId}
                      onChange={(e) => setEmailOrId(e.target.value)}
                      placeholder="cso@satyasupport.co.in"
                      autoComplete="username"
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 transition focus:border-indigo-500 focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    <span className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer" title="Contact Super Admin for password reset">
                      Forgot Password?
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 transition focus:border-indigo-500 focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                    />
                    <span className="text-xs text-slate-400">Remember this device</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Session V1</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 py-2.5 px-4 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition duration-200 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to CRM</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security & System Footnotes */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>256-Bit TLS Security</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Role-Based Auth Guard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Enterprise Bar */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-slate-600 border-t border-slate-900/60">
        <p>&copy; {new Date().getFullYear()} SATYA Enterprise CRM. All rights reserved. Built for Government Schemes, Grants, Loans & IT Operations.</p>
      </footer>
    </div>
  );
}
