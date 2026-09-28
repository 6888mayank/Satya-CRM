'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import {
  Laptop,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  Search,
  KeyRound,
  Terminal,
  Cpu,
  RefreshCw
} from 'lucide-react';

export default function DevicePinningView() {
  const {
    pinnedDevices,
    currentDevice,
    isCurrentDevicePinned,
    isDevicePinningEnforced,
    pinCurrentDevice,
    pinDeviceByFingerprint,
    unpinDevice,
    toggleDeviceEnforcement,
    currentUser
  } = useCRM();

  const [copiedToken, setCopiedToken] = useState(false);
  const [currentMachineName, setCurrentMachineName] = useState(currentDevice.deviceName || 'My Workstation');
  const [remoteToken, setRemoteToken] = useState('');
  const [remoteName, setRemoteName] = useState('');
  const [remoteUser, setRemoteUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PINNED' | 'REVOKED'>('ALL');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const canConfigure = currentUser.role === 'TECH' || currentUser.role === 'SUPER_ADMIN';

  const handleCopyCurrent = () => {
    navigator.clipboard.writeText(currentDevice.fingerprint);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handlePinCurrent = async () => {
    try {
      await pinCurrentDevice(currentMachineName);
      setFeedback({ message: `Successfully pinned workstation "${currentMachineName}".`, type: 'success' });
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      setFeedback({ message: 'Failed to pin workstation.', type: 'error' });
    }
  };

  const handlePinRemote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remoteToken.trim() || !remoteName.trim()) {
      setFeedback({ message: 'Machine Token and Label are required.', type: 'error' });
      return;
    }

    try {
      const ok = await pinDeviceByFingerprint(remoteToken, remoteName, remoteUser);
      if (ok) {
        setFeedback({ message: `Remote system "${remoteName}" authorized and pinned.`, type: 'success' });
        setRemoteToken('');
        setRemoteName('');
        setRemoteUser('');
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch {
      setFeedback({ message: 'Failed to authorize remote system.', type: 'error' });
    }
  };

  const filteredDevices = pinnedDevices.filter((d) => {
    const matchesSearch =
      d.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.deviceFingerprint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.assignedToUser && d.assignedToUser.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Laptop className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Hardware Binding &amp; Device Pinning
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tech Administrator authority &bull; Configure and pin systems to restrict CRM access exclusively to authorized hardware
              </p>
            </div>
          </div>
        </div>

        {/* Global Enforcement Toggle */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 px-3.5 rounded-2xl shadow-xs">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-900 dark:text-white">Strict Hardware Binding</p>
            <p className="text-[10px] text-slate-400">
              {isDevicePinningEnforced ? 'Only pinned systems can open CRM' : 'Open mode (whitelisting relaxed)'}
            </p>
          </div>
          <button
            onClick={toggleDeviceEnforcement}
            disabled={!canConfigure}
            className="text-slate-400 hover:text-indigo-600 transition cursor-pointer"
            title="Toggle Strict Hardware Enforcement"
          >
            {isDevicePinningEnforced ? (
              <ToggleRight className="h-8 w-8 text-emerald-500" />
            ) : (
              <ToggleLeft className="h-8 w-8 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Grid: Current Machine Card + Whitelist Remote System Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Current Workstation Card */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Current Machine Status</h3>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                isCurrentDevicePinned
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {isCurrentDevicePinned ? 'PINNED & AUTHORIZED' : 'NOT PINNED'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Device Token / Fingerprint</span>
              <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800/80">
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm select-all">
                  {currentDevice.fingerprint}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCurrent}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                  title="Copy Token"
                >
                  {copiedToken ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400">Platform</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{currentDevice.osPlatform}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400">Browser</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{currentDevice.browserInfo}</p>
              </div>
            </div>

            {/* Pin Action */}
            <div className="pt-2">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Label for This Workstation
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={currentMachineName}
                  onChange={(e) => setCurrentMachineName(e.target.value)}
                  placeholder="e.g. HQ - Tech Specialist Mac"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={handlePinCurrent}
                  disabled={!canConfigure}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {isCurrentDevicePinned ? 'Re-Pin Machine' : 'Pin This System'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Remote Machine Whitelisting Form */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Whitelist Remote Employee Workstation</h3>
          </div>

          <form onSubmit={handlePinRemote} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Employee Machine Token *
              </label>
              <input
                type="text"
                required
                value={remoteToken}
                onChange={(e) => setRemoteToken(e.target.value)}
                placeholder="Paste DEV-SATYA-XXXXX token received from employee"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Workstation Label *</label>
                <input
                  type="text"
                  required
                  value={remoteName}
                  onChange={(e) => setRemoteName(e.target.value)}
                  placeholder="e.g. Noida Branch - Desk 04"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Assigned Staff Name</label>
                <input
                  type="text"
                  value={remoteUser}
                  onChange={(e) => setRemoteUser(e.target.value)}
                  placeholder="e.g. Rahul Sharma (BDE)"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={!canConfigure}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Authorize &amp; Pin System</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Pinned Systems Directory Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Pinned &amp; Whitelisted Systems Directory
            </h3>
            <p className="text-xs text-slate-500">
              {pinnedDevices.length} authorized machines configured in database
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search machines or staff..."
                className="rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="ALL">All Status</option>
              <option value="PINNED">Pinned</option>
              <option value="REVOKED">Revoked</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <th className="py-2.5 px-3">System Name &bull; Machine ID</th>
                <th className="py-2.5 px-3">Assigned User</th>
                <th className="py-2.5 px-3">OS &bull; Browser</th>
                <th className="py-2.5 px-3">Pinned By</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No pinned systems match your filter. Authorize your first machine above.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                          <Laptop className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{d.deviceName}</span>
                            {d.deviceFingerprint === currentDevice.fingerprint && (
                              <span className="rounded-sm bg-indigo-100 px-1.5 py-0.2 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                This PC
                              </span>
                            )}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400">{d.deviceFingerprint}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                      {d.assignedToUser || 'General Terminal'}
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      <span>{d.osPlatform}</span> &bull; <span className="text-[11px]">{d.browserInfo}</span>
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      <p className="font-medium text-slate-700 dark:text-slate-300">{d.pinnedBy}</p>
                      <p className="text-[10px] text-slate-400">{new Date(d.pinnedAt).toLocaleDateString('en-IN')}</p>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          d.status === 'PINNED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${d.status === 'PINNED' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        {d.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      {d.status === 'PINNED' ? (
                        <button
                          type="button"
                          onClick={() => unpinDevice(d.id)}
                          disabled={!canConfigure}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Revoke / Unpin</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => pinDeviceByFingerprint(d.deviceFingerprint, d.deviceName, d.assignedToUser)}
                          disabled={!canConfigure}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Re-Authorize</span>
                        </button>
                      )}
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
