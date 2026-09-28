'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/crm-context';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  Lock,
  X,
  Sparkles,
  CalendarDays,
  Palmtree,
  CheckCircle2,
  Search,
  Filter,
  Flag,
  SunMedium,
  PartyPopper,
  Info,
  Clock
} from 'lucide-react';
import { Holiday } from '@/types/crm';

const COMMON_PRESETS = [
  { name: 'Republic Day', type: 'National' as const, date: '2026-01-26', desc: 'National Republic Day Celebration' },
  { name: 'Holi (Festival of Colors)', type: 'Gazetted' as const, date: '2026-03-04', desc: 'Spring Festival' },
  { name: 'Id-ul-Fitr (Ramzan Id)', type: 'Gazetted' as const, date: '2026-03-21', desc: 'Islamic Gazetted Holiday' },
  { name: 'Good Friday', type: 'Gazetted' as const, date: '2026-04-03', desc: 'Christian Gazetted Holiday' },
  { name: 'Independence Day', type: 'National' as const, date: '2026-08-15', desc: 'National Independence Day Celebration' },
  { name: 'Mahatma Gandhi Jayanti', type: 'National' as const, date: '2026-10-02', desc: 'National Holiday' },
  { name: 'Dussehra (Vijay Dashami)', type: 'Gazetted' as const, date: '2026-10-20', desc: 'Autumn Festival' },
  { name: 'Diwali (Deepavali)', type: 'Gazetted' as const, date: '2026-11-08', desc: 'Festival of Lights' },
  { name: 'Guru Nanak Jayanti', type: 'Gazetted' as const, date: '2026-11-24', desc: 'Sikh Festival' },
  { name: 'Christmas Day', type: 'Gazetted' as const, date: '2026-12-25', desc: 'Winter Holiday' }
];

export default function HolidaysView() {
  const { holidays, addHoliday, updateHoliday, deleteHoliday, currentUser } = useCRM();

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Add Form State
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [day, setDay] = useState('');
  const [type, setType] = useState<Holiday['type']>('Gazetted');
  const [description, setDescription] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | Holiday['type']>('All');

  // HR Permission check: HR or Super Admin
  const isHR = currentUser.role === 'HR' || currentUser.role === 'SUPER_ADMIN';

  const calculateDayName = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[d.getDay()] || '';
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    setDay(calculateDayName(selectedDate));
  };

  const applyPreset = (preset: typeof COMMON_PRESETS[0]) => {
    setName(preset.name);
    setDate(preset.date);
    setDay(calculateDayName(preset.date));
    setType(preset.type);
    setDescription(preset.desc);
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;

    const ok = addHoliday({
      name: name.trim(),
      date,
      day: day || calculateDayName(date) || 'Weekday',
      type,
      description: description.trim() || undefined
    });

    if (ok) {
      setIsAddModalOpen(false);
      setName('');
      setDate('');
      setDay('');
      setType('Gazetted');
      setDescription('');
    }
  };

  const handleUpdateHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHoliday || !editingHoliday.name.trim() || !editingHoliday.date) return;

    const ok = updateHoliday({
      ...editingHoliday,
      name: editingHoliday.name.trim(),
      day: editingHoliday.day || calculateDayName(editingHoliday.date) || 'Weekday'
    });

    if (ok) {
      setEditingHoliday(null);
    }
  };

  // Filter and sort holidays chronologically
  const filteredHolidays = useMemo(() => {
    return holidays
      .filter((h) => {
        const matchesSearch =
          h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.date.includes(searchQuery) ||
          h.day.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'All' || h.type === typeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays, searchQuery, typeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = holidays.filter((h) => h.date >= today).length;
    const national = holidays.filter((h) => h.type === 'National').length;
    const gazetted = holidays.filter((h) => h.type === 'Gazetted').length;
    const restricted = holidays.filter((h) => h.type === 'Restricted' || h.type === 'Festival' || h.type === 'Optional').length;

    return { total: holidays.length, upcoming, national, gazetted, restricted };
  }, [holidays]);

  const getTypeBadgeStyle = (hType: Holiday['type']) => {
    switch (hType) {
      case 'National':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40';
      case 'Gazetted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40';
      case 'Festival':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/40';
      case 'Restricted':
      case 'Optional':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { label: 'Today!', isUrgent: true };
    if (diffDays === 1) return { label: 'Tomorrow', isUrgent: true };
    if (diffDays > 1 && diffDays <= 30) return { label: `In ${diffDays} days`, isUrgent: false };
    if (diffDays < 0) return { label: 'Past', isUrgent: false };
    return { label: `In ${diffDays} days`, isUrgent: false };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Company Holiday Calendar
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                isHR
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              {isHR ? 'HR Administration Control' : 'View-Only Calendar'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Official gazetted, national, and restricted holidays calendar for SATYA Enterprise
          </p>
        </div>

        {/* HR Action Button */}
        {isHR ? (
          <button
            type="button"
            onClick={() => {
              setName('');
              setDate('');
              setDay('');
              setType('Gazetted');
              setDescription('');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Company Holiday</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>Managed by HR Department</span>
          </div>
        )}
      </div>

      {/* Permission Notice Banner */}
      <div
        className={`p-3.5 rounded-2xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isHR
            ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300'
            : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2">
          {isHR ? (
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <Lock className="h-4 w-4 text-slate-400 shrink-0" />
          )}
          <span>
            {isHR
              ? `HR Department Active (${currentUser.name}): You have administrative authorization to publish new company holidays, modify dates, or remove dates from the corporate calendar.`
              : 'Company holidays are scheduled and maintained exclusively by Human Resources (HR). Attendance calculations, biometric punch waivers, and leave deductions follow this schedule.'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
          <span>Total Holidays: <strong className="text-slate-900 dark:text-white">{holidays.length}</strong></span>
          <span>•</span>
          <span>Upcoming: <strong className="text-emerald-600 dark:text-emerald-400">{stats.upcoming}</strong></span>
        </div>
      </div>

      {/* Metric Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Holidays</span>
            <Calendar className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{stats.total}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Annual corporate calendar</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">National Days</span>
            <Flag className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400">{stats.national}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Mandatory national off</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Gazetted Holidays</span>
            <Palmtree className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.gazetted}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Official paid holidays</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Restricted / Festival</span>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-1 text-lg font-bold text-purple-600 dark:text-purple-400">{stats.restricted}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Optional &amp; festive off</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search holiday by name, date or day..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {(['All', 'National', 'Gazetted', 'Restricted', 'Festival'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setTypeFilter(filter)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition shrink-0 cursor-pointer ${
                typeFilter === filter
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Holidays List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {filteredHolidays.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Palmtree className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold">No holidays found</p>
            <p className="text-xs">
              {isHR
                ? 'Click "Add Company Holiday" above to publish a new date.'
                : 'No holidays match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredHolidays.map((h) => {
              const countdown = getDaysUntil(h.date);
              const isPast = countdown.label === 'Past';

              return (
                <div
                  key={h.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition text-xs group ${
                    isPast
                      ? 'border-slate-100 bg-slate-50/50 opacity-70 hover:opacity-100 dark:border-slate-800/60 dark:bg-slate-900/40'
                      : countdown.isUrgent
                      ? 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                      : 'border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                        h.type === 'National'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : h.type === 'Festival'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {h.type === 'National' ? (
                        <Flag className="h-4 w-4" />
                      ) : h.type === 'Festival' ? (
                        <PartyPopper className="h-4 w-4" />
                      ) : (
                        <Calendar className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {h.name}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${getTypeBadgeStyle(
                            h.type
                          )}`}
                        >
                          {h.type}
                        </span>
                        {!isPast && (
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                              countdown.isUrgent
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {countdown.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                        <span className="font-medium text-slate-600 dark:text-slate-300">{h.day}</span>
                        {h.description && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-xs">{h.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                        {h.date}
                      </span>
                    </div>

                    {/* HR Management Actions: Edit and Delete */}
                    {isHR && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingHoliday({ ...h })}
                          className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-white text-slate-500 hover:text-indigo-600 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition cursor-pointer"
                          title="Edit Holiday Details (HR Only)"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(h.id)}
                          className="p-1.5 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:hover:border-rose-900/40 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition cursor-pointer"
                          title="Remove Holiday (HR Only)"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD HOLIDAY MODAL (HR ONLY) */}
      {isAddModalOpen && isHR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-left animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Publish Company Holiday</h3>
                  <p className="text-[11px] text-slate-400">Human Resources Official Authorization</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mt-3.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                Quick Template Pick:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
                  >
                    + {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddHoliday} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Holiday Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali / Republic Day / Annual Foundation Day"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={handleDateChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Day of Week</label>
                  <input
                    type="text"
                    placeholder="e.g. Friday"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Holiday Classification</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Gazetted">Gazetted / Public Holiday (Mandatory Off)</option>
                  <option value="National">National Holiday (National Celebration)</option>
                  <option value="Restricted">Restricted Holiday (Optional Leave)</option>
                  <option value="Festival">Festival Celebration</option>
                  <option value="Optional">Optional / Floating Holiday</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Notes / Department Applicability (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Applicable across all pan-India branches"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95 cursor-pointer"
                >
                  Publish Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT HOLIDAY MODAL (HR ONLY) */}
      {editingHoliday && isHR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-indigo-200 bg-white p-6 shadow-2xl dark:border-indigo-900/60 dark:bg-slate-900 text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <Edit2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Edit Company Holiday</h3>
                  <p className="text-[11px] text-slate-400">Modify date or classification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingHoliday(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateHoliday} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Holiday Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingHoliday.name}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Date *</label>
                  <input
                    type="date"
                    required
                    value={editingHoliday.date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setEditingHoliday({
                        ...editingHoliday,
                        date: newDate,
                        day: calculateDayName(newDate)
                      });
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Day of Week</label>
                  <input
                    type="text"
                    value={editingHoliday.day}
                    onChange={(e) => setEditingHoliday({ ...editingHoliday, day: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Holiday Classification</label>
                <select
                  value={editingHoliday.type}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, type: e.target.value as any })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Gazetted">Gazetted / Public Holiday</option>
                  <option value="National">National Holiday</option>
                  <option value="Restricted">Restricted Holiday</option>
                  <option value="Festival">Festival Celebration</option>
                  <option value="Optional">Optional / Floating Holiday</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Notes / Department Applicability
                </label>
                <input
                  type="text"
                  value={editingHoliday.description || ''}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, description: e.target.value })}
                  placeholder="e.g. All branches closed"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingHoliday(null)}
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

      {/* CONFIRM DELETE MODAL (HR ONLY) */}
      {deleteConfirmId && isHR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-rose-200 bg-white p-5 shadow-2xl dark:border-rose-900/60 dark:bg-slate-900 text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Remove Holiday</h3>
                <p className="text-[11px] text-slate-400">HR Administrative Action</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to remove{' '}
              <strong>{holidays.find((h) => h.id === deleteConfirmId)?.name}</strong> from the official company calendar?
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteHoliday(deleteConfirmId);
                  setDeleteConfirmId(null);
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
