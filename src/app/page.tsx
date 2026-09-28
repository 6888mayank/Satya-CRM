'use client';

import React from 'react';
import { CRMProvider, useCRM } from '@/context/crm-context';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import BookingModal from '@/components/modals/BookingModal';
import CustomerDetailDrawer from '@/components/modals/CustomerDetailDrawer';
import CommandPalette from '@/components/modals/CommandPalette';
import WFHModal from '@/components/modals/WFHModal';

// Views
import DashboardView from '@/components/views/DashboardView';
import RMCockpitView from '@/components/views/RMCockpitView';
import TeamsView from '@/components/views/TeamsView';
import LeadsView from '@/components/views/LeadsView';
import CustomersView from '@/components/views/CustomersView';
import CompaniesView from '@/components/views/CompaniesView';
import BookingsView from '@/components/views/BookingsView';
import DealsView from '@/components/views/DealsView';
import PipelineView from '@/components/views/PipelineView';
import FollowUpsView from '@/components/views/FollowUpsView';
import TasksView from '@/components/views/TasksView';
import ActivitiesView from '@/components/views/ActivitiesView';
import EmployeesView from '@/components/views/EmployeesView';
import AttendanceView from '@/components/views/AttendanceView';
import LeavesView from '@/components/views/LeavesView';
import HolidaysView from '@/components/views/HolidaysView';
import ReportsSalesView from '@/components/views/ReportsSalesView';
import ReportsHRView from '@/components/views/ReportsHRView';
import ReportsAttendanceView from '@/components/views/ReportsAttendanceView';
import UserManagementView from '@/components/views/UserManagementView';
import SystemConfigView from '@/components/views/SystemConfigView';
import CustomFieldsView from '@/components/views/CustomFieldsView';
import AutomationView from '@/components/views/AutomationView';
import IntegrationsView from '@/components/views/IntegrationsView';
import NotificationsView from '@/components/views/NotificationsView';
import AuditLogsView from '@/components/views/AuditLogsView';
import TechCockpitView from '@/components/views/TechCockpitView';
import LoginView from '@/components/auth/LoginView';

function CRMApp() {
  const { activeView, isAuthenticated } = useCRM();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'rm-cockpit':
        return <RMCockpitView />;
      case 'teams':
        return <TeamsView />;
      case 'leads':
        return <LeadsView />;
      case 'customers':
        return <CustomersView />;
      case 'companies':
        return <CompaniesView />;
      case 'bookings':
        return <BookingsView />;
      case 'deals':
        return <DealsView />;
      case 'pipeline':
        return <PipelineView />;
      case 'followups':
        return <FollowUpsView />;
      case 'tasks':
        return <TasksView />;
      case 'activities':
        return <ActivitiesView />;
      case 'employees':
        return <EmployeesView />;
      case 'attendance':
        return <AttendanceView />;
      case 'leaves':
        return <LeavesView />;
      case 'holidays':
        return <HolidaysView />;
      case 'reports-sales':
        return <ReportsSalesView />;
      case 'reports-hr':
        return <ReportsHRView />;
      case 'reports-attendance':
        return <ReportsAttendanceView />;
      case 'user-management':
        return <UserManagementView />;
      case 'system-config':
        return <SystemConfigView />;
      case 'custom-fields':
        return <CustomFieldsView />;
      case 'automation':
        return <AutomationView />;
      case 'integrations':
      case 'api-webhooks':
        return <IntegrationsView />;
      case 'notifications-page':
        return <NotificationsView />;
      case 'audit-logs':
        return <AuditLogsView />;
      case 'tech-cockpit':
        return <TechCockpitView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
      {/* Enterprise Sidebar with Role Guards */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{renderActiveView()}</div>
        </main>
      </div>

      {/* Modals & Drawers */}
      <BookingModal />
      <CustomerDetailDrawer />
      <CommandPalette />
      <WFHModal />
    </div>
  );
}

export default function Page() {
  return (
    <CRMProvider>
      <CRMApp />
    </CRMProvider>
  );
}
