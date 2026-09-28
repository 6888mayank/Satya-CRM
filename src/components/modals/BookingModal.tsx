'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { ServiceCategory } from '@/types/crm';
import {
  SERVICE_CATEGORIES,
  INDIAN_STATES,
  BUSINESS_STRUCTURES,
  LEAD_SOURCES,
  DEFAULT_GOVT_DOCUMENTS,
  DEFAULT_IT_DOCUMENTS
} from '@/lib/constants';
import {
  X,
  Landmark,
  Award,
  Coins,
  Code2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileCheck2,
  Receipt,
  User,
  Building
} from 'lucide-react';

export default function BookingModal() {
  const { isBookingModalOpen, setIsBookingModalOpen, addCustomerBooking, currentUser, employees } = useCRM();

  // Wizard steps: 1: Categories & Services, 2: Customer Info, 3: Business Info, 4: Requirements, 5: Documents & Financials
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Selected categories and individual service tags
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>(['GOVERNMENT_SCHEMES']);
  const [selectedServices, setSelectedServices] = useState<string[]>(['PMEGP Scheme Assistance']);

  // Step 2: Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    companyName: '',
    mobile: '',
    whatsapp: '',
    email: '',
    city: '',
    state: 'Maharashtra',
    pinCode: '',
    businessType: 'Manufacturing',
    businessCategory: 'Engineering & Industrial Tools',
    customerType: 'New' as 'New' | 'Existing' | 'Enterprise' | 'Startup',
    customerSource: 'Website' as const,
    assignedSalespersonId: currentUser.id,
    assignedSalespersonName: currentUser.name
  });

  // Step 3: Business Information
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    businessStructure: 'Private Limited' as const,
    vintageYears: 3,
    annualTurnover: '₹2.5 Crore',
    currentStatus: 'Profitable' as const,
    employeeCount: 15,
    industry: 'Engineering & Manufacturing',
    businessLocation: '',
    existingBusiness: true
  });

  // Step 4A: Government Scheme / Grant Requirements
  const [grantSchemeReq, setGrantSchemeReq] = useState({
    schemeInterestedIn: 'PMEGP Scheme Assistance',
    schemeType: 'Central' as 'Central' | 'State',
    state: 'Maharashtra',
    fundingPurpose: 'Purchase of new automated machinery and shed expansion',
    requiredFundingAmount: 5000000,
    expectedGrantAmount: 1750000,
    businessActivity: 'Precision Engineering & Tooling',
    businessStage: 'Existing Business' as const,
    eligibilityStatus: 'Eligible' as const,
    documentsAvailable: ['PAN', 'Aadhaar', 'GST Certificate', 'Udyam Certificate', '3-Yr ITR'],
    customerRequirement: 'Assistance with Project Report preparation, online portal filing and nodal bank coordination.',
    additionalNotes: 'Candidate is eligible for special category 35% subsidy rate.'
  });

  // Step 4B: Business Loan Requirements
  const [loanReq, setLoanReq] = useState({
    loanType: 'Working Capital Loan / Cash Credit',
    requiredLoanAmount: 2500000,
    purposeOfLoan: 'Raw material procurement and working capital cycle support',
    businessTurnover: '₹2.5 Crore',
    monthlyRevenue: '₹22 Lakhs',
    existingLoans: 'None / Clean track',
    existingEMI: '₹0',
    cibilScore: '750+',
    collateralAvailable: 'Industrial Factory Shed',
    businessVintage: '3 Years',
    bankingRelationship: 'State Bank of India',
    preferredBank: 'State Bank of India',
    loanUrgency: 'Within 15 Days' as const,
    requiredTenure: '36 Months',
    additionalRequirements: 'Prefer CGTMSE collateral-free guarantee cover if applicable.'
  });

  // Step 4C: IT Service Requirements
  const [itReq, setItReq] = useState({
    serviceRequired: 'Corporate Website Development',
    projectType: 'New Project' as const,
    businessRequirement: 'Lead generation website with product catalog and RFQ quotation form.',
    currentWebsite: '',
    existingSoftware: '',
    requiredFeatures: ['Product Showcase', 'WhatsApp Inquiries', 'Mobile Responsive', 'Admin CMS'],
    estimatedBudget: 60000,
    expectedDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    technologyPreference: 'Next.js, Tailwind CSS, TypeScript',
    domainAvailable: true,
    hostingAvailable: false,
    designRequired: true,
    maintenanceRequired: true,
    referenceWebsite: 'https://example-industry.com',
    additionalRequirements: 'Fast delivery needed for upcoming trade expo.'
  });

  // Step 5: Document checklist selection & Financials
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>(DEFAULT_GOVT_DOCUMENTS.slice(0, 6));
  const [expectedAmount, setExpectedAmount] = useState<number>(75000);
  const [advanceAmount, setAdvanceAmount] = useState<number>(25000);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NEFT' | 'RTGS' | 'Cheque' | 'Cash'>('UPI');
  const [transactionRef, setTransactionRef] = useState<string>('');

  if (!isBookingModalOpen) return null;

  const toggleCategory = (catId: ServiceCategory) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length === 1) return; // keep at least one
      setSelectedCategories(selectedCategories.filter((c) => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const toggleService = (srv: string) => {
    if (selectedServices.includes(srv)) {
      if (selectedServices.length === 1) return;
      setSelectedServices(selectedServices.filter((s) => s !== srv));
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const toggleDocument = (doc: string) => {
    if (selectedDocuments.includes(doc)) {
      setSelectedDocuments(selectedDocuments.filter((d) => d !== doc));
    } else {
      setSelectedDocuments([...selectedDocuments, doc]);
    }
  };

  const hasGovt = selectedCategories.includes('GOVERNMENT_SCHEMES') || selectedCategories.includes('GOVERNMENT_GRANTS');
  const hasLoan = selectedCategories.includes('BUSINESS_LOANS');
  const hasIT = selectedCategories.includes('IT_SERVICES');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addCustomerBooking({
      customer: {
        name: customerInfo.name || 'Client',
        companyName: customerInfo.companyName || customerInfo.name || 'Company',
        mobile: customerInfo.mobile,
        whatsapp: customerInfo.whatsapp || customerInfo.mobile,
        email: customerInfo.email,
        city: customerInfo.city,
        state: customerInfo.state,
        pinCode: customerInfo.pinCode,
        businessType: customerInfo.businessType,
        businessCategory: customerInfo.businessCategory,
        customerType: customerInfo.customerType,
        customerSource: customerInfo.customerSource,
        assignedSalespersonId: customerInfo.assignedSalespersonId,
        assignedSalespersonName: customerInfo.assignedSalespersonName,
        businessDetails: {
          businessName: businessInfo.businessName || customerInfo.companyName || 'Business',
          businessStructure: businessInfo.businessStructure,
          vintageYears: Number(businessInfo.vintageYears),
          annualTurnover: businessInfo.annualTurnover,
          currentStatus: businessInfo.currentStatus,
          employeeCount: Number(businessInfo.employeeCount),
          industry: businessInfo.industry,
          businessLocation: businessInfo.businessLocation || customerInfo.city,
          existingBusiness: businessInfo.existingBusiness
        }
      },
      services: selectedServices,
      categories: selectedCategories,
      grantDetails: hasGovt ? grantSchemeReq : undefined,
      loanDetails: hasLoan ? loanReq : undefined,
      itDetails: hasIT ? itReq : undefined,
      documents: selectedDocuments,
      expectedAmount: Number(expectedAmount) || 0,
      advanceAmount: Number(advanceAmount) || 0,
      paymentMethod,
      transactionRef: transactionRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`
    });

    setIsBookingModalOpen(false);
    setCurrentStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Official Booking Engine
              </span>
              <span className="text-xs text-slate-400">Step {currentStep} of 5</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Create New Customer Booking
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Government Schemes, Grants, Business Loans & IT Service Requirements
            </p>
          </div>
          <button
            onClick={() => setIsBookingModalOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-2.5 text-xs font-semibold dark:border-slate-800/80 dark:bg-slate-950/40">
          {[
            { step: 1, label: 'Service Category' },
            { step: 2, label: 'Customer Info' },
            { step: 3, label: 'Business Info' },
            { step: 4, label: 'Requirements' },
            { step: 5, label: 'Documents & Payment' },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`flex items-center gap-2 transition ${
                currentStep === s.step
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : currentStep > s.step
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                  currentStep === s.step
                    ? 'bg-indigo-600 text-white'
                    : currentStep > s.step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {currentStep > s.step ? '✓' : s.step}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body / Steps */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: SERVICE CATEGORY & SERVICES */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  1. Select Service Categories (Multiple allowed)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customers frequently purchase both Government/Loan assistance and Technology services together.
                </p>
              </div>

              {/* Large Visual Category Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SERVICE_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id as ServiceCategory);
                  const Icon =
                    cat.id === 'GOVERNMENT_SCHEMES'
                      ? Landmark
                      : cat.id === 'GOVERNMENT_GRANTS'
                      ? Award
                      : cat.id === 'BUSINESS_LOANS'
                      ? Coins
                      : Code2;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id as ServiceCategory)}
                      className={`group relative cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-900 dark:text-white">{cat.name}</h5>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                              {cat.description}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-4 w-4" />}
                        </div>
                      </div>

                      {/* Services Pills within selected category */}
                      <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        {cat.services.map((srv) => {
                          const srvSelected = selectedServices.includes(srv);
                          return (
                            <button
                              type="button"
                              key={srv}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isSelected) toggleCategory(cat.id as ServiceCategory);
                                toggleService(srv);
                              }}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                                srvSelected
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                              }`}
                            >
                              {srvSelected ? '✓ ' : '+ '}
                              {srv}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected summary */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                  Selected Services ({selectedServices.length}):
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {selectedServices.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-xs font-medium text-indigo-700 shadow-2xs dark:bg-slate-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => toggleService(s)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CUSTOMER INFORMATION */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Customer & Contact Information</h4>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Gupta"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Business / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABC Enterprises Pvt Ltd"
                    value={customerInfo.companyName}
                    onChange={(e) => {
                      setCustomerInfo({ ...customerInfo, companyName: e.target.value });
                      setBusinessInfo({ ...businessInfo, businessName: e.target.value });
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98231 45012"
                    value={customerInfo.mobile}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, mobile: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98231 45012"
                    value={customerInfo.whatsapp}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, whatsapp: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh@abcenterprises.com"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune"
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    State *
                  </label>
                  <select
                    value={customerInfo.state}
                    onChange={(e) => {
                      setCustomerInfo({ ...customerInfo, state: e.target.value });
                      setGrantSchemeReq({ ...grantSchemeReq, state: e.target.value });
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Pin Code
                  </label>
                  <input
                    type="text"
                    placeholder="411014"
                    value={customerInfo.pinCode}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, pinCode: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Lead Source
                  </label>
                  <select
                    value={customerInfo.customerSource}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, customerSource: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  >
                    {LEAD_SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Assigned Sales Executive
                  </label>
                  <select
                    value={customerInfo.assignedSalespersonName}
                    onChange={(e) => {
                      const emp = employees.find((emp) => emp.name === e.target.value);
                      setCustomerInfo({
                        ...customerInfo,
                        assignedSalespersonName: e.target.value,
                        assignedSalespersonId: emp?.id || currentUser.id
                      });
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  >
                    {employees.filter((emp) => emp.department === 'Sales' || emp.role === 'SUPER_ADMIN').map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BUSINESS INFORMATION */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Business Entity Information</h4>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessInfo.businessName || customerInfo.companyName}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Business Structure *
                  </label>
                  <select
                    value={businessInfo.businessStructure}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, businessStructure: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  >
                    {BUSINESS_STRUCTURES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Business Vintage (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={businessInfo.vintageYears}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, vintageYears: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Annual Turnover (Approx)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹2.5 Crore"
                    value={businessInfo.annualTurnover}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, annualTurnover: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Current Business Status
                  </label>
                  <select
                    value={businessInfo.currentStatus}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, currentStatus: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  >
                    <option value="Profitable">Profitable</option>
                    <option value="Break-even">Break-even</option>
                    <option value="Growth">Growth / Scaling</option>
                    <option value="Early Stage">Early Stage / Seed</option>
                    <option value="Struggling">Cash-flow Constrained</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Number of Employees
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={businessInfo.employeeCount}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, employeeCount: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Industry / Sector
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Manufacturing, Agro, IT, Services"
                    value={businessInfo.industry}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, industry: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Existing Business?
                  </label>
                  <div className="mt-2 flex items-center gap-4 text-xs font-medium">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="existingBusiness"
                        checked={businessInfo.existingBusiness === true}
                        onChange={() => setBusinessInfo({ ...businessInfo, existingBusiness: true })}
                        className="text-indigo-600"
                      />
                      <span>Yes (Existing Business)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="existingBusiness"
                        checked={businessInfo.existingBusiness === false}
                        onChange={() => setBusinessInfo({ ...businessInfo, existingBusiness: false })}
                        className="text-indigo-600"
                      />
                      <span>No (New Startup / Entity)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONDITIONAL SERVICE REQUIREMENTS */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* GOVT SCHEME / GRANT REQUIREMENT */}
              {hasGovt && (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50/20 p-5 dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2 dark:border-indigo-900/40">
                    <div className="flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Government Scheme / Grant Requirement
                      </h4>
                    </div>
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                      Scheme / Grant Section
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Scheme Interested In
                      </label>
                      <input
                        type="text"
                        value={grantSchemeReq.schemeInterestedIn}
                        onChange={(e) => setGrantSchemeReq({ ...grantSchemeReq, schemeInterestedIn: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Scheme Type (Central / State)
                      </label>
                      <select
                        value={grantSchemeReq.schemeType}
                        onChange={(e) => setGrantSchemeReq({ ...grantSchemeReq, schemeType: e.target.value as any })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      >
                        <option value="Central">Central Government Scheme</option>
                        <option value="State">State Government Scheme</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Required Funding Amount (₹)
                      </label>
                      <input
                        type="number"
                        step="50000"
                        value={grantSchemeReq.requiredFundingAmount}
                        onChange={(e) => setGrantSchemeReq({ ...grantSchemeReq, requiredFundingAmount: Number(e.target.value) })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Expected Grant / Subsidy Amount (₹)
                      </label>
                      <input
                        type="number"
                        step="50000"
                        value={grantSchemeReq.expectedGrantAmount}
                        onChange={(e) => setGrantSchemeReq({ ...grantSchemeReq, expectedGrantAmount: Number(e.target.value) })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Purpose of Funding / Project Details
                      </label>
                      <textarea
                        rows={2}
                        value={grantSchemeReq.fundingPurpose}
                        onChange={(e) => setGrantSchemeReq({ ...grantSchemeReq, fundingPurpose: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Eligibility Status
                      </label>
                      <select
                        value={grantSchemeReq.eligibilityStatus}
                        onChange={(e) => setGrantSchemeReq({ ...grantSchemeReq, eligibilityStatus: e.target.value as any })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      >
                        <option value="Eligible">Fully Eligible</option>
                        <option value="Needs Review">Needs Detailed Assessment</option>
                        <option value="Marginal">Marginal / Conditional</option>
                        <option value="Not Eligible">Not Eligible</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Business Stage
                      </label>
                      <select
                        value={grantSchemeReq.businessStage}
                        onChange={(e) => setGrantSchemeReq({ ...grantSchemeReq, businessStage: e.target.value as any })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      >
                        <option value="Existing Business">Existing Business</option>
                        <option value="New Business">New Business</option>
                        <option value="Expansion">Expansion / Modernization</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* LOAN REQUIREMENT */}
              {hasLoan && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/20 p-5 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-100 pb-2 dark:border-amber-900/40">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Business Loan Requirement
                      </h4>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                      Loan Section
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Loan Type
                      </label>
                      <input
                        type="text"
                        value={loanReq.loanType}
                        onChange={(e) => setLoanReq({ ...loanReq, loanType: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Required Loan Amount (₹)
                      </label>
                      <input
                        type="number"
                        step="50000"
                        value={loanReq.requiredLoanAmount}
                        onChange={(e) => setLoanReq({ ...loanReq, requiredLoanAmount: Number(e.target.value) })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Monthly Revenue
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹18 Lakhs"
                        value={loanReq.monthlyRevenue}
                        onChange={(e) => setLoanReq({ ...loanReq, monthlyRevenue: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        CIBIL / Credit Information
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 750 (Excellent)"
                        value={loanReq.cibilScore}
                        onChange={(e) => setLoanReq({ ...loanReq, cibilScore: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Collateral Available
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Industrial Shed, Residential Property, None"
                        value={loanReq.collateralAvailable}
                        onChange={(e) => setLoanReq({ ...loanReq, collateralAvailable: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Preferred Bank & Urgency
                      </label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          placeholder="Bank (e.g. SBI, HDFC)"
                          value={loanReq.preferredBank}
                          onChange={(e) => setLoanReq({ ...loanReq, preferredBank: e.target.value })}
                          className="w-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                        />
                        <select
                          value={loanReq.loanUrgency}
                          onChange={(e) => setLoanReq({ ...loanReq, loanUrgency: e.target.value as any })}
                          className="w-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                        >
                          <option value="Immediate">Immediate</option>
                          <option value="Within 15 Days">Within 15 Days</option>
                          <option value="Within 30 Days">Within 30 Days</option>
                          <option value="Flexible">Flexible</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* IT REQUIREMENT */}
              {hasIT && (
                <div className="rounded-2xl border border-sky-200 bg-sky-50/20 p-5 dark:border-sky-900/40 dark:bg-sky-950/20 space-y-4">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-2 dark:border-sky-900/40">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        IT & Software Service Requirement
                      </h4>
                    </div>
                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                      IT Section
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Service Required
                      </label>
                      <input
                        type="text"
                        value={itReq.serviceRequired}
                        onChange={(e) => setItReq({ ...itReq, serviceRequired: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Project Type
                      </label>
                      <select
                        value={itReq.projectType}
                        onChange={(e) => setItReq({ ...itReq, projectType: e.target.value as any })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      >
                        <option value="New Project">New Project from scratch</option>
                        <option value="Redesign">Redesign existing website/portal</option>
                        <option value="Maintenance">Annual Maintenance / Support</option>
                        <option value="Migration">Cloud / Server Migration</option>
                        <option value="API Integration">API / Chatbot Integration</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Business & Functional Requirements
                      </label>
                      <textarea
                        rows={2}
                        value={itReq.businessRequirement}
                        onChange={(e) => setItReq({ ...itReq, businessRequirement: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Estimated Budget (₹)
                      </label>
                      <input
                        type="number"
                        step="5000"
                        value={itReq.estimatedBudget}
                        onChange={(e) => setItReq({ ...itReq, estimatedBudget: Number(e.target.value) })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Expected Delivery Date
                      </label>
                      <input
                        type="date"
                        value={itReq.expectedDeliveryDate}
                        onChange={(e) => setItReq({ ...itReq, expectedDeliveryDate: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Technology Preference
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Next.js, React, Node.js, WordPress"
                        value={itReq.technologyPreference}
                        onChange={(e) => setItReq({ ...itReq, technologyPreference: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Current Website / Reference
                      </label>
                      <input
                        type="url"
                        placeholder="https://clientwebsite.com"
                        value={itReq.currentWebsite}
                        onChange={(e) => setItReq({ ...itReq, currentWebsite: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: DOCUMENTS & FINANCIALS */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Dynamic Document Checklist */}
              <div>
                <div className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Dynamic Customer Document Checklist
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select the documents to request from the customer based on chosen services.
                </p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[...DEFAULT_GOVT_DOCUMENTS, ...DEFAULT_IT_DOCUMENTS].map((doc) => {
                    const isChecked = selectedDocuments.includes(doc);
                    return (
                      <label
                        key={doc}
                        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium cursor-pointer transition ${
                          isChecked
                            ? 'border-indigo-300 bg-indigo-50/50 text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDocument(doc)}
                          className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="truncate">{doc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Financial Booking Details */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 dark:border-slate-700">
                  <Receipt className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Booking Value & Advance Payment
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Total Service Value / Expected Deal Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1000"
                      step="1000"
                      value={expectedAmount}
                      onChange={(e) => setExpectedAmount(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Advance Amount Paid Now (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={advanceAmount}
                      onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-emerald-600 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                      <option value="NEFT">NEFT Bank Transfer</option>
                      <option value="RTGS">RTGS High-Value Transfer</option>
                      <option value="Cheque">Bank Cheque</option>
                      <option value="Cash">Cash Receipt</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Transaction Reference / UTR
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UPI/626291048123 or NEFT Ref"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                </div>

                {/* Calculation Summary */}
                <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-xs">
                  <div>
                    <span className="text-slate-500">Balance Pending: </span>
                    <span className="font-bold text-rose-600">
                      ₹{Math.max(0, expectedAmount - advanceAmount).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Payment Status: </span>
                    <span className="font-bold text-emerald-600">
                      {advanceAmount >= expectedAmount
                        ? 'Paid in Full'
                        : advanceAmount > 0
                        ? 'Partially Paid'
                        : 'Pending Payment'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm & Create Booking</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
