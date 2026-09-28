'use client';

import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';

export default function BookingsView() {
  const {
    bookings,
    payments,
    customers,
    recordPayment,
    setSelectedCustomer,
    setIsBookingModalOpen
  } = useCRM();

  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  // Record payment modal state
  const [activeBookingForPayment, setActiveBookingForPayment] = useState<Booking | null>(null);
  const [payAmount, setPayAmount] = useState<number>(10000);
  const [payMethod, setPayMethod] = useState<PaymentRecord['paymentMethod']>('UPI');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const filtered = bookings.filter((b) => {
    if (paymentFilter !== 'ALL' && b.paymentStatus !== paymentFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.companyName.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.services.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalValue = bookings.reduce((sum, b) => sum + b.expectedAmount, 0);
  const totalPaid = bookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalPending = bookings.reduce((sum, b) => sum + b.pendingAmount, 0);

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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customer Bookings & Orders</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dedicated sales ledger tracking Government scheme contracts, loans, and IT project deliverables ({filtered.length})
          </p>
        </div>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Customer Booking</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Contract Value</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(totalValue)}</p>
          <span className="text-[11px] text-slate-400 font-medium">{bookings.length} registered orders</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Paid / Realized</span>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">{formatCurrency(totalPaid)}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Cleared through accounts</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Pending Receivable</span>
          <p className="mt-2 text-2xl font-extrabold text-rose-600">{formatCurrency(totalPending)}</p>
          <span className="text-[11px] text-rose-500 font-medium">To be collected</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Booking #, Client, Services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:bg-white focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Paid">Paid in Full</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Pending">Payment Pending</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Dedicated Bookings Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-3">Customer & Company</th>
                <th className="py-3.5 px-3">Services</th>
                <th className="py-3.5 px-3">Salesperson</th>
                <th className="py-3.5 px-3">Booking Date</th>
                <th className="py-3.5 px-3 text-right">Total Value</th>
                <th className="py-3.5 px-3 text-right">Paid Amount</th>
                <th className="py-3.5 px-3 text-right">Pending Amount</th>
                <th className="py-3.5 px-3 text-center">Payment Status</th>
                <th className="py-3.5 px-3 text-center">Service Status</th>
                <th className="py-3.5 px-3 text-center">Docs Status</th>
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
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-indigo-600">
                      #{b.id}
                    </td>

                    <td className="py-3.5 px-3">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{b.customerName}</p>
                        <p className="text-[11px] text-slate-400">{b.companyName}</p>
                      </div>
                    </td>

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

                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                      {b.assignedSalesperson}
                    </td>

                    <td className="py-3.5 px-3 text-slate-500">
                      {formatDate(b.bookingDate)}
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(b.expectedAmount)}
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold text-emerald-600">
                      {formatCurrency(b.paidAmount)}
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold text-rose-600">
                      {formatCurrency(b.pendingAmount)}
                    </td>

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

                    <td className="py-3.5 px-3 text-center">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {b.serviceStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          b.documentsStatus === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {b.documentsStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.pendingAmount > 0 && (
                          <button
                            onClick={() => {
                              setActiveBookingForPayment(b);
                              setPayAmount(b.pendingAmount);
                            }}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                          >
                            + Pay
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const cust = customers.find((c) => c.id === b.customerId);
                            if (cust) setSelectedCustomer(cust);
                          }}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {activeBookingForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
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
                  <span className="font-bold">{formatCurrency(activeBookingForPayment.expectedAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Paid So Far</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(activeBookingForPayment.paidAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Current Pending</span>
                  <span className="font-bold text-rose-600">{formatCurrency(activeBookingForPayment.pendingAmount)}</span>
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
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs focus:bg-white dark:border-slate-700 dark:bg-slate-800"
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
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                >
                  Confirm & Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
