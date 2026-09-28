export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'RM' 
  | 'BRANCH_MANAGER' 
  | 'TL' 
  | 'BDM' 
  | 'BDE' 
  | 'HR' 
  | 'TECH';

export type ServiceCategory = 
  | 'GOVERNMENT_GRANTS' 
  | 'GOVERNMENT_SCHEMES' 
  | 'BUSINESS_LOANS' 
  | 'IT_SERVICES';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  department: 'Sales' | 'HR' | 'Tech' | 'Operations' | 'Finance' | 'Executive';
  designation: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  avatar: string;
  lastLogin: string;
  createdDate: string;
  reportingManager?: string;
  permissions: string[];
  branch?: string;
}

export interface SalesTeam {
  id: string;
  name: string;
  division: string;
  branchName: string;
  branchManagerId: string;
  branchManagerName: string;
  teamLeadId: string;
  teamLeadName: string;
  bdmIds: string[];
  bdmNames: string[];
  bdeIds: string[];
  bdeNames: string[];
  targetRevenue: number;
  achievedRevenue: number;
  activeLeadsCount: number;
  createdAt: string;
}

export interface WFHRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: UserRole;
  date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  approvedBy?: string;
}

export interface BusinessDetails {
  businessName: string;
  businessStructure: 'Proprietorship' | 'Partnership' | 'LLP' | 'Private Limited' | 'Public Limited' | 'Startup' | 'Individual' | 'Other';
  vintageYears: number;
  annualTurnover: string;
  currentStatus: 'Profitable' | 'Break-even' | 'Early Stage' | 'Seed' | 'Growth' | 'Struggling';
  employeeCount: number;
  industry: string;
  businessLocation: string;
  existingBusiness: boolean;
}

export type LeadStatus =
  | 'New Lead'
  | 'Contacted'
  | 'Requirement Collected'
  | 'Eligibility Checking'
  | 'Documents Pending'
  | 'Documents Received'
  | 'Under Processing'
  | 'Proposal Sent'
  | 'Payment Pending'
  | 'Service Booked'
  | 'In Progress'
  | 'Completed'
  | 'Rejected'
  | 'Lost'
  | 'Follow-up Required';

export type LeadSource =
  | 'Website'
  | 'Google'
  | 'Facebook'
  | 'Instagram'
  | 'WhatsApp'
  | 'Referral'
  | 'Cold Call'
  | 'Existing Customer'
  | 'Campaign'
  | 'Walk-in'
  | 'Partner'
  | 'Other';

export interface GrantSchemeDetails {
  schemeInterestedIn: string;
  schemeType: 'Central' | 'State';
  state: string;
  fundingPurpose: string;
  requiredFundingAmount: number;
  expectedGrantAmount: number;
  businessActivity: string;
  businessStage: 'New Business' | 'Existing Business' | 'Expansion' | 'Modernization';
  eligibilityStatus: 'Eligible' | 'Needs Review' | 'Marginal' | 'Not Eligible';
  documentsAvailable: string[];
  customerRequirement: string;
  additionalNotes?: string;
}

export interface LoanRequirementDetails {
  loanType: string;
  requiredLoanAmount: number;
  purposeOfLoan: string;
  businessTurnover: string;
  monthlyRevenue: string;
  existingLoans: string;
  existingEMI: string;
  cibilScore: string;
  collateralAvailable: string;
  businessVintage: string;
  bankingRelationship: string;
  preferredBank: string;
  loanUrgency: 'Immediate' | 'Within 15 Days' | 'Within 30 Days' | 'Flexible';
  requiredTenure: string;
  additionalRequirements?: string;
}

export interface ITRequirementDetails {
  serviceRequired: string;
  projectType: 'New Project' | 'Redesign' | 'Maintenance' | 'Migration' | 'API Integration';
  businessRequirement: string;
  currentWebsite?: string;
  existingSoftware?: string;
  requiredFeatures: string[];
  estimatedBudget: number;
  expectedDeliveryDate: string;
  technologyPreference: string;
  domainAvailable: boolean;
  hostingAvailable: boolean;
  designRequired: boolean;
  maintenanceRequired: boolean;
  referenceWebsite?: string;
  additionalRequirements?: string;
}

export interface DocumentItem {
  id: string;
  customerId: string;
  title: string;
  category: 'GOVERNMENT' | 'LOAN' | 'IT' | 'OTHER';
  status: 'Uploaded' | 'Pending' | 'Verified' | 'Rejected';
  uploadedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  fileSize?: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  city: string;
  state: string;
  pinCode: string;
  businessType: string;
  businessCategory: string;
  customerType: 'New' | 'Existing' | 'Enterprise' | 'Startup';
  customerSource: LeadSource;
  assignedSalespersonId: string;
  assignedSalespersonName: string;
  businessDetails: BusinessDetails;
  selectedCategories: ServiceCategory[];
  servicesInterested: string[];
  grantSchemeDetails?: GrantSchemeDetails;
  loanDetails?: LoanRequirementDetails;
  itDetails?: ITRequirementDetails;
  leadStatus: LeadStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  expectedValue: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  companyName: string;
  services: string[];
  assignedSalesperson: string;
  bookingDate: string;
  expectedAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'Pending' | 'Partially Paid' | 'Paid' | 'Refunded';
  serviceStatus: 'Booked' | 'In Progress' | 'Under Processing' | 'Completed' | 'Delivered' | 'Cancelled';
  expectedCompletionDate: string;
  documentsStatus: 'Pending' | 'Partial' | 'Verified';
  category: ServiceCategory;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'UPI' | 'NEFT' | 'RTGS' | 'Cheque' | 'Cash' | 'Credit Card' | 'Payment Gateway';
  transactionReference: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  notes?: string;
  recordedBy: string;
}

export interface FollowUp {
  id: string;
  customerId: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  type: 
    | 'Call' 
    | 'WhatsApp' 
    | 'Email' 
    | 'Meeting' 
    | 'Document Collection' 
    | 'Payment Follow-up' 
    | 'Eligibility Follow-up' 
    | 'Loan Follow-up' 
    | 'IT Requirement Meeting' 
    | 'Demo';
  assignedEmployee: string;
  notes: string;
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Rescheduled';
  priority: 'Low' | 'Medium' | 'High';
}

export interface Task {
  id: string;
  title: string;
  customerId?: string;
  customerName?: string;
  assignedTo: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Done';
  relatedTo?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: 'Sales' | 'HR' | 'Tech' | 'Operations' | 'Finance' | 'Executive';
  designation: string;
  role: UserRole;
  reportingManager: string;
  joiningDate: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  avatar: string;
  employeeCode: string;
  branch?: string;
  // Live performance stats for RM & TL inspection
  leadsHandled?: number;
  bookingsCount?: number;
  revenueGenerated?: number;
  conversionRate?: string;
  teamName?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: string;
  status: 'Present' | 'Late' | 'Half Day' | 'Absent' | 'Leave' | 'WFH';
  remarks?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Paid Leave' | 'Unpaid Leave' | string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  approvedBy?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  day: string;
  type: 'National' | 'Gazetted' | 'Restricted' | 'Festival' | 'Optional';
  description?: string;
}

export interface CustomField {
  id: string;
  entity: 'Leads' | 'Customers' | 'Bookings' | 'Deals' | 'Employees' | 'Companies';
  label: string;
  fieldName: string;
  type: 'Text' | 'Number' | 'Currency' | 'Date' | 'Dropdown' | 'Multi-select' | 'Boolean' | 'Phone' | 'Email' | 'File Upload';
  options?: string[];
  required: boolean;
  defaultValue?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: string;
  triggerCondition: string;
  actionDescription: string;
  active: boolean;
  triggerCount: number;
  lastTriggered?: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  type: 'GOVT_LOAN' | 'IT';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'lead' | 'booking' | 'document' | 'payment' | 'followup' | 'leave' | 'system' | 'wfh';
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface PinnedDevice {
  id: string;
  deviceFingerprint: string;
  deviceName: string;
  assignedToUser?: string;
  osPlatform: string;
  browserInfo: string;
  ipAddress?: string;
  status: 'PINNED' | 'PENDING' | 'REVOKED';
  pinnedBy: string;
  pinnedAt: string;
  lastActiveAt: string;
  notes?: string;
}
