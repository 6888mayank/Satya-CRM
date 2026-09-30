-- =============================================================================
-- SATYA CRM — COMPLETE SUPABASE DATABASE SCHEMA
-- Compatible with PostgreSQL 15+ & Supabase REST API
-- =============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Migration: Drop single-column unique constraints on email to allow shared email IDs with distinct passwords
ALTER TABLE IF EXISTS public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS public.employees DROP CONSTRAINT IF EXISTS employees_email_key;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS phone TEXT;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  password TEXT DEFAULT 'akash@802',
  department TEXT,
  designation TEXT,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  avatar TEXT,
  last_login TEXT,
  created_date TEXT,
  reporting_manager TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  branch TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_email_password UNIQUE (email, password)
);

-- 2. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  designation TEXT,
  role TEXT NOT NULL,
  reporting_manager TEXT,
  joining_date TEXT,
  status TEXT DEFAULT 'Active',
  avatar TEXT,
  employee_code TEXT UNIQUE,
  branch TEXT,
  leads_handled INT DEFAULT 0,
  bookings_count INT DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  conversion_rate TEXT,
  team_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CUSTOMERS / LEADS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT,
  mobile TEXT,
  whatsapp TEXT,
  email TEXT,
  city TEXT,
  state TEXT,
  pin_code TEXT,
  business_type TEXT,
  business_category TEXT,
  customer_type TEXT DEFAULT 'New',
  customer_source TEXT DEFAULT 'Website',
  assigned_salesperson_id TEXT,
  assigned_salesperson_name TEXT,
  business_details JSONB DEFAULT '{}'::jsonb,
  selected_categories JSONB DEFAULT '[]'::jsonb,
  services_interested JSONB DEFAULT '[]'::jsonb,
  grant_scheme_details JSONB,
  loan_details JSONB,
  it_details JSONB,
  lead_status TEXT DEFAULT 'New Lead',
  priority TEXT DEFAULT 'Medium',
  expected_value NUMERIC DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  customer_name TEXT,
  company_name TEXT,
  services JSONB DEFAULT '[]'::jsonb,
  assigned_salesperson TEXT,
  booking_date TEXT,
  expected_amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  pending_amount NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'Pending',
  service_status TEXT DEFAULT 'Booked',
  expected_completion_date TEXT,
  documents_status TEXT DEFAULT 'Pending',
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT,
  customer_name TEXT,
  amount NUMERIC NOT NULL,
  payment_date TEXT,
  payment_method TEXT,
  transaction_reference TEXT,
  status TEXT DEFAULT 'Completed',
  notes TEXT,
  recorded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  title TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'Pending',
  uploaded_at TEXT,
  verified_by TEXT,
  rejection_reason TEXT,
  file_size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FOLLOW-UPS TABLE
CREATE TABLE IF NOT EXISTS public.followups (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  customer_name TEXT,
  service TEXT,
  date TEXT,
  time TEXT,
  type TEXT,
  assigned_employee TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Pending',
  priority TEXT DEFAULT 'Medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  customer_id TEXT,
  customer_name TEXT,
  assigned_to TEXT,
  due_date TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'To Do',
  related_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY,
  employee_id TEXT,
  employee_name TEXT,
  date TEXT NOT NULL,
  check_in TEXT,
  check_out TEXT,
  working_hours TEXT DEFAULT '0h',
  status TEXT DEFAULT 'Present',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. LEAVES TABLE
CREATE TABLE IF NOT EXISTS public.leaves (
  id TEXT PRIMARY KEY,
  employee_id TEXT,
  employee_name TEXT,
  department TEXT,
  leave_type TEXT,
  start_date TEXT,
  end_date TEXT,
  reason TEXT,
  status TEXT DEFAULT 'Pending',
  applied_date TEXT,
  approved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. WORK FROM HOME (WFH) TABLE
CREATE TABLE IF NOT EXISTS public.wfh_requests (
  id TEXT PRIMARY KEY,
  employee_id TEXT,
  employee_name TEXT,
  department TEXT,
  role TEXT,
  date TEXT,
  reason TEXT,
  status TEXT DEFAULT 'Pending',
  applied_date TEXT,
  approved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. SALES TEAMS & HIERARCHY TABLE
CREATE TABLE IF NOT EXISTS public.sales_teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  division TEXT,
  branch_name TEXT,
  branch_manager_id TEXT,
  branch_manager_name TEXT,
  team_lead_id TEXT,
  team_lead_name TEXT,
  bdm_ids JSONB DEFAULT '[]'::jsonb,
  bdm_names JSONB DEFAULT '[]'::jsonb,
  bde_ids JSONB DEFAULT '[]'::jsonb,
  bde_names JSONB DEFAULT '[]'::jsonb,
  target_revenue NUMERIC DEFAULT 0,
  achieved_revenue NUMERIC DEFAULT 0,
  active_leads_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  old_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  timestamp TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT,
  time TEXT,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. HOLIDAYS TABLE
CREATE TABLE IF NOT EXISTS public.holidays (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  day TEXT,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. CUSTOM FIELDS TABLE
CREATE TABLE IF NOT EXISTS public.custom_fields (
  id TEXT PRIMARY KEY,
  entity TEXT,
  name TEXT,
  label TEXT,
  type TEXT,
  required BOOLEAN DEFAULT FALSE,
  options JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. AUTOMATION RULES TABLE
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id TEXT PRIMARY KEY,
  name TEXT,
  trigger_event TEXT,
  action_type TEXT,
  active BOOLEAN DEFAULT TRUE,
  description TEXT,
  trigger_count INT DEFAULT 0,
  last_triggered TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. PINNED DEVICES (HARDWARE SECURITY & MACHINE WHITELISTING)
CREATE TABLE IF NOT EXISTS public.pinned_devices (
  id TEXT PRIMARY KEY,
  device_fingerprint TEXT UNIQUE NOT NULL,
  device_name TEXT NOT NULL,
  assigned_to_user TEXT,
  os_platform TEXT,
  browser_info TEXT,
  ip_address TEXT,
  status TEXT DEFAULT 'PINNED',
  pinned_by TEXT NOT NULL,
  pinned_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enabling public/anon read and write access for CRM operations
-- =============================================================================

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public access policy on %s" ON public.%I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "Public access policy on %s" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
  END LOOP;
END $$;

-- =============================================================================
-- SEED INITIAL ROOT SUPER ADMIN & TECH USERS
-- (Ensures administrative & security configuration access)
-- =============================================================================

INSERT INTO public.users (id, name, email, password, department, designation, role, status, avatar, last_login, created_date, branch, permissions)
VALUES (
  'u-1',
  'Satya Sharma',
  'cso@satyasupport.co.in',
  'akash@802',
  'Executive',
  'Chief Strategy Officer & Founder',
  'SUPER_ADMIN',
  'Active',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  '23 Sep 2026, 09:45 PM',
  '15 Jan 2025',
  'Corporate HQ',
  '["sales.leads.view","sales.leads.create","sales.leads.edit","sales.leads.delete","sales.bookings.view","sales.bookings.create","sales.bookings.edit","sales.payments.view","sales.payments.manage","hr.employees.view","hr.employees.create","hr.employees.edit","attendance.view","attendance.manage","users.view","users.create","users.edit","users.manage_roles","system.settings","system.device_pinning","system.custom_fields","system.automation","system.integrations","system.audit_logs"]'::jsonb
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password = EXCLUDED.password;

INSERT INTO public.users (id, name, email, password, department, designation, role, status, avatar, last_login, created_date, branch, permissions)
VALUES (
  'u-tech',
  'Aman Verma (IT & Tech Lead)',
  'tech@satyasupport.co.in',
  'akash@802',
  'Tech',
  'Lead Systems & Security Engineer',
  'TECH',
  'Active',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  '23 Sep 2026, 10:15 PM',
  '15 Jan 2025',
  'Corporate HQ',
  '["system.settings","system.device_pinning","system.custom_fields","system.automation","system.integrations","system.audit_logs","users.view","attendance.view"]'::jsonb
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password = EXCLUDED.password;

INSERT INTO public.employees (id, name, email, phone, department, designation, role, reporting_manager, joining_date, status, avatar, employee_code, branch)
VALUES (
  'e-1',
  'Satya Sharma',
  'cso@satyasupport.co.in',
  '+91 98111 22334',
  'Executive',
  'Chief Strategy Officer & Founder',
  'SUPER_ADMIN',
  'Board of Directors',
  '01 Jan 2024',
  'Active',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'EMP-001',
  'Corporate HQ'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.employees (id, name, email, phone, department, designation, role, reporting_manager, joining_date, status, avatar, employee_code, branch)
VALUES (
  'e-tech',
  'Aman Verma (IT & Tech Lead)',
  'tech@satyasupport.co.in',
  '+91 98222 33445',
  'Tech',
  'Lead Systems & Security Engineer',
  'TECH',
  'Satya Sharma',
  '01 Feb 2024',
  'Active',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'EMP-TECH-01',
  'Corporate HQ'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

