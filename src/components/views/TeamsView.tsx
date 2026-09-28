'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/crm-context';
import { formatCurrency } from '@/lib/utils';
import { SalesTeam, TeamMember } from '@/types/crm';
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
  Edit2,
  Trash2,
  Sliders,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export default function TeamsView() {
  const {
    teams,
    employees,
    currentUser,
    createTeam,
    deleteTeam,
    updateTeamName,
    updateTeamTarget,
    updateMemberTargets,
    updateTeamMembers
  } = useCRM();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('ALL');

  // Super Admin Modals
  const [isNewTeamOpen, setIsNewTeamOpen] = useState(false);
  const [editingTeamSA, setEditingTeamSA] = useState<SalesTeam | null>(null);
  const [deleteConfirmTeamId, setDeleteConfirmTeamId] = useState<string | null>(null);

  // TL Member Target Assignment Modal
  const [targetTeamTL, setTargetTeamTL] = useState<SalesTeam | null>(null);
  const [tempMembers, setTempMembers] = useState<TeamMember[]>([]);

  // Super Admin Create Form State
  const [newTeamName, setNewTeamName] = useState('');
  const [newDivision, setNewDivision] = useState('Government Schemes & Subsidies');
  const [newBranch, setNewBranch] = useState('Mumbai Central Branch');
  const [newTLId, setNewTLId] = useState('');
  const [newTarget, setNewTarget] = useState<number>(1500000);

  // Super Admin Edit Form State
  const [editName, setEditName] = useState('');
  const [editDivision, setEditDivision] = useState('');
  const [editTarget, setEditTarget] = useState<number>(1500000);

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  // Available staff lists by role
  const teamLeaders = employees.filter((e) => e.role === 'TL');
  const bdms = employees.filter((e) => e.role === 'BDM');
  const bdes = employees.filter((e) => e.role === 'BDE');
  const availableReps = employees.filter((e) => e.role === 'BDM' || e.role === 'BDE');

  // Open Super Admin Edit
  const openSuperAdminEdit = (team: SalesTeam) => {
    setEditingTeamSA(team);
    setEditName(team.name);
    setEditDivision(team.division);
    setEditTarget(team.targetRevenue);
  };

  const handleSuperAdminEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeamSA) return;

    if (editName.trim() !== editingTeamSA.name || editDivision !== editingTeamSA.division) {
      updateTeamName(editingTeamSA.id, editName.trim(), editDivision);
    }
    if (editTarget !== editingTeamSA.targetRevenue) {
      updateTeamTarget(editingTeamSA.id, Number(editTarget));
    }

    setEditingTeamSA(null);
  };

  // Open TL Member Targets Modal
  const openMemberTargetsModal = (team: SalesTeam) => {
    setTargetTeamTL(team);
    // Deep clone members or initialize up to 5 members
    setTempMembers(
      (team.members || []).map((m) => ({
        ...m,
        targetRevenue: m.targetRevenue || 300000,
        achievedRevenue: m.achievedRevenue || 0
      }))
    );
  };

  const handleMemberTargetChange = (memberId: string, newTarget: number) => {
    setTempMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, targetRevenue: Math.max(0, newTarget) } : m))
    );
  };

  const handleRemoveMember = (memberId: string) => {
    setTempMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleAddMemberToTeam = (empId: string) => {
    if (tempMembers.length >= 5) {
      alert('Team Limit: Maximum 5 members allowed under the Team Leader.');
      return;
    }
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    if (tempMembers.some((m) => m.id === empId || m.name === emp.name)) {
      alert('Member already added to this team.');
      return;
    }

    const defaultMemberTarget = Math.round(
      (targetTeamTL?.targetRevenue || 1500000) / (tempMembers.length + 1)
    );

    setTempMembers([
      ...tempMembers,
      {
        id: emp.id,
        name: emp.name,
        role: emp.role === 'BDM' ? 'BDM' : 'BDE',
        targetRevenue: defaultMemberTarget,
        achievedRevenue: 0,
        email: emp.email,
        phone: emp.phone
      }
    ]);
  };

  const handleSaveMemberTargets = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTeamTL) return;

    if (tempMembers.length > 5) {
      alert('Limit Exceeded: A team can have a maximum of 5 members under the TL.');
      return;
    }

    updateMemberTargets(targetTeamTL.id, tempMembers);
    setTargetTeamTL(null);
  };

  // Super Admin Create Team
  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;

    const tl = teamLeaders.find((t) => t.id === newTLId) || teamLeaders[0];

    createTeam({
      name: newTeamName.trim(),
      division: newDivision,
      branchName: newBranch,
      branchManagerId: 'e-bm',
      branchManagerName: 'Pooja Deshmukh',
      teamLeadId: tl?.id || `tl-${Date.now()}`,
      teamLeadName: tl?.name || 'Assigned TL',
      members: [],
      bdmIds: [],
      bdmNames: [],
      bdeIds: [],
      bdeNames: [],
      targetRevenue: Number(newTarget) || 1500000,
      achievedRevenue: 0,
      activeLeadsCount: 0
    });

    setIsNewTeamOpen(false);
    setNewTeamName('');
    setNewTarget(1500000);
  };

  // Summary Metrics
  const totalEnterpriseTarget = useMemo(() => {
    return teams.reduce((sum, t) => sum + t.targetRevenue, 0);
  }, [teams]);

  const totalAchievedRevenue = useMemo(() => {
    return teams.reduce((sum, t) => sum + t.achievedRevenue, 0);
  }, [teams]);

  const totalMembersCount = useMemo(() => {
    return teams.reduce((sum, t) => sum + (t.members?.length || 0), 0);
  }, [teams]);

  // Filtered Teams
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const matchesDivision = selectedDivision === 'ALL' || t.division.includes(selectedDivision);
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.teamLeadName.toLowerCase().includes(q) ||
        t.branchName.toLowerCase().includes(q) ||
        t.division.toLowerCase().includes(q) ||
        t.members?.some((m) => m.name.toLowerCase().includes(q));

      return matchesDivision && matchesSearch;
    });
  }, [teams, selectedDivision, search]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Sales Teams & Quota Hierarchy
            </h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
              {teams.length} Active Teams • 1 TL + 5 Members / Team
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Super Admin sets team targets &amp; names • Team Leaders (TL) assign individual quotas to their 5 members
          </p>
        </div>

        {/* Super Admin Create Button */}
        {isSuperAdmin ? (
          <button
            onClick={() => {
              if (teamLeaders[0]) setNewTLId(teamLeaders[0].id);
              setIsNewTeamOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Generate New Team</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>Team Generation Restricted to Super Admin</span>
          </div>
        )}
      </div>

      {/* Super Admin Authority Notice */}
      <div
        className={`p-3.5 rounded-2xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isSuperAdmin
            ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 dark:bg-indigo-950/30 dark:border-indigo-900/50 dark:text-indigo-200'
            : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2">
          {isSuperAdmin ? (
            <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          ) : (
            <Lock className="h-4 w-4 text-slate-400 shrink-0" />
          )}
          <span>
            {isSuperAdmin
              ? `Super Admin Active (${currentUser.name}): You have full authorization to generate new teams, rename teams, adjust overall team targets, or delete pods.`
              : `Branch Hierarchy Active (${currentUser.name}): Team names & overall targets are controlled by Super Admin. Team Leaders manage their 5 member quotas.`}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
          <span>Enterprise Target: <strong className="text-slate-900 dark:text-white">{formatCurrency(totalEnterpriseTarget)}</strong></span>
          <span>•</span>
          <span>Achieved: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(totalAchievedRevenue)}</strong></span>
        </div>
      </div>

      {/* Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Teams</span>
            <Layers className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{teams.length} Teams</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Scalable sales hierarchy</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Team Leaders (TL)</span>
            <Crown className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400">{teams.length} Leads</div>
          <p className="text-[10px] text-slate-400 mt-0.5">1 TL leading each team</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Members</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">{totalMembersCount} Members</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Max 5 members / team</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Combined Target</span>
            <Target className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-1 text-lg font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(totalEnterpriseTarget)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Super Admin configured</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams by name, TL, branch, or member..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'ALL', label: 'All Divisions' },
            { id: 'Government', label: 'Govt Grants & Schemes' },
            { id: 'Loans', label: 'Business Loans' },
            { id: 'IT Services', label: 'IT & Software' }
          ].map((div) => (
            <button
              key={div.id}
              type="button"
              onClick={() => setSelectedDivision(div.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition shrink-0 cursor-pointer ${
                selectedDivision === div.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
              }`}
            >
              {div.label}
            </button>
          ))}
        </div>
      </div>

      {/* Teams Grid (16 Teams) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredTeams.map((team) => {
          const membersList = team.members || [];
          const percent = team.targetRevenue > 0
            ? Math.min(100, Math.round((team.achievedRevenue / team.targetRevenue) * 100))
            : 0;

          const isTeamTL =
            (currentUser.role === 'TL' &&
              (currentUser.id === team.teamLeadId || currentUser.name === team.teamLeadName)) ||
            isSuperAdmin;

          const memberTargetSum = membersList.reduce((sum, m) => sum + (m.targetRevenue || 0), 0);

          return (
            <div
              key={team.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 transition"
            >
              <div>
                {/* Team Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {team.division}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                      <span>{team.name}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{team.branchName}</p>
                  </div>

                  {/* Super Admin Team Controls */}
                  {isSuperAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openSuperAdminEdit(team)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-800"
                        title="Super Admin: Edit Team Name & Monthly Target"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmTeamId(team.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        title="Super Admin: Delete Team"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Target Progress Bar (Super Admin Target) */}
                <div className="mt-3.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-500 font-medium">Team Target (Super Admin):</span>
                    <strong className="text-slate-900 dark:text-white font-mono">
                      {formatCurrency(team.targetRevenue)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-slate-500 font-medium">Achieved:</span>
                    <strong className="text-emerald-600 font-mono">
                      {formatCurrency(team.achievedRevenue)} ({percent}%)
                    </strong>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Team Hierarchy: TL + 5 Members */}
                <div className="mt-3.5 space-y-2.5 text-xs">
                  {/* Team Leader (TL) */}
                  <div className="flex items-center justify-between rounded-xl bg-amber-50/70 p-2.5 border border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-900/40">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                        <Crown className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase text-amber-700 dark:text-amber-400 block">
                          Team Leader (TL)
                        </span>
                        <p className="font-bold text-slate-900 dark:text-white text-xs">
                          {team.teamLeadName}
                        </p>
                      </div>
                    </div>

                    {/* TL Target Allocation Button */}
                    {isTeamTL && (
                      <button
                        type="button"
                        onClick={() => openMemberTargetsModal(team)}
                        className="rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-indigo-600 shadow-2xs border border-indigo-200 hover:bg-indigo-50 dark:bg-slate-800 dark:text-indigo-300 dark:border-indigo-900 transition cursor-pointer"
                      >
                        Assign Member Targets
                      </button>
                    )}
                  </div>

                  {/* 5 Members Sub-Grid */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-800/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                        Team Members ({membersList.length} / 5 max)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Quota Sum: {formatCurrency(memberTargetSum)}
                      </span>
                    </div>

                    {membersList.length === 0 ? (
                      <div className="py-3 text-center text-slate-400 text-[11px]">
                        No members assigned yet.{' '}
                        {isTeamTL && (
                          <button
                            type="button"
                            onClick={() => openMemberTargetsModal(team)}
                            className="text-indigo-600 font-semibold underline"
                          >
                            Add members now
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {membersList.map((m, idx) => {
                          const mPercent = m.targetRevenue > 0
                            ? Math.min(100, Math.round((m.achievedRevenue / m.targetRevenue) * 100))
                            : 0;

                          return (
                            <div
                              key={m.id || idx}
                              className="flex items-center justify-between rounded-lg bg-white p-2 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 text-[11px]"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                                    m.role === 'BDM'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                      : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                  }`}
                                >
                                  {m.role}
                                </span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                                  {m.name}
                                </span>
                              </div>

                              <div className="text-right">
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                  {formatCurrency(m.targetRevenue)}
                                </span>
                                <span className="text-[10px] text-emerald-600 ml-1">
                                  ({mPercent}%)
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Branch: <strong className="text-slate-700 dark:text-slate-300">{team.branchName.split(' ')[0]}</strong></span>
                {isTeamTL ? (
                  <span
                    onClick={() => openMemberTargetsModal(team)}
                    className="text-indigo-600 font-semibold cursor-pointer hover:underline"
                  >
                    TL Quota Control →
                  </span>
                ) : (
                  <span className="text-slate-400 text-[10px]">Managed by TL &amp; SA</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SUPER ADMIN: CREATE NEW TEAM MODAL */}
      {isNewTeamOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Generate New Sales Team (Super Admin)
                  </h3>
                  <p className="text-[11px] text-slate-400">Set team name, division, TL, and initial target</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTeamOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Team Name * (Super Admin Control)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Team 17 - Solaris Titans"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Service Division</label>
                <select
                  value={newDivision}
                  onChange={(e) => setNewDivision(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Government Grants & Funding">Government Grants &amp; Funding</option>
                  <option value="Government Schemes & Subsidies">Government Schemes &amp; Subsidies</option>
                  <option value="Business Loans & MSME Credit">Business Loans &amp; MSME Credit</option>
                  <option value="IT Services & SaaS Solutions">IT Services &amp; SaaS Solutions</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Branch Location</label>
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Mumbai Central Branch">Mumbai Central</option>
                    <option value="Pune West Hub">Pune West</option>
                    <option value="Delhi NCR Branch">Delhi NCR</option>
                    <option value="Bangalore Tech Branch">Bangalore Tech</option>
                    <option value="Hyderabad Hub">Hyderabad Hub</option>
                    <option value="Corporate HQ">Corporate HQ</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Assign Team Leader (TL)</label>
                  <select
                    value={newTLId}
                    onChange={(e) => setNewTLId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {teamLeaders.map((tl) => (
                      <option key={tl.id} value={tl.id}>
                        {tl.name} (TL)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Monthly Revenue Target (₹) * (Super Admin Control)
                </label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={newTarget}
                  onChange={(e) => setNewTarget(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Once created, the assigned TL can allocate this quota among up to 5 members.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTeamOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-indigo-700 transition active:scale-95 cursor-pointer"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPER ADMIN: EDIT TEAM NAME & TARGET MODAL */}
      {editingTeamSA && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-indigo-200 bg-white p-6 shadow-2xl dark:border-indigo-900/60 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <Edit2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Edit Team Name &amp; Target (Super Admin)
                  </h3>
                  <p className="text-[11px] text-slate-400">Exclusive Super Admin Authorization</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeamSA(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSuperAdminEditSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Team Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Service Division</label>
                <select
                  value={editDivision}
                  onChange={(e) => setEditDivision(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Government Grants & Funding">Government Grants &amp; Funding</option>
                  <option value="Government Schemes & Subsidies">Government Schemes &amp; Subsidies</option>
                  <option value="Business Loans & MSME Credit">Business Loans &amp; MSME Credit</option>
                  <option value="IT Services & SaaS Solutions">IT Services &amp; SaaS Solutions</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Monthly Team Target (₹) * (Increase or Decrease)
                </label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={editTarget}
                  onChange={(e) => setEditTarget(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Adjusting this target will update the overall quota tracking for {editName}.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTeamSA(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-indigo-700 transition active:scale-95 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TL: ASSIGN MEMBER TARGETS MODAL (MAX 5 MEMBERS) */}
      {targetTeamTL && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-amber-200 bg-white p-6 shadow-2xl dark:border-amber-900/60 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <Crown className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Assign Member Targets: {targetTeamTL.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Team Leader Quota Allocation • Max 5 Members under TL
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTargetTeamTL(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quota Comparison Banner */}
            <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500">Super Admin Team Target: </span>
                <strong className="text-slate-900 dark:text-white font-mono">
                  {formatCurrency(targetTeamTL.targetRevenue)}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Total Member Quota: </span>
                <strong
                  className={`font-mono ${
                    tempMembers.reduce((s, m) => s + (m.targetRevenue || 0), 0) >= targetTeamTL.targetRevenue
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {formatCurrency(tempMembers.reduce((s, m) => s + (m.targetRevenue || 0), 0))}
                </strong>
              </div>
            </div>

            {/* Members List Form */}
            <form onSubmit={handleSaveMemberTargets} className="mt-4 space-y-3.5 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Team Members ({tempMembers.length} / 5 max)
                  </span>
                  {tempMembers.length < 5 && (
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      +{5 - tempMembers.length} slots available
                    </span>
                  )}
                </div>

                {tempMembers.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          m.role === 'BDM'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                        }`}
                      >
                        {m.role}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{m.name}</p>
                        <p className="text-[10px] text-slate-400">
                          Achieved: {formatCurrency(m.achievedRevenue || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-500 font-medium">Target: ₹</span>
                        <input
                          type="number"
                          step="10000"
                          required
                          value={m.targetRevenue}
                          onChange={(e) => handleMemberTargetChange(m.id, Number(e.target.value))}
                          className="w-28 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-mono font-bold text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-right"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Remove member from team"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Member Dropdown (if < 5 members) */}
              {tempMembers.length < 5 ? (
                <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/40">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Add Member to Pod (Choose BDM or BDE)
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      id="add-rep-select"
                      className="flex-1 rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      defaultValue=""
                    >
                      <option value="" disabled>Select staff member...</option>
                      {availableReps
                        .filter((rep) => !tempMembers.some((m) => m.id === rep.id || m.name === rep.name))
                        .map((rep) => (
                          <option key={rep.id} value={rep.id}>
                            {rep.name} ({rep.role} • {rep.branch || 'Branch'})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const select = document.getElementById('add-rep-select') as HTMLSelectElement;
                        if (select && select.value) {
                          handleAddMemberToTeam(select.value);
                          select.value = '';
                        }
                      }}
                      className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
                    >
                      + Add Member
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 text-center text-[11px] font-medium dark:bg-slate-800 dark:text-slate-300">
                  Maximum team capacity reached (5 members under TL). Remove a member to swap staff.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTargetTeamTL(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-amber-700 transition active:scale-95 cursor-pointer"
                >
                  Save Member Quotas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPER ADMIN: DELETE TEAM CONFIRMATION MODAL */}
      {deleteConfirmTeamId && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-rose-200 bg-white p-5 shadow-2xl dark:border-rose-900/60 dark:bg-slate-900 text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Delete Sales Team</h3>
                <p className="text-[11px] text-slate-400">Super Admin Administrative Action</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to remove{' '}
              <strong>{teams.find((t) => t.id === deleteConfirmTeamId)?.name}</strong>? All member quotas and pod hierarchy will be unlinked.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTeamId(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTeam(deleteConfirmTeamId);
                  setDeleteConfirmTeamId(null);
                }}
                className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition active:scale-95 cursor-pointer"
              >
                Confirm &amp; Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
