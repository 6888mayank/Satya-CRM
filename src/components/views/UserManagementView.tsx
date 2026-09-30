'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { UserRole, UserProfile } from '@/types/crm';
import { GRANULAR_PERMISSIONS } from '@/lib/constants';
import {
  UserCog,
  Plus,
  ShieldAlert,
  Search,
  Check,
  X,
  Lock,
  RotateCcw,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Key,
  Trash2,
  AlertTriangle,
  Edit2,
  Phone,
  Mail,
  Building,
  MapPin
} from 'lucide-react';

export default function UserManagementView() {
  const {
    users,
    employees,
    currentUser,
    addUser,
    updateUserRole,
    toggleUserStatus,
    updateUser,
    deleteUser
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'users' | 'permissions'>('users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // New user modal
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDepartment, setNewDepartment] = useState<UserProfile['department']>('Sales');
  const [newDesignation, setNewDesignation] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('BDE');
  const [newBranch, setNewBranch] = useState<'ND1' | 'ND2'>('ND1');
  const [newPassword, setNewPassword] = useState('');
  const [createUserError, setCreateUserError] = useState<string | null>(null);

  // Comprehensive Edit User state (Allows HR / CSO to edit any profile details)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editDepartment, setEditDepartment] = useState<UserProfile['department']>('Sales');
  const [editRole, setEditRole] = useState<UserRole>('BDE');
  const [editBranch, setEditBranch] = useState<'ND1' | 'ND2'>('ND1');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>('Active');
  const [editPassword, setEditPassword] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState(false);
  const [editUserError, setEditUserError] = useState<string | null>(null);

  // Authorization check: Super Admin, RM, HR, and Tech can access
  const isAuthorized =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'RM' ||
    currentUser.role === 'HR' ||
    currentUser.role === 'TECH';

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-3" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Access Restricted</h3>
        <p className="text-xs text-slate-500 max-w-md mt-1">
          User Management is strictly restricted to <strong>Super Admin</strong>, <strong>RM</strong>, <strong>HR</strong>, and authorized <strong>Tech</strong> personnel.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openEditModal = (u: UserProfile) => {
    setSelectedUserForEdit(u);
    setEditName(u.name);
    setEditEmail(u.email);
    const matchingEmp = employees.find(
      (e) => e.id === u.id || (e.name.toLowerCase() === u.name.toLowerCase() && e.email.toLowerCase() === u.email.toLowerCase())
    );
    setEditPhone(u.phone || matchingEmp?.phone || '');
    setEditDesignation(u.designation);
    setEditDepartment(u.department);
    setEditRole(u.role);
    setEditBranch(u.branch === 'ND2' ? 'ND2' : 'ND1');
    setEditStatus(u.status);
    setEditPassword(u.password || '');
    setEditSuccessMsg(false);
    setEditUserError(null);
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    setEditUserError(null);

    const targetEmail = editEmail.trim().toLowerCase();
    const targetPass = editPassword.trim() || selectedUserForEdit.password?.trim() || 'akash@802';

    // Rule: Same Email ID allowed across multiple accounts, BUT passwords MUST be distinct
    const duplicateCreds = users.some(
      (u) =>
        u.id !== selectedUserForEdit.id &&
        u.email.trim().toLowerCase() === targetEmail &&
        (u.password?.trim() || 'akash@802') === targetPass
    );

    if (duplicateCreds) {
      setEditUserError(
        `Duplicate Credentials: Another account already uses Email "${editEmail.trim()}" with this exact password. You can share the same Email ID, but passwords must be different (e.g. Mayank@123 vs Archit@123).`
      );
      return;
    }

    updateUser(selectedUserForEdit.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      designation: editDesignation.trim(),
      department: editDepartment,
      role: editRole,
      branch: editBranch,
      status: editStatus,
      ...(editPassword.trim() ? { password: editPassword.trim() } : {})
    });

    setEditSuccessMsg(true);
    setTimeout(() => {
      setSelectedUserForEdit(null);
      setEditSuccessMsg(false);
      setEditUserError(null);
    }, 900);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError(null);

    const targetEmail = newEmail.trim().toLowerCase();
    const targetPass = newPassword.trim() || 'satya@123';

    // Rule: Same Email ID allowed across multiple accounts, BUT passwords MUST be distinct
    const duplicateCreds = users.some(
      (u) =>
        u.email.trim().toLowerCase() === targetEmail &&
        (u.password?.trim() || 'akash@802') === targetPass
    );

    if (duplicateCreds) {
      setCreateUserError(
        `Duplicate Credentials: An account with Email "${newEmail.trim()}" already exists with this exact password. You can share the same Email ID, but each user must have a unique password (e.g. Mayank@123 vs Archit@123).`
      );
      return;
    }

    addUser({
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || '+91 98000 00000',
      password: targetPass,
      department: newDepartment,
      designation: newDesignation.trim() || `${newDepartment} Specialist`,
      role: newRole,
      status: 'Active',
      branch: newBranch,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      permissions: ['sales.leads.view', 'sales.bookings.view']
    });

    setIsNewUserOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewPassword('');
    setNewDesignation('');
    setCreateUserError(null);
  };

  const rolesList: UserRole[] = [
    'SUPER_ADMIN',
    'RM',
    'BRANCH_MANAGER',
    'TL',
    'BDM',
    'BDE',
    'HR',
    'TECH'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Management & Access Control</h2>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              Zero Generic Admin Model
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Provision staff accounts, assign discrete roles (Super Admin, HR, Tech, Sales), and manage permission nodes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('users')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'users'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Users Directory
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'permissions'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Permissions Matrix
            </button>
          </div>

          <button
            onClick={() => setIsNewUserOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user, email, department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:bg-white focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="ALL">All Roles ({users.length})</option>
                {rolesList.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ')} ({users.filter((u) => u.role === r).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-3">Contact (Email & Mobile)</th>
                    <th className="py-3.5 px-3 text-center">Branch</th>
                    <th className="py-3.5 px-3">Department & Designation</th>
                    <th className="py-3.5 px-3">System Role</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Last Login</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredUsers.map((u) => {
                    const empPhone =
                      u.phone ||
                      employees.find(
                        (e) =>
                          e.id === u.id ||
                          (e.name.toLowerCase() === u.name.toLowerCase() &&
                            e.email.toLowerCase() === u.email.toLowerCase())
                      )?.phone;
                    const isSharedEmail =
                      users.filter((other) => other.email.toLowerCase() === u.email.toLowerCase()).length > 1;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-slate-800 dark:text-slate-200 font-medium">{u.email}</span>
                              {isSharedEmail && (
                                <span
                                  className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50"
                                  title="Multiple accounts share this Email ID with distinct passwords"
                                >
                                  <Key className="h-2.5 w-2.5 text-amber-600" />
                                  Shared ID
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="h-2.5 w-2.5 text-indigo-500" />
                              {empPhone || '+91 98000 00000'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[11px] font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
                            {u.branch || 'ND1'}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{u.designation}</p>
                          <span className="text-[10px] text-slate-400">{u.department}</span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              u.role === 'SUPER_ADMIN'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : u.role === 'HR'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : u.role === 'TECH'
                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            }`}
                          >
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                              u.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                            title="Click to toggle status"
                          >
                            {u.status}
                          </button>
                        </td>

                        <td className="py-3.5 px-3 text-slate-500 text-[11px]">{u.lastLogin || 'Recent'}</td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(u)}
                              className="flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                              title="HR / CSO Edit: Name, Email, Mobile, Designation, Role, Branch & Password"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>Edit Profile</span>
                            </button>
                            <button
                              onClick={() => alert(`Password reset link dispatched to ${u.email}`)}
                              title="Quick Reset Password"
                              className="rounded-lg border border-slate-200 p-1 text-slate-400 hover:text-slate-700 dark:border-slate-700"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setUserToDelete(u)}
                              title={`Remove ${u.name} from CRM`}
                              className="rounded-lg border border-rose-200 p-1 text-rose-500 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/60 transition"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRANULAR PERMISSIONS MATRIX */}
      {activeTab === 'permissions' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Granular Permission Nodes</h3>
            <p className="text-xs text-slate-400">
              System access capabilities mapped strictly to non-admin roles: Super Admin, HR, Tech, and Sales
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="pb-3">Permission Node</th>
                  <th className="pb-3">Module</th>
                  <th className="pb-3 text-center">Super Admin</th>
                  <th className="pb-3 text-center">HR</th>
                  <th className="pb-3 text-center">Tech / IT</th>
                  <th className="pb-3 text-center">Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {GRANULAR_PERMISSIONS.map((perm) => {
                  const superAdminHas = true;
                  const hrHas = perm.category === 'HR' || perm.key.startsWith('users.view') || perm.key.startsWith('users.create');
                  const techHas = perm.category === 'System' || perm.category === 'User Management';
                  const salesHas = perm.category === 'Sales' && !perm.key.includes('delete');

                  return (
                    <tr key={perm.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {perm.key}
                        <span className="block text-[10px] font-sans text-slate-400 font-normal">{perm.label}</span>
                      </td>
                      <td className="py-2.5 text-slate-500">{perm.category}</td>
                      <td className="py-2.5 text-center">
                        <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                      </td>
                      <td className="py-2.5 text-center">
                        {hrHas ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-2.5 text-center">
                        {techHas ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-2.5 text-center">
                        {salesHas ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isNewUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Provision New User Account</h3>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Shared Email ID allowed • Password must be unique</span>
              </div>
              <button onClick={() => { setIsNewUserOpen(false); setCreateUserError(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Credential Policy Notice */}
            <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-2.5 text-[11px] text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-200 flex items-start gap-2">
              <Key className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Credential Policy</p>
                <p className="text-[10px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                  Multiple users can share the same Email ID (e.g. <code>tl@satyasupport.co.in</code>), but <strong>passwords must be distinct</strong> for each user (e.g. <code>Mayank@123</code> vs <code>Archit@123</code>).
                </p>
              </div>
            </div>

            {createUserError && (
              <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{createUserError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="mt-3 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikas Sharma"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setCreateUserError(null); }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Email Address (Login ID) *</span>
                  <span className="text-[10px] text-slate-400">Can be shared with distinct pass</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tl@satyasupport.co.in"
                  value={newEmail}
                  onChange={(e) => { setNewEmail(e.target.value); setCreateUserError(null); }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Tech">Tech</option>
                    <option value="Executive">Executive</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Branch Location *</label>
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="ND1">Branch ND1</option>
                    <option value="ND2">Branch ND2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">System Role *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-indigo-600 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="BDE">BDE (Business Development Exec)</option>
                    <option value="BDM">BDM (Business Development Mgr)</option>
                    <option value="TL">TL (Team Lead - Sales)</option>
                    <option value="BRANCH_MANAGER">BRANCH MANAGER</option>
                    <option value="RM">RM (Regional Manager)</option>
                    <option value="HR">HR</option>
                    <option value="TECH">TECH</option>
                    {currentUser.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">SUPER ADMIN</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Designation *</label>
                <input
                  type="text"
                  placeholder="e.g. Loan Processing Specialist"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Initial Login Password</span>
                  <span className="text-[10px] text-slate-400">Default: satya@123</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. satya@123"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setCreateUserError(null); }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewUserOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprehensive Edit User Modal (HR & CSO / Super Admin Full Authority) */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-indigo-600" />
                  Edit Profile &amp; Role: {selectedUserForEdit.name}
                </h3>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Authorized Operator: {currentUser.name} ({currentUser.role === 'SUPER_ADMIN' ? 'CSO / Super Admin' : currentUser.role})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForEdit(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Policy Info banner */}
            <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-2.5 text-[11px] text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-200 flex items-start gap-2">
              <Key className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Credential Policy: Shared Login ID Permitted</p>
                <p className="text-[10px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                  Accounts may share the same Email ID (e.g. <code>tl@satyasupport.co.in</code>), but <strong>passwords must remain unique</strong> across accounts.
                </p>
              </div>
            </div>

            {editUserError && (
              <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{editUserError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUserEdit} className="mt-3 space-y-4 text-xs">
              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Full Name (Naam) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Email Address (Mail ID) *</span>
                    <span className="text-[10px] text-slate-400 font-normal">Can be shared with diff pass</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => { setEditEmail(e.target.value); setEditUserError(null); }}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Mobile Number & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-indigo-500" />
                    Mobile Number (Phone) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Department & Branch Location (ND1 / ND2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Department</label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Tech">Tech</option>
                    <option value="Executive">Executive</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                    Branch Location *
                  </label>
                  <select
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-black text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300"
                  >
                    <option value="ND1">Branch ND1</option>
                    <option value="ND2">Branch ND2</option>
                  </select>
                </div>
              </div>

              {/* System Role Selection */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Assign System Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {rolesList.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEditRole(r)}
                      className={`flex items-center justify-between rounded-xl border p-2.5 text-left text-xs transition cursor-pointer ${
                        editRole === r
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{r.replace('_', ' ')}</span>
                      {editRole === r && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Status & Password Reset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className={`mt-1 w-full rounded-xl border p-2 text-xs font-bold ${
                      editStatus === 'Active'
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'border-slate-300 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <option value="Active">Active Account</option>
                    <option value="Inactive">Suspended / Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Reset Password</span>
                    <span className="text-[10px] text-slate-400">Current: {selectedUserForEdit.password || 'akash@802'}</span>
                  </label>
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => { setEditPassword(e.target.value); setEditUserError(null); }}
                    placeholder="New password"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              {editSuccessMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Profile updated &amp; saved successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setUserToDelete(selectedUserForEdit);
                    setSelectedUserForEdit(null);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/60 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete User</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForEdit(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-700 shadow-xs transition"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE USER MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900/60 dark:bg-slate-900 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Remove User Account
                </h3>
                <p className="text-[11px] text-slate-400">Permanently revoke CRM system access &amp; credentials</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 flex items-center gap-3">
                <img src={userToDelete.avatar} alt={userToDelete.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{userToDelete.name}</p>
                  <p className="text-slate-500 truncate">{userToDelete.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {userToDelete.role}
                    </span>
                    <span className="text-[11px] text-slate-400">{userToDelete.department}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-rose-50/70 p-3 border border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-300 text-[11px]">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Important Operational Notice:</span>
                </p>
                <p>
                  Removing <strong>{userToDelete.name}</strong> will revoke all system logins, remove them from active sales/tech pods, and log an audit record under your name.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ok = deleteUser(userToDelete.id);
                    if (ok) {
                      setUserToDelete(null);
                    }
                  }}
                  className="rounded-xl bg-rose-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-rose-700 transition flex items-center gap-1.5 active:scale-95"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Confirm &amp; Delete User</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
