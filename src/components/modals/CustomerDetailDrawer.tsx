'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  X,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plus,
  Landmark,
  Coins,
  Code2,
  Check,
  XCircle,
  FileCheck2,
  MessageSquare
} from 'lucide-react';
import { LeadStatus } from '@/types/crm';

export default function CustomerDetailDrawer() {
  const {
    selectedCustomer,
    setSelectedCustomer,
    updateCustomerStatus,
    bookings,
    payments,
    documents,
    followups,
    tasks,
    updateDocumentStatus,
    addFollowUp,
    completeFollowUp,
    recordPayment,
    currentUser
  } = useCRM();

  const [activeTab, setActiveTab] = useState<
    'details' | 'requirements' | 'documents' | 'payments' | 'followups' | 'tasks' | 'notes' | 'timeline'
  >('details');

  // Quick action states
  const [newNote, setNewNote] = useState('');
  const [notesList, setNotesList] = useState<string[]>([
    'Customer interested in combining PMEGP capital subsidy with commercial equipment loan.',
    'Promoter documents collected via email. CA provisional balance sheet awaited.'
  ]);

  // Payment quick entry
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(25000);
  const [payMethod, setPayMethod] = useState<'UPI' | 'NEFT' | 'RTGS' | 'Cheque' | 'Cash'>('UPI');
  const [payRef, setPayRef] = useState('');

  // Follow-up quick entry
  const [isAddingFollowup, setIsAddingFollowup] = useState(false);
  const [followupType, setFollowupType] = useState<any>('Call');
  const [followupDate, setFollowupDate] = useState(new Date().toISOString().split('T')[0]);
  const [followupTime, setFollowupTime] = useState('03:00 PM');
  const [followupNote, setFollowupNote] = useState('');

  if (!selectedCustomer) return null;

  const customerBookings = bookings.filter((b) => b.customerId === selectedCustomer.id);
  const customerPayments = payments.filter((p) =>
    customerBookings.some((b) => b.id === p.bookingId)
  );
  const customerDocuments = documents.filter((d) => d.customerId === selectedCustomer.id);
  const customerFollowups = followups.filter((f) => f.customerId === selectedCustomer.id);
  const customerTasks = tasks.filter((t) => t.customerId === selectedCustomer.id);

  const totalBookingValue = customerBookings.reduce((sum, b) => sum + b.expectedAmount, selectedCustomer.expectedValue || 0);
  const totalPaid = customerBookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalPending = Math.max(0, totalBookingValue - totalPaid);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotesList([newNote, ...notesList]);
    setNewNote('');
  };

  const handleQuickPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerBookings.length === 0) return;
    const targetBooking = customerBookings[0];
    recordPayment({
      bookingId: targetBooking.id,
      amount: Number(payAmount),
      method: payMethod,
      transactionReference: payRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: 'Recorded from customer 360 profile'
    });
    setIsRecordingPayment(false);
  };

  const handleQuickFollowupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFollowUp({
      customerId: selectedCustomer.id,
      customerName: `${selectedCustomer.name} (${selectedCustomer.companyName})`,
      service: selectedCustomer.servicesInterested[0] || 'General Inquiry',
      date: followupDate,
      time: followupTime,
      type: followupType,
      assignedEmployee: selectedCustomer.assignedSalespersonName,
      notes: followupNote || 'Follow-up discussion',
      status: 'Pending',
      priority: 'High'
    });
    setIsAddingFollowup(false);
    setFollowupNote('');
  };

  const statusList: LeadStatus[] = [
    'New Lead', 'Contacted', 'Requirement Collected', 'Eligibility Checking',
    'Documents Pending', 'Documents Received', 'Under Processing', 'Proposal Sent',
    'Payment Pending', 'Service Booked', 'In Progress', 'Completed', 'Rejected', 'Lost'
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="border-b border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-950/30">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedCustomer.name}
                  </h2>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {selectedCustomer.customerType}
                  </span>
                </div>
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {selectedCustomer.companyName}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* KPI Bar */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 rounded-xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Lead Status</span>
              <select
                value={selectedCustomer.leadStatus}
                onChange={(e) => updateCustomerStatus(selectedCustomer.id, e.target.value as LeadStatus)}
                className="mt-0.5 font-bold text-indigo-600 bg-transparent border-0 p-0 text-xs focus:ring-0 cursor-pointer"
              >
                {statusList.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned To</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {selectedCustomer.assignedSalespersonName}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Value</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(totalBookingValue)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Pending Amount</span>
              <span className="font-bold text-rose-600">
                {formatCurrency(totalPending)}
              </span>
            </div>
          </div>

          {/* Services Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500">Services:</span>
            {selectedCustomer.servicesInterested.map((srv) => (
              <span
                key={srv}
                className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60"
              >
                {srv}
              </span>
            ))}
          </div>

          {/* Drawer Tabs */}
          <div className="mt-4 flex gap-2 overflow-x-auto border-b border-slate-200 pb-1 text-xs font-semibold dark:border-slate-800">
            {[
              { id: 'details', label: 'Details' },
              { id: 'requirements', label: 'Service Specs' },
              { id: 'documents', label: `Documents (${customerDocuments.length})` },
              { id: 'payments', label: `Payments (${customerPayments.length})` },
              { id: 'followups', label: `Follow-ups (${customerFollowups.length})` },
              { id: 'tasks', label: `Tasks (${customerTasks.length})` },
              { id: 'notes', label: 'Notes' },
              { id: 'timeline', label: 'Activity' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs space-y-6">
          {/* TAB: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>Mobile: <strong className="text-slate-800 dark:text-slate-200">{selectedCustomer.mobile}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                    <span>WhatsApp: <strong className="text-slate-800 dark:text-slate-200">{selectedCustomer.whatsapp}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>Email: <strong className="text-slate-800 dark:text-slate-200">{selectedCustomer.email}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>Location: <strong className="text-slate-800 dark:text-slate-200">{selectedCustomer.city}, {selectedCustomer.state} ({selectedCustomer.pinCode})</strong></span>
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                  Business Entity Profile
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Structure</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.businessDetails.businessStructure}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Vintage</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.businessDetails.vintageYears} Years</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Turnover</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.businessDetails.annualTurnover}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.businessDetails.currentStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Employees</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.businessDetails.employeeCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Industry</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.businessDetails.industry}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SERVICE REQUIREMENTS */}
          {activeTab === 'requirements' && (
            <div className="space-y-4">
              {/* Scheme/Grant Specs */}
              {selectedCustomer.grantSchemeDetails && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300">
                    <Landmark className="h-4 w-4" />
                    <span>Government Scheme / Grant Specifications</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Scheme</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedCustomer.grantSchemeDetails.schemeInterestedIn}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Type</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedCustomer.grantSchemeDetails.schemeType} ({selectedCustomer.grantSchemeDetails.state})</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Funding Required</span>
                      <strong className="text-indigo-600">{formatCurrency(selectedCustomer.grantSchemeDetails.requiredFundingAmount)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Expected Grant / Subsidy</span>
                      <strong className="text-emerald-600">{formatCurrency(selectedCustomer.grantSchemeDetails.expectedGrantAmount)}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px]">Purpose</span>
                      <p className="text-slate-600 dark:text-slate-400">{selectedCustomer.grantSchemeDetails.fundingPurpose}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loan Specs */}
              {selectedCustomer.loanDetails && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
                    <Coins className="h-4 w-4" />
                    <span>Business Loan Requirement</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Loan Type</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedCustomer.loanDetails.loanType}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Required Amount</span>
                      <strong className="text-amber-600">{formatCurrency(selectedCustomer.loanDetails.requiredLoanAmount)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">CIBIL Info</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedCustomer.loanDetails.cibilScore}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Collateral</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedCustomer.loanDetails.collateralAvailable}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px]">Purpose</span>
                      <p className="text-slate-600 dark:text-slate-400">{selectedCustomer.loanDetails.purposeOfLoan}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* IT Specs */}
              {selectedCustomer.itDetails && (
                <div className="rounded-xl border border-sky-200 bg-sky-50/30 p-4 dark:border-sky-900/40 dark:bg-sky-950/20 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300">
                    <Code2 className="h-4 w-4" />
                    <span>IT & Software Service Specifications</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Service</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedCustomer.itDetails.serviceRequired}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Budget</span>
                      <strong className="text-sky-600">{formatCurrency(selectedCustomer.itDetails.estimatedBudget)}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px]">Features</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCustomer.itDetails.requiredFeatures.map((f) => (
                          <span key={f} className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded text-[10px]">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white">Document Verification Checklist</h4>
                <span className="text-slate-400 text-[11px]">{customerDocuments.length} items</span>
              </div>

              {customerDocuments.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">No documents requested yet.</p>
              ) : (
                <div className="space-y-2">
                  {customerDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{doc.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>Category: {doc.category}</span>
                            {doc.fileSize && <span>• {doc.fileSize}</span>}
                            {doc.verifiedBy && <span>• Verified by {doc.verifiedBy}</span>}
                            {doc.rejectionReason && (
                              <span className="text-rose-500 font-medium">• {doc.rejectionReason}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            doc.status === 'Verified'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : doc.status === 'Uploaded'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : doc.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {doc.status}
                        </span>

                        {/* Quick Action Buttons for verification */}
                        {doc.status !== 'Verified' && (
                          <button
                            onClick={() => updateDocumentStatus(doc.id, 'Verified')}
                            title="Mark Verified"
                            className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {doc.status !== 'Rejected' && (
                          <button
                            onClick={() => {
                              const reason = prompt('Rejection reason:');
                              if (reason) updateDocumentStatus(doc.id, 'Rejected', reason);
                            }}
                            title="Reject Document"
                            className="rounded-lg p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Payment Ledger</h4>
                  <p className="text-[11px] text-slate-500">
                    Paid: <strong className="text-emerald-600">{formatCurrency(totalPaid)}</strong> / Pending: <strong className="text-rose-600">{formatCurrency(totalPending)}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setIsRecordingPayment(true)}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Record Payment</span>
                </button>
              </div>

              {/* Record Payment Form */}
              {isRecordingPayment && (
                <form
                  onSubmit={handleQuickPaymentSubmit}
                  className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-3"
                >
                  <h5 className="font-bold text-emerald-800 dark:text-emerald-300">Record New Payment</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Amount (₹)</label>
                      <input
                        type="number"
                        required
                        value={payAmount}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Payment Method</label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value as any)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                      >
                        <option value="UPI">UPI</option>
                        <option value="NEFT">NEFT</option>
                        <option value="RTGS">RTGS</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Transaction Reference / UTR</label>
                      <input
                        type="text"
                        placeholder="e.g. UPI/626291048123"
                        value={payRef}
                        onChange={(e) => setPayRef(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRecordingPayment(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Save Payment
                    </button>
                  </div>
                </form>
              )}

              {/* Payments list */}
              {customerPayments.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">No payment transactions recorded.</p>
              ) : (
                <div className="space-y-2">
                  {customerPayments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div>
                        <p className="font-bold text-emerald-600">{formatCurrency(p.amount)}</p>
                        <p className="text-[10px] text-slate-400">
                          {p.paymentMethod} • Ref: {p.transactionReference} • {formatDate(p.paymentDate)}
                        </p>
                        {p.notes && <p className="text-[10px] text-slate-500 mt-0.5">{p.notes}</p>}
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: FOLLOW-UPS */}
          {activeTab === 'followups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white">Scheduled Follow-ups</h4>
                <button
                  onClick={() => setIsAddingFollowup(true)}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Schedule Follow-up</span>
                </button>
              </div>

              {/* Quick schedule form */}
              {isAddingFollowup && (
                <form
                  onSubmit={handleQuickFollowupSubmit}
                  className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-3"
                >
                  <h5 className="font-bold text-indigo-900 dark:text-indigo-300">New Follow-up</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Type</label>
                      <select
                        value={followupType}
                        onChange={(e) => setFollowupType(e.target.value as any)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                      >
                        <option value="Call">Call</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Email">Email</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Document Collection">Document Collection</option>
                        <option value="Payment Follow-up">Payment Follow-up</option>
                        <option value="Eligibility Follow-up">Eligibility Follow-up</option>
                        <option value="Loan Follow-up">Loan Follow-up</option>
                        <option value="IT Requirement Meeting">IT Requirement Meeting</option>
                        <option value="Demo">Demo</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Date & Time</label>
                      <div className="flex gap-1">
                        <input
                          type="date"
                          value={followupDate}
                          onChange={(e) => setFollowupDate(e.target.value)}
                          className="w-1/2 rounded-lg border border-slate-200 bg-white p-1 text-[11px] dark:border-slate-700 dark:bg-slate-900"
                        />
                        <input
                          type="text"
                          value={followupTime}
                          onChange={(e) => setFollowupTime(e.target.value)}
                          className="w-1/2 rounded-lg border border-slate-200 bg-white p-1 text-[11px] dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Agenda / Notes</label>
                      <input
                        type="text"
                        placeholder="Details of follow-up"
                        value={followupNote}
                        onChange={(e) => setFollowupNote(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingFollowup(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      Schedule
                    </button>
                  </div>
                </form>
              )}

              {/* Followups list */}
              {customerFollowups.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">No scheduled follow-ups.</p>
              ) : (
                <div className="space-y-2">
                  {customerFollowups.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">{f.type}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {formatDate(f.date)} at {f.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{f.notes}</p>
                      </div>

                      {f.status === 'Pending' ? (
                        <button
                          onClick={() => completeFollowUp(f.id)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                        >
                          Mark Done
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-600">✓ Done</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Internal Tasks</h4>
              {customerTasks.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">No tasks linked to this client.</p>
              ) : (
                customerTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{t.title}</p>
                      <p className="text-[10px] text-slate-400">
                        Assigned to {t.assignedTo} • Due {formatDate(t.dueDate)} • {t.priority} Priority
                      </p>
                    </div>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        t.status === 'Done'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add confidential customer note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Post Note
                </button>
              </form>

              <div className="space-y-2">
                {notesList.map((note, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <p className="text-slate-700 dark:text-slate-300">{note}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Logged by {currentUser.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="relative border-l-2 border-slate-200 pl-4 space-y-4 dark:border-slate-700">
              <div className="relative">
                <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                <p className="font-semibold text-slate-900 dark:text-white">Customer Created & Requirement Logged</p>
                <p className="text-[10px] text-slate-400">{formatDate(selectedCustomer.createdAt)}</p>
              </div>

              {customerPayments.map((p) => (
                <div key={p.id} className="relative">
                  <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
                  <p className="font-semibold text-slate-900 dark:text-white">Payment Received: {formatCurrency(p.amount)}</p>
                  <p className="text-[10px] text-slate-400">{formatDate(p.paymentDate)} via {p.paymentMethod}</p>
                </div>
              ))}

              <div className="relative">
                <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-400 ring-4 ring-white dark:ring-slate-900" />
                <p className="font-semibold text-slate-900 dark:text-white">Lead Status: {selectedCustomer.leadStatus}</p>
                <p className="text-[10px] text-slate-400">Current active state in pipeline</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
