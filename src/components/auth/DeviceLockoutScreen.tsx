'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import {
  ShieldAlert,
  Copy,
  Check,
  Laptop,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  RefreshCw,
  LogOut,
  Building2,
  KeyRound
} from 'lucide-react';

export default function DeviceLockoutScreen() {
  const {
    currentDevice,
    pinCurrentDevice,
    currentUser,
    logout,
    login
  } = useCRM();

  const [copied, setCopied] = useState(false);
  const [isTechAuthOpen, setIsTechAuthOpen] = useState(false);
  const [techEmail, setTechEmail] = useState('tech@satyasupport.co.in');
  const [techPassword, setTechPassword] = useState('');
  const [machineLabel, setMachineLabel] = useState(currentDevice.deviceName || 'Office Workstation');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDevice.fingerprint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTechPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthorizing(true);

    try {
      // 1. Verify tech credentials
      const res = await login(techEmail, techPassword, true);
      if (!res.success) {
        setAuthError(res.error || 'Invalid Tech credentials. Only authorized IT staff can pin this machine.');
        setIsAuthorizing(false);
        return;
      }

      // 2. Pin current machine
      await pinCurrentDevice(machineLabel);
      setIsTechAuthOpen(false);
    } catch (err: any) {
      setAuthError('An error occurred during machine authorization.');
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* Background Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(225,29,72,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-rose-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl mx-auto my-auto text-center space-y-6">
        {/* Warning Icon Badge */}
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-500 ring-8 ring-rose-500/5 shadow-2xl shadow-rose-950">
          <ShieldAlert className="h-12 w-12 animate-pulse" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-950/60 px-3.5 py-1 text-xs font-semibold text-rose-300">
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>Strict Hardware Security Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            System Not Pinned — Access Blocked
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            This computer has not been authorized or pinned by the <strong>Tech Department</strong>. Under SATYA enterprise compliance, the CRM can only run on whitelisted hardware.
          </p>
        </div>

        {/* Machine Fingerprint Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 text-left shadow-2xl backdrop-blur-xl ring-1 ring-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Workstation Token</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-sm sm:text-base font-bold text-amber-400 select-all">
                  {currentDevice.fingerprint}
                </span>
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition active:scale-95 cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copy Machine ID</span>
                </>
              )}
            </button>
          </div>

          {/* Hardware Specs Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5">
              <span className="text-[10px] text-slate-500 font-medium">Operating System</span>
              <p className="text-xs font-semibold text-slate-300 truncate">{currentDevice.osPlatform}</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5">
              <span className="text-[10px] text-slate-500 font-medium">Browser Client</span>
              <p className="text-xs font-semibold text-slate-300 truncate">{currentDevice.browserInfo}</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 font-medium">Display Resolution</span>
              <p className="text-xs font-semibold text-slate-300 truncate">{currentDevice.screenResolution}</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setIsTechAuthOpen(true)}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 py-2.5 px-4 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition duration-150 active:scale-[0.98] cursor-pointer"
            >
              <KeyRound className="h-4 w-4" />
              <span>Tech Account Sign In &amp; Pin System</span>
            </button>

            <button
              onClick={logout}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Switch User</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-xs text-slate-500">
          Need access immediately? Copy your <strong>Machine Token</strong> and send it to your company Tech Lead (<span className="text-slate-400">tech@satyasupport.co.in</span>) or branch administrator.
        </p>
      </div>

      {/* TECH PINNING MODAL */}
      {isTechAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7 shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Laptop className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Authorize &amp; Pin System</h3>
                <p className="text-[11px] text-slate-400">Tech Lead &bull; Hardware Whitelisting</p>
              </div>
            </div>

            {authError && (
              <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-200">
                {authError}
              </div>
            )}

            <form onSubmit={handleTechPin} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-300">Tech Email / ID</label>
                <input
                  type="text"
                  required
                  value={techEmail}
                  onChange={(e) => setTechEmail(e.target.value)}
                  placeholder="tech@satyasupport.co.in"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/80 p-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">Tech Password</label>
                <input
                  type="password"
                  required
                  value={techPassword}
                  onChange={(e) => setTechPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/80 p-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">System Friendly Label</label>
                <input
                  type="text"
                  required
                  value={machineLabel}
                  onChange={(e) => setMachineLabel(e.target.value)}
                  placeholder="e.g. Noida Branch - Desk 02 PC"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/80 p-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-2.5 text-[11px] text-slate-400">
                <span>Machine Token: </span>
                <span className="font-mono text-indigo-300">{currentDevice.fingerprint}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTechAuthOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAuthorizing}
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isAuthorizing ? 'Authorizing Machine...' : 'Confirm & Pin Machine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
