import { NextResponse } from 'next/server';
import { getPostgresPool, checkPostgresHealth } from '@/lib/postgres';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'health') {
    const health = await checkPostgresHealth();
    return NextResponse.json(health);
  }

  const pool = getPostgresPool();
  if (!pool) {
    return NextResponse.json(
      { success: false, error: 'DATABASE_URL is not configured for PostgreSQL' },
      { status: 503 }
    );
  }

  try {
    // Batch fetch all CRM collections directly from PostgreSQL
    const [
      users,
      employees,
      customers,
      bookings,
      payments,
      documents,
      followups,
      tasks,
      attendance,
      leaves,
      wfhRequests,
      teams,
      auditLogs,
      notifications,
      holidays,
      customFields,
      automations,
      pinnedDevices
    ] = await Promise.all([
      pool.query('SELECT * FROM public.users ORDER BY created_at DESC').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.employees ORDER BY created_at DESC').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.customers ORDER BY created_at DESC').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.bookings ORDER BY created_at DESC').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.payments ORDER BY created_at DESC').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.documents ORDER BY created_at DESC').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.followups ORDER BY created_at DESC').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.tasks ORDER BY created_at DESC').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.attendance ORDER BY created_at DESC').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.leaves ORDER BY created_at DESC').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.wfh_requests ORDER BY created_at DESC').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.sales_teams ORDER BY created_at DESC').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.audit_logs ORDER BY created_at DESC LIMIT 100').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.notifications ORDER BY created_at DESC LIMIT 50').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.holidays ORDER BY created_at DESC').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.custom_fields ORDER BY created_at DESC').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.automation_rules ORDER BY created_at DESC').then(r => r.rows).catch(() => []),
      pool.query('SELECT * FROM public.pinned_devices ORDER BY pinned_at DESC').then(r => r.rows).catch(() => [])
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        employees,
        customers,
        bookings,
        payments,
        documents,
        followups,
        tasks,
        attendance,
        leaves,
        wfhRequests,
        teams,
        auditLogs,
        notifications,
        holidays,
        customFields,
        automations,
        pinnedDevices
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Database query error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const pool = getPostgresPool();
  if (!pool) {
    return NextResponse.json(
      { success: false, error: 'DATABASE_URL is not configured for PostgreSQL' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { table, action, data, id } = body;

    if (!table) {
      return NextResponse.json({ success: false, error: 'Table name is required' }, { status: 400 });
    }

    // Safe SQL table whitelist
    const allowedTables = [
      'users', 'employees', 'customers', 'bookings', 'payments',
      'documents', 'followups', 'tasks', 'attendance', 'leaves',
      'wfh_requests', 'sales_teams', 'audit_logs', 'notifications',
      'holidays', 'custom_fields', 'automation_rules', 'pinned_devices'
    ];

    if (!allowedTables.includes(table)) {
      return NextResponse.json({ success: false, error: 'Unauthorized table' }, { status: 403 });
    }

    if (action === 'insert') {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const cols = keys.map(k => `"${k}"`).join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

      const query = `INSERT INTO public."${table}" (${cols}) VALUES (${placeholders}) ON CONFLICT ("id") DO UPDATE SET ${keys.map(k => `"${k}" = EXCLUDED."${k}"`).join(', ')} RETURNING *;`;
      const res = await pool.query(query, values);
      return NextResponse.json({ success: true, row: res.rows[0] });
    }

    if (action === 'update') {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
      values.push(id);

      const query = `UPDATE public."${table}" SET ${setClause} WHERE "id" = $${values.length} RETURNING *;`;
      const res = await pool.query(query, values);
      return NextResponse.json({ success: true, row: res.rows[0] });
    }

    if (action === 'delete') {
      const query = `DELETE FROM public."${table}" WHERE "id" = $1;`;
      await pool.query(query, [id]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Database operation failed' },
      { status: 500 }
    );
  }
}
