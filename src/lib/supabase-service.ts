import { supabase, isSupabaseConfigured, checkRenderPostgresConnection } from './supabase';
import {
  UserProfile,
  Customer,
  Booking,
  PaymentRecord,
  DocumentItem,
  FollowUp,
  Task,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  WFHRequest,
  SalesTeam,
  AuditLog,
  Notification as CRMNotification,
  Holiday,
  CustomField,
  AutomationRule,
  PinnedDevice
} from '@/types/crm';

// =============================================================================
// POSTGRESQL API HELPER (For Render PostgreSQL / Direct PG Pool via /api/db)
// =============================================================================

export async function callPostgresApi(table: string, action: 'insert' | 'update' | 'delete', data?: any, id?: string) {
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, action, data, id })
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

// =============================================================================
// HELPER TRANSFORMERS (Postgres snake_case <-> TypeScript camelCase)
// =============================================================================

function mapUserFromDb(row: any): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password || undefined,
    department: row.department || 'Sales',
    designation: row.designation || 'Staff',
    role: row.role || 'BDE',
    status: row.status || 'Active',
    avatar: row.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    lastLogin: row.last_login || new Date().toLocaleString('en-IN'),
    createdDate: row.created_date || new Date().toISOString().split('T')[0],
    reportingManager: row.reporting_manager,
    permissions: Array.isArray(row.permissions) ? row.permissions : [],
    branch: row.branch || 'Corporate HQ'
  };
}

function mapEmployeeFromDb(row: any): Employee {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    department: row.department || 'Sales',
    designation: row.designation || 'Staff',
    role: row.role || 'BDE',
    reportingManager: row.reporting_manager || 'Satya Sharma',
    joiningDate: row.joining_date || new Date().toISOString().split('T')[0],
    status: row.status || 'Active',
    avatar: row.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    employeeCode: row.employee_code || row.id,
    branch: row.branch || 'Corporate HQ',
    leadsHandled: row.leads_handled || 0,
    bookingsCount: row.bookings_count || 0,
    revenueGenerated: row.revenue_generated || 0,
    conversionRate: row.conversion_rate || '0%',
    teamName: row.team_name || 'General Team'
  };
}

function mapCustomerFromDb(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    companyName: row.company_name || '',
    mobile: row.mobile || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    city: row.city || '',
    state: row.state || '',
    pinCode: row.pin_code || '',
    businessType: row.business_type || '',
    businessCategory: row.business_category || '',
    customerType: row.customer_type || 'New',
    customerSource: row.customer_source || 'Website',
    assignedSalespersonId: row.assigned_salesperson_id || '',
    assignedSalespersonName: row.assigned_salesperson_name || 'Unassigned',
    businessDetails: row.business_details || {},
    selectedCategories: Array.isArray(row.selected_categories) ? row.selected_categories : [],
    servicesInterested: Array.isArray(row.services_interested) ? row.services_interested : [],
    grantSchemeDetails: row.grant_scheme_details,
    loanDetails: row.loan_details,
    itDetails: row.it_details,
    leadStatus: row.lead_status || 'New Lead',
    priority: row.priority || 'Medium',
    expectedValue: Number(row.expected_value) || 0,
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

function mapBookingFromDb(row: any): Booking {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name || '',
    companyName: row.company_name || '',
    services: Array.isArray(row.services) ? row.services : [],
    assignedSalesperson: row.assigned_salesperson || 'Unassigned',
    bookingDate: row.booking_date || new Date().toISOString(),
    expectedAmount: Number(row.expected_amount) || 0,
    paidAmount: Number(row.paid_amount) || 0,
    pendingAmount: Number(row.pending_amount) || 0,
    paymentStatus: row.payment_status || 'Pending',
    serviceStatus: row.service_status || 'Booked',
    expectedCompletionDate: row.expected_completion_date || '',
    documentsStatus: row.documents_status || 'Pending',
    category: row.category || 'GOVERNMENT_SCHEMES'
  };
}

function mapPaymentFromDb(row: any): PaymentRecord {
  return {
    id: row.id,
    bookingId: row.booking_id,
    customerName: row.customer_name || '',
    amount: Number(row.amount) || 0,
    paymentDate: row.payment_date || new Date().toISOString(),
    paymentMethod: row.payment_method || 'UPI',
    transactionReference: row.transaction_reference || '',
    status: row.status || 'Completed',
    notes: row.notes,
    recordedBy: row.recorded_by || 'System'
  };
}

function mapAttendanceFromDb(row: any): AttendanceRecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name || '',
    date: row.date,
    checkIn: row.check_in,
    checkOut: row.check_out,
    workingHours: row.working_hours || '0h',
    status: row.status || 'Present',
    remarks: row.remarks
  };
}

function mapLeaveFromDb(row: any): LeaveRequest {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name || '',
    leaveType: row.leave_type || 'Casual Leave',
    startDate: row.start_date,
    endDate: row.end_date,
    days: Number(row.days) || 1,
    reason: row.reason || '',
    status: row.status || 'Pending',
    appliedDate: row.applied_date || new Date().toISOString().split('T')[0],
    approvedBy: row.approved_by
  };
}

function mapWFHFromDb(row: any): WFHRequest {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name || '',
    department: row.department || 'Sales',
    role: row.role || 'BDE',
    date: row.date,
    reason: row.reason || '',
    status: row.status || 'Pending',
    appliedDate: row.applied_date || new Date().toISOString().split('T')[0],
    approvedBy: row.approved_by
  };
}

function mapTeamFromDb(row: any): SalesTeam {
  return {
    id: row.id,
    name: row.name,
    division: row.division || '',
    branchName: row.branch_name || '',
    branchManagerId: row.branch_manager_id || '',
    branchManagerName: row.branch_manager_name || '',
    teamLeadId: row.team_lead_id || '',
    teamLeadName: row.team_lead_name || '',
    bdmIds: Array.isArray(row.bdm_ids) ? row.bdm_ids : [],
    bdmNames: Array.isArray(row.bdm_names) ? row.bdm_names : [],
    bdeIds: Array.isArray(row.bde_ids) ? row.bde_ids : [],
    bdeNames: Array.isArray(row.bde_names) ? row.bde_names : [],
    targetRevenue: Number(row.target_revenue) || 0,
    achievedRevenue: Number(row.achieved_revenue) || 0,
    activeLeadsCount: Number(row.active_leads_count) || 0,
    createdAt: row.created_at || new Date().toISOString()
  };
}

function mapDeviceFromDb(row: any): PinnedDevice {
  return {
    id: row.id,
    deviceFingerprint: row.device_fingerprint,
    deviceName: row.device_name || 'Authorized Machine',
    assignedToUser: row.assigned_to_user,
    osPlatform: row.os_platform || 'Desktop',
    browserInfo: row.browser_info || 'Browser',
    ipAddress: row.ip_address,
    status: (row.status as any) || 'PINNED',
    pinnedBy: row.pinned_by || 'Tech Admin',
    pinnedAt: row.pinned_at || new Date().toISOString(),
    lastActiveAt: row.last_active_at || new Date().toISOString(),
    notes: row.notes
  };
}

// =============================================================================
// BATCH DATA FETCH (Loads live state from Supabase)
// =============================================================================

export interface LiveCRMData {
  users: UserProfile[];
  employees: Employee[];
  customers: Customer[];
  bookings: Booking[];
  payments: PaymentRecord[];
  documents: DocumentItem[];
  followups: FollowUp[];
  tasks: Task[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  wfhRequests: WFHRequest[];
  teams: SalesTeam[];
  auditLogs: AuditLog[];
  notifications: CRMNotification[];
  holidays: Holiday[];
  customFields: CustomField[];
  automations: AutomationRule[];
  pinnedDevices: PinnedDevice[];
}

export function mapAllCollections(raw: any): LiveCRMData {
  return {
    users: (raw.users || []).map(mapUserFromDb),
    employees: (raw.employees || []).map(mapEmployeeFromDb),
    customers: (raw.customers || []).map(mapCustomerFromDb),
    bookings: (raw.bookings || []).map(mapBookingFromDb),
    payments: (raw.payments || []).map(mapPaymentFromDb),
    documents: (raw.documents || []).map((d: any) => ({
      id: d.id,
      customerId: d.customer_id,
      title: d.title,
      category: d.category,
      status: d.status,
      uploadedAt: d.uploaded_at,
      verifiedBy: d.verified_by,
      rejectionReason: d.rejection_reason,
      fileSize: d.file_size
    })),
    followups: (raw.followups || []).map((f: any) => ({
      id: f.id,
      customerId: f.customer_id,
      customerName: f.customer_name,
      service: f.service,
      date: f.date,
      time: f.time,
      type: f.type,
      assignedEmployee: f.assigned_employee,
      notes: f.notes,
      status: f.status,
      priority: f.priority
    })),
    tasks: (raw.tasks || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      customerId: t.customer_id,
      customerName: t.customer_name,
      assignedTo: t.assigned_to,
      dueDate: t.due_date,
      priority: t.priority,
      status: t.status,
      relatedTo: t.related_to
    })),
    attendance: (raw.attendance || []).map(mapAttendanceFromDb),
    leaves: (raw.leaves || []).map(mapLeaveFromDb),
    wfhRequests: (raw.wfhRequests || raw.wfh_requests || []).map(mapWFHFromDb),
    teams: (raw.teams || raw.sales_teams || []).map(mapTeamFromDb),
    auditLogs: (raw.auditLogs || raw.audit_logs || []).map((a: any) => ({
      id: a.id,
      actor: a.actor || a.user_name || 'System User',
      actorRole: a.actor_role || a.user_role || 'SUPER_ADMIN',
      action: a.action,
      entityType: a.entity_type,
      entityId: a.entity_id,
      details: a.details,
      oldValue: a.old_value,
      newValue: a.new_value,
      timestamp: a.timestamp || new Date().toLocaleString('en-IN')
    })),
    notifications: (raw.notifications || []).map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type || 'system',
      read: Boolean(n.read),
      timestamp: n.timestamp || n.time || 'Just now',
      link: n.link || n.action_url
    })),
    holidays: (raw.holidays || []).map((h: any) => ({
      id: h.id,
      name: h.name,
      date: h.date,
      day: h.day,
      type: h.type
    })),
    customFields: (raw.customFields || raw.custom_fields || []).map((c: any) => ({
      id: c.id,
      entity: c.entity || 'Leads',
      label: c.label || c.name || '',
      fieldName: c.field_name || c.name || '',
      type: c.type || 'Text',
      required: Boolean(c.required),
      options: Array.isArray(c.options) ? c.options : [],
      defaultValue: c.default_value
    })),
    automations: (raw.automations || raw.automation_rules || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      triggerEvent: r.trigger_event || 'Customer Created',
      triggerCondition: r.trigger_condition || 'Always',
      actionDescription: r.action_description || r.description || '',
      active: Boolean(r.active),
      triggerCount: r.trigger_count || 0,
      lastTriggered: r.last_triggered
    })),
    pinnedDevices: (raw.pinnedDevices || raw.pinned_devices || []).map(mapDeviceFromDb)
  };
}

export async function fetchLiveCRMData(): Promise<{
  success: boolean;
  data?: LiveCRMData;
  error?: string;
  provider?: 'render' | 'supabase';
}> {
  // 1. Try Render PostgreSQL via /api/db first
  try {
    const pgPing = await checkRenderPostgresConnection();
    if (pgPing.connected) {
      const res = await fetch('/api/db');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return {
            success: true,
            provider: 'render',
            data: mapAllCollections(json.data)
          };
        }
      }
    }
  } catch {
    // Fall through to Supabase
  }

  // 2. Next check Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const [
        usersRes,
        employeesRes,
        customersRes,
        bookingsRes,
        paymentsRes,
        docsRes,
        followupsRes,
        tasksRes,
        attendanceRes,
        leavesRes,
        wfhRes,
        teamsRes,
        auditRes,
        notifsRes,
        holidaysRes,
        fieldsRes,
        automationsRes,
        devicesRes
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('documents').select('*'),
        supabase.from('followups').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('attendance').select('*').order('date', { ascending: false }),
        supabase.from('leaves').select('*').order('created_at', { ascending: false }),
        supabase.from('wfh_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('sales_teams').select('*'),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('holidays').select('*'),
        supabase.from('custom_fields').select('*'),
        supabase.from('automation_rules').select('*'),
        supabase.from('pinned_devices').select('*').order('pinned_at', { ascending: false })
      ]);

      if (usersRes.error && usersRes.error.code === '42P01') {
        return {
          success: false,
          error: 'Tables not found. Please run the supabase_schema.sql script in your SQL Editor.'
        };
      }

      return {
        success: true,
        provider: 'supabase',
        data: mapAllCollections({
          users: usersRes.data,
          employees: employeesRes.data,
          customers: customersRes.data,
          bookings: bookingsRes.data,
          payments: paymentsRes.data,
          documents: docsRes.data,
          followups: followupsRes.data,
          tasks: tasksRes.data,
          attendance: attendanceRes.data,
          leaves: leavesRes.data,
          wfhRequests: wfhRes.data,
          teams: teamsRes.data,
          auditLogs: auditRes.data,
          notifications: notifsRes.data,
          holidays: holidaysRes.data,
          customFields: fieldsRes.data,
          automations: automationsRes.data,
          pinnedDevices: devicesRes.data
        })
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to fetch Supabase data' };
    }
  }

  return {
    success: false,
    error: 'No database connected. Configure Render PostgreSQL (DATABASE_URL) or Supabase (NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local'
  };
}

// =============================================================================
// DATABASE MUTATORS (Writes live changes to Render PostgreSQL & Supabase)
// =============================================================================

export async function dbInsertCustomer(customer: Customer) {
  const payload = {
    id: customer.id,
    name: customer.name,
    company_name: customer.companyName,
    mobile: customer.mobile,
    whatsapp: customer.whatsapp,
    email: customer.email,
    city: customer.city,
    state: customer.state,
    pin_code: customer.pinCode,
    business_type: customer.businessType,
    business_category: customer.businessCategory,
    customer_type: customer.customerType,
    customer_source: customer.customerSource,
    assigned_salesperson_id: customer.assignedSalespersonId,
    assigned_salesperson_name: customer.assignedSalespersonName,
    business_details: customer.businessDetails,
    selected_categories: customer.selectedCategories,
    services_interested: customer.servicesInterested,
    grant_scheme_details: customer.grantSchemeDetails,
    loan_details: customer.loanDetails,
    it_details: customer.itDetails,
    lead_status: customer.leadStatus,
    priority: customer.priority,
    expected_value: customer.expectedValue,
    tags: customer.tags,
    created_at: customer.createdAt,
    updated_at: customer.updatedAt
  };

  callPostgresApi('customers', 'insert', payload, customer.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('customers').insert(payload);
  }
}

export async function dbUpdateCustomer(id: string, updates: Partial<Customer>) {
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.companyName !== undefined) payload.company_name = updates.companyName;
  if (updates.mobile !== undefined) payload.mobile = updates.mobile;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.leadStatus !== undefined) payload.lead_status = updates.leadStatus;
  if (updates.priority !== undefined) payload.priority = updates.priority;
  if (updates.expectedValue !== undefined) payload.expected_value = updates.expectedValue;
  if (updates.assignedSalespersonName !== undefined) payload.assigned_salesperson_name = updates.assignedSalespersonName;
  if (updates.assignedSalespersonId !== undefined) payload.assigned_salesperson_id = updates.assignedSalespersonId;

  callPostgresApi('customers', 'update', payload, id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('customers').update(payload).eq('id', id);
  }
}

export async function dbInsertBooking(booking: Booking) {
  const payload = {
    id: booking.id,
    customer_id: booking.customerId,
    customer_name: booking.customerName,
    company_name: booking.companyName,
    services: booking.services,
    assigned_salesperson: booking.assignedSalesperson,
    booking_date: booking.bookingDate,
    expected_amount: booking.expectedAmount,
    paid_amount: booking.paidAmount,
    pending_amount: booking.pendingAmount,
    payment_status: booking.paymentStatus,
    service_status: booking.serviceStatus,
    expected_completion_date: booking.expectedCompletionDate,
    documents_status: booking.documentsStatus,
    category: booking.category
  };

  callPostgresApi('bookings', 'insert', payload, booking.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('bookings').insert(payload);
  }
}

export async function dbUpdateBooking(id: string, updates: Partial<Booking>) {
  const payload: any = {};
  if (updates.paidAmount !== undefined) payload.paid_amount = updates.paidAmount;
  if (updates.pendingAmount !== undefined) payload.pending_amount = updates.pendingAmount;
  if (updates.paymentStatus !== undefined) payload.payment_status = updates.paymentStatus;
  if (updates.serviceStatus !== undefined) payload.service_status = updates.serviceStatus;
  if (updates.documentsStatus !== undefined) payload.documents_status = updates.documentsStatus;

  callPostgresApi('bookings', 'update', payload, id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('bookings').update(payload).eq('id', id);
  }
}

export async function dbInsertPayment(payment: PaymentRecord) {
  const payload = {
    id: payment.id,
    booking_id: payment.bookingId,
    customer_name: payment.customerName,
    amount: payment.amount,
    payment_date: payment.paymentDate,
    payment_method: payment.paymentMethod,
    transaction_reference: payment.transactionReference,
    status: payment.status,
    notes: payment.notes,
    recorded_by: payment.recordedBy
  };

  callPostgresApi('payments', 'insert', payload, payment.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('payments').insert(payload);
  }
}

export async function dbInsertDocument(doc: DocumentItem) {
  const payload = {
    id: doc.id,
    customer_id: doc.customerId,
    title: doc.title,
    category: doc.category,
    status: doc.status,
    uploaded_at: doc.uploadedAt,
    verified_by: doc.verifiedBy,
    rejection_reason: doc.rejectionReason,
    file_size: doc.fileSize
  };

  callPostgresApi('documents', 'insert', payload, doc.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('documents').insert(payload);
  }
}

export async function dbUpdateDocument(id: string, updates: Partial<DocumentItem>) {
  const payload: any = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.rejectionReason !== undefined) payload.rejection_reason = updates.rejectionReason;
  if (updates.verifiedBy !== undefined) payload.verified_by = updates.verifiedBy;

  callPostgresApi('documents', 'update', payload, id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('documents').update(payload).eq('id', id);
  }
}

export async function dbInsertFollowUp(followup: FollowUp) {
  const payload = {
    id: followup.id,
    customer_id: followup.customerId,
    customer_name: followup.customerName,
    service: followup.service,
    date: followup.date,
    time: followup.time,
    type: followup.type,
    assigned_employee: followup.assignedEmployee,
    notes: followup.notes,
    status: followup.status,
    priority: followup.priority
  };

  callPostgresApi('followups', 'insert', payload, followup.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('followups').insert(payload);
  }
}

export async function dbUpdateFollowUp(id: string, updates: Partial<FollowUp>) {
  callPostgresApi('followups', 'update', updates, id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('followups').update(updates).eq('id', id);
  }
}

export async function dbInsertAttendance(rec: AttendanceRecord) {
  const payload = {
    id: rec.id,
    employee_id: rec.employeeId,
    employee_name: rec.employeeName,
    date: rec.date,
    check_in: rec.checkIn,
    check_out: rec.checkOut,
    working_hours: rec.workingHours,
    status: rec.status,
    remarks: rec.remarks
  };

  callPostgresApi('attendance', 'insert', payload, rec.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('attendance').insert(payload);
  }
}

export async function dbUpdateAttendance(id: string, updates: Partial<AttendanceRecord>) {
  const payload: any = {};
  if (updates.checkOut !== undefined) payload.check_out = updates.checkOut;
  if (updates.workingHours !== undefined) payload.working_hours = updates.workingHours;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.remarks !== undefined) payload.remarks = updates.remarks;

  callPostgresApi('attendance', 'update', payload, id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('attendance').update(payload).eq('id', id);
  }
}

export async function dbInsertLeave(leave: LeaveRequest) {
  const payload = {
    id: leave.id,
    employee_id: leave.employeeId,
    employee_name: leave.employeeName,
    leave_type: leave.leaveType,
    start_date: leave.startDate,
    end_date: leave.endDate,
    days: leave.days,
    reason: leave.reason,
    status: leave.status,
    applied_date: leave.appliedDate,
    approved_by: leave.approvedBy
  };

  callPostgresApi('leaves', 'insert', payload, leave.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('leaves').insert(payload);
  }
}

export async function dbUpdateLeave(id: string, status: string, approvedBy?: string) {
  const payload = { status, approved_by: approvedBy };
  callPostgresApi('leaves', 'update', payload, id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('leaves').update(payload).eq('id', id);
  }
}

export async function dbInsertWFH(wfh: WFHRequest) {
  const payload = {
    id: wfh.id,
    employee_id: wfh.employeeId,
    employee_name: wfh.employeeName,
    department: wfh.department,
    role: wfh.role,
    date: wfh.date,
    reason: wfh.reason,
    status: wfh.status,
    applied_date: wfh.appliedDate,
    approved_by: wfh.approvedBy
  };

  callPostgresApi('wfh_requests', 'insert', payload, wfh.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('wfh_requests').insert(payload);
  }
}

export async function dbUpdateWFH(id: string, status: string, approvedBy?: string) {
  const payload = { status, approved_by: approvedBy };
  callPostgresApi('wfh_requests', 'update', payload, id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('wfh_requests').update(payload).eq('id', id);
  }
}

export async function dbInsertUser(user: UserProfile) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password || 'akash@802',
    department: user.department,
    designation: user.designation,
    role: user.role,
    status: user.status,
    avatar: user.avatar,
    last_login: user.lastLogin,
    created_date: user.createdDate,
    reporting_manager: user.reportingManager,
    permissions: user.permissions,
    branch: user.branch
  };

  callPostgresApi('users', 'insert', payload, user.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('users').insert(payload);
  }
}

export async function dbUpdateUser(id: string, updates: Partial<UserProfile>) {
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.department !== undefined) payload.department = updates.department;
  if (updates.designation !== undefined) payload.designation = updates.designation;
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.password !== undefined) payload.password = updates.password;
  if (updates.lastLogin !== undefined) payload.last_login = updates.lastLogin;
  if (updates.permissions !== undefined) payload.permissions = updates.permissions;

  callPostgresApi('users', 'update', payload, id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('users').update(payload).eq('id', id);
  }
}

export async function dbDeleteUser(id: string) {
  callPostgresApi('users', 'delete', undefined, id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('users').delete().eq('id', id);
  }
}

export async function dbInsertEmployee(emp: Employee) {
  const payload = {
    id: emp.id,
    name: emp.name,
    email: emp.email,
    phone: emp.phone,
    department: emp.department,
    designation: emp.designation,
    role: emp.role,
    reporting_manager: emp.reportingManager,
    joining_date: emp.joiningDate,
    status: emp.status,
    avatar: emp.avatar,
    employee_code: emp.employeeCode,
    branch: emp.branch
  };

  callPostgresApi('employees', 'insert', payload, emp.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('employees').insert(payload);
  }
}

export async function dbDeleteEmployee(id: string) {
  callPostgresApi('employees', 'delete', undefined, id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('employees').delete().eq('id', id);
  }
}

export async function dbInsertTeam(team: SalesTeam) {
  const payload = {
    id: team.id,
    name: team.name,
    division: team.division,
    branch_name: team.branchName,
    branch_manager_id: team.branchManagerId,
    branch_manager_name: team.branchManagerName,
    team_lead_id: team.teamLeadId,
    team_lead_name: team.teamLeadName,
    bdm_ids: team.bdmIds,
    bdm_names: team.bdmNames,
    bde_ids: team.bdeIds,
    bde_names: team.bdeNames,
    target_revenue: team.targetRevenue,
    achieved_revenue: team.achievedRevenue,
    active_leads_count: team.activeLeadsCount
  };

  callPostgresApi('sales_teams', 'insert', payload, team.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('sales_teams').insert(payload);
  }
}

export async function dbUpdateTeam(id: string, updates: Partial<SalesTeam>) {
  callPostgresApi('sales_teams', 'update', updates, id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('sales_teams').update(updates).eq('id', id);
  }
}

export async function dbInsertAuditLog(log: AuditLog) {
  const payload = {
    id: log.id,
    actor: log.actor,
    actor_role: log.actorRole,
    action: log.action,
    entity_type: log.entityType,
    entity_id: log.entityId,
    details: log.details,
    old_value: log.oldValue,
    new_value: log.newValue,
    timestamp: log.timestamp
  };

  callPostgresApi('audit_logs', 'insert', payload, log.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('audit_logs').insert(payload);
  }
}

export async function dbInsertNotification(notif: CRMNotification) {
  const payload = {
    id: notif.id,
    title: notif.title,
    message: notif.message,
    type: notif.type,
    read: notif.read,
    timestamp: notif.timestamp,
    link: notif.link
  };

  callPostgresApi('notifications', 'insert', payload, notif.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('notifications').insert(payload);
  }
}

export async function dbMarkNotificationRead(id: string) {
  const payload = { read: true };
  callPostgresApi('notifications', 'update', payload, id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('notifications').update(payload).eq('id', id);
  }
}

export async function dbClearAllNotifications() {
  if (isSupabaseConfigured) {
    await supabase.from('notifications').delete().neq('id', '');
  }
}

export async function dbInsertHoliday(holiday: Holiday) {
  const payload = {
    id: holiday.id,
    name: holiday.name,
    date: holiday.date,
    day: holiday.day,
    type: holiday.type,
    description: holiday.description || ''
  };

  callPostgresApi('holidays', 'insert', payload, holiday.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('holidays').insert(payload);
  }
}

export async function dbUpdateHoliday(holiday: Holiday) {
  const payload = {
    name: holiday.name,
    date: holiday.date,
    day: holiday.day,
    type: holiday.type,
    description: holiday.description || ''
  };

  callPostgresApi('holidays', 'update', payload, holiday.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('holidays').update(payload).eq('id', holiday.id);
  }
}

export async function dbDeleteHoliday(id: string) {
  callPostgresApi('holidays', 'delete', undefined, id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('holidays').delete().eq('id', id);
  }
}

export async function dbInsertPinnedDevice(device: PinnedDevice) {
  const payload = {
    id: device.id,
    device_fingerprint: device.deviceFingerprint,
    device_name: device.deviceName,
    assigned_to_user: device.assignedToUser,
    os_platform: device.osPlatform,
    browser_info: device.browserInfo,
    ip_address: device.ipAddress,
    status: device.status,
    pinned_by: device.pinnedBy,
    pinned_at: device.pinnedAt,
    last_active_at: device.lastActiveAt,
    notes: device.notes
  };

  callPostgresApi('pinned_devices', 'insert', payload, device.id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('pinned_devices').upsert(payload);
  }
}

export async function dbUpdatePinnedDevice(id: string, updates: Partial<PinnedDevice>) {
  const payload: any = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.deviceName !== undefined) payload.device_name = updates.deviceName;
  if (updates.assignedToUser !== undefined) payload.assigned_to_user = updates.assignedToUser;
  if (updates.lastActiveAt !== undefined) payload.last_active_at = updates.lastActiveAt;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  callPostgresApi('pinned_devices', 'update', payload, id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('pinned_devices').update(payload).eq('id', id);
  }
}

export async function dbDeletePinnedDevice(id: string) {
  callPostgresApi('pinned_devices', 'delete', undefined, id).catch(() => {});

  if (isSupabaseConfigured) {
    await supabase.from('pinned_devices').delete().eq('id', id);
  }
}

