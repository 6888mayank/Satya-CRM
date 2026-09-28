import { AttendanceRecord, Employee, LeaveRequest, WFHRequest } from '@/types/crm';
import { EmployeeMTDStats } from '@/lib/attendance-calculator';

/**
 * Triggers a browser download of a CSV file with UTF-8 BOM so Microsoft Excel
 * properly parses characters, commas, and formatting.
 */
function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(field: string | number | null | undefined): string {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * 1. Export Daily Attendance for all staff on a specific date
 */
export function exportDailyAttendanceToExcel(
  date: string,
  attendanceList: AttendanceRecord[],
  employeesList: Employee[],
  leavesList: LeaveRequest[] = [],
  wfhList: WFHRequest[] = []
) {
  const headers = [
    'Emp Code',
    'Employee Name',
    'Department',
    'Designation',
    'System Role',
    'Date',
    'Check In',
    'Check Out',
    'Working Hours',
    'Status',
    'Remarks / Field Notes'
  ];

  const rows = employeesList.map((emp) => {
    const cleanEmpName = emp.name.split('(')[0].trim().toLowerCase();
    const att = attendanceList.find(
      (a) =>
        (a.employeeId === emp.id || a.employeeName.toLowerCase().includes(cleanEmpName)) &&
        a.date === date
    );

    const onLeave = leavesList.find(
      (l) =>
        (l.employeeId === emp.id || l.employeeName.toLowerCase().includes(cleanEmpName)) &&
        l.status === 'Approved' &&
        date >= l.startDate &&
        date <= l.endDate
    );

    const onWFH = wfhList.find(
      (w) =>
        (w.employeeId === emp.id || w.employeeName.toLowerCase().includes(cleanEmpName)) &&
        w.status === 'Approved' &&
        w.date === date
    );

    let status = 'Absent';
    let checkIn = 'Not Punched';
    let checkOut = 'Pending';
    let hours = '0h';
    let remarks = 'Unexcused / Loss of Pay (LOP)';

    if (att) {
      status = att.status;
      checkIn = att.checkIn || 'Not Punched';
      checkOut = att.checkOut || 'Pending';
      hours = att.workingHours || '0h';
      remarks = att.remarks || 'Standard biometric punch';
    } else if (onLeave) {
      status = 'Leave';
      checkIn = 'On Leave';
      checkOut = 'On Leave';
      hours = '0h';
      remarks = `Approved Leave: ${onLeave.leaveType} (${onLeave.reason})`;
    } else if (onWFH) {
      status = 'WFH';
      checkIn = '09:15 AM';
      checkOut = '06:30 PM';
      hours = '9h 15m';
      remarks = `Approved Remote Work: ${onWFH.reason}`;
    }

    return [
      escapeCSV(emp.employeeCode || emp.id),
      escapeCSV(emp.name),
      escapeCSV(emp.department),
      escapeCSV(emp.designation),
      escapeCSV(emp.role),
      escapeCSV(date),
      escapeCSV(checkIn),
      escapeCSV(checkOut),
      escapeCSV(hours),
      escapeCSV(status),
      escapeCSV(remarks)
    ].join(',');
  });

  const summaryHeader = [
    `"SATYA CRM — DAILY ATTENDANCE REGISTER"`,
    `"Target Date",${escapeCSV(date)},"Generated At",${escapeCSV(new Date().toLocaleString('en-IN'))}`,
    `"Total Registered Employees",${escapeCSV(employeesList.length)}`,
    `""`
  ];

  const csvContent = [...summaryHeader, headers.join(','), ...rows].join('\n');
  const fileName = `Daily_Attendance_${date}.csv`;
  downloadCSV(csvContent, fileName);
}

/**
 * 2. Export Detailed Monthly Attendance Sheet for a Particular Employee
 */
export function exportEmployeeMonthlyAttendanceToExcel(
  emp: Employee,
  stats: EmployeeMTDStats
) {
  const summaryBlock = [
    `"SATYA CRM — INDIVIDUAL MONTHLY ATTENDANCE REGISTER"`,
    `"Employee Name",${escapeCSV(emp.name)},"Employee Code",${escapeCSV(emp.employeeCode || emp.id)}`,
    `"Department",${escapeCSV(emp.department)},"System Role",${escapeCSV(emp.role)}`,
    `"Month",${escapeCSV(stats.monthName)},"Attendance Score",${escapeCSV(`${stats.attendancePercentage}%`)}`,
    `"Working Days (MTD)",${escapeCSV(stats.workingDaysTillDate)},"Days Present",${escapeCSV(stats.presentDays)}`,
    `"Days WFH",${escapeCSV(stats.wfhDays)},"Days on Leave",${escapeCSV(stats.leaveDays)}`,
    `"Days Absent (LOP)",${escapeCSV(stats.absentDays)},"Late Punches",${escapeCSV(stats.lateDays)}`,
    `""` // Empty row separator
  ];

  const tableHeaders = [
    'Date',
    'Day',
    'Attendance Status',
    'Biometric Check In',
    'Biometric Check Out',
    'Working Hours',
    'Activity Remarks / Reason'
  ];

  const dailyRows = stats.dailyRecords.map((d) => [
    escapeCSV(d.date),
    escapeCSV(d.dayName),
    escapeCSV(d.status),
    escapeCSV(d.checkIn || '—'),
    escapeCSV(d.checkOut || '—'),
    escapeCSV(d.workingHours),
    escapeCSV(d.notes)
  ].join(','));

  const csvContent = [...summaryBlock, tableHeaders.join(','), ...dailyRows].join('\n');
  const safeName = emp.name.replace(/[^a-zA-Z0-9]/g, '_');
  const safeMonth = stats.monthName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Monthly_Attendance_${safeName}_${safeMonth}.csv`;
  downloadCSV(csvContent, fileName);
}

/**
 * 3. Export Monthly Attendance Summary for All Staff
 */
export function exportAllStaffMonthlyToExcel(
  monthName: string,
  staffSummaries: { emp: Employee; stats: EmployeeMTDStats }[]
) {
  const headers = [
    'Emp Code',
    'Employee Name',
    'Department',
    'Designation',
    'System Role',
    'Reporting Manager',
    'Working Days (MTD)',
    'Days Present',
    'Days WFH',
    'Days on Leave',
    'Days Absent (LOP)',
    'Late Marks',
    'Attendance Score %'
  ];

  const rows = staffSummaries.map(({ emp, stats }) => [
    escapeCSV(emp.employeeCode || emp.id),
    escapeCSV(emp.name),
    escapeCSV(emp.department),
    escapeCSV(emp.designation),
    escapeCSV(emp.role),
    escapeCSV(emp.reportingManager),
    escapeCSV(stats.workingDaysTillDate),
    escapeCSV(stats.presentDays),
    escapeCSV(stats.wfhDays),
    escapeCSV(stats.leaveDays),
    escapeCSV(stats.absentDays),
    escapeCSV(stats.lateDays),
    escapeCSV(`${stats.attendancePercentage}%`)
  ].join(','));

  const csvContent = [
    `"SATYA CRM — BRANCH MONTHLY ATTENDANCE SUMMARY"`,
    `"Month",${escapeCSV(monthName)},"Total Staff Headcount",${escapeCSV(staffSummaries.length)}`,
    `""`,
    headers.join(','),
    ...rows
  ].join('\n');

  const safeMonth = monthName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Branch_Staff_Monthly_Attendance_${safeMonth}.csv`;
  downloadCSV(csvContent, fileName);
}
