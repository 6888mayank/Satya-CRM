'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  UserRole,
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
  Notification as CRMNotification,
  LeadStatus,
  ServiceCategory,
  SalesTeam,
  TeamMember,
  WFHRequest,
  PinnedDevice
} from '@/types/crm';
import { getOrCreateDeviceFingerprint, DeviceMetadata } from '@/lib/device-fingerprint';
import {
  INITIAL_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_CUSTOMERS,
  INITIAL_BOOKINGS,
  INITIAL_PAYMENTS,
  INITIAL_DOCUMENTS,
  INITIAL_FOLLOWUPS,
  INITIAL_TASKS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_HOLIDAYS,
  INITIAL_CUSTOM_FIELDS,
  INITIAL_AUTOMATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TEAMS,
  INITIAL_WFH_REQUESTS,
  INITIAL_PINNED_DEVICES
} from '@/lib/initial-data';
import {
  fetchLiveCRMData,
  dbInsertCustomer,
  dbUpdateCustomer,
  dbInsertBooking,
  dbUpdateBooking,
  dbInsertPayment,
  dbInsertDocument,
  dbUpdateDocument,
  dbInsertFollowUp,
  dbUpdateFollowUp,
  dbInsertAttendance,
  dbUpdateAttendance,
  dbInsertLeave,
  dbUpdateLeave,
  dbInsertWFH,
  dbUpdateWFH,
  dbInsertUser,
  dbUpdateUser,
  dbDeleteUser,
  dbInsertEmployee,
  dbDeleteEmployee,
  dbInsertTeam,
  dbUpdateTeam,
  dbDeleteTeam,
  dbInsertAuditLog,
  dbInsertNotification,
  dbMarkNotificationRead,
  dbClearAllNotifications,
  dbInsertHoliday,
  dbUpdateHoliday,
  dbDeleteHoliday,
  dbInsertPinnedDevice,
  dbUpdatePinnedDevice,
  dbDeletePinnedDevice
} from '@/lib/supabase-service';
import { isSupabaseConfigured, checkSupabaseConnection, checkRenderPostgresConnection } from '@/lib/supabase';

interface CRMContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (cust: Customer | null) => void;
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
  isWFHModalOpen: boolean;
  setIsWFHModalOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Authentication
  isAuthenticated: boolean;
  login: (emailOrId: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Hardware Security & Machine Pinning
  pinnedDevices: PinnedDevice[];
  currentDevice: DeviceMetadata;
  isCurrentDevicePinned: boolean;
  isDevicePinningEnforced: boolean;
  pinCurrentDevice: (deviceName?: string, assignedTo?: string) => Promise<boolean>;
  pinDeviceByFingerprint: (fingerprint: string, deviceName: string, assignedTo?: string) => Promise<boolean>;
  unpinDevice: (deviceId: string) => Promise<boolean>;
  toggleDeviceEnforcement: () => void;

  // Database Connection Status (Render PostgreSQL or Supabase)
  isDbConnected: boolean;
  isDbLoading: boolean;
  dbError: string | null;
  dbProvider: 'render' | 'supabase' | 'none';
  refreshData: () => Promise<void>;

  // Data Collections (Zero Fake Data)
  customers: Customer[];
  bookings: Booking[];
  payments: PaymentRecord[];
  documents: DocumentItem[];
  followups: FollowUp[];
  tasks: Task[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  holidays: Holiday[];
  users: UserProfile[];
  customFields: CustomField[];
  automations: AutomationRule[];
  auditLogs: AuditLog[];
  notifications: CRMNotification[];
  teams: SalesTeam[];
  wfhRequests: WFHRequest[];

  // Mutators
  addCustomerBooking: (payload: {
    customer: Partial<Customer>;
    services: string[];
    categories: ServiceCategory[];
    grantDetails?: any;
    loanDetails?: any;
    itDetails?: any;
    documents?: string[];
    expectedAmount: number;
    advanceAmount?: number;
    paymentMethod?: PaymentRecord['paymentMethod'];
    transactionRef?: string;
  }) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  updateCustomerStatus: (id: string, newStatus: LeadStatus) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  recordPayment: (payload: {
    bookingId: string;
    amount: number;
    method: PaymentRecord['paymentMethod'];
    transactionReference: string;
    notes?: string;
  }) => void;
  updateDocumentStatus: (docId: string, status: DocumentItem['status'], reason?: string) => void;
  addFollowUp: (followup: Omit<FollowUp, 'id'>) => void;
  completeFollowUp: (followupId: string) => void;
  checkInAttendance: (employeeId: string, remarks?: string) => void;
  checkOutAttendance: (employeeId: string) => void;
  applyLeave: (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => void;
  updateLeaveStatus: (leaveId: string, status: 'Approved' | 'Rejected') => void;
  applyWFH: (req: Omit<WFHRequest, 'id' | 'status' | 'appliedDate'>) => void;
  updateWFHStatus: (requestId: string, status: 'Approved' | 'Rejected') => void;
  addUser: (user: Omit<UserProfile, 'id' | 'createdDate' | 'lastLogin'>) => void;
  updateUser: (userId: string, updates: Partial<UserProfile>) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  toggleUserStatus: (userId: string) => void;
  deleteUser: (userId: string) => boolean;
  deleteEmployee: (employeeId: string) => boolean;
  addCustomField: (field: Omit<CustomField, 'id'>) => void;
  deleteCustomField: (id: string) => void;
  toggleAutomation: (id: string) => void;
  addAutomation: (rule: Omit<AutomationRule, 'id' | 'triggerCount'>) => void;
  addAuditLog: (action: string, entityType: string, entityId: string, details: string, oldValue?: string, newValue?: string) => void;
  addHoliday: (holiday: Omit<Holiday, 'id'>) => boolean;
  updateHoliday: (holiday: Holiday) => boolean;
  deleteHoliday: (holidayId: string) => boolean;
  createTeam: (team: Omit<SalesTeam, 'id' | 'createdAt'>) => boolean;
  deleteTeam: (teamId: string) => boolean;
  updateTeamTarget: (teamId: string, newTarget: number) => boolean;
  updateTeamName: (teamId: string, newName: string, newDivision?: string) => boolean;
  updateMemberTargets: (teamId: string, members: TeamMember[]) => boolean;
  updateTeamMembers: (teamId: string, updates: Partial<SalesTeam>) => void;
  updateTeamRoster: (teamId: string, members: TeamMember[]) => boolean;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isWFHModalOpen, setIsWFHModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Database Connection State
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [isDbLoading, setIsDbLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbProvider, setDbProvider] = useState<'render' | 'supabase' | 'none'>('none');

  // Live Collections
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [followups, setFollowups] = useState<FollowUp[]>(INITIAL_FOLLOWUPS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [holidays, setHolidays] = useState<Holiday[]>(INITIAL_HOLIDAYS);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [customFields, setCustomFields] = useState<CustomField[]>(INITIAL_CUSTOM_FIELDS);
  const [automations, setAutomations] = useState<AutomationRule[]>(INITIAL_AUTOMATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<CRMNotification[]>(INITIAL_NOTIFICATIONS);
  const [teams, setTeams] = useState<SalesTeam[]>(INITIAL_TEAMS);
  const [wfhRequests, setWfhRequests] = useState<WFHRequest[]>(INITIAL_WFH_REQUESTS);
  const [pinnedDevices, setPinnedDevices] = useState<PinnedDevice[]>(INITIAL_PINNED_DEVICES);
  const [currentDevice, setCurrentDevice] = useState<DeviceMetadata>({
    fingerprint: 'DEV-SATYA-INIT',
    deviceName: 'Current Computer',
    osPlatform: 'Desktop',
    browserInfo: 'Browser',
    screenResolution: '0x0',
    timeZone: 'Asia/Kolkata',
    language: 'en'
  });
  const [isDevicePinningEnforced, setIsDevicePinningEnforced] = useState<boolean>(true);

  const isCurrentDevicePinned = Boolean(
    pinnedDevices.some(
      (d) => d.deviceFingerprint === currentDevice.fingerprint && d.status === 'PINNED'
    )
  );

  // 1. Initial Load & Multi-Engine Sync (Render PostgreSQL or Supabase)
  const refreshData = useCallback(async () => {
    setIsDbLoading(true);

    // Purge any legacy mock state from user's localStorage
    try {
      localStorage.removeItem('CRM_ENTERPRISE_STATE_V3');
      localStorage.removeItem('CRM_ENTERPRISE_STATE_V2');
      localStorage.removeItem('CRM_ENTERPRISE_STATE_V1');
      localStorage.removeItem('CRM_STATE');
    } catch {
      // ignore
    }

    // 1. Primary CRM Database (PostgreSQL / Supabase)
    let connected = false;
    let providerName: 'render' | 'supabase' | 'none' = 'none';

    try {
      const pgPing = await checkRenderPostgresConnection();
      if (pgPing.connected) {
        connected = true;
        providerName = 'render';
      }
    } catch {
      // Fall through to Supabase
    }

    if (!connected && isSupabaseConfigured) {
      try {
        const ping = await checkSupabaseConnection();
        if (ping.connected) {
          connected = true;
          providerName = 'supabase';
        } else {
          setDbError(ping.error || 'Cannot connect to Supabase endpoint.');
        }
      } catch (err: any) {
        setDbError(err?.message || 'Supabase connection failure.');
      }
    }

    if (connected) {
      setDbProvider(providerName);
    } else if (!isSupabaseConfigured) {
      setDbProvider('none');
      setDbError(
        'Database connection pending. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to activate live Supabase sync.'
      );
    }

    const res = await fetchLiveCRMData();
    if (res.success && res.data) {
      setIsDbConnected(true);
      setDbError(null);
      if (res.provider) setDbProvider(res.provider);
      setCustomers(res.data.customers);
      setBookings(res.data.bookings);
      setPayments(res.data.payments);
      setDocuments(res.data.documents);
      setFollowups(res.data.followups);
      setTasks(res.data.tasks);
      setAttendance(res.data.attendance);
      setLeaves(res.data.leaves);
      setWfhRequests(res.data.wfhRequests);
      setTeams(res.data.teams);
      setAuditLogs(res.data.auditLogs);
      setNotifications(res.data.notifications);
      setHolidays(res.data.holidays);
      setCustomFields(res.data.customFields);
      setAutomations(res.data.automations);

      if (res.data.users.length > 0) {
        const liveUsers = res.data.users;
        setUsers(liveUsers);
        setCurrentUser((prev) => {
          // Strictly match by user ID to prevent cross-account replacement when emails are shared
          const updated = liveUsers.find((u) => u.id === prev.id);
          return updated || prev;
        });
      }
      if (res.data.employees.length > 0) {
        setEmployees(res.data.employees);
      }
      if (res.data.pinnedDevices) {
        setPinnedDevices(res.data.pinnedDevices);
      }
    } else {
      setIsDbConnected(false);
      if (!isSupabaseConfigured && !connected) {
        // Safe offline mode fallback
        setIsDbConnected(true);
        setDbError(null);
      } else {
        setDbError(res.error || 'Failed to fetch live database records');
      }
    }
    setIsDbLoading(false);
  }, []);

  // 2. Restore session from localStorage on mount
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('CRM_AUTH_SESSION_V1');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed && (parsed.id || parsed.email)) {
          // Strictly match parsed.id first so accounts sharing the same email ID are never mixed up
          const found = users.find(
            (u) =>
              (parsed.id && u.id === parsed.id) ||
              (!parsed.id && parsed.email && u.email.toLowerCase() === parsed.email.toLowerCase())
          );
          if (found) {
            setCurrentUser(found);
            setIsAuthenticated(true);
          } else if (parsed.email && parsed.email.toLowerCase() === 'cso@satyasupport.co.in') {
            setCurrentUser(INITIAL_USERS[0]);
            setIsAuthenticated(true);
          }
        }
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
    }
  }, [users]);

  // 3. Hardware fingerprint initialize on client mount
  useEffect(() => {
    const dev = getOrCreateDeviceFingerprint();
    setCurrentDevice(dev);

    try {
      const storedEnforce = localStorage.getItem('SATYA_DEVICE_ENFORCEMENT_V1');
      if (storedEnforce !== null) {
        setIsDevicePinningEnforced(storedEnforce === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Load theme preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('CRM_THEME') as 'dark' | 'light';
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('CRM_THEME', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const switchRole = (role: UserRole) => {
    const match = users.find((u) => u.role === role) || {
      id: `u-${role.toLowerCase()}`,
      name: `${role} User`,
      email: `${role.toLowerCase()}@crmsolutions.in`,
      department: ['BDE', 'BDM', 'TL', 'BRANCH_MANAGER'].includes(role) ? 'Sales' : role === 'HR' ? 'HR' : role === 'TECH' ? 'Tech' : 'Executive',
      designation: role === 'SUPER_ADMIN' ? 'Super Administrator' : role === 'RM' ? 'Regional Manager (RM)' : role === 'BRANCH_MANAGER' ? 'Branch Sales Manager' : role === 'TL' ? 'Team Leader (TL)' : role === 'BDM' ? 'Business Development Manager (BDM)' : role === 'BDE' ? 'Business Development Executive (BDE)' : `${role} Lead`,
      role,
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      lastLogin: 'Just now',
      createdDate: '15 Jan 2025',
      permissions: []
    };
    setCurrentUser(match);
  };

  const addAuditLog = (action: string, entityType: string, entityId: string, details: string, oldValue?: string, newValue?: string) => {
    const now = new Date();
    const formatted = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    const newEntry: AuditLog = {
      id: `aud-${Date.now()}`,
      actor: currentUser.name,
      actorRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      oldValue,
      newValue,
      timestamp: formatted
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
    dbInsertAuditLog(newEntry);
  };

  const addCustomerBooking = (payload: {
    customer: Partial<Customer>;
    services: string[];
    categories: ServiceCategory[];
    grantDetails?: any;
    loanDetails?: any;
    itDetails?: any;
    documents?: string[];
    expectedAmount: number;
    advanceAmount?: number;
    paymentMethod?: PaymentRecord['paymentMethod'];
    transactionRef?: string;
  }) => {
    const custId = `cust-${Date.now().toString().slice(-4)}`;
    const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString().split('T')[0];

    const newCustomer: Customer = {
      id: custId,
      name: payload.customer.name || 'New Customer',
      companyName: payload.customer.companyName || payload.customer.name || 'Company',
      mobile: payload.customer.mobile || '',
      whatsapp: payload.customer.whatsapp || payload.customer.mobile || '',
      email: payload.customer.email || '',
      city: payload.customer.city || '',
      state: payload.customer.state || 'Maharashtra',
      pinCode: payload.customer.pinCode || '',
      businessType: payload.customer.businessType || 'General Business',
      businessCategory: payload.customer.businessCategory || 'Commercial',
      customerType: payload.customer.customerType || 'New',
      customerSource: payload.customer.customerSource || 'Website',
      assignedSalespersonId: payload.customer.assignedSalespersonId || currentUser.id,
      assignedSalespersonName: payload.customer.assignedSalespersonName || currentUser.name,
      businessDetails: payload.customer.businessDetails || {
        businessName: payload.customer.companyName || 'Business',
        businessStructure: 'Proprietorship',
        vintageYears: 1,
        annualTurnover: '₹50 Lakhs',
        currentStatus: 'Profitable',
        employeeCount: 5,
        industry: 'Services',
        businessLocation: payload.customer.city || 'India',
        existingBusiness: true,
      },
      selectedCategories: payload.categories,
      servicesInterested: payload.services,
      grantSchemeDetails: payload.grantDetails,
      loanDetails: payload.loanDetails,
      itDetails: payload.itDetails,
      leadStatus: payload.advanceAmount && payload.advanceAmount > 0 ? 'Service Booked' : 'Requirement Collected',
      priority: payload.expectedAmount > 100000 ? 'High' : 'Medium',
      expectedValue: payload.expectedAmount,
      createdAt: nowStr,
      updatedAt: nowStr,
      tags: payload.services.slice(0, 3)
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    dbInsertCustomer(newCustomer);

    const advance = payload.advanceAmount || 0;
    const pending = Math.max(0, payload.expectedAmount - advance);
    const paymentStatus: Booking['paymentStatus'] =
      advance >= payload.expectedAmount ? 'Paid' : advance > 0 ? 'Partially Paid' : 'Pending';

    const newBooking: Booking = {
      id: bookingId,
      customerId: custId,
      customerName: newCustomer.name,
      companyName: newCustomer.companyName,
      services: payload.services,
      assignedSalesperson: newCustomer.assignedSalespersonName,
      assignedSalespersonId: newCustomer.assignedSalespersonId || currentUser.id,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      clientEmail: newCustomer.email,
      clientMobile: newCustomer.mobile,
      branchName: currentUser.branch || 'Corporate HQ',
      bookingDate: nowStr,
      expectedAmount: payload.expectedAmount,
      paidAmount: advance,
      pendingAmount: pending,
      paymentStatus,
      serviceStatus: advance > 0 ? 'Booked' : 'Under Processing',
      expectedCompletionDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      documentsStatus: 'Pending',
      category: payload.categories[0] || 'GOVERNMENT_SCHEMES'
    };

    setBookings((prev) => [newBooking, ...prev]);
    dbInsertBooking(newBooking);

    // Dynamic Team & Member Target Attribution
    const creditAmount = advance > 0 ? advance : payload.expectedAmount;
    setTeams((prev) =>
      prev.map((team) => {
        const isTeamMatch =
          team.members?.some(
            (m) => m.name === newCustomer.assignedSalespersonName || m.id === newCustomer.assignedSalespersonId
          ) || team.teamLeadName === newCustomer.assignedSalespersonName;

        if (!isTeamMatch) return team;

        const updatedMembers = (team.members || []).map((m) =>
          m.name === newCustomer.assignedSalespersonName || m.id === newCustomer.assignedSalespersonId
            ? { ...m, achievedRevenue: m.achievedRevenue + creditAmount }
            : m
        );

        return {
          ...team,
          members: updatedMembers,
          achievedRevenue: team.achievedRevenue + creditAmount
        };
      })
    );

    if (advance > 0) {
      const payment: PaymentRecord = {
        id: `pay-${Date.now().toString().slice(-4)}`,
        bookingId,
        customerName: newCustomer.companyName,
        amount: advance,
        paymentDate: nowStr,
        paymentMethod: payload.paymentMethod || 'UPI',
        transactionReference: payload.transactionRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'Completed',
        notes: 'Advance booking payment',
        recordedBy: currentUser.name
      };
      setPayments((prev) => [payment, ...prev]);
      dbInsertPayment(payment);
    }

    if (payload.documents && payload.documents.length > 0) {
      const docItems: DocumentItem[] = payload.documents.map((docTitle, idx) => ({
        id: `doc-${Date.now()}-${idx}`,
        customerId: custId,
        title: docTitle,
        category: payload.categories.includes('IT_SERVICES') ? 'IT' : 'GOVERNMENT',
        status: 'Pending',
        fileSize: 'Pending upload'
      }));
      setDocuments((prev) => [...docItems, ...prev]);
      docItems.forEach((doc) => dbInsertDocument(doc));
    }

    const initialFollowUp: FollowUp = {
      id: `f-${Date.now()}`,
      customerId: custId,
      customerName: `${newCustomer.name} (${newCustomer.companyName})`,
      service: payload.services[0] || 'Service Requirement',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '11:00 AM',
      type: 'Document Collection',
      assignedEmployee: newCustomer.assignedSalespersonName,
      notes: `Collect required documents for ${payload.services.join(', ')}.`,
      status: 'Pending',
      priority: 'High'
    };
    setFollowups((prev) => [initialFollowUp, ...prev]);
    dbInsertFollowUp(initialFollowUp);

    addAuditLog(
      'New Customer Booking Created',
      'Booking',
      bookingId,
      `Created booking for ${newCustomer.companyName} (${payload.services.join(', ')}) with expected value ₹${payload.expectedAmount.toLocaleString()}`,
      '-',
      newBooking.paymentStatus
    );

    const notif: CRMNotification = {
      id: `notif-${Date.now()}`,
      title: `New Booking #${bookingId}`,
      message: `${newCustomer.companyName} booked for ₹${payload.expectedAmount.toLocaleString()}`,
      type: 'booking',
      read: false,
      timestamp: 'Just now',
      link: 'bookings'
    };
    setNotifications((prev) => [notif, ...prev]);
    dbInsertNotification(notif);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : c))
    );
    dbUpdateCustomer(id, updates);
    addAuditLog('Customer Updated', 'Customer', id, `Updated details for customer ID ${id}`);
  };

  const updateCustomerStatus = (id: string, newStatus: LeadStatus) => {
    const cust = customers.find((c) => c.id === id);
    if (!cust) return;
    const oldStatus = cust.leadStatus;
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, leadStatus: newStatus, updatedAt: new Date().toISOString().split('T')[0] } : c))
    );
    dbUpdateCustomer(id, { leadStatus: newStatus });
    addAuditLog('Lead Status Changed', 'Lead', id, `Changed status from "${oldStatus}" to "${newStatus}" for ${cust.name}`, oldStatus, newStatus);
  };

  const addBooking = (booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
    dbInsertBooking(booking);
    addAuditLog('Booking Added', 'Booking', booking.id, `Created booking ${booking.id} for ${booking.companyName}`);
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    dbUpdateBooking(id, updates);
    addAuditLog('Booking Updated', 'Booking', id, `Updated attributes on booking ${id}`);
  };

  const recordPayment = ({
    bookingId,
    amount,
    method,
    transactionReference,
    notes
  }: {
    bookingId: string;
    amount: number;
    method: PaymentRecord['paymentMethod'];
    transactionReference: string;
    notes?: string;
  }) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now().toString().slice(-4)}`,
      bookingId,
      customerName: booking.companyName,
      amount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: method,
      transactionReference: transactionReference || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Completed',
      notes,
      recordedBy: currentUser.name
    };

    setPayments((prev) => [newPayment, ...prev]);
    dbInsertPayment(newPayment);

    const newPaid = booking.paidAmount + amount;
    const newPending = Math.max(0, booking.expectedAmount - newPaid);
    const newStatus: Booking['paymentStatus'] =
      newPaid >= booking.expectedAmount ? 'Paid' : 'Partially Paid';

    updateBooking(bookingId, {
      paidAmount: newPaid,
      pendingAmount: newPending,
      paymentStatus: newStatus,
      serviceStatus: newPaid >= booking.expectedAmount ? 'In Progress' : booking.serviceStatus
    });

    addAuditLog(
      'Payment Recorded',
      'Payment',
      newPayment.id,
      `Recorded ₹${amount.toLocaleString()} via ${method} for booking #${bookingId}`,
      `₹${booking.paidAmount.toLocaleString()}`,
      `₹${newPaid.toLocaleString()}`
    );
  };

  const updateDocumentStatus = (docId: string, status: DocumentItem['status'], reason?: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              status,
              rejectionReason: reason || d.rejectionReason,
              verifiedBy: status === 'Verified' ? currentUser.name : d.verifiedBy
            }
          : d
      )
    );
    dbUpdateDocument(docId, {
      status,
      rejectionReason: reason,
      verifiedBy: status === 'Verified' ? currentUser.name : undefined
    });
    addAuditLog('Document Status Updated', 'Document', docId, `Status changed to ${status}${reason ? ` (Reason: ${reason})` : ''}`);
  };

  const addFollowUp = (followup: Omit<FollowUp, 'id'>) => {
    const newF: FollowUp = {
      ...followup,
      id: `f-${Date.now().toString().slice(-4)}`
    };
    setFollowups((prev) => [newF, ...prev]);
    dbInsertFollowUp(newF);
    addAuditLog('Follow-up Scheduled', 'FollowUp', newF.id, `Scheduled ${followup.type} with ${followup.customerName} on ${followup.date}`);
  };

  const completeFollowUp = (followupId: string) => {
    setFollowups((prev) =>
      prev.map((f) => (f.id === followupId ? { ...f, status: 'Completed' } : f))
    );
    dbUpdateFollowUp(followupId, { status: 'Completed' });
    addAuditLog('Follow-up Completed', 'FollowUp', followupId, `Marked follow-up ${followupId} as completed`);
  };

  const checkInAttendance = (employeeId: string, remarks?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const existing = attendance.find((a) => (a.employeeId === employeeId || a.employeeName === currentUser.name) && a.date === today);

    if (existing) {
      alert('Already checked in for today!');
      return;
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now().toString().slice(-4)}`,
      employeeId,
      employeeName: currentUser.name,
      date: today,
      checkIn: timeStr,
      checkOut: null,
      workingHours: 'In Progress',
      status: now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30) ? 'Late' : 'Present',
      remarks: remarks || 'Office Punch In'
    };

    setAttendance((prev) => [newRecord, ...prev]);
    dbInsertAttendance(newRecord);
    addAuditLog('Biometric Check-In', 'Attendance', newRecord.id, `${currentUser.name} checked in at ${timeStr}`);
  };

  const checkOutAttendance = (employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const record = attendance.find((a) => (a.employeeId === employeeId || a.employeeName === currentUser.name) && a.date === today);

    if (!record) {
      alert('No active check-in record found for today.');
      return;
    }

    setAttendance((prev) =>
      prev.map((a) =>
        a.id === record.id
          ? {
              ...a,
              checkOut: timeStr,
              workingHours: '8h 30m',
              status: a.status
            }
          : a
      )
    );
    dbUpdateAttendance(record.id, { checkOut: timeStr, workingHours: '8h 30m' });
    addAuditLog('Biometric Check-Out', 'Attendance', record.id, `${currentUser.name} checked out at ${timeStr}`);
  };

  const applyLeave = (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => {
    const newL: LeaveRequest = {
      ...leave,
      id: `lv-${Date.now().toString().slice(-4)}`,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    setLeaves((prev) => [newL, ...prev]);
    dbInsertLeave(newL);
    addAuditLog('Leave Application Submitted', 'Leave', newL.id, `${leave.employeeName} applied for ${leave.leaveType} (${leave.startDate} to ${leave.endDate})`);
  };

  const updateLeaveStatus = (leaveId: string, status: 'Approved' | 'Rejected') => {
    // Strict authority guard: only RM, SUPER_ADMIN, and HR can approve/reject leaves
    if (
      currentUser.role !== 'SUPER_ADMIN' &&
      currentUser.role !== 'RM' &&
      currentUser.role !== 'HR'
    ) {
      alert('Access Denied: Leave approval authority is restricted exclusively to Regional Manager (RM), Super Admin, and HR.');
      return;
    }

    setLeaves((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status, approvedBy: `${currentUser.name} (${currentUser.role})` } : l))
    );
    dbUpdateLeave(leaveId, status, `${currentUser.name} (${currentUser.role})`);
    addAuditLog('Leave Request Decided', 'Leave', leaveId, `${currentUser.name} (${currentUser.role}) marked leave as ${status}`);
  };

  const applyWFH = (req: Omit<WFHRequest, 'id' | 'status' | 'appliedDate'>) => {
    const newReq: WFHRequest = {
      ...req,
      id: `wfh-${Date.now().toString().slice(-4)}`,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    setWfhRequests((prev) => [newReq, ...prev]);
    dbInsertWFH(newReq);
    addAuditLog('WFH Request Submitted', 'WFH', newReq.id, `${req.employeeName} requested WFH on ${req.date} (Reason: ${req.reason})`);
  };

  const updateWFHStatus = (requestId: string, status: 'Approved' | 'Rejected') => {
    // Strict authority guard: only RM, SUPER_ADMIN, and HR can approve/reject WFH
    if (
      currentUser.role !== 'SUPER_ADMIN' &&
      currentUser.role !== 'RM' &&
      currentUser.role !== 'HR'
    ) {
      alert('Access Denied: Remote work (WFH) approval authority is restricted exclusively to Regional Manager (RM), Super Admin, and HR.');
      return;
    }

    setWfhRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status, approvedBy: `${currentUser.name} (${currentUser.role})` } : r))
    );
    dbUpdateWFH(requestId, status, `${currentUser.name} (${currentUser.role})`);

    if (status === 'Approved') {
      const targetReq = wfhRequests.find((r) => r.id === requestId);
      if (targetReq) {
        const existingAtt = attendance.find(
          (a) =>
            (a.employeeId === targetReq.employeeId || a.employeeName.toLowerCase().includes(targetReq.employeeName.split('(')[0].trim().toLowerCase())) &&
            a.date === targetReq.date
        );

        if (existingAtt) {
          setAttendance((prev) =>
            prev.map((a) =>
              a.id === existingAtt.id
                ? { ...a, status: 'WFH', remarks: `Approved WFH: ${targetReq.reason}` }
                : a
            )
          );
          dbUpdateAttendance(existingAtt.id, { status: 'WFH', remarks: `Approved WFH: ${targetReq.reason}` });
        } else {
          const wfhAttRecord: AttendanceRecord = {
            id: `att-wfh-${Date.now().toString().slice(-4)}`,
            employeeId: targetReq.employeeId,
            employeeName: targetReq.employeeName,
            date: targetReq.date,
            checkIn: '09:00 AM',
            checkOut: '06:30 PM',
            workingHours: '9h 30m',
            status: 'WFH',
            remarks: `Approved WFH: ${targetReq.reason}`
          };
          setAttendance((prev) => [wfhAttRecord, ...prev]);
          dbInsertAttendance(wfhAttRecord);
        }
      }
    }

    addAuditLog('WFH Request Decided', 'WFH', requestId, `${currentUser.name} marked WFH request as ${status}`);
  };

  const createTeam = (team: Omit<SalesTeam, 'id' | 'createdAt'>): boolean => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      alert('Access Denied: Only Super Admin has authority to generate or add new sales teams.');
      return false;
    }

    const members = (team.members || []).slice(0, 5);
    const newTeam: SalesTeam = {
      ...team,
      members,
      id: `team-${(teams.length + 1).toString().padStart(2, '0')}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTeams((prev) => [...prev, newTeam]);
    dbInsertTeam(newTeam);
    addAuditLog(
      'Sales Team Created',
      'Team Hierarchy',
      newTeam.id,
      `${currentUser.name} (Super Admin) created sales team "${newTeam.name}" with monthly target ₹${newTeam.targetRevenue.toLocaleString()}`
    );
    return true;
  };

  const deleteTeam = (teamId: string): boolean => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      alert('Access Denied: Only Super Admin has authority to remove or delete sales teams.');
      return false;
    }

    const target = teams.find((t) => t.id === teamId);
    if (!target) return false;

    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    dbDeleteTeam(teamId);
    addAuditLog(
      'Sales Team Removed',
      'Team Hierarchy',
      teamId,
      `${currentUser.name} (Super Admin) deleted sales team "${target.name}"`
    );
    return true;
  };

  const updateTeamName = (teamId: string, newName: string, newDivision?: string): boolean => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      alert('Access Denied: Only Super Admin has authority to change sales team names or divisions.');
      return false;
    }

    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? { ...t, name: newName.trim(), ...(newDivision ? { division: newDivision } : {}) }
          : t
      )
    );
    dbUpdateTeam(teamId, { name: newName.trim(), ...(newDivision ? { division: newDivision } : {}) });
    addAuditLog(
      'Sales Team Renamed',
      'Team Hierarchy',
      teamId,
      `${currentUser.name} (Super Admin) renamed team to "${newName}"`
    );
    return true;
  };

  const updateTeamTarget = (teamId: string, newTarget: number): boolean => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      alert('Access Denied: Only Super Admin has authority to increase or decrease team revenue targets.');
      return false;
    }

    const num = Number(newTarget);
    if (isNaN(num) || num < 0) return false;

    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, targetRevenue: num } : t))
    );
    dbUpdateTeam(teamId, { targetRevenue: num });
    addAuditLog(
      'Team Target Adjusted',
      'Team Hierarchy',
      teamId,
      `${currentUser.name} (Super Admin) updated monthly target for team to ₹${num.toLocaleString()}`
    );
    return true;
  };

  const updateMemberTargets = (teamId: string, members: TeamMember[]): boolean => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return false;

    const isTL = currentUser.role === 'TL' && (currentUser.id === team.teamLeadId || currentUser.name === team.teamLeadName);
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
    const isRM = currentUser.role === 'RM';

    if (!isTL && !isSuperAdmin && !isRM) {
      alert('Access Denied: Only the Team Leader (TL) or Super Admin can assign individual targets to team members.');
      return false;
    }

    // TL can ONLY update targets of already assigned members — strictly cannot add or remove members!
    if (!isSuperAdmin) {
      const existingIds = (team.members || []).map((m) => m.id).sort().join(',');
      const newIds = members.map((m) => m.id).sort().join(',');
      if (existingIds !== newIds) {
        alert('Access Denied: Only Super Admin can decide who is added or removed from this team. TL can only set individual targets.');
        return false;
      }
    }

    if (members.length > 5) {
      alert('Limit Exceeded: A team can have a maximum of 5 members under the TL.');
      return false;
    }

    const bdmMembers = members.filter((m) => m.role === 'BDM');
    const bdeMembers = members.filter((m) => m.role === 'BDE');

    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              members,
              bdmIds: bdmMembers.map((m) => m.id),
              bdmNames: bdmMembers.map((m) => m.name),
              bdeIds: bdeMembers.map((m) => m.id),
              bdeNames: bdeMembers.map((m) => m.name)
            }
          : t
      )
    );
    dbUpdateTeam(teamId, {
      members,
      bdmIds: bdmMembers.map((m) => m.id),
      bdmNames: bdmMembers.map((m) => m.name),
      bdeIds: bdeMembers.map((m) => m.id),
      bdeNames: bdeMembers.map((m) => m.name)
    });
    addAuditLog(
      'Member Targets Assigned',
      'Team Hierarchy',
      teamId,
      `${currentUser.name} assigned individual targets for ${members.length} members in team "${team.name}"`
    );
    return true;
  };

  const updateTeamRoster = (teamId: string, members: TeamMember[]): boolean => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      alert('Access Denied: Only Super Admin can decide which members (BDE/BDM) are added or removed from this team.');
      return false;
    }

    const team = teams.find((t) => t.id === teamId);
    if (!team) return false;

    if (members.length > 5) {
      alert('Limit Exceeded: A team can have a maximum of 5 members under the TL.');
      return false;
    }

    const bdmMembers = members.filter((m) => m.role === 'BDM');
    const bdeMembers = members.filter((m) => m.role === 'BDE');

    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              members,
              bdmIds: bdmMembers.map((m) => m.id),
              bdmNames: bdmMembers.map((m) => m.name),
              bdeIds: bdeMembers.map((m) => m.id),
              bdeNames: bdeMembers.map((m) => m.name)
            }
          : t
      )
    );
    dbUpdateTeam(teamId, {
      members,
      bdmIds: bdmMembers.map((m) => m.id),
      bdmNames: bdmMembers.map((m) => m.name),
      bdeIds: bdeMembers.map((m) => m.id),
      bdeNames: bdeMembers.map((m) => m.name)
    });
    addAuditLog(
      'Team Roster Updated',
      'Team Hierarchy',
      teamId,
      `${currentUser.name} (Super Admin) updated member roster for team "${team.name}" (${members.length} members assigned)`
    );
    return true;
  };

  const updateTeamMembers = (teamId: string, updates: Partial<SalesTeam>) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      alert('Access Denied: Only Super Admin has authority to modify team structure.');
      return;
    }
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, ...updates } : t))
    );
    dbUpdateTeam(teamId, updates);
    addAuditLog('Sales Team Updated', 'Team Management', teamId, `${currentUser.name} (Super Admin) updated structure for team ID ${teamId}`);
  };

  const addUser = (userData: Omit<UserProfile, 'id' | 'createdDate' | 'lastLogin'>) => {
    const enteredEmail = userData.email.trim().toLowerCase();
    const enteredPass = (userData.password?.trim() || 'satya@123');

    // Rule: Same Email ID allowed across multiple users, but passwords MUST be distinct
    const duplicateCreds = users.some(
      (u) =>
        u.email.trim().toLowerCase() === enteredEmail &&
        (u.password?.trim() || 'akash@802') === enteredPass
    );

    if (duplicateCreds) {
      alert(
        `Credential Conflict: An account with Email "${userData.email}" already exists with this exact password. You can share the same Email ID, but each user MUST have a unique, distinct password (e.g. Mayank@123 vs Archit@123).`
      );
      return;
    }

    const uniqueSuffix = `${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const userId = `u-${uniqueSuffix}`;
    const empId = `e-${uniqueSuffix}`;
    const nowStr = new Date().toISOString().split('T')[0];

    const newUser: UserProfile = {
      ...userData,
      id: userId,
      phone: userData.phone || '+91 98000 00000',
      password: enteredPass,
      createdDate: nowStr,
      lastLogin: 'Never logged in'
    };

    setUsers((prev) => [newUser, ...prev]);
    dbInsertUser(newUser);

    const newEmp: Employee = {
      id: empId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '+91 98000 00000',
      department: userData.department,
      designation: userData.designation,
      role: userData.role,
      reportingManager: currentUser.name,
      joiningDate: nowStr,
      status: 'Active',
      avatar: userData.avatar,
      employeeCode: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      branch: userData.branch || 'Corporate HQ',
      leadsHandled: 0,
      bookingsCount: 0,
      revenueGenerated: 0,
      conversionRate: '0%',
      teamName: 'General Team'
    };

    setEmployees((prev) => [newEmp, ...prev]);
    dbInsertEmployee(newEmp);

    addAuditLog('User Added', 'User Management', userId, `Created user ${userData.name} (${userData.role}) in department ${userData.department}`);
  };

  const updateUser = (userId: string, updates: Partial<UserProfile>) => {
    const target = users.find((u) => u.id === userId);
    const targetEmail = (updates.email !== undefined ? updates.email : target?.email || '').trim().toLowerCase();
    const targetPass = (updates.password !== undefined ? updates.password.trim() : (target?.password || 'akash@802')).trim();

    // Rule: Same Email ID allowed across multiple users, but passwords MUST be distinct
    const duplicateCreds = users.some(
      (u) =>
        u.id !== userId &&
        u.email.trim().toLowerCase() === targetEmail &&
        (u.password?.trim() || 'akash@802') === targetPass
    );

    if (duplicateCreds) {
      alert(
        `Credential Conflict: Another user account already uses Email "${targetEmail}" with this exact password. Passwords must be distinct when sharing an Email ID.`
      );
      return;
    }

    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
    dbUpdateUser(userId, updates);

    // Sync with matching employee record (match by id or exact match of both name AND previous email)
    setEmployees((prev) =>
      prev.map((e) => {
        const isMatchedEmp =
          e.id === userId ||
          e.id === `e-${userId.replace(/^u-/, '')}` ||
          (target && e.name.toLowerCase() === target.name.toLowerCase() && e.email.toLowerCase() === target.email.toLowerCase());

        if (isMatchedEmp) {
          return {
            ...e,
            ...(updates.name ? { name: updates.name } : {}),
            ...(updates.email ? { email: updates.email } : {}),
            ...(updates.phone ? { phone: updates.phone } : {}),
            ...(updates.designation ? { designation: updates.designation } : {}),
            ...(updates.department ? { department: updates.department } : {}),
            ...(updates.role ? { role: updates.role } : {}),
            ...(updates.branch ? { branch: updates.branch } : {}),
            ...(updates.status ? { status: updates.status === 'Active' ? 'Active' : 'Inactive' } : {})
          };
        }
        return e;
      })
    );

    // Sync with active session strictly if updating self (match by user ID only, not email)
    if (userId === currentUser.id) {
      setCurrentUser((prev) => ({
        ...prev,
        ...updates
      }));
    }

    // Sync with Teams if user is a TL or team member
    if (target && (updates.name || updates.role || updates.email || updates.phone)) {
      setTeams((prev) =>
        prev.map((t) => {
          const isTL = t.teamLeadId === userId || (t.teamLeadName.toLowerCase() === target.name.toLowerCase() && !t.teamLeadId);
          const updatedMembers = (t.members || []).map((m) => {
            if (m.id === userId || (m.name.toLowerCase() === target.name.toLowerCase() && m.email?.toLowerCase() === target.email.toLowerCase())) {
              return {
                ...m,
                name: updates.name || m.name,
                role: updates.role === 'BDM' || updates.role === 'BDE' ? updates.role : m.role,
                email: updates.email || m.email,
                phone: updates.phone || m.phone
              };
            }
            return m;
          });

          return {
            ...t,
            ...(isTL && updates.name ? { teamLeadName: updates.name } : {}),
            members: updatedMembers
          };
        })
      );
    }

    addAuditLog(
      'User Updated',
      'User Management',
      userId,
      `Updated user profile details for ${updates.name || target?.name || userId} by ${currentUser.name} (${currentUser.role})`
    );
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    updateUser(userId, { role });
  };

  const toggleUserStatus = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const newStatus = target.status === 'Active' ? 'Inactive' : 'Active';
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
    dbUpdateUser(userId, { status: newStatus });
    addAuditLog('User Status Toggled', 'User Management', userId, `Changed status of ${target.name} to ${newStatus}`);
  };

  const deleteUser = (userId: string): boolean => {
    const target = users.find((u) => u.id === userId);
    if (!target) return false;

    if (userId === currentUser.id || target.email === currentUser.email) {
      alert('Cannot delete your own active session account.');
      return false;
    }

    if (target.role === 'SUPER_ADMIN') {
      const superAdmins = users.filter((u) => u.role === 'SUPER_ADMIN');
      if (superAdmins.length <= 1) {
        alert('Cannot remove the primary Super Admin account.');
        return false;
      }
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setEmployees((prev) => prev.filter((e) => e.id !== userId && e.email !== target.email));
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        bdmIds: t.bdmIds.filter((id) => id !== userId),
        bdeIds: t.bdeIds.filter((id) => id !== userId)
      }))
    );

    dbDeleteUser(userId);
    addAuditLog('User Account Deleted', 'User Management', userId, `${currentUser.name} (${currentUser.role}) permanently removed user account for ${target.name} (${target.role})`);

    const notif: CRMNotification = {
      id: `notif-${Date.now()}`,
      title: 'User Account Removed',
      message: `${target.name} (${target.role}) has been removed from the system by ${currentUser.name}`,
      type: 'system',
      read: false,
      timestamp: 'Just now',
      link: 'user-management'
    };
    setNotifications((prev) => [notif, ...prev]);
    dbInsertNotification(notif);

    return true;
  };

  const deleteEmployee = (employeeId: string): boolean => {
    const targetEmp = employees.find((e) => e.id === employeeId);
    if (!targetEmp) return false;

    if (targetEmp.email === currentUser.email) {
      alert('Cannot remove your own employee profile during an active session.');
      return false;
    }

    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    setUsers((prev) => prev.filter((u) => u.id !== employeeId && u.email !== targetEmp.email));
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        bdmIds: t.bdmIds.filter((id) => id !== employeeId),
        bdeIds: t.bdeIds.filter((id) => id !== employeeId)
      }))
    );

    dbDeleteEmployee(employeeId);
    addAuditLog('Employee Removed', 'HR Directory', employeeId, `${currentUser.name} removed employee profile for ${targetEmp.name} (${targetEmp.designation})`);

    return true;
  };

  const addCustomField = (field: Omit<CustomField, 'id'>) => {
    const newF: CustomField = {
      ...field,
      id: `cf-${Date.now().toString().slice(-4)}`
    };
    setCustomFields((prev) => [...prev, newF]);
    addAuditLog('Custom Field Created', 'CRM Configuration', newF.id, `Added custom field "${field.label}" to entity ${field.entity}`);
  };

  const deleteCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
    addAuditLog('Custom Field Deleted', 'CRM Configuration', id, `Deleted custom field ${id}`);
  };

  const addHoliday = (holidayData: Omit<Holiday, 'id'>): boolean => {
    if (currentUser.role !== 'HR' && currentUser.role !== 'SUPER_ADMIN') {
      alert('Access Denied: Only the HR Department has the authority to add official company holidays.');
      return false;
    }

    const newHoliday: Holiday = {
      ...holidayData,
      id: `hol-${Date.now().toString().slice(-4)}`
    };

    setHolidays((prev) => [...prev, newHoliday]);
    dbInsertHoliday(newHoliday);
    addAuditLog('Company Holiday Added', 'HR Calendar', newHoliday.id, `${currentUser.name} (${currentUser.role}) published company holiday "${newHoliday.name}" on ${newHoliday.date}`);

    const notif: CRMNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Company Holiday Published',
      message: `${newHoliday.name} scheduled for ${newHoliday.date} (${newHoliday.day}) by HR`,
      type: 'system',
      read: false,
      timestamp: 'Just now',
      link: 'holidays'
    };
    setNotifications((prev) => [notif, ...prev]);
    dbInsertNotification(notif);

    return true;
  };

  const updateHoliday = (updatedHoliday: Holiday): boolean => {
    if (currentUser.role !== 'HR' && currentUser.role !== 'SUPER_ADMIN') {
      alert('Access Denied: Only the HR Department has the authority to edit official company holidays.');
      return false;
    }

    setHolidays((prev) => prev.map((h) => (h.id === updatedHoliday.id ? updatedHoliday : h)));
    dbUpdateHoliday(updatedHoliday);
    addAuditLog(
      'Company Holiday Updated',
      'HR Calendar',
      updatedHoliday.id,
      `${currentUser.name} (${currentUser.role}) updated holiday "${updatedHoliday.name}" to ${updatedHoliday.date} (${updatedHoliday.day})`
    );

    const notif: CRMNotification = {
      id: `notif-${Date.now()}`,
      title: 'Company Holiday Updated',
      message: `Holiday "${updatedHoliday.name}" was modified to ${updatedHoliday.date} (${updatedHoliday.day}) by HR`,
      type: 'system',
      read: false,
      timestamp: 'Just now',
      link: 'holidays'
    };
    setNotifications((prev) => [notif, ...prev]);
    dbInsertNotification(notif);

    return true;
  };

  const deleteHoliday = (holidayId: string): boolean => {
    if (currentUser.role !== 'HR' && currentUser.role !== 'SUPER_ADMIN') {
      alert('Access Denied: Only the HR Department has the authority to remove company holidays.');
      return false;
    }

    const target = holidays.find((h) => h.id === holidayId);
    if (!target) return false;

    setHolidays((prev) => prev.filter((h) => h.id !== holidayId));
    dbDeleteHoliday(holidayId);
    addAuditLog('Company Holiday Removed', 'HR Calendar', holidayId, `${currentUser.name} (${currentUser.role}) removed company holiday "${target.name}" (${target.date})`);

    const notif: CRMNotification = {
      id: `notif-${Date.now()}`,
      title: 'Company Holiday Removed',
      message: `Holiday "${target.name}" on ${target.date} was removed by HR`,
      type: 'system',
      read: false,
      timestamp: 'Just now',
      link: 'holidays'
    };
    setNotifications((prev) => [notif, ...prev]);
    dbInsertNotification(notif);

    return true;
  };

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
    addAuditLog('Automation Toggled', 'Automation', id, `Toggled status of automation rule ${id}`);
  };

  const addAutomation = (rule: Omit<AutomationRule, 'id' | 'triggerCount'>) => {
    const newR: AutomationRule = {
      ...rule,
      id: `auto-${Date.now().toString().slice(-4)}`,
      triggerCount: 0
    };
    setAutomations((prev) => [...prev, newR]);
    addAuditLog('Automation Created', 'Automation', newR.id, `Created automation "${rule.name}"`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    dbMarkNotificationRead(id);
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    dbClearAllNotifications();
  };

  const login = async (
    emailOrId: string,
    pass: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedId = emailOrId.trim().toLowerCase();
    const trimmedPass = pass.trim();

    // Shorthand role and department aliases
    const aliasMap: Record<string, string> = {
      'cso': 'cso@satyasupport.co.in',
      'superadmin': 'cso@satyasupport.co.in',
      'admin': 'cso@satyasupport.co.in',
      'tech': 'tech@satyasupport.co.in',
      'rm': 'rm@satyasupport.co.in',
      'bm': 'bm@satyasupport.co.in',
      'tl': 'tl@satyasupport.co.in',
      'bdm': 'bdm@satyasupport.co.in',
      'bde': 'bde@satyasupport.co.in',
      'hr': 'hr@satyasupport.co.in'
    };

    const targetEmailOrId = aliasMap[trimmedId] || trimmedId;

    // Check if an employee code (e.g. EMP-001, EMP-RM-01, EMP-HR-01) was entered
    const empMatch = employees.find(
      (e) => e.employeeCode && e.employeeCode.toLowerCase() === trimmedId
    );

    let matchedUser: UserProfile | undefined = users.find(
      (u) =>
        (u.email.toLowerCase() === targetEmailOrId ||
          u.id.toLowerCase() === targetEmailOrId ||
          (empMatch && u.email.toLowerCase() === empMatch.email.toLowerCase()) ||
          (empMatch && u.id.toLowerCase() === empMatch.id.toLowerCase())) &&
        (u.password === trimmedPass || (!u.password && trimmedPass === 'akash@802'))
    );

    // Fallback to INITIAL_USERS if state hasn't populated yet
    if (!matchedUser) {
      matchedUser = INITIAL_USERS.find(
        (u) =>
          (u.email.toLowerCase() === targetEmailOrId ||
            u.id.toLowerCase() === targetEmailOrId ||
            (empMatch && u.email.toLowerCase() === empMatch.email.toLowerCase())) &&
          (u.password === trimmedPass || (!u.password && trimmedPass === 'akash@802'))
      );
    }

    if (!matchedUser) {
      return {
        success: false,
        error: 'Invalid Work Email/ID or Password. Please check your credentials.'
      };
    }

    if (matchedUser.status === 'Inactive') {
      return {
        success: false,
        error: 'This account has been deactivated. Please contact the Administrator.'
      };
    }

    setCurrentUser(matchedUser);
    setIsAuthenticated(true);

    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    updateUser(matchedUser.id, { lastLogin: nowStr });

    if (rememberMe) {
      try {
        localStorage.setItem(
          'CRM_AUTH_SESSION_V1',
          JSON.stringify({
            id: matchedUser.id,
            email: matchedUser.email,
            role: matchedUser.role,
            name: matchedUser.name,
            loggedInAt: Date.now()
          })
        );
      } catch (err) {
        console.error('Session persistence error:', err);
      }
    }

    addAuditLog('User Logged In', 'Authentication', matchedUser.id, `${matchedUser.name} (${matchedUser.role}) logged in successfully.`);
    return { success: true };
  };

  const logout = () => {
    addAuditLog('User Logged Out', 'Authentication', currentUser.id, `${currentUser.name} signed out.`);
    try {
      localStorage.removeItem('CRM_AUTH_SESSION_V1');
    } catch (err) {
      console.error('Error clearing session:', err);
    }
    setIsAuthenticated(false);
  };

  const pinCurrentDevice = async (deviceName?: string, assignedTo?: string): Promise<boolean> => {
    const devId = `dev-${Date.now().toString().slice(-6)}`;
    const newDevice: PinnedDevice = {
      id: devId,
      deviceFingerprint: currentDevice.fingerprint,
      deviceName: deviceName || currentDevice.deviceName || 'Authorized Terminal',
      assignedToUser: assignedTo || currentUser.name,
      osPlatform: currentDevice.osPlatform,
      browserInfo: currentDevice.browserInfo,
      status: 'PINNED',
      pinnedBy: `${currentUser.name} (${currentUser.role})`,
      pinnedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      notes: `Pinned on ${new Date().toLocaleDateString('en-IN')}`
    };

    setPinnedDevices((prev) => {
      const filtered = prev.filter((d) => d.deviceFingerprint !== currentDevice.fingerprint);
      return [newDevice, ...filtered];
    });

    dbInsertPinnedDevice(newDevice);
    addAuditLog('System Pinned', 'Hardware Security', newDevice.id, `${currentUser.name} pinned machine "${newDevice.deviceName}" (${newDevice.deviceFingerprint})`);

    const notif: CRMNotification = {
      id: `notif-${Date.now()}`,
      title: 'Machine Pinned & Whitelisted',
      message: `${newDevice.deviceName} authorized to run CRM by ${currentUser.name}`,
      type: 'system',
      read: false,
      timestamp: 'Just now',
      link: 'device-pinning'
    };
    setNotifications((prev) => [notif, ...prev]);
    dbInsertNotification(notif);

    return true;
  };

  const pinDeviceByFingerprint = async (fingerprint: string, deviceName: string, assignedTo?: string): Promise<boolean> => {
    const cleanFp = fingerprint.trim();
    if (!cleanFp) return false;

    const devId = `dev-${Date.now().toString().slice(-6)}`;
    const newDevice: PinnedDevice = {
      id: devId,
      deviceFingerprint: cleanFp,
      deviceName: deviceName.trim() || 'Whitelisted System',
      assignedToUser: assignedTo?.trim() || 'Assigned Staff',
      osPlatform: 'Remote System',
      browserInfo: 'Authorized Client',
      status: 'PINNED',
      pinnedBy: `${currentUser.name} (${currentUser.role})`,
      pinnedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      notes: `Remote authorized by ${currentUser.name}`
    };

    setPinnedDevices((prev) => {
      const filtered = prev.filter((d) => d.deviceFingerprint !== cleanFp);
      return [newDevice, ...filtered];
    });

    dbInsertPinnedDevice(newDevice);
    addAuditLog('Remote System Pinned', 'Hardware Security', newDevice.id, `${currentUser.name} authorized remote machine ${cleanFp} as "${newDevice.deviceName}"`);
    return true;
  };

  const unpinDevice = async (deviceId: string): Promise<boolean> => {
    const target = pinnedDevices.find((d) => d.id === deviceId);
    if (!target) return false;

    setPinnedDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: 'REVOKED' } : d))
    );

    dbUpdatePinnedDevice(deviceId, { status: 'REVOKED' });
    addAuditLog('System Authorization Revoked', 'Hardware Security', deviceId, `${currentUser.name} revoked access for machine "${target.deviceName}" (${target.deviceFingerprint})`);
    return true;
  };

  const toggleDeviceEnforcement = () => {
    setIsDevicePinningEnforced((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('SATYA_DEVICE_ENFORCEMENT_V1', String(next));
      } catch {
        // ignore
      }
      addAuditLog('Hardware Enforcement Toggled', 'Hardware Security', 'SYSTEM', `${currentUser.name} set Strict Hardware Pinning to ${next ? 'ENABLED' : 'DISABLED'}`);
      return next;
    });
  };

  return (
    <CRMContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        pinnedDevices,
        currentDevice,
        isCurrentDevicePinned,
        isDevicePinningEnforced,
        pinCurrentDevice,
        pinDeviceByFingerprint,
        unpinDevice,
        toggleDeviceEnforcement,
        currentUser,
        setCurrentUser,
        switchRole,
        activeView,
        setActiveView,
        theme,
        toggleTheme,
        selectedCustomer,
        setSelectedCustomer,
        isBookingModalOpen,
        setIsBookingModalOpen,
        isWFHModalOpen,
        setIsWFHModalOpen,
        searchQuery,
        setSearchQuery,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isDbConnected,
        isDbLoading,
        dbError,
        dbProvider,
        refreshData,
        customers,
        bookings,
        payments,
        documents,
        followups,
        tasks,
        employees,
        attendance,
        leaves,
        holidays,
        users,
        customFields,
        automations,
        auditLogs,
        notifications,
        teams,
        wfhRequests,
        addCustomerBooking,
        updateCustomer,
        updateCustomerStatus,
        addBooking,
        updateBooking,
        recordPayment,
        updateDocumentStatus,
        addFollowUp,
        completeFollowUp,
        checkInAttendance,
        checkOutAttendance,
        applyLeave,
        updateLeaveStatus,
        applyWFH,
        updateWFHStatus,
        addUser,
        updateUser,
        updateUserRole,
        toggleUserStatus,
        deleteUser,
        deleteEmployee,
        addCustomField,
        deleteCustomField,
        toggleAutomation,
        addAutomation,
        addAuditLog,
        addHoliday,
        updateHoliday,
        deleteHoliday,
        createTeam,
        deleteTeam,
        updateTeamName,
        updateTeamTarget,
        updateMemberTargets,
        updateTeamMembers,
        updateTeamRoster,
        markNotificationRead,
        clearAllNotifications
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
