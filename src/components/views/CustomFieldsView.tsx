'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { CustomField } from '@/types/crm';
import { Layers, Plus, Trash2, ShieldAlert, X } from 'lucide-react';

export default function CustomFieldsView() {
  const { customFields, addCustomField, deleteCustomField, currentUser } = useCRM();

  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New field form
  const [entity, setEntity] = useState<CustomField['entity']>('Customers');
  const [label, setLabel] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [type, setType] = useState<CustomField['type']>('Text');
  const [optionsStr, setOptionsStr] = useState('');
  const [required, setRequired] = useState(false);

  const canAccess = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'TECH';

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-3" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Authorized Tech Access Only</h3>
        <p className="text-xs text-slate-500 max-w-md mt-1">
          Custom field schemas and technical CRM configurations are strictly restricted to <strong>Authorized Tech</strong> and <strong>Super Admin</strong> users.
        </p>
      </div>
    );
  }

  const filtered = customFields.filter((cf) => {
    if (entityFilter !== 'ALL' && cf.entity !== entityFilter) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = fieldName || label.toLowerCase().replace(/\s+/g, '_');
    const options = optionsStr ? optionsStr.split(',').map((o) => o.trim()) : undefined;

    addCustomField({
      entity,
      label,
      fieldName: slug,
      type,
      options,
      required
    });

    setIsModalOpen(false);
    setLabel('');
    setFieldName('');
    setOptionsStr('');
  };

  const entities = ['Leads', 'Customers', 'Bookings', 'Deals', 'Employees', 'Companies'];
  const fieldTypes: CustomField['type'][] = [
    'Text', 'Number', 'Currency', 'Date', 'Dropdown', 'Multi-select', 'Boolean', 'Phone', 'Email', 'File Upload'
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Custom Field Schema Builder</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Extend CRM entities (Leads, Customers, Bookings) with custom fields tailored for schemes, grants & loans
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Field</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 w-fit overflow-x-auto text-xs">
        <button
          onClick={() => setEntityFilter('ALL')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            entityFilter === 'ALL'
              ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          All Entities
        </button>
        {entities.map((ent) => (
          <button
            key={ent}
            onClick={() => setEntityFilter(ent)}
            className={`rounded-lg px-3 py-1.5 font-semibold transition ${
              entityFilter === ent
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {ent}
          </button>
        ))}
      </div>

      {/* Fields Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3.5 px-4">Field Label</th>
                <th className="py-3.5 px-3">System Key</th>
                <th className="py-3.5 px-3">Target Entity</th>
                <th className="py-3.5 px-3">Data Type</th>
                <th className="py-3.5 px-3">Required</th>
                <th className="py-3.5 px-3">Options</th>
                <th className="py-3.5 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.map((cf) => (
                <tr key={cf.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{cf.label}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-500">{cf.fieldName}</td>
                  <td className="py-3.5 px-3">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {cf.entity}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">{cf.type}</td>
                  <td className="py-3.5 px-3">
                    {cf.required ? (
                      <span className="text-emerald-600 font-bold">Yes</span>
                    ) : (
                      <span className="text-slate-400">Optional</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 max-w-xs truncate">
                    {cf.options ? cf.options.join(', ') : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => deleteCustomField(cf.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Custom Field Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Create Custom Field</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Target Entity</label>
                <select
                  value={entity}
                  onChange={(e) => setEntity(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  {entities.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Field Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CIBIL Commercial Rank"
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
                    setFieldName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">System Field Key</label>
                <input
                  type="text"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Data Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  {fieldTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {(type === 'Dropdown' || type === 'Multi-select') && (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Options (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Option 1, Option 2, Option 3"
                    value={optionsStr}
                    onChange={(e) => setOptionsStr(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="req"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="req" className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Mandatory Field (Required on form submission)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700"
                >
                  Save Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
