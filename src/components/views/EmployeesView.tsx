'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { formatDate } from '@/lib/utils';
import { Employee, UserRole } from '@/types/crm';
import {
  Users2,
  Search,
  Plus,
  Mail,
  Phone,
  ShieldCheck,
  X,
  FileSpreadsheet,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { calculateEmployeeMTD } from '@/lib/attendance-calculator';
import {
  exportEmployeeMonthlyAttendanceToExcel,
  exportAllStaffMonthlyToExcel
} from '@/lib/export-excel';
import AttendanceExportModal from '@/components/modals/AttendanceExportModal';

export default function EmployeesView() {
  const { employees, currentUser, attendance, leaves, wfhRequests, deleteEmployee } = useCRM();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const canManage =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'RM' ||
    currentUser.role === 'HR';

  const filtered = employees.filter((emp) => {
    if (departmentFilter !== 'ALL' && emp.department !== departmentFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const departments = ['Sales', 'HR', 'Tech', 'Operations', 'Finance', 'Executive'];

  const handleDownloadEmpAttendance = (emp: Employee) => {
    const stats = calculateEmployeeMTD(emp.id, emp.name, attendance, leaves, wfhRequests);
    exportEmployeeMonthlyAttendanceToExcel(emp, stats);
  };

  const handleDownloadAllStaff = () => {
    const staffSummaries = employees.map((emp) => ({
      emp,
      stats: calculateEmployeeMTD(emp.id, emp.name, attendance, leaves, wfhRequests)
    }));
    exportAllStaffMonthlyToExcel('September 2026', staffSummaries);
  };

  const confirmDeleteEmployee = () => {
    if (!employeeToDelete) return;
    deleteEmployee(employeeToDelete.id);
    setEmployeeToDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Employee Directory</h2>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Excel Export Enabled
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Internal organization roster: departments, designations, reporting managers & roles ({filtered.length})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAllStaff}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 transition active:scale-95"
            title="Download Monthly Attendance Summary for all staff"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download All-Staff Excel</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Attendance Export Center</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:bg-white focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((emp) => (
          <div
            key={emp.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="h-12 w-12 rounded-2xl object-cover ring-2 ring-indigo-500/10"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{emp.name}</h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {emp.designation}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">{emp.employeeCode}</span>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    emp.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {emp.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-3 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <div>
                  <span className="text-[10px] text-slate-400 block">Department</span>
                  <strong className="text-slate-800 dark:text-slate-200">{emp.department}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">System Role</span>
                  <strong className="text-slate-800 dark:text-slate-200">{emp.role}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 block">Reporting Manager</span>
                  <strong className="text-slate-800 dark:text-slate-200">{emp.reportingManager}</strong>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{emp.phone}</span>
                </div>
              </div>
            </div>

            {/* Actions Bar on each employee card */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleDownloadEmpAttendance(emp)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300 transition active:scale-95"
                title={`Download ${emp.name}'s Monthly Attendance Excel Sheet`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Attendance Excel (.csv)</span>
              </button>

              {canManage && emp.id !== currentUser.id && (
                <button
                  onClick={() => setEmployeeToDelete(emp)}
                  className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 transition"
                  title="Remove / Delete Employee"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Employee Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900/60 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Remove Employee Account
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently remove employee{' '}
              <strong className="text-rose-600 dark:text-rose-400">{employeeToDelete.name}</strong> ({employeeToDelete.designation})?
            </p>

            <div className="mt-3 rounded-xl bg-rose-50/70 p-3 text-[11px] text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
              ⚠️ This will remove their employee profile and automatically clean up any sales team assignments.
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteEmployee}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition"
              >
                Permanently Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Excel Export Modal */}
      <AttendanceExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

