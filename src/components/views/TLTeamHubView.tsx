'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/crm-context';
import { formatCurrency } from '@/lib/utils';
import { SalesTeam, TeamMember } from '@/types/crm';
import {
  Trophy,
  Crown,
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  DollarSign,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Building,
  UserCheck,
  Award,
  Sparkles,
  BarChart3,
  Calendar,
  X,
  Plus,
  RefreshCw,
  Eye,
  BookmarkCheck,
  MapPin,
  ChevronRight
} from 'lucide-react';

export default function TLTeamHubView() {
  const {
    teams,
    currentUser,
    bookings,
    updateMemberTargets,
    setIsBookingModalOpen
  } = useCRM();

  // Find the TL's assigned team, or fallback to first team
  const userTeam = useMemo(() => {
    // If current user is TL, match by id or name
    if (currentUser.role === 'TL') {
      const match = teams.find(
        (t) =>
          t.teamLeadId === currentUser.id ||
          t.teamLeadName.toLowerCase() === currentUser.name.toLowerCase()
      );
      if (match) return match;
    }
    return teams[0] || null;
  }, [teams, currentUser]);

  // Selected team ID (allows Super Admin, RM, BM, or TL to inspect specific team)
  const [selectedTeamId, setSelectedTeamId] = useState<string>(userTeam?.id || 'team-01');

  // Active view tab: 'my-team' | 'leaderboard' | 'bookings'
  const [activeTab, setActiveTab] = useState<'my-team' | 'leaderboard' | 'bookings'>('my-team');

  // Leaderboard filters & sorting
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [leaderboardDivision, setLeaderboardDivision] = useState('ALL');
  const [sortBy, setSortBy] = useState<'rank' | 'revenue-desc' | 'percent-desc' | 'revenue-asc'>('rank');

  // Member target editing modal state
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [editingMembers, setEditingMembers] = useState<TeamMember[]>([]);
  const [targetSaveSuccess, setTargetSaveSuccess] = useState(false);

  // Active inspected team
  const activeTeam = useMemo(() => {
    return teams.find((t) => t.id === selectedTeamId) || userTeam || teams[0];
  }, [teams, selectedTeamId, userTeam]);

  // Calculate actual achieved revenue for the active team from its members
  const teamAchieved = useMemo(() => {
    if (!activeTeam) return 0;
    const membersSum = (activeTeam.members || []).reduce(
      (sum, m) => sum + (Number(m.achievedRevenue) || 0),
      0
    );
    return membersSum > 0 ? membersSum : activeTeam.achievedRevenue || 0;
  }, [activeTeam]);

  const teamTarget = activeTeam?.targetRevenue || 1500000;
  const teamProgressPct = Math.min(100, Math.round((teamAchieved / teamTarget) * 100));
  const teamGap = Math.max(0, teamTarget - teamAchieved);

  // Computed Leaderboard Ranking for ALL 16 teams
  const rankedTeams = useMemo(() => {
    const list = teams.map((team) => {
      const memberAchieved = (team.members || []).reduce(
        (sum, m) => sum + (Number(m.achievedRevenue) || 0),
        0
      );
      const achieved = memberAchieved > 0 ? memberAchieved : team.achievedRevenue || 0;
      const target = team.targetRevenue || 1500000;
      const pct = Math.round((achieved / target) * 100);
      return {
        ...team,
        effectiveAchieved: achieved,
        effectiveTarget: target,
        percentAchieved: pct
      };
    });

    // Default sort by Achieved Revenue descending to determine absolute rank
    list.sort((a, b) => b.effectiveAchieved - a.effectiveAchieved);

    // Assign rank #1 to #16 and calculate gap from #1 leader
    const maxAchieved = list[0]?.effectiveAchieved || 1;
    return list.map((item, index) => ({
      ...item,
      rank: index + 1,
      gapFromLeader: maxAchieved - item.effectiveAchieved,
      isUserTeam:
        userTeam?.id === item.id ||
        (currentUser.role === 'TL' &&
          (item.teamLeadId === currentUser.id ||
            item.teamLeadName.toLowerCase() === currentUser.name.toLowerCase()))
    }));
  }, [teams, userTeam, currentUser]);

  // Statistics for comparative cards
  const leaderTeam = rankedTeams[0];
  const trailingTeam = rankedTeams[rankedTeams.length - 1];
  const userTeamRanked = rankedTeams.find((t) => t.id === activeTeam?.id);

  const orgTotalTarget = rankedTeams.reduce((sum, t) => sum + t.effectiveTarget, 0);
  const orgTotalAchieved = rankedTeams.reduce((sum, t) => sum + t.effectiveAchieved, 0);
  const orgAveragePct = orgTotalTarget > 0 ? Math.round((orgTotalAchieved / orgTotalTarget) * 100) : 0;

  // Filtered leaderboard
  const filteredLeaderboard = useMemo(() => {
    let result = [...rankedTeams];

    if (leaderboardSearch.trim()) {
      const q = leaderboardSearch.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.teamLeadName.toLowerCase().includes(q) ||
          t.division.toLowerCase().includes(q) ||
          t.branchName.toLowerCase().includes(q)
      );
    }

    if (leaderboardDivision !== 'ALL') {
      result = result.filter((t) => t.division === leaderboardDivision);
    }

    if (sortBy === 'revenue-desc') {
      result.sort((a, b) => b.effectiveAchieved - a.effectiveAchieved);
    } else if (sortBy === 'percent-desc') {
      result.sort((a, b) => b.percentAchieved - a.percentAchieved);
    } else if (sortBy === 'revenue-asc') {
      // Sabse peeche first
      result.sort((a, b) => a.effectiveAchieved - b.effectiveAchieved);
    }

    return result;
  }, [rankedTeams, leaderboardSearch, leaderboardDivision, sortBy]);

  // Bookings associated with active team members
  const teamBookings = useMemo(() => {
    if (!activeTeam || !activeTeam.members) return [];
    const memberNames = new Set(activeTeam.members.map((m) => m.name.toLowerCase()));
    memberNames.add(activeTeam.teamLeadName.toLowerCase());

    return bookings.filter((b) => {
      const assigned = (b.assignedSalesperson || '').toLowerCase();
      const creator = (b.createdByName || '').toLowerCase();
      return memberNames.has(assigned) || memberNames.has(creator);
    });
  }, [bookings, activeTeam]);

  // Open modal to assign individual targets
  const handleOpenTargetModal = () => {
    if (!activeTeam) return;
    setEditingMembers(
      (activeTeam.members || []).map((m) => ({
        ...m,
        targetRevenue: m.targetRevenue || 300000
      }))
    );
    setTargetSaveSuccess(false);
    setIsTargetModalOpen(true);
  };

  // Change individual member target
  const handleTargetChange = (memberId: string, value: number) => {
    setEditingMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, targetRevenue: Math.max(0, value) } : m))
    );
  };

  // Distribute target evenly across the 5 members
  const handleDistributeEvenly = () => {
    if (editingMembers.length === 0) return;
    const split = Math.round(teamTarget / editingMembers.length);
    setEditingMembers((prev) =>
      prev.map((m) => ({
        ...m,
        targetRevenue: split
      }))
    );
  };

  // Save targets
  const handleSaveMemberTargets = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam) return;
    const ok = updateMemberTargets(activeTeam.id, editingMembers);
    if (ok) {
      setTargetSaveSuccess(true);
      setTimeout(() => {
        setIsTargetModalOpen(false);
        setTargetSaveSuccess(false);
      }, 1000);
    }
  };

  const totalEditingAllocated = editingMembers.reduce(
    (sum, m) => sum + (Number(m.targetRevenue) || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Team Switcher Bar */}
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl lg:flex-row lg:items-center lg:justify-between border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-400/30">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              {currentUser.role === 'TL' ? 'Team Leader Cockpit' : 'TL Team Management & Standings'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Org Telemetry
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl text-white">
            {activeTeam?.name || 'Dedicated Sales Team'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
            Complete operational cockpit for your 5-member sales unit, individual target distribution, and real-time comparative rankings against all 16 sales teams.
          </p>
        </div>

        {/* Team Selector & Period */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/15">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-200 mb-1">
              Select Active Team ({teams.length} Total Teams)
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="bg-slate-900/90 text-white font-semibold text-xs rounded-lg px-3 py-1.5 border border-indigo-400/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                  {t.name} (TL: {t.teamLeadName})
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex flex-col items-end bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current Period</span>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> MTD September 2026
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('my-team')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'my-team'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/70'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>My Dedicated Team ({activeTeam?.members?.length || 0} Members)</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/70'
          }`}
        >
          <Trophy className="h-4 w-4 text-amber-300" />
          <span>All 16 Teams Leaderboard (Aage vs Peeche)</span>
          <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-extrabold">
            Rank #{userTeamRanked?.rank || 1}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'bookings'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/70'
          }`}
        >
          <BookmarkCheck className="h-4 w-4" />
          <span>Team Bookings ({teamBookings.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DEDICATED TEAM COCKPIT & 5 MEMBERS BREAKDOWN           */}
      {/* ============================================================== */}
      {activeTab === 'my-team' && (
        <div className="space-y-6">
          {/* Executive Performance Highlights */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Team Target (Super Admin) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Team Monthly Target</span>
                <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Target className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(teamTarget)}
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                Fixed quota set by Super Admin
              </p>
            </div>

            {/* Achieved Revenue */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Achieved Revenue</span>
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(teamAchieved)}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span>{teamProgressPct}% Achieved</span>
                <span className={teamGap === 0 ? 'text-emerald-600' : 'text-amber-500'}>
                  {teamGap === 0 ? 'Target Reached!' : `₹${teamGap.toLocaleString()} Remaining`}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    teamProgressPct >= 90
                      ? 'bg-emerald-500'
                      : teamProgressPct >= 65
                      ? 'bg-indigo-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, teamProgressPct)}%` }}
                />
              </div>
            </div>

            {/* Cross-Team Org Rank */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Org Ranking Standing</span>
                <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Trophy className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  Rank #{userTeamRanked?.rank || 1}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  of 16 Teams
                </span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {userTeamRanked?.rank === 1 ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Crown className="h-3.5 w-3.5 text-amber-500" /> Currently Leading the Org!
                  </span>
                ) : (
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    {formatCurrency(userTeamRanked?.gapFromLeader || 0)} behind #1 ({leaderTeam?.name})
                  </span>
                )}
              </p>
            </div>

            {/* Team Unit Health & TL Profile */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Team Structure</span>
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                {activeTeam?.members?.length || 0} / 5 Members
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                TL: <span className="font-bold text-slate-800 dark:text-slate-200">{activeTeam?.teamLeadName}</span>
              </p>
            </div>
          </div>

          {/* Team Context Identity Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-md shadow-indigo-500/20">
                {activeTeam?.name.charAt(0) || 'T'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {activeTeam?.name}
                  </h3>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    {activeTeam?.division}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {activeTeam?.branchName}
                  </span>
                  <span>•</span>
                  <span>Branch Manager: <strong className="text-slate-800 dark:text-slate-200">{activeTeam?.branchManagerName}</strong></span>
                  <span>•</span>
                  <span>Team Leader: <strong className="text-indigo-600 dark:text-indigo-400">{activeTeam?.teamLeadName}</strong></span>
                </div>
              </div>
            </div>

            {/* TL Target Allocation Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenTargetModal}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Allocate Member Targets</span>
              </button>
            </div>
          </div>

          {/* 5 TEAM MEMBERS DRILL-DOWN SCORECARD */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Your 5 Dedicated Team Members
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Detailed individual quota breakdown, booked revenue, and contribution to {activeTeam?.name}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Total Allocated: <strong className="text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(
                      (activeTeam?.members || []).reduce((s, m) => s + (m.targetRevenue || 0), 0)
                    )}
                  </strong> / {formatCurrency(teamTarget)}
                </span>
              </div>
            </div>

            {/* Members Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {(activeTeam?.members || []).map((member, idx) => {
                const memberTarget = member.targetRevenue || 300000;
                const memberAchieved = Number(member.achievedRevenue) || 0;
                const memberPct = Math.min(100, Math.round((memberAchieved / memberTarget) * 100));
                const contributionPct = teamAchieved > 0 ? Math.round((memberAchieved / teamAchieved) * 100) : 0;
                const memberBookingsCount = bookings.filter(
                  (b) =>
                    (b.assignedSalesperson || '').toLowerCase() === member.name.toLowerCase() ||
                    (b.createdByName || '').toLowerCase() === member.name.toLowerCase()
                ).length;

                return (
                  <div
                    key={member.id || idx}
                    className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-xs">
                          {member.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {member.name}
                          </h4>
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold mt-0.5 ${
                              member.role === 'BDM'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            }`}
                          >
                            {member.role === 'BDM' ? 'BDM • Loan Specialist' : 'BDE • Executive'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          memberPct >= 90
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : memberPct >= 65
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {memberPct >= 90 ? 'Star Closer' : memberPct >= 65 ? 'On Track' : 'Needs Push'}
                      </span>
                    </div>

                    {/* Target & Achieved Row */}
                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200/80 pt-3 dark:border-slate-700/60 text-xs">
                      <div>
                        <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          Assigned Target (TL)
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatCurrency(memberTarget)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          Achieved Revenue
                        </span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(memberAchieved)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        <span>Quota Achieved</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{memberPct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            memberPct >= 90
                              ? 'bg-emerald-500'
                              : memberPct >= 65
                              ? 'bg-indigo-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${memberPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                      <span>Team Contribution: <strong className="text-slate-700 dark:text-slate-300">{contributionPct}%</strong></span>
                      <span>Bookings: <strong className="text-slate-700 dark:text-slate-300">{memberBookingsCount}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ALL 16 TEAMS LEADERBOARD & COMPARATIVE STANDINGS        */}
      {/* ============================================================== */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Comparative Standings Overview Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Sabse Aage - Leader #1 */}
            <div className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50 via-white to-amber-100/40 p-5 shadow-md dark:border-amber-500/30 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-700 dark:text-amber-300">
                  <Crown className="h-3 w-3 text-amber-500" /> Sabse Aage (Rank #1)
                </span>
                <span className="text-xl">🥇</span>
              </div>
              <div className="mt-3 text-lg font-black text-slate-900 dark:text-white truncate">
                {leaderTeam?.name}
              </div>
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                TL: {leaderTeam?.teamLeadName} • {leaderTeam?.branchName}
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-amber-200/60 pt-2 dark:border-amber-900/40">
                <span className="text-xs text-slate-500 dark:text-slate-400">Revenue Achieved:</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(leaderTeam?.effectiveAchieved || 0)} ({leaderTeam?.percentAchieved}%)
                </span>
              </div>
            </div>

            {/* Aapki Team Ki Position */}
            <div className="rounded-2xl border-2 border-indigo-400/80 bg-gradient-to-br from-indigo-50 via-white to-indigo-100/40 p-5 shadow-md dark:border-indigo-500/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-300">
                  <Award className="h-3 w-3 text-indigo-500" /> Aapki Team Ka Rank
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                  Rank #{userTeamRanked?.rank}
                </span>
              </div>
              <div className="mt-3 text-lg font-black text-slate-900 dark:text-white truncate">
                {userTeamRanked?.name}
              </div>
              <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                TL: {userTeamRanked?.teamLeadName} • {userTeamRanked?.branchName}
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-indigo-200/60 pt-2 dark:border-indigo-900/40">
                <span className="text-xs text-slate-500 dark:text-slate-400">Gap to #1 Leader:</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-300">
                  {userTeamRanked?.rank === 1 ? 'Current Leader 👑' : `-${formatCurrency(userTeamRanked?.gapFromLeader || 0)}`}
                </span>
              </div>
            </div>

            {/* Sabse Peeche - Rank #16 Trailing */}
            <div className="rounded-2xl border-2 border-rose-300/80 bg-gradient-to-br from-rose-50 via-white to-rose-100/40 p-5 shadow-md dark:border-rose-500/30 dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-900">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="h-3 w-3 text-rose-500" /> Sabse Peeche (Rank #16)
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-600 text-white">
                  Trailing
                </span>
              </div>
              <div className="mt-3 text-lg font-black text-slate-900 dark:text-white truncate">
                {trailingTeam?.name}
              </div>
              <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                TL: {trailingTeam?.teamLeadName} • {trailingTeam?.branchName}
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-rose-200/60 pt-2 dark:border-rose-900/40">
                <span className="text-xs text-slate-500 dark:text-slate-400">Revenue Achieved:</span>
                <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                  {formatCurrency(trailingTeam?.effectiveAchieved || 0)} ({trailingTeam?.percentAchieved}%)
                </span>
              </div>
            </div>

            {/* Org Benchmark Average */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Company Target Pace</span>
                <div className="rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <BarChart3 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                {orgAveragePct}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Avg Team Revenue: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(Math.round(orgTotalAchieved / rankedTeams.length))}</strong>
              </div>
              <div className="mt-3 border-t border-slate-100 pt-2 dark:border-slate-800 text-[11px] text-slate-500">
                {rankedTeams.filter((t) => t.percentAchieved >= orgAveragePct).length} of 16 teams performing above average
              </div>
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={leaderboardSearch}
                onChange={(e) => setLeaderboardSearch(e.target.value)}
                placeholder="Search team name, TL name, branch..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Division Filter */}
              <select
                value={leaderboardDivision}
                onChange={(e) => setLeaderboardDivision(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Divisions</option>
                <option value="Government Grants & Funding">Government Grants & Funding</option>
                <option value="Government Schemes & Subsidies">Government Schemes & Subsidies</option>
                <option value="Business Loans & MSME Credit">Business Loans & MSME Credit</option>
                <option value="IT Services & SaaS">IT Services & SaaS</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="rank">Sort by: Top Rank (Sabse Aage First)</option>
                <option value="percent-desc">Sort by: Highest % Achieved</option>
                <option value="revenue-asc">Sort by: Sabse Peeche First (Lowest)</option>
              </select>

              {/* Focus My Team Button */}
              <button
                onClick={() => {
                  setLeaderboardSearch(userTeam?.name || '');
                }}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400"
              >
                <Target className="h-3.5 w-3.5" />
                <span>Show My Team Only</span>
              </button>

              {leaderboardSearch && (
                <button
                  onClick={() => setLeaderboardSearch('')}
                  className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  title="Clear Filter"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* ALL 16 TEAMS COMPARATIVE LEADERBOARD TABLE */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5 text-center w-16">Rank</th>
                    <th className="px-4 py-3.5">Team & Division</th>
                    <th className="px-4 py-3.5">Team Leader (TL)</th>
                    <th className="px-4 py-3.5">Branch</th>
                    <th className="px-4 py-3.5 text-right">Target (₹)</th>
                    <th className="px-4 py-3.5 text-right">Achieved (₹)</th>
                    <th className="px-4 py-3.5 w-44">Quota Progress</th>
                    <th className="px-4 py-3.5 text-right">Gap to #1 Leader</th>
                    <th className="px-4 py-3.5 text-center">Status / Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLeaderboard.map((team) => {
                    const isCurrentUserTeam = team.isUserTeam;
                    const isRank1 = team.rank === 1;
                    const isRank2 = team.rank === 2;
                    const isRank3 = team.rank === 3;
                    const isTrailing = team.rank >= 14;

                    return (
                      <tr
                        key={team.id}
                        className={`transition-colors ${
                          isCurrentUserTeam
                            ? 'bg-indigo-50/80 font-medium hover:bg-indigo-100/70 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 ring-2 ring-indigo-500 ring-inset'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="px-4 py-3.5 text-center font-black">
                          {isRank1 ? (
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-sm shadow-xs font-black">
                              1🥇
                            </span>
                          ) : isRank2 ? (
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-slate-900 text-sm shadow-xs font-black">
                              2🥈
                            </span>
                          ) : isRank3 ? (
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-white text-sm shadow-xs font-black">
                              3🥉
                            </span>
                          ) : (
                            <span
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold ${
                                isTrailing
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              #{team.rank}
                            </span>
                          )}
                        </td>

                        {/* Team Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {team.name}
                            </span>
                            {isCurrentUserTeam && (
                              <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-xs">
                                Your Team
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-xs">
                            {team.division}
                          </span>
                        </td>

                        {/* TL */}
                        <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                          {team.teamLeadName}
                        </td>

                        {/* Branch */}
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                          {team.branchName}
                        </td>

                        {/* Target */}
                        <td className="px-4 py-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                          {formatCurrency(team.effectiveTarget)}
                        </td>

                        {/* Achieved */}
                        <td className="px-4 py-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(team.effectiveAchieved)}
                        </td>

                        {/* Quota Progress */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            <span>{team.percentAchieved}%</span>
                            <span className="text-[10px] font-normal text-slate-500">
                              {team.members?.length || 0} Reps
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                team.percentAchieved >= 90
                                  ? 'bg-emerald-500'
                                  : team.percentAchieved >= 65
                                  ? 'bg-indigo-500'
                                  : team.percentAchieved >= 45
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, team.percentAchieved)}%` }}
                            />
                          </div>
                        </td>

                        {/* Gap to Leader */}
                        <td className="px-4 py-3.5 text-right">
                          {team.rank === 1 ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                              👑 Leader (+₹0)
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-600 dark:text-slate-400">
                              -{formatCurrency(team.gapFromLeader)}
                            </span>
                          )}
                        </td>

                        {/* Status Tier */}
                        <td className="px-4 py-3.5 text-center">
                          {team.rank <= 3 ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              Podium / Top 3
                            </span>
                          ) : team.rank <= 8 ? (
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                              Upper Tier
                            </span>
                          ) : team.rank <= 13 ? (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                              Mid Tier
                            </span>
                          ) : (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                              Trailing / Peeche
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: TEAM BOOKINGS STREAM                                   */}
      {/* ============================================================== */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookmarkCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Bookings Generated by {activeTeam?.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time transactions and service bookings closed by this team unit.
              </p>
            </div>
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Booking</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            {teamBookings.length === 0 ? (
              <div className="p-12 text-center">
                <BookmarkCheck className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                <h4 className="mt-3 font-bold text-sm text-slate-900 dark:text-white">
                  No Bookings Recorded Yet
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  When team members (BDMs/BDEs) close customer proposals, their confirmed bookings will populate this ledger with full contribution tracking.
                </p>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Booking Now</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3.5">Booking ID</th>
                      <th className="px-4 py-3.5">Client / Company</th>
                      <th className="px-4 py-3.5">Service Category</th>
                      <th className="px-4 py-3.5">Closed By Rep</th>
                      <th className="px-4 py-3.5 text-right">Value (₹)</th>
                      <th className="px-4 py-3.5">Payment Status</th>
                      <th className="px-4 py-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {teamBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {b.id}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {b.companyName}
                          </span>
                          <span className="text-[10px] text-slate-500">{b.customerName}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                          {b.category || b.services?.[0] || 'Standard Service'}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                          {b.assignedSalesperson || b.createdByName}
                        </td>
                        <td className="px-4 py-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(b.expectedAmount)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              b.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : b.paymentStatus === 'Partially Paid'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500">
                          {b.bookingDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TL ASSIGN MEMBER TARGETS                               */}
      {/* ============================================================== */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Allocate Targets to 5 Team Members
                </h3>
              </div>
              <button
                onClick={() => setIsTargetModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberTargets} className="mt-4 space-y-4">
              {/* Context Summary */}
              <div className="flex items-center justify-between rounded-xl bg-indigo-50/80 p-3 text-xs dark:bg-indigo-950/40">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                    Super Admin Team Quota
                  </span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">
                    {formatCurrency(teamTarget)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                    Sum of Member Allocations
                  </span>
                  <span
                    className={`font-black text-sm ${
                      totalEditingAllocated === teamTarget
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : totalEditingAllocated > teamTarget
                        ? 'text-rose-500'
                        : 'text-amber-500'
                    }`}
                  >
                    {formatCurrency(totalEditingAllocated)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDistributeEvenly}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Distribute Evenly (₹{Math.round(teamTarget / (editingMembers.length || 1)).toLocaleString()})
                </button>
              </div>

              {/* Members Input List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {editingMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                        {m.name}
                      </h5>
                      <span className="text-[10px] text-slate-500">
                        {m.role} • Current Achieved: ₹{(m.achievedRevenue || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        value={m.targetRevenue}
                        onChange={(e) => handleTargetChange(m.id, Number(e.target.value))}
                        className="w-32 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-right text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {targetSaveSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Member targets updated and saved successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTargetModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
                >
                  Save Quotas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
