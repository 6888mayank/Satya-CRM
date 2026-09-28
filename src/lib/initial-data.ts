import {
  UserProfile,
  Customer,
  Booking,
  PaymentRecord,
  FollowUp,
  Task,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  Holiday,
  CustomField,
  AutomationRule,
  AuditLog,
  DocumentItem,
  SalesTeam,
  WFHRequest,
  Notification as CRMNotification,
  PinnedDevice
} from '@/types/crm';

/**
 * Root Super Admin profile — maintained for initial authentication
 */
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'u-1',
    name: 'Satya Sharma',
    email: 'cso@satyasupport.co.in',
    password: 'akash@802',
    department: 'Executive',
    designation: 'Chief Strategy Officer & Founder',
    role: 'SUPER_ADMIN',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastLogin: '23 Sep 2026, 09:45 PM',
    createdDate: '15 Jan 2025',
    branch: 'Corporate HQ',
    permissions: [
      'sales.leads.view', 'sales.leads.create', 'sales.leads.edit', 'sales.leads.delete',
      'sales.bookings.view', 'sales.bookings.create', 'sales.bookings.edit',
      'sales.payments.view', 'sales.payments.manage',
      'hr.employees.view', 'hr.employees.create', 'hr.employees.edit',
      'attendance.view', 'attendance.manage',
      'users.view', 'users.create', 'users.edit', 'users.manage_roles',
      'system.settings', 'system.custom_fields', 'system.automation', 'system.integrations', 'system.audit_logs'
    ]
  },
  {
    id: 'u-rm',
    name: 'Rajesh Nair',
    email: 'rm@satyasupport.co.in',
    password: 'akash@802',
    department: 'Sales',
    designation: 'Regional Manager (West & North Zone)',
    role: 'RM',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    lastLogin: '23 Sep 2026, 08:30 PM',
    createdDate: '15 Jan 2025',
    branch: 'West Zone HQ',
    permissions: [
      'sales.leads.view', 'sales.leads.create', 'sales.leads.edit',
      'sales.bookings.view', 'sales.bookings.create', 'sales.bookings.edit',
      'sales.payments.view', 'hr.employees.view', 'attendance.view', 'attendance.manage', 'users.view'
    ]
  },
  {
    id: 'u-bm',
    name: 'Pooja Deshmukh',
    email: 'bm@satyasupport.co.in',
    password: 'akash@802',
    department: 'Sales',
    designation: 'Branch Operations Manager',
    role: 'BRANCH_MANAGER',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    lastLogin: '23 Sep 2026, 06:15 PM',
    createdDate: '15 Jan 2025',
    branch: 'Mumbai Central Branch',
    permissions: [
      'sales.leads.view', 'sales.leads.create', 'sales.leads.edit',
      'sales.bookings.view', 'sales.bookings.create', 'sales.bookings.edit',
      'sales.payments.view', 'hr.employees.view', 'attendance.view', 'users.view'
    ]
  },
  {
    id: 'u-tl',
    name: 'Vikram Rathore',
    email: 'tl@satyasupport.co.in',
    password: 'akash@802',
    department: 'Sales',
    designation: 'Govt Schemes & Subsidy Team Lead',
    role: 'TL',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    lastLogin: '23 Sep 2026, 07:10 PM',
    createdDate: '15 Jan 2025',
    branch: 'Mumbai Central Branch',
    permissions: [
      'sales.leads.view', 'sales.leads.create', 'sales.leads.edit',
      'sales.bookings.view', 'sales.bookings.create', 'sales.bookings.edit',
      'sales.payments.view', 'attendance.view'
    ]
  },
  {
    id: 'u-bdm',
    name: 'Neha Mehta',
    email: 'bdm@satyasupport.co.in',
    password: 'akash@802',
    department: 'Sales',
    designation: 'Business Development Manager (Loans)',
    role: 'BDM',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    lastLogin: '23 Sep 2026, 05:40 PM',
    createdDate: '15 Jan 2025',
    branch: 'Mumbai Central Branch',
    permissions: [
      'sales.leads.view', 'sales.leads.create', 'sales.leads.edit',
      'sales.bookings.view', 'sales.bookings.create', 'sales.payments.view', 'attendance.view'
    ]
  },
  {
    id: 'u-bde',
    name: 'Rohan Patil',
    email: 'bde@satyasupport.co.in',
    password: 'akash@802',
    department: 'Sales',
    designation: 'Business Development Executive (IT & Grants)',
    role: 'BDE',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    lastLogin: '23 Sep 2026, 04:20 PM',
    createdDate: '15 Jan 2025',
    branch: 'Mumbai Central Branch',
    permissions: [
      'sales.leads.view', 'sales.leads.create', 'sales.leads.edit',
      'sales.bookings.view', 'attendance.view'
    ]
  },
  {
    id: 'u-hr',
    name: 'Priya Iyer',
    email: 'hr@satyasupport.co.in',
    password: 'akash@802',
    department: 'HR',
    designation: 'Head of Human Resources',
    role: 'HR',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    lastLogin: '23 Sep 2026, 05:00 PM',
    createdDate: '15 Jan 2025',
    branch: 'Corporate HQ',
    permissions: [
      'hr.employees.view', 'hr.employees.create', 'hr.employees.edit',
      'attendance.view', 'attendance.manage', 'users.view', 'users.create', 'users.edit'
    ]
  },
  {
    id: 'u-tech',
    name: 'Aman Verma (IT & Tech Lead)',
    email: 'tech@satyasupport.co.in',
    password: 'akash@802',
    department: 'Tech',
    designation: 'Lead Systems & Security Engineer',
    role: 'TECH',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastLogin: '23 Sep 2026, 10:15 PM',
    createdDate: '15 Jan 2025',
    branch: 'Corporate HQ',
    permissions: [
      'system.settings', 'system.device_pinning', 'system.custom_fields', 'system.automation', 'system.integrations', 'system.audit_logs',
      'users.view', 'attendance.view'
    ]
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'e-1',
    name: 'Satya Sharma',
    email: 'cso@satyasupport.co.in',
    phone: '+91 98111 22334',
    department: 'Executive',
    designation: 'Chief Strategy Officer & Founder',
    role: 'SUPER_ADMIN',
    reportingManager: 'Board of Directors',
    joiningDate: '01 Jan 2024',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    employeeCode: 'EMP-001',
    branch: 'Corporate HQ',
    leadsHandled: 0,
    bookingsCount: 0,
    revenueGenerated: 0,
    conversionRate: '0%',
    teamName: 'Executive Team'
  },
  {
    id: 'e-rm',
    name: 'Rajesh Nair',
    email: 'rm@satyasupport.co.in',
    phone: '+91 98111 55667',
    department: 'Sales',
    designation: 'Regional Manager (West & North Zone)',
    role: 'RM',
    reportingManager: 'Satya Sharma',
    joiningDate: '15 Jan 2024',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    employeeCode: 'EMP-RM-01',
    branch: 'West Zone HQ',
    leadsHandled: 0,
    bookingsCount: 0,
    revenueGenerated: 0,
    conversionRate: '0%',
    teamName: 'Regional Leadership'
  },
  {
    id: 'e-bm',
    name: 'Pooja Deshmukh',
    email: 'bm@satyasupport.co.in',
    phone: '+91 98222 66778',
    department: 'Sales',
    designation: 'Branch Operations Manager',
    role: 'BRANCH_MANAGER',
    reportingManager: 'Rajesh Nair',
    joiningDate: '01 Feb 2024',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    employeeCode: 'EMP-BM-01',
    branch: 'Mumbai Central Branch',
    leadsHandled: 0,
    bookingsCount: 0,
    revenueGenerated: 0,
    conversionRate: '0%',
    teamName: 'Branch Management'
  },
  {
    id: 'e-tl',
    name: 'Vikram Rathore',
    email: 'tl@satyasupport.co.in',
    phone: '+91 98333 77889',
    department: 'Sales',
    designation: 'Govt Schemes & Subsidy Team Lead',
    role: 'TL',
    reportingManager: 'Pooja Deshmukh',
    joiningDate: '15 Feb 2024',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    employeeCode: 'EMP-TL-01',
    branch: 'Mumbai Central Branch',
    leadsHandled: 0,
    bookingsCount: 0,
    revenueGenerated: 0,
    conversionRate: '0%',
    teamName: 'Schemes & Grants Pod'
  },
  {
    id: 'e-bdm',
    name: 'Neha Mehta',
    email: 'bdm@satyasupport.co.in',
    phone: '+91 98444 88990',
    department: 'Sales',
    designation: 'Business Development Manager (Loans)',
    role: 'BDM',
    reportingManager: 'Vikram Rathore',
    joiningDate: '01 Mar 2024',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    employeeCode: 'EMP-BDM-01',
    branch: 'Mumbai Central Branch',
    leadsHandled: 0,
    bookingsCount: 0,
    revenueGenerated: 0,
    conversionRate: '0%',
    teamName: 'Debt & Loans Pod'
  },
  {
    id: 'e-bde',
    name: 'Rohan Patil',
    email: 'bde@satyasupport.co.in',
    phone: '+91 98555 99001',
    department: 'Sales',
    designation: 'Business Development Executive (IT & Grants)',
    role: 'BDE',
    reportingManager: 'Neha Mehta',
    joiningDate: '15 Mar 2024',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    employeeCode: 'EMP-BDE-01',
    branch: 'Mumbai Central Branch',
    leadsHandled: 0,
    bookingsCount: 0,
    revenueGenerated: 0,
    conversionRate: '0%',
    teamName: 'Sales Execution Pod'
  },
  {
    id: 'e-hr',
    name: 'Priya Iyer',
    email: 'hr@satyasupport.co.in',
    phone: '+91 98666 11223',
    department: 'HR',
    designation: 'Head of Human Resources',
    role: 'HR',
    reportingManager: 'Satya Sharma',
    joiningDate: '01 Feb 2024',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    employeeCode: 'EMP-HR-01',
    branch: 'Corporate HQ',
    leadsHandled: 0,
    bookingsCount: 0,
    revenueGenerated: 0,
    conversionRate: '0%',
    teamName: 'Human Resources'
  },
  {
    id: 'e-tech',
    name: 'Aman Verma (IT & Tech Lead)',
    email: 'tech@satyasupport.co.in',
    phone: '+91 98222 33445',
    department: 'Tech',
    designation: 'Lead Systems & Security Engineer',
    role: 'TECH',
    reportingManager: 'Satya Sharma',
    joiningDate: '01 Feb 2024',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    employeeCode: 'EMP-TECH-01',
    branch: 'Corporate HQ',
    leadsHandled: 0,
    bookingsCount: 0,
    revenueGenerated: 0,
    conversionRate: '0%',
    teamName: 'IT & Infrastructure'
  }
];

// ZERO FAKE DATA — All collections initialized as clean empty arrays
export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];
export const INITIAL_PAYMENTS: PaymentRecord[] = [];
export const INITIAL_DOCUMENTS: DocumentItem[] = [];
export const INITIAL_FOLLOWUPS: FollowUp[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_LEAVES: LeaveRequest[] = [];
export const INITIAL_HOLIDAYS: Holiday[] = [
  { id: 'hol-001', name: 'Republic Day', date: '2026-01-26', day: 'Monday', type: 'National', description: 'National Republic Day Celebration' },
  { id: 'hol-002', name: 'Maha Shivratri', date: '2026-02-15', day: 'Sunday', type: 'Gazetted', description: 'Gazetted Holiday' },
  { id: 'hol-003', name: 'Holi (Festival of Colors)', date: '2026-03-04', day: 'Wednesday', type: 'Gazetted', description: 'Spring Festival Holiday' },
  { id: 'hol-004', name: 'Id-ul-Fitr (Ramzan Id)', date: '2026-03-21', day: 'Saturday', type: 'Gazetted', description: 'Islamic Gazetted Holiday' },
  { id: 'hol-005', name: 'Mahavir Jayanti', date: '2026-03-31', day: 'Tuesday', type: 'Gazetted', description: 'Gazetted Holiday' },
  { id: 'hol-006', name: 'Good Friday', date: '2026-04-03', day: 'Friday', type: 'Gazetted', description: 'Christian Gazetted Holiday' },
  { id: 'hol-007', name: 'Buddha Purnima', date: '2026-05-31', day: 'Sunday', type: 'Gazetted', description: 'Gazetted Holiday' },
  { id: 'hol-008', name: 'Bakrid / Eid-ul-Adha', date: '2026-05-27', day: 'Wednesday', type: 'Gazetted', description: 'Gazetted Holiday' },
  { id: 'hol-009', name: 'Independence Day', date: '2026-08-15', day: 'Saturday', type: 'National', description: 'National Independence Day Celebration' },
  { id: 'hol-010', name: 'Milad-un-Nabi (Id-e-Milad)', date: '2026-08-26', day: 'Wednesday', type: 'Gazetted', description: 'Prophet Birthday' },
  { id: 'hol-011', name: 'Mahatma Gandhi Jayanti', date: '2026-10-02', day: 'Friday', type: 'National', description: 'National Holiday' },
  { id: 'hol-012', name: 'Dussehra (Vijay Dashami)', date: '2026-10-20', day: 'Tuesday', type: 'Gazetted', description: 'Autumn Festival' },
  { id: 'hol-013', name: 'Diwali (Deepavali)', date: '2026-11-08', day: 'Sunday', type: 'Gazetted', description: 'Festival of Lights' },
  { id: 'hol-014', name: 'Govardhan Puja', date: '2026-11-09', day: 'Monday', type: 'Restricted', description: 'Restricted / Optional Holiday' },
  { id: 'hol-015', name: 'Bhai Duj', date: '2026-11-10', day: 'Tuesday', type: 'Restricted', description: 'Restricted / Optional Holiday' },
  { id: 'hol-016', name: 'Guru Nanak Jayanti', date: '2026-11-24', day: 'Tuesday', type: 'Gazetted', description: 'Sikh Festival' },
  { id: 'hol-017', name: 'Christmas Day', date: '2026-12-25', day: 'Friday', type: 'Gazetted', description: 'Winter Holiday' }
];
export const INITIAL_CUSTOM_FIELDS: CustomField[] = [];
export const INITIAL_AUTOMATIONS: AutomationRule[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_NOTIFICATIONS: CRMNotification[] = [];
export const INITIAL_TEAMS: SalesTeam[] = [];
export const INITIAL_WFH_REQUESTS: WFHRequest[] = [];
export const INITIAL_PINNED_DEVICES: PinnedDevice[] = [];
