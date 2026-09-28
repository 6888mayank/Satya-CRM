'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { formatCurrency } from '@/lib/utils';
import { SalesTeam } from '@/types/crm';
import {
  Users,
  Plus,
  Crown,
  UserCheck,
  Building,
  Target,
  ChevronRight,
  ShieldCheck,
  X,
  Edit2
} from 'lucide-react';

export default function TeamsView() {
  const {
    teams,
    employees,
    currentUser,
    createTeam,
    updateTeamMembers
  } = useCRM();

  const [isNewTeamOpen, setIsNewTeamOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [division, setDivision] = useState('Government Schemes & Subsidies');
  const [selectedTLId, setSelectedTLId] = useState('');
  const [selectedBDMs, setSelectedBDMs] = useState<string[]>([]);
  const [selectedBDEs, setSelectedBDEs] = useState<string[]>([]);
  const [targetRevenue, setTargetRevenue] = useState<number>(1000000);

  // Edit / Reassignment state
  const [editingTeam, setEditingTeam] = useState<SalesTeam | null>(null);

  const canManage =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'RM' ||
    currentUser.role === 'BRANCH_MANAGER' ||
    currentUser.role === 'TL';

  // Available staff lists by role
  const branchManagers = employees.filter((e) => e.role === 'BRANCH_MANAGER' || e.role === 'RM');
  const teamLeaders = employees.filter((e) => e.role === 'TL');
  const bdms = employees.filter((e) => e.role === 'BDM');
  const bdes = employees.filter((e) => e.role === 'BDE');

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tl = teamLeaders.find((t) => t.id === selectedTLId) || teamLeaders[0];
    const bm = branchManagers[0];

    const bdmObjList = bdms.filter((b) => selectedBDMs.includes(b.id));
    const bdeObjList = bdes.filter((b) => selectedBDEs.includes(b.id));

    createTeam({
      name: teamName,
      division,
      branchName: 'Pune & West Hub',
      branchManagerId: bm?.id || currentUser.id,
      branchManagerName: bm?.name || currentUser.name,
      teamLeadId: tl?.id || '',
      teamLeadName: tl?.name || 'Assigned TL',
      bdmIds: selectedBDMs,
      bdmNames: bdmObjList.map((b) => b.name),
      bdeIds: selectedBDEs,
      bdeNames: bdeObjList.map((b) => b.name),
      targetRevenue: Number(targetRevenue) || 1000000,
      achievedRevenue: 0,
      activeLeadsCount: 0
    });

    setIsNewTeamOpen(false);
    setTeamName('');
    setSelectedBDMs([]);
    setSelectedBDEs([]);
  };

  const toggleBDMSelection = (id: string) => {
    if (selectedBDMs.includes(id)) {
      setSelectedBDMs(selectedBDMs.filter((item) => item !== id));
    } else {
      setSelectedBDMs([...selectedBDMs, id]);
    }
  };

  const toggleBDESelection = (id: string) => {
    if (selectedBDEs.includes(id)) {
      setSelectedBDEs(selectedBDEs.filter((item) => item !== id));
    } else {
      setSelectedBDEs([...selectedBDEs, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sales Teams & Branch Hierarchy</h2>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Branch Manager → TL → BDM → BDE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure sales divisions, map BDEs under BDMs, BDMs under TLs, and track team target achievements
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              if (teamLeaders[0]) setSelectedTLId(teamLeaders[0].id);
              setIsNewTeamOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Sales Team</span>
          </button>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {teams.map((team) => {
          const percent = Math.min(100, Math.round((team.achievedRevenue / team.targetRevenue) * 100));

          return (
            <div
              key={team.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 transition"
            >
              <div>
                {/* Team Top Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {team.division}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">
                      {team.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">{team.branchName}</p>
                  </div>

                  {canManage && (
                    <button
                      onClick={() => setEditingTeam(team)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                      title="Edit team hierarchy"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Target Progress Bar */}
                <div className="mt-4 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-500 font-medium">Monthly Target:</span>
                    <strong className="text-slate-900 dark:text-white">{formatCurrency(team.targetRevenue)}</strong>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 font-medium">Achieved:</span>
                    <strong className="text-emerald-600">{formatCurrency(team.achievedRevenue)} ({percent}%)</strong>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Team Hierarchy Tree */}
                <div className="mt-4 space-y-3 text-xs">
                  {/* Branch Manager */}
                  <div className="flex items-center gap-2 rounded-xl bg-purple-50/60 p-2 border border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/30">
                    <Building className="h-4 w-4 text-purple-600 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold uppercase text-purple-600 block">Branch Manager (BM)</span>
                      <p className="font-bold text-slate-900 dark:text-white">{team.branchManagerName}</p>
                    </div>
                  </div>

                  {/* Team Leader (TL) */}
                  <div className="flex items-center gap-2 rounded-xl bg-indigo-50/60 p-2 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30 ml-2">
                    <Crown className="h-4 w-4 text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold uppercase text-indigo-600 block">Team Leader (TL)</span>
                      <p className="font-bold text-slate-900 dark:text-white">{team.teamLeadName}</p>
                    </div>
                  </div>

                  {/* BDMs */}
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 ml-4 space-y-1">
                    <span className="text-[9px] font-bold uppercase text-blue-600 block">
                      Business Development Managers (BDM) ({team.bdmNames.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {team.bdmNames.map((name) => (
                        <span
                          key={name}
                          className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* BDEs */}
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 ml-6 space-y-1">
                    <span className="text-[9px] font-bold uppercase text-teal-600 block">
                      Business Development Executives (BDE) ({team.bdeNames.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {team.bdeNames.map((name) => (
                        <span
                          key={name}
                          className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Active Leads: <strong className="text-slate-800 dark:text-slate-200">{team.activeLeadsCount}</strong></span>
                <span className="text-indigo-600 font-semibold cursor-pointer hover:underline" onClick={() => setEditingTeam(team)}>
                  Reassign Staff →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Team Modal */}
      {isNewTeamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Form New Sales Team & Hierarchy</h3>
              <button onClick={() => setIsNewTeamOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Zone Loan Specialists"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Service Division</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Government Schemes & Subsidies">Government Schemes & Subsidies</option>
                  <option value="Government Grants & Funding">Government Grants & Funding</option>
                  <option value="Business Loans & MSME Credit">Business Loans & MSME Credit</option>
                  <option value="IT Services & SaaS Solutions">IT Services & SaaS Solutions</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Team Leader (TL) *</label>
                <select
                  value={selectedTLId}
                  onChange={(e) => setSelectedTLId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  {teamLeaders.map((tl) => (
                    <option key={tl.id} value={tl.id}>
                      {tl.name} ({tl.designation})
                    </option>
                  ))}
                </select>
              </div>

              {/* BDMs Multiselect */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Select BDMs (Reporting to TL)
                </label>
                <div className="mt-1 grid grid-cols-2 gap-1.5">
                  {bdms.map((bdm) => {
                    const isChecked = selectedBDMs.includes(bdm.id);
                    return (
                      <label
                        key={bdm.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'border-blue-400 bg-blue-50/60 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200'
                            : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBDMSelection(bdm.id)}
                          className="rounded-sm"
                        />
                        <span className="truncate">{bdm.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* BDEs Multiselect */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Select BDEs (Reporting to BDM / TL)
                </label>
                <div className="mt-1 grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                  {bdes.map((bde) => {
                    const isChecked = selectedBDEs.includes(bde.id);
                    return (
                      <label
                        key={bde.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'border-teal-400 bg-teal-50/60 text-teal-900 dark:bg-teal-950/40 dark:text-teal-200'
                            : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBDESelection(bde.id)}
                          className="rounded-sm"
                        />
                        <span className="truncate">{bde.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Monthly Revenue Target (₹) *</label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={targetRevenue}
                  onChange={(e) => setTargetRevenue(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTeamOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Hierarchy Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Reassign Hierarchy: {editingTeam.name}
                </h3>
                <p className="text-xs text-slate-400">Map who reports to which BDM / TL</p>
              </div>
              <button onClick={() => setEditingTeam(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Team Leader</label>
                <input
                  type="text"
                  value={editingTeam.teamLeadName}
                  onChange={(e) => setEditingTeam({ ...editingTeam, teamLeadName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Monthly Target (₹)</label>
                <input
                  type="number"
                  value={editingTeam.targetRevenue}
                  onChange={(e) => setEditingTeam({ ...editingTeam, targetRevenue: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-bold dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateTeamMembers(editingTeam.id, editingTeam);
                    setEditingTeam(null);
                  }}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700"
                >
                  Update Structure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
