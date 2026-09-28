'use client';

import React, { useEffect, useState } from 'react';
import { useCRM } from '@/context/crm-context';
import {
  Search,
  X,
  Users2,
  BookmarkCheck,
  Building2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    customers,
    bookings,
    employees,
    setSelectedCustomer,
    setActiveView
  } = useCRM();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.companyName.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.servicesInterested.some((s) => s.toLowerCase().includes(q))
  );

  const filteredBookings = bookings.filter(
    (b) =>
      b.id.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.companyName.toLowerCase().includes(q) ||
      b.services.some((s) => s.toLowerCase().includes(q))
  );

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
  );

  const quickNav = [
    { label: 'Sales Pipeline (Kanban)', view: 'pipeline' },
    { label: 'Customer Bookings Ledger', view: 'bookings' },
    { label: 'Attendance Roster & Punches', view: 'attendance' },
    { label: 'Leave Management', view: 'leaves' },
    { label: 'User Management & Permissions', view: 'user-management' },
    { label: 'Custom Field Builder', view: 'custom-fields' },
    { label: 'Automation Rules Builder', view: 'automation' },
    { label: 'System Audit Logs', view: 'audit-logs' },
  ].filter((item) => item.label.toLowerCase().includes(q));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 pt-20 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search anything: Client, Scheme, Booking #, Phone, Employee..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden dark:text-white"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-800">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3 text-xs space-y-4">
          {/* Quick Navigations */}
          {quickNav.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Navigation
              </div>
              <div className="space-y-1 mt-1">
                {quickNav.slice(0, 4).map((nav) => (
                  <button
                    key={nav.view}
                    onClick={() => {
                      setActiveView(nav.view);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  >
                    <span>{nav.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers Results */}
          {filteredCustomers.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Customers & Leads ({filteredCustomers.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredCustomers.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="flex items-center justify-between rounded-xl p-2.5 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs dark:bg-indigo-950 dark:text-indigo-300">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {c.companyName} • {c.servicesInterested.join(', ')}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {c.leadStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookings Results */}
          {filteredBookings.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Bookings ({filteredBookings.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredBookings.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      const cust = customers.find((c) => c.id === b.customerId);
                      if (cust) setSelectedCustomer(cust);
                      setActiveView('bookings');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="flex items-center justify-between rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookmarkCheck className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          #{b.id} — {b.companyName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {b.services.join(', ')} • ₹{b.expectedAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">
                      {b.paymentStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employees Results */}
          {filteredEmployees.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Team Members ({filteredEmployees.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredEmployees.slice(0, 3).map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => {
                      setActiveView('employees');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="flex items-center justify-between rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={emp.avatar} alt={emp.name} className="h-6 w-6 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{emp.name}</p>
                        <p className="text-[10px] text-slate-500">{emp.designation} • {emp.department}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">{emp.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredCustomers.length === 0 && filteredBookings.length === 0 && quickNav.length === 0 && (
            <div className="py-8 text-center text-slate-400">
              No matching clients, bookings, or schemes found for &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
