export const SERVICE_CATEGORIES = [
  {
    id: 'GOVERNMENT_SCHEMES',
    name: 'Government Schemes',
    description: 'PMEGP, MUDRA, Startup India, Stand Up India, MSME & State subsidies',
    icon: 'Landmark',
    accentColor: 'indigo',
    services: [
      'PMEGP Scheme Assistance',
      'MUDRA Loan Scheme (Shishu, Kishore, Tarun)',
      'Startup India Seed Fund Scheme (SISFS)',
      'MSME Credit Guarantee Scheme (CGTMSE)',
      'PM Vishwakarma Scheme',
      'Stand-Up India Scheme',
      'State Government Industrial Subsidies',
      'Central Government Capital Subsidies',
      'ZED Certification & Subsidy',
      'Other Government Scheme',
    ],
  },
  {
    id: 'GOVERNMENT_GRANTS',
    name: 'Government Grants',
    description: 'Non-repayable funding, innovation grants, technology adoption grants',
    icon: 'Award',
    accentColor: 'emerald',
    services: [
      'Business Grant Assistance',
      'Startup Innovation Grant',
      'BIRAC / Biotech Grant',
      'Technology Development Board (TDB) Grant',
      'Export Promotion Capital Goods (EPCG) Grant',
      'R&D and Commercialization Grant',
      'State Startup Grant',
      'Subsidy Reimbursement Filing',
      'Other Government Grant',
    ],
  },
  {
    id: 'BUSINESS_LOANS',
    name: 'Business Loans',
    description: 'Secured & unsecured business credit, working capital, machinery financing',
    icon: 'Coins',
    accentColor: 'amber',
    services: [
      'MSME Business Loan (Collateral-free)',
      'Working Capital Loan / Cash Credit (CC/OD)',
      'Term Loan for Factory / Expansion',
      'Machinery & Equipment Financing',
      'Startup / Early Stage Business Loan',
      'Commercial Property Loan / LAP',
      'Invoice / Bill Discounting',
      'Export Credit Facility',
      'Other Business Loan',
    ],
  },
  {
    id: 'IT_SERVICES',
    name: 'IT / Technology Services',
    description: 'Enterprise portals, custom software, SaaS, mobile apps, AI automation',
    icon: 'Code2',
    accentColor: 'sky',
    services: [
      'Corporate Website Development',
      'Custom Web Application Development',
      'Mobile App Development (iOS & Android)',
      'Custom CRM / ERP Development',
      'Custom Software Development',
      'AI / Machine Learning Automation',
      'AI Chatbot & Voicebot Solutions',
      'Digital Marketing & Lead Generation',
      'Search Engine Optimization (SEO)',
      'E-commerce Portal Development',
      'Cloud Architecture & Maintenance Support',
      'API & Third-party Integrations',
    ],
  },
] as const;

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi NCR', 'Chandigarh'
];

export const BUSINESS_STRUCTURES = [
  'Proprietorship',
  'Partnership',
  'LLP',
  'Private Limited',
  'Public Limited',
  'Startup',
  'Individual',
  'Other'
];

export const LEAD_SOURCES = [
  'Website',
  'Google',
  'Facebook',
  'Instagram',
  'WhatsApp',
  'Referral',
  'Cold Call',
  'Existing Customer',
  'Campaign',
  'Walk-in',
  'Partner',
  'Other'
];

export const DEFAULT_GOVT_LOAN_STAGES = [
  { id: 'st-new', name: 'New Leads', color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800', order: 1, type: 'GOVT_LOAN' as const },
  { id: 'st-contacted', name: 'Contacted', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800', order: 2, type: 'GOVT_LOAN' as const },
  { id: 'st-req', name: 'Requirement Collected', color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800', order: 3, type: 'GOVT_LOAN' as const },
  { id: 'st-eligibility', name: 'Eligibility Check', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-800', order: 4, type: 'GOVT_LOAN' as const },
  { id: 'st-docs-pending', name: 'Documents Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800', order: 5, type: 'GOVT_LOAN' as const },
  { id: 'st-docs-verified', name: 'Documents Verified', color: 'bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-800', order: 6, type: 'GOVT_LOAN' as const },
  { id: 'st-proposal', name: 'Proposal Sent', color: 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800', order: 7, type: 'GOVT_LOAN' as const },
  { id: 'st-pay-pending', name: 'Payment Pending', color: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800', order: 8, type: 'GOVT_LOAN' as const },
  { id: 'st-booked', name: 'Booked', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800', order: 9, type: 'GOVT_LOAN' as const },
  { id: 'st-inprocess', name: 'In Process', color: 'bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800', order: 10, type: 'GOVT_LOAN' as const },
  { id: 'st-completed', name: 'Completed', color: 'bg-green-500/10 text-green-700 border-green-200 dark:border-green-800', order: 11, type: 'GOVT_LOAN' as const },
];

export const DEFAULT_IT_STAGES = [
  { id: 'it-lead', name: 'Lead', color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800', order: 1, type: 'IT' as const },
  { id: 'it-discovery', name: 'Discovery', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800', order: 2, type: 'IT' as const },
  { id: 'it-req', name: 'Requirements', color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800', order: 3, type: 'IT' as const },
  { id: 'it-quote', name: 'Quotation', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-800', order: 4, type: 'IT' as const },
  { id: 'it-negotiation', name: 'Negotiation', color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800', order: 5, type: 'IT' as const },
  { id: 'it-advance', name: 'Advance Payment', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800', order: 6, type: 'IT' as const },
  { id: 'it-dev', name: 'Development', color: 'bg-sky-500/10 text-sky-600 border-sky-200 dark:border-sky-800', order: 7, type: 'IT' as const },
  { id: 'it-testing', name: 'Testing', color: 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800', order: 8, type: 'IT' as const },
  { id: 'it-delivered', name: 'Delivered', color: 'bg-green-500/10 text-green-700 border-green-200 dark:border-green-800', order: 9, type: 'IT' as const },
];

export const GRANULAR_PERMISSIONS = [
  { key: 'sales.leads.view', label: 'View Leads', category: 'Sales' },
  { key: 'sales.leads.create', label: 'Create Leads', category: 'Sales' },
  { key: 'sales.leads.edit', label: 'Edit Leads', category: 'Sales' },
  { key: 'sales.leads.delete', label: 'Delete Leads', category: 'Sales' },
  { key: 'sales.bookings.view', label: 'View Bookings', category: 'Sales' },
  { key: 'sales.bookings.create', label: 'Create Bookings', category: 'Sales' },
  { key: 'sales.bookings.edit', label: 'Edit Bookings', category: 'Sales' },
  { key: 'sales.payments.view', label: 'View Payments', category: 'Sales' },
  { key: 'sales.payments.manage', label: 'Manage & Record Payments', category: 'Sales' },
  { key: 'hr.employees.view', label: 'View Employees', category: 'HR' },
  { key: 'hr.employees.create', label: 'Create Employees', category: 'HR' },
  { key: 'hr.employees.edit', label: 'Edit Employees', category: 'HR' },
  { key: 'attendance.view', label: 'View Attendance', category: 'HR' },
  { key: 'attendance.manage', label: 'Approve & Manage Attendance', category: 'HR' },
  { key: 'users.view', label: 'View Users', category: 'User Management' },
  { key: 'users.create', label: 'Create Users', category: 'User Management' },
  { key: 'users.edit', label: 'Edit Users', category: 'User Management' },
  { key: 'users.manage_roles', label: 'Assign & Change Roles', category: 'User Management' },
  { key: 'system.settings', label: 'Configure System Settings', category: 'System' },
  { key: 'system.custom_fields', label: 'Manage Custom Fields', category: 'System' },
  { key: 'system.automation', label: 'Configure Automations', category: 'System' },
  { key: 'system.integrations', label: 'Manage Integrations & APIs', category: 'System' },
  { key: 'system.audit_logs', label: 'View Audit Logs', category: 'System' },
];

export const DEFAULT_GOVT_DOCUMENTS = [
  'PAN Card of Promoter / Entity',
  'Aadhaar Card of Applicant',
  'GST Registration Certificate',
  'Udyam / MSME Registration Certificate',
  'Last 12 Months Bank Account Statement',
  'Last 3 Years ITR with Computation / Audited Balance Sheet',
  'Business Entity Proof (Partnership Deed / MOA / COI)',
  'Registered Office / Factory Address Proof',
  'Detailed Project Report (DPR) / Quotations',
  'Machinery / Asset Quotations',
  'Rent Agreement / Title Deed of Premises'
];

export const DEFAULT_IT_DOCUMENTS = [
  'Scope of Work / Requirement Specification Document',
  'Existing Website & System Audit',
  'Brand Guidelines, Logo & Visual Assets',
  'Content & Product Catalog Files',
  'Wireframes / Reference Links',
  'API & Server Credentials (Secure)'
];
