'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/crm-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Booking, PaymentRecord } from '@/types/crm';
import {
  BookmarkCheck,
  Search,
  Plus,
  DollarSign,
  Receipt,
  FileCheck2,
  Calendar,
  X,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Copy,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  FileText,
  UserCheck
} from 'lucide-react';

export default function BookingsView() {
  const {
    bookings,
    payments,
    customers,
    recordPayment,
    setSelectedCustomer,
    setIsBookingModalOpen,
    currentUser
  } = useCRM();

  const [search, setSearch] = useState('');
  const [bookingIdSearch, setBookingIdSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  // Active view detail modal state
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  // Record payment modal state
  const [activeBookingForPayment, setActiveBookingForPayment] = useState<Booking | null>(null);
  const [payAmount, setPayAmount] = useState<number>(10000);
  const [payMethod, setPayMethod] = useState<PaymentRecord['paymentMethod']>('UPI');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isRM = currentUser.role === 'RM';
  const isBM = currentUser.role === 'BRANCH_MANAGER';
  const isTL = currentUser.role === 'TL';
  const isSales = currentUser.role === 'BDM' || currentUser.role === 'BDE';

  // Check if current user generated the booking
  const isBookingCreator = (b: Booking) => {
    return (
      isSuperAdmin ||
      currentUser.id === b.createdById ||
      currentUser.name === b.createdByName ||
      currentUser.name === b.assignedSalesperson ||
      currentUser.id === b.assignedSalespersonId
    );
  };

  // Mask client email for BM and non-creators
  const getMaskedEmail = (b: Booking) => {
    const email = b.clientEmail || customers.find((c) => c.id === b.customerId)?.email;
    if (!email) return 'N/A';
    if (isBookingCreator(b)) return email;

    const parts = email.split('@');
    if (parts.length === 2) {
      const name = parts[0];
      const domain = parts[1];
      const masked = name.length > 2 ? `${name[0]}••••${name[name.length - 1]}` : `${name[0]}••••`;
      return `${masked}@${domain}`;
    }
    return '[Protected - Creator Only]';
  };

  // Mask client phone for BM and non-creators
  const getMaskedPhone = (b: Booking) => {
    const phone = b.clientMobile || customers.find((c) => c.id === b.customerId)?.mobile;
    if (!phone) return 'N/A';
    if (isBookingCreator(b)) return phone;

    const clean = phone.replace(/\s+/g, '');
    if (clean.length >= 4) {
      return `+91 ••••• ••${clean.slice(-4)}`;
    }
    return '+91 ••••• •••••';
  };

  // Role-based visibility filtering
  const visibleBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (isSuperAdmin || isRM) return true;
      if (isBM) {
        // BM sees all bookings of their branch
        return true;
      }
      if (isTL) {
        // TL sees all bookings in their jurisdiction
        return true;
      }
      if (isSales) {
        // BDE and BDM only see their OWN generated bookings!
        return (
          b.assignedSalesperson === currentUser.name ||
          b.assignedSalespersonId === currentUser.id ||
          b.createdById === currentUser.id ||
          b.createdByName === currentUser.name
        );
      }
      return true;
    });
  }, [bookings, currentUser, isSuperAdmin, isRM, isBM, isTL, isSales]);

  // Search and payment status filter
  const filtered = useMemo(() => {
    return visibleBookings.filter((b) => {
      if (paymentFilter !== 'ALL' && b.paymentStatus !== paymentFilter) return false;
      if (bookingIdSearch.trim()) {
        const bid = bookingIdSearch.toLowerCase().replace('#', '').trim();
        if (!b.id.toLowerCase().includes(bid)) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          b.id.toLowerCase().includes(q) ||
          b.companyName.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.assignedSalesperson.toLowerCase().includes(q) ||
          b.services.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [visibleBookings, paymentFilter, bookingIdSearch, search]);

  const totalValue = filtered.reduce((sum, b) => sum + b.expectedAmount, 0);
  const totalPaid = filtered.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalPending = filtered.reduce((sum, b) => sum + b.pendingAmount, 0);

  const copyBookingId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBookingForPayment) return;

    recordPayment({
      bookingId: activeBookingForPayment.id,
      amount: Number(payAmount),
      method: payMethod,
      transactionReference: payRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: payNotes || 'Milestone payment'
    });

    setActiveBookingForPayment(null);
    setPayAmount(10000);
    setPayRef('');
    setPayNotes('');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customer Bookings & Orders</h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                isBM
                  ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300'
                  : isSales
                  ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300'
              }`}
            >
              {isBM
                ? 'Branch Manager View (Tracking by Booking ID • Contact Masked)'
                : isSales
                ? 'My Generated Sales Bookings'
                : 'Enterprise Sales & Revenue Ledger'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dedicated sales ledger tracking Government scheme contracts, loans, and IT project deliverables ({filtered.length})
          </p>
        </div>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Customer Booking</span>
        </button>
      </div>

      {/* Security Privacy Notice Banner */}
      <div
        className={`p-3.5 rounded-2xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isBM
            ? 'bg-purple-50/70 border-purple-200 text-purple-900 dark:bg-purple-950/30 dark:border-purple-900/50 dark:text-purple-300'
            : isSales
            ? 'bg-teal-50/70 border-teal-200 text-teal-900 dark:bg-teal-950/30 dark:border-teal-900/50 dark:text-teal-300'
            : 'bg-indigo-50/70 border-indigo-200 text-indigo-900 dark:bg-indigo-950/30 dark:border-indigo-900/50 dark:text-indigo-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {isBM ? (
            <Lock className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
          <span>
            {isBM
              ? `Branch Manager Security: You can monitor all company bookings and verify orders using the Booking ID (#BK-XXXX). Client email IDs and phone numbers are masked to safeguard client privacy.`
              : isSales
              ? `Sales Representative Portal (${currentUser.name}): You have full access to client contact details for bookings you generated. Other reps' bookings are hidden.`
              : `Enterprise Oversight (${currentUser.name}): Full corporate view of all bookings, team targets, and revenue realizations across branches.`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
          <span>Total Bookings: <strong className="text-slate-900 dark:text-white">{filtered.length}</strong></span>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Booked Value</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalValue)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Across {filtered.length} visible contracts</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600">Advance Paid</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-emerald-600 font-mono">
            {formatCurrency(totalPaid)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Realized into accounts</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600">Pending Milestone Balance</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-rose-600 font-mono">
            {formatCurrency(totalPending)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">To be collected upon delivery</p>
        </div>
      </div>

      {/* Filter and Search Bar with Dedicated Booking ID Input */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Dedicated Booking ID Search (For BM and staff) */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-indigo-500" />
            <input
              type="text"
              placeholder="Search by Booking ID (e.g. 1001)..."
              value={bookingIdSearch}
              onChange={(e) => setBookingIdSearch(e.target.value)}
              className="h-8.5 w-full rounded-xl border border-indigo-200 bg-indigo-50/40 pl-9 pr-3 text-xs font-mono text-slate-900 placeholder-indigo-400 focus:bg-white focus:border-indigo-500 focus:outline-hidden dark:border-indigo-900/60 dark:bg-indigo-950/20 dark:text-white"
            />
          </div>

          {/* General Company & Services Search */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Company, Client, Services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8.5 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:bg-white focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Paid">Paid in Full</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Pending">Payment Pending</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-3">Company &amp; Client</th>
                <th className="py-3.5 px-3">Client Contact</th>
                <th className="py-3.5 px-3">Services</th>
                <th className="py-3.5 px-3">Salesperson</th>
                <th className="py-3.5 px-3">Booking Date</th>
                <th className="py-3.5 px-3 text-right">Total Value</th>
                <th className="py-3.5 px-3 text-right">Paid</th>
                <th className="py-3.5 px-3 text-right">Pending</th>
                <th className="py-3.5 px-3 text-center">Payment Status</th>
                <th className="py-3.5 px-3 text-center">Service Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    No bookings found matching filters
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const creator = isBookingCreator(b);
                  const maskedEmail = getMaskedEmail(b);
                  const maskedPhone = getMaskedPhone(b);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      {/* Booking ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          <span>#{b.id}</span>
                          <button
                            type="button"
                            onClick={() => copyBookingId(b.id)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            title="Copy Booking ID"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </td>

                      {/* Company & Client Name */}
                      <td className="py-3.5 px-3">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{b.companyName}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 pl-5">{b.customerName}</p>
                        </div>
                      </td>

                      {/* Contact Column (Masked for BM, Unmasked for Creator) */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                            {creator ? (
                              <span className="text-slate-700 dark:text-slate-300 font-mono">
                                {maskedEmail}
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-slate-400 italic font-mono text-[10px]"
                                title="Client email protected under Sales Integrity Policy"
                              >
                                <Lock className="h-2.5 w-2.5 text-purple-500" />
                                <span>{maskedEmail}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                            {creator ? (
                              <span className="text-slate-700 dark:text-slate-300 font-mono">
                                {maskedPhone}
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-slate-400 italic font-mono text-[10px]"
                                title="Client phone protected under Sales Integrity Policy"
                              >
                                <Lock className="h-2.5 w-2.5 text-purple-500" />
                                <span>{maskedPhone}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Services */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {b.services.map((s) => (
                            <span
                              key={s}
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Salesperson */}
                      <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">{b.assignedSalesperson}</span>
                      </td>

                      {/* Booking Date */}
                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                        {formatDate(b.bookingDate)}
                      </td>

                      {/* Total Value */}
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                        {formatCurrency(b.expectedAmount)}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-3.5 px-3 text-right font-bold text-emerald-600 font-mono">
                        {formatCurrency(b.paidAmount)}
                      </td>

                      {/* Pending Amount */}
                      <td className="py-3.5 px-3 text-right font-bold text-rose-600 font-mono">
                        {formatCurrency(b.pendingAmount)}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            b.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : b.paymentStatus === 'Partially Paid'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {b.paymentStatus}
                        </span>
                      </td>

                      {/* Service Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {b.serviceStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.pendingAmount > 0 && (
                            <button
                              onClick={() => {
                                setActiveBookingForPayment(b);
                                setPayAmount(b.pendingAmount);
                              }}
                              className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer"
                            >
                              + Pay
                            </button>
                          )}
                          <button
                            onClick={() => setDetailBooking(b)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOOKING DETAILS MODAL */}
      {detailBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <BookmarkCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Booking Order #{detailBooking.id}
                  </h3>
                  <p className="text-[11px] text-slate-400">Recorded on {formatDate(detailBooking.bookingDate)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailBooking(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              {/* Company & Client Details */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">Company Name:</span>
                  <strong className="text-slate-900 dark:text-white text-sm">{detailBooking.companyName}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Authorized Contact:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{detailBooking.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Client Email:</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    {!isBookingCreator(detailBooking) && <Lock className="h-3 w-3 text-purple-500" />}
                    <span>{getMaskedEmail(detailBooking)}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Client Phone:</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    {!isBookingCreator(detailBooking) && <Lock className="h-3 w-3 text-purple-500" />}
                    <span>{getMaskedPhone(detailBooking)}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Sales Representative:</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">{detailBooking.assignedSalesperson}</span>
                </div>
              </div>

              {/* Financial Status */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Amount</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                    {formatCurrency(detailBooking.expectedAmount)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                  <span className="text-[10px] text-emerald-600 block uppercase font-bold">Advance Paid</span>
                  <span className="font-bold text-emerald-600 font-mono text-xs">
                    {formatCurrency(detailBooking.paidAmount)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
                  <span className="text-[10px] text-rose-600 block uppercase font-bold">Pending Balance</span>
                  <span className="font-bold text-rose-600 font-mono text-xs">
                    {formatCurrency(detailBooking.pendingAmount)}
                  </span>
                </div>
              </div>

              {/* Services List */}
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Booked Services ({detailBooking.services.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {detailBooking.services.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDetailBooking(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
                {detailBooking.pendingAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const b = detailBooking;
                      setDetailBooking(null);
                      setActiveBookingForPayment(b);
                      setPayAmount(b.pendingAmount);
                    }}
                    className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95 cursor-pointer"
                  >
                    + Record Milestone Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {activeBookingForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Record Payment: #{activeBookingForPayment.id}
                </h3>
                <p className="text-xs text-slate-400">{activeBookingForPayment.companyName}</p>
              </div>
              <button
                onClick={() => setActiveBookingForPayment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 flex justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Total Deal</span>
                  <span className="font-bold font-mono">{formatCurrency(activeBookingForPayment.expectedAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Paid So Far</span>
                  <span className="font-bold text-emerald-600 font-mono">{formatCurrency(activeBookingForPayment.paidAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Current Pending</span>
                  <span className="font-bold text-rose-600 font-mono">{formatCurrency(activeBookingForPayment.pendingAmount)}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Amount Being Paid (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={activeBookingForPayment.pendingAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-bold font-mono text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, Paytm, BHIM)</option>
                  <option value="NEFT">NEFT Direct Bank Transfer</option>
                  <option value="RTGS">RTGS Real-Time Transfer</option>
                  <option value="Cheque">Bank Cheque</option>
                  <option value="Cash">Cash Receipt</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Transaction Reference / UTR *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UPI/626291048123 or Bank UTR"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs focus:bg-white dark:border-slate-700 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Notes / Milestone</label>
                <input
                  type="text"
                  placeholder="e.g. DIC submission tranche / Website advance"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveBookingForPayment(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95 cursor-pointer"
                >
                  Confirm &amp; Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
