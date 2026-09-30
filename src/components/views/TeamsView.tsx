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
    updateTeamMembers,
    updateTeamRoster
  } = useCRM();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<'ALL' | 'ND1' | 'ND2'>('ALL');

  // Super Admin Modals
  const [isNewTeamOpen, setIsNewTeamOpen] = useState(false);
  const [editingTeamSA, setEditingTeamSA] = useState<SalesTeam | null>(null);
  const [deleteConfirmTeamId, setDeleteConfirmTeamId] = useState<string | null>(null);

  // TL Member Target Assignment Modal (Exclusive to setting quotas per BDE / BDM)
  const [targetTeamTL, setTargetTeamTL] = useState<SalesTeam | null>(null);
  const [tempMembers, setTempMembers] = useState<TeamMember[]>([]);

  // Super Admin Create Form State
  const [newTeamName, setNewTeamName] = useState('');
  const [newBranch, setNewBranch] = useState<'ND1' | 'ND2'>('ND1');
  const [newTLId, setNewTLId] = useState('');
  const [newTarget, setNewTarget] = useState<number>(1500000);
  const [newTeamMembers, setNewTeamMembers] = useState<TeamMember[]>([]);
  const [newRepToAdd, setNewRepToAdd] = useState('');

  // Super Admin Edit Form State
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState<number>(1500000);
  const [editBranch, setEditBranch] = useState<'ND1' | 'ND2'>('ND1');
  const [editTLId, setEditTLId] = useState('');
  const [editRosterMembers, setEditRosterMembers] = useState<TeamMember[]>([]);
  const [selectedRepToAdd, setSelectedRepToAdd] = useState('');

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  // Available staff lists by role
  const teamLeaders = employees.filter((e) => e.role === 'TL');
  const bdms = employees.filter((e) => e.role === 'BDM');
  const bdes = employees.filter((e) => e.role === 'BDE');
  const availableReps = employees.filter((e) => e.role === 'BDM' || e.role === 'BDE');

  // Open Super Admin Edit Modal (Name, Target, Branch, TL & 5-Member Roster)
  const openSuperAdminEdit = (team: SalesTeam) => {
    setEditingTeamSA(team);
    setEditName(team.name);
    setEditTarget(team.targetRevenue);
    setEditBranch((team.branchName === 'ND2' ? 'ND2' : 'ND1') as 'ND1' | 'ND2');
    setEditTLId(team.teamLeadId || '');
    setEditRosterMembers([...(team.members || [])]);
    setSelectedRepToAdd('');
  };

  const handleSuperAdminRemoveMember = (memberId: string) => {
    setEditRosterMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleSuperAdminAddMember = (empId: string) => {
    if (editRosterMembers.length >= 5) {
      alert('Team Limit: Maximum 5 members allowed under the Team Leader.');
      return;
    }
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    if (editRosterMembers.some((m) => m.id === empId || m.name === emp.name)) {
      alert('Member already added to this team.');
      return;
    }

    const defaultMemberTarget = Math.round(
      (editTarget || 1500000) / (editRosterMembers.length + 1)
    );

    setEditRosterMembers([
      ...editRosterMembers,
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
    setSelectedRepToAdd('');
  };

  const handleSuperAdminEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeamSA) return;

    const assignedTL = teamLeaders.find((t) => t.id === editTLId);

    if (editName.trim() !== editingTeamSA.name) {
      updateTeamName(editingTeamSA.id, editName.trim(), editingTeamSA.division || 'All Services');
    }
    if (editTarget !== editingTeamSA.targetRevenue) {
      updateTeamTarget(editingTeamSA.id, Number(editTarget));
    }

    updateTeamMembers(editingTeamSA.id, {
      branchName: editBranch,
      ...(assignedTL ? { teamLeadId: assignedTL.id, teamLeadName: assignedTL.name } : {})
    });

    updateTeamRoster(editingTeamSA.id, editRosterMembers);
    setEditingTeamSA(null);
  };

  // Open TL Member Targets Modal (Exclusively for setting targets per BDE / BDM)
  const openMemberTargetsModal = (team: SalesTeam) => {
    setTargetTeamTL(team);
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

  // TL Helper: Distribute Evenly
  const handleTLDistributeEvenly = () => {
    if (!targetTeamTL || tempMembers.length === 0) return;
    const split = Math.round(targetTeamTL.targetRevenue / tempMembers.length);
    setTempMembers((prev) =>
      prev.map((m) => ({
        ...m,
        targetRevenue: split
      }))
    );
  };

  // TL Helper: BDM Priority (higher quota for BDMs, remainder for BDEs)
  const handleTLBDMPriority = () => {
    if (!targetTeamTL || tempMembers.length === 0) return;
    const bdmCount = tempMembers.filter((m) => m.role === 'BDM').length;
    const bdeCount = tempMembers.filter((m) => m.role === 'BDE').length;
    if (bdmCount === 0 || bdeCount === 0) {
      handleTLDistributeEvenly();
      return;
    }
    const x = Math.round(targetTeamTL.targetRevenue / (bdmCount * 1.25 + bdeCount));
    const bdmQuota = Math.round(x * 1.25);
    setTempMembers((prev) =>
      prev.map((m) => ({
        ...m,
        targetRevenue: m.role === 'BDM' ? bdmQuota : x
      }))
    );
  };

  const handleSaveMemberTargets = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTeamTL) return;

    updateMemberTargets(targetTeamTL.id, tempMembers);
    setTargetTeamTL(null);
  };

  // Super Admin Create Team
  const handleAddMemberToNewTeam = (empId: string) => {
    if (newTeamMembers.length >= 5) {
      alert('Team Limit: Maximum 5 members allowed under the Team Leader.');
      return;
    }
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    if (newTeamMembers.some((m) => m.id === empId || m.name === emp.name)) {
      alert('Member already added.');
      return;
    }
    const defaultMemberTarget = Math.round(
      (newTarget || 1500000) / (newTeamMembers.length + 1)
    );
    setNewTeamMembers([
      ...newTeamMembers,
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
    setNewRepToAdd('');
  };

  const handleRemoveMemberFromNewTeam = (memberId: string) => {
    setNewTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;

    const tl = teamLeaders.find((t) => t.id === newTLId) || teamLeaders[0];
    const bdmMembers = newTeamMembers.filter((m) => m.role === 'BDM');
    const bdeMembers = newTeamMembers.filter((m) => m.role === 'BDE');

    createTeam({
      name: newTeamName.trim(),
      division: 'All Services',
      branchName: newBranch,
      branchManagerId: 'e-bm',
      branchManagerName: 'Pooja Deshmukh',
      teamLeadId: tl?.id || `tl-${Date.now()}`,
      teamLeadName: tl?.name || 'Assigned TL',
      members: newTeamMembers,
      bdmIds: bdmMembers.map((m) => m.id),
      bdmNames: bdmMembers.map((m) => m.name),
      bdeIds: bdeMembers.map((m) => m.id),
      bdeNames: bdeMembers.map((m) => m.name),
      targetRevenue: Number(newTarget) || 1500000,
      achievedRevenue: 0,
      activeLeadsCount: 0
    });

    setIsNewTeamOpen(false);
    setNewTeamName('');
    setNewTarget(1500000);
    setNewTeamMembers([]);
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
      const matchesBranch = selectedBranch === 'ALL' || t.branchName === selectedBranch;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.teamLeadName.toLowerCase().includes(q) ||
        t.branchName.toLowerCase().includes(q) ||
        t.members?.some((m) => m.name.toLowerCase().includes(q));

      return matchesBranch && matchesSearch;
    });
  }, [teams, selectedBranch, search]);

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
            { id: 'ALL', label: 'All Branches (ND1 & ND2)' },
            { id: 'ND1', label: 'Branch ND1' },
            { id: 'ND2', label: 'Branch ND2' }
          ].map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBranch(b.id as any)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition shrink-0 cursor-pointer ${
                selectedBranch === b.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
              }`}
            >
              {b.label}
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
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
                        Branch {team.branchName}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        All Services
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{team.name}</span>
                    </h3>
                  </div>

                  {/* Super Admin Team Controls */}
                  {isSuperAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openSuperAdminEdit(team)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-800"
                        title="Super Admin: Edit Team Name, Target & 5-Member Roster"
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
                        Set BDE/BDM Targets
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
                        No members assigned yet.
                        {isSuperAdmin ? (
                          <div className="mt-1">
                            <button
                              type="button"
                              onClick={() => openSuperAdminEdit(team)}
                              className="text-indigo-600 font-semibold underline cursor-pointer"
                            >
                              + Assign BDE/BDM members (Super Admin)
                            </button>
                          </div>
                        ) : (
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            (Members are decided strictly by Super Admin)
                          </span>
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
                <div className="flex items-center gap-2">
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => openSuperAdminEdit(team)}
                      className="text-indigo-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="h-3 w-3" />
                      <span>Manage Roster (SA)</span>
                    </button>
                  )}
                  {isTeamTL && (
                    <button
                      type="button"
                      onClick={() => openMemberTargetsModal(team)}
                      className="text-amber-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Target className="h-3 w-3" />
                      <span>Set Quotas (TL)</span>
                    </button>
                  )}
                </div>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Branch Location *</label>
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="ND1">Branch ND1</option>
                    <option value="ND2">Branch ND2</option>
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

              {/* Optional Initial Members (Max 5 - Super Admin Exclusive) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Assign Initial Members ({newTeamMembers.length}/5) (Super Admin Only)
                  </label>
                  <span className="text-[10px] text-slate-400">Optional • Max 5 members</span>
                </div>
                {newTeamMembers.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {newTeamMembers.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-[11px]"
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              m.role === 'BDM'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                            }`}
                          >
                            {m.role}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">{m.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberFromNewTeam(m.id)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {newTeamMembers.length < 5 && (
                  <div className="flex items-center gap-2">
                    <select
                      value={newRepToAdd}
                      onChange={(e) => setNewRepToAdd(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select staff member to assign...</option>
                      {availableReps
                        .filter((rep) => !newTeamMembers.some((m) => m.id === rep.id || m.name === rep.name))
                        .map((rep) => (
                          <option key={rep.id} value={rep.id}>
                            {rep.name} ({rep.role} • {rep.branch || 'ND1'})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      disabled={!newRepToAdd}
                      onClick={() => {
                        if (newRepToAdd) handleAddMemberToNewTeam(newRepToAdd);
                      }}
                      className="rounded-xl bg-slate-900 text-white px-3 py-2 text-xs font-bold hover:bg-slate-800 disabled:opacity-40"
                    >
                      + Add
                    </button>
                  </div>
                )}
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

      {/* SUPER ADMIN: EDIT TEAM NAME, TARGET & 5-MEMBER ROSTER MODAL */}
      {editingTeamSA && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-indigo-200 bg-white p-6 shadow-2xl dark:border-indigo-900/60 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Edit Team &amp; Member Roster (Super Admin)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Exclusive Authority: Change Name, Branch, TL, Quota &amp; Decide Members (Add/Remove)
                  </p>
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

            <form onSubmit={handleSuperAdminEditSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Branch Location *</label>
                  <select
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="ND1">Branch ND1</option>
                    <option value="ND2">Branch ND2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Assign Team Leader (TL)</label>
                  <select
                    value={editTLId}
                    onChange={(e) => setEditTLId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {teamLeaders.map((tl) => (
                      <option key={tl.id} value={tl.id}>
                        {tl.name} (TL)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Monthly Team Target (₹) * (Super Admin)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    required
                    value={editTarget}
                    onChange={(e) => setEditTarget(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 5-Member Roster Management Section (Exclusive to Super Admin) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-indigo-600" />
                      <span>Team Member Roster ({editRosterMembers.length} / 5 max)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Super Admin decides which BDE / BDM is added or removed.
                    </p>
                  </div>
                  {editRosterMembers.length < 5 && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950 dark:text-emerald-300">
                      {5 - editRosterMembers.length} slot(s) open
                    </span>
                  )}
                </div>

                {/* Current Members List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editRosterMembers.length === 0 ? (
                    <div className="p-3 text-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 dark:bg-slate-800/40 dark:border-slate-700">
                      No members currently assigned to this team. Add staff below.
                    </div>
                  ) : (
                    editRosterMembers.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/60"
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
                            <span className="font-bold text-slate-900 dark:text-white block text-xs">
                              {m.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Current Target: {formatCurrency(m.targetRevenue)} • Achieved: {formatCurrency(m.achievedRevenue || 0)}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSuperAdminRemoveMember(m.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Super Admin: Remove member from team"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Member Dropdown (if < 5 members) */}
                {editRosterMembers.length < 5 ? (
                  <div className="p-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/20">
                    <label className="font-semibold text-indigo-950 dark:text-indigo-200 block mb-1.5">
                      + Add Staff Member (BDM or BDE)
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedRepToAdd}
                        onChange={(e) => setSelectedRepToAdd(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="">Select available staff member...</option>
                        {availableReps
                          .filter((rep) => !editRosterMembers.some((m) => m.id === rep.id || m.name === rep.name))
                          .map((rep) => (
                            <option key={rep.id} value={rep.id}>
                              {rep.name} ({rep.role} • {rep.branch || 'ND1'})
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        disabled={!selectedRepToAdd}
                        onClick={() => {
                          if (selectedRepToAdd) {
                            handleSuperAdminAddMember(selectedRepToAdd);
                          }
                        }}
                        className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition disabled:opacity-40 cursor-pointer shrink-0"
                      >
                        + Add Member
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 text-center text-[11px] font-medium dark:bg-slate-800 dark:text-slate-300">
                    Maximum team capacity reached (5 members under TL). Remove a member to add someone else.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTeamSA(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-indigo-700 transition active:scale-95 cursor-pointer"
                >
                  Save Team &amp; Roster Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TL: ASSIGN MEMBER TARGETS MODAL (MAX 5 MEMBERS - ROSTER LOCKED) */}
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
                    Team Leader Quota Allocation • Set Individual Targets per BDE &amp; BDM
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

            {/* Super Admin Roster Lock Notice */}
            <div className="mt-3.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-200 flex items-start gap-2.5">
              <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block">Team Roster Controlled Strictly by Super Admin</strong>
                <p className="text-[11px] mt-0.5 text-amber-800/90 dark:text-amber-300/80">
                  Who is added or removed from this team is decided solely by Super Admin. As Team Leader, you set individual monthly revenue targets for each BDE and BDM below.
                </p>
              </div>
            </div>

            {/* Quota Comparison & Helper Presets */}
            <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Team Target (Super Admin)</span>
                  <strong className="text-slate-900 dark:text-white font-mono text-sm">
                    {formatCurrency(targetTeamTL.targetRevenue)}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Total TL Member Quota</span>
                  <strong
                    className={`font-mono text-sm ${
                      tempMembers.reduce((s, m) => s + (m.targetRevenue || 0), 0) === targetTeamTL.targetRevenue
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : tempMembers.reduce((s, m) => s + (m.targetRevenue || 0), 0) > targetTeamTL.targetRevenue
                        ? 'text-rose-500'
                        : 'text-amber-500'
                    }`}
                  >
                    {formatCurrency(tempMembers.reduce((s, m) => s + (m.targetRevenue || 0), 0))}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Presets:</span>
                <button
                  type="button"
                  onClick={handleTLDistributeEvenly}
                  className="rounded-lg bg-indigo-50 border border-indigo-200 px-2 py-1 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300 cursor-pointer"
                >
                  Distribute Evenly
                </button>
                <button
                  type="button"
                  onClick={handleTLBDMPriority}
                  className="rounded-lg bg-blue-50 border border-blue-200 px-2 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300 cursor-pointer"
                >
                  BDM Priority (+25%)
                </button>
              </div>
            </div>

            {/* Members Target Inputs (No delete or add buttons - roster is locked) */}
            <form onSubmit={handleSaveMemberTargets} className="mt-4 space-y-3.5 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Assigned Team Members ({tempMembers.length} / 5)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Set separate targets for BDM and BDE
                  </span>
                </div>

                {tempMembers.length === 0 ? (
                  <div className="p-4 text-center rounded-xl bg-slate-50 text-slate-400 text-xs">
                    No members assigned to this team yet. Contact Super Admin to add members to your pod.
                  </div>
                ) : (
                  tempMembers.map((m, idx) => (
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
                            min="0"
                            required
                            value={m.targetRevenue}
                            onChange={(e) => handleMemberTargetChange(m.id, Number(e.target.value))}
                            className="w-32 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-mono font-bold text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-right"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTargetTeamTL(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={tempMembers.length === 0}
                  className="rounded-xl bg-amber-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-amber-700 transition active:scale-95 cursor-pointer disabled:opacity-40"
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
