'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { DEFAULT_GOVT_LOAN_STAGES, DEFAULT_IT_STAGES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { PipelineStage, LeadStatus, Customer } from '@/types/crm';
import {
  KanbanSquare,
  Plus,
  Sliders,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  UserCheck,
  Building2,
  X,
  Check
} from 'lucide-react';

export default function PipelineView() {
  const {
    customers,
    updateCustomerStatus,
    setSelectedCustomer,
    setIsBookingModalOpen,
    currentUser
  } = useCRM();

  // Active pipeline type: Government Schemes & Loans vs IT Projects
  const [pipelineType, setPipelineType] = useState<'GOVT_LOAN' | 'IT'>('GOVT_LOAN');

  // Stages configuration state
  const [govtStages, setGovtStages] = useState<PipelineStage[]>(DEFAULT_GOVT_LOAN_STAGES);
  const [itStages, setItStages] = useState<PipelineStage[]>(DEFAULT_IT_STAGES);

  // Stage Configurator modal
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const activeStages = pipelineType === 'GOVT_LOAN' ? govtStages : itStages;

  // Filter customers for current pipeline
  const pipelineCustomers = customers.filter((c) => {
    if (pipelineType === 'IT') {
      return c.selectedCategories?.includes('IT_SERVICES');
    } else {
      return (
        c.selectedCategories?.includes('GOVERNMENT_SCHEMES') ||
        c.selectedCategories?.includes('GOVERNMENT_GRANTS') ||
        c.selectedCategories?.includes('BUSINESS_LOANS')
      );
    }
  });

  // Helper to map LeadStatus to stage
  const getCustomersForStage = (stageName: string) => {
    return pipelineCustomers.filter((c) => {
      // Direct match or normalized match
      if (c.leadStatus.toLowerCase() === stageName.toLowerCase()) return true;
      if (stageName === 'Eligibility Check' && c.leadStatus === 'Eligibility Checking') return true;
      if (stageName === 'Documents Verified' && c.leadStatus === 'Documents Received') return true;
      if (stageName === 'Booked' && c.leadStatus === 'Service Booked') return true;
      if (stageName === 'In Process' && c.leadStatus === 'In Progress') return true;
      return false;
    });
  };

  const handleMoveStage = (customer: Customer, direction: 'forward' | 'backward') => {
    const currentIndex = activeStages.findIndex(
      (s) =>
        s.name.toLowerCase() === customer.leadStatus.toLowerCase() ||
        (s.name === 'Eligibility Check' && customer.leadStatus === 'Eligibility Checking') ||
        (s.name === 'Booked' && customer.leadStatus === 'Service Booked')
    );
    if (currentIndex === -1) return;

    const nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < activeStages.length) {
      const nextStageName = activeStages[nextIndex].name;
      // Convert to LeadStatus format
      let targetStatus: LeadStatus = nextStageName as LeadStatus;
      if (nextStageName === 'Eligibility Check') targetStatus = 'Eligibility Checking';
      if (nextStageName === 'Booked') targetStatus = 'Service Booked';
      if (nextStageName === 'In Process') targetStatus = 'In Progress';
      updateCustomerStatus(customer.id, targetStatus);
    }
  };

  const canConfigure = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'TECH';

  return (
    <div className="space-y-4">
      {/* Header & Pipeline Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sales Pipeline Board</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive visual Kanban board tracking scheme approvals, loan sanctions & IT sprint delivery
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Pipeline Switcher */}
          <div className="flex rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800">
            <button
              onClick={() => setPipelineType('GOVT_LOAN')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                pipelineType === 'GOVT_LOAN'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Govt Schemes & Loans
            </button>
            <button
              onClick={() => setPipelineType('IT')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                pipelineType === 'IT'
                  ? 'bg-white text-sky-600 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              IT & Tech Projects
            </button>
          </div>

          {canConfigure && (
            <button
              onClick={() => setIsConfigOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Configure Stages</span>
            </button>
          )}

          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
        {activeStages.map((stage, sIdx) => {
          const stageCustomers = getCustomersForStage(stage.name);
          const stageTotal = stageCustomers.reduce((sum, c) => sum + (c.expectedValue || 0), 0);

          return (
            <div
              key={stage.id}
              className="flex w-72 shrink-0 flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/60"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {stageCustomers.length}
                  </span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate" title={stage.name}>
                    {stage.name}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {formatCurrency(stageTotal)}
                </span>
              </div>

              {/* Cards Container */}
              <div className="mt-3 flex-1 space-y-2.5 min-h-[350px]">
                {stageCustomers.length === 0 ? (
                  <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-400 dark:border-slate-800">
                    No leads here
                  </div>
                ) : (
                  stageCustomers.map((cust) => (
                    <div
                      key={cust.id}
                      onClick={() => setSelectedCustomer(cust)}
                      className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-indigo-400 hover:shadow-xs dark:border-slate-800 dark:bg-slate-800/90 dark:hover:border-indigo-500 transition"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="overflow-hidden">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {cust.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {cust.companyName}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                            cust.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : cust.priority === 'High'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-700'
                          }`}
                        >
                          {cust.priority}
                        </span>
                      </div>

                      {/* Services badges */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {cust.servicesInterested.slice(0, 2).map((srv) => (
                          <span
                            key={srv}
                            className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 truncate max-w-[180px]"
                          >
                            {srv}
                          </span>
                        ))}
                      </div>

                      {/* Card Footer with Value and Move Controls */}
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-700/60 text-xs">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {formatCurrency(cust.expectedValue)}
                        </span>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {sIdx > 0 && (
                            <button
                              onClick={() => handleMoveStage(cust, 'backward')}
                              title="Move back"
                              className="rounded-md p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 dark:hover:bg-slate-700"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {sIdx < activeStages.length - 1 && (
                            <button
                              onClick={() => handleMoveStage(cust, 'forward')}
                              title="Move forward"
                              className="rounded-md p-1 hover:bg-slate-100 text-indigo-600 hover:text-indigo-800 dark:hover:bg-slate-700"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Configurator Modal for Tech / Super Admin */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Configure Pipeline Stages ({pipelineType === 'GOVT_LOAN' ? 'Govt Schemes / Loans' : 'IT Projects'})
                </h3>
                <p className="text-xs text-slate-400">Add, rename, or reorder pipeline sales stages</p>
              </div>
              <button onClick={() => setIsConfigOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
              {activeStages.map((st, idx) => (
                <div key={st.id} className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 text-xs dark:border-slate-700">
                  <span className="w-5 text-center font-bold text-slate-400">{idx + 1}</span>
                  <input
                    type="text"
                    value={st.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      if (pipelineType === 'GOVT_LOAN') {
                        setGovtStages(govtStages.map((s) => (s.id === st.id ? { ...s, name: newName } : s)));
                      } else {
                        setItStages(itStages.map((s) => (s.id === st.id ? { ...s, name: newName } : s)));
                      }
                    }}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                onClick={() => setIsConfigOpen(false)}
                className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
