import { AttendanceRecord, LeaveRequest, WFHRequest } from '@/types/crm';

export interface DayAttendanceSummary {
  date: string; // '2026-09-01'
  dayNumber: number; // 1 to 30
  dayName: string; // 'Tue', 'Sun', etc.
  isSunday: boolean;
  isToday: boolean;
  isPastOrToday: boolean;
  status: 'Present' | 'WFH' | 'Leave' | 'Absent' | 'Late' | 'Weekly Off' | 'Holiday' | 'Upcoming';
  checkIn: string | null;
  checkOut: string | null;
  workingHours: string;
  notes: string;
}

export interface EmployeeMTDStats {
  employeeId: string;
  employeeName: string;
  monthName: string; // 'September 2026'
  totalCalendarDaysInMonth: number; // 30
  passedDaysTillDate: number; // 21
  workingDaysTillDate: number; // Total working days (excluding Sundays)
  presentDays: number;
  wfhDays: number;
  leaveDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number; // e.g. 94.4
  dailyRecords: DayAttendanceSummary[];
}

/**
 * Calculates Month-Till-Date (MTD) attendance metrics for a specific employee
 * based on attendance records, approved leaves, and approved WFH requests.
 */
export function calculateEmployeeMTD(
  employeeId: string,
  employeeName: string,
  attendanceList: AttendanceRecord[],
  leavesList: LeaveRequest[],
  wfhList: WFHRequest[],
  targetYear: number = 2026,
  targetMonth: number = 8 // 0-indexed: 8 is September
): EmployeeMTDStats {
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  // Target date within CRM timeline: September 21, 2026
  const currentDayNumber = 21;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  let workingDaysTillDate = 0;
  let presentDays = 0;
  let wfhDays = 0;
  let leaveDays = 0;
  let absentDays = 0;
  let lateDays = 0;

  const dailyRecords: DayAttendanceSummary[] = [];

  // Match employee name or ID flexibly
  const cleanEmpName = employeeName.split('(')[0].trim().toLowerCase();

  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(targetYear, targetMonth, day);
    const dayOfWeekIndex = dayDate.getDay();
    const dayName = dayNames[dayOfWeekIndex];
    const isSunday = dayOfWeekIndex === 0;
    const isToday = day === currentDayNumber;
    const isPastOrToday = day <= currentDayNumber;

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const dateStr = `${targetYear}-${pad(targetMonth + 1)}-${pad(day)}`;

    if (!isPastOrToday) {
      // Future day in month
      dailyRecords.push({
        date: dateStr,
        dayNumber: day,
        dayName,
        isSunday,
        isToday: false,
        isPastOrToday: false,
        status: isSunday ? 'Weekly Off' : 'Upcoming',
        checkIn: null,
        checkOut: null,
        workingHours: '—',
        notes: isSunday ? 'Sunday Weekly Off' : 'Upcoming shift'
      });
      continue;
    }

    if (isSunday) {
      dailyRecords.push({
        date: dateStr,
        dayNumber: day,
        dayName,
        isSunday: true,
        isToday,
        isPastOrToday: true,
        status: 'Weekly Off',
        checkIn: null,
        checkOut: null,
        workingHours: '—',
        notes: 'Sunday Weekly Off'
      });
      continue;
    }

    // It's a working day till date
    workingDaysTillDate++;

    // 1. Check if there's an attendance punch for this date
    const att = attendanceList.find((a) => {
      const matchId = a.employeeId === employeeId;
      const matchName = a.employeeName.toLowerCase().includes(cleanEmpName);
      return (matchId || matchName) && a.date === dateStr;
    });

    // 2. Check if there is an approved Leave covering this date
    const onLeave = leavesList.find((l) => {
      const matchId = l.employeeId === employeeId;
      const matchName = l.employeeName.toLowerCase().includes(cleanEmpName);
      return (
        (matchId || matchName) &&
        l.status === 'Approved' &&
        dateStr >= l.startDate &&
        dateStr <= l.endDate
      );
    });

    // 3. Check if there is an approved WFH covering this date
    const onWFH = wfhList.find((w) => {
      const matchId = w.employeeId === employeeId;
      const matchName = w.employeeName.toLowerCase().includes(cleanEmpName);
      return (matchId || matchName) && w.status === 'Approved' && w.date === dateStr;
    });

    if (att) {
      if (att.status === 'Present') {
        presentDays++;
        dailyRecords.push({
          date: dateStr,
          dayNumber: day,
          dayName,
          isSunday: false,
          isToday,
          isPastOrToday: true,
          status: 'Present',
          checkIn: att.checkIn || '09:00 AM',
          checkOut: att.checkOut || (isToday ? 'In Progress' : '06:30 PM'),
          workingHours: att.workingHours || (isToday ? 'Active Shift' : '9h 30m'),
          notes: att.remarks || 'Standard biometric punch'
        });
      } else if (att.status === 'WFH') {
        wfhDays++;
        dailyRecords.push({
          date: dateStr,
          dayNumber: day,
          dayName,
          isSunday: false,
          isToday,
          isPastOrToday: true,
          status: 'WFH',
          checkIn: att.checkIn || '09:10 AM',
          checkOut: att.checkOut || (isToday ? 'In Progress' : '06:30 PM'),
          workingHours: att.workingHours || (isToday ? 'Active Remote' : '9h 20m'),
          notes: att.remarks || 'Remote Work Approved'
        });
      } else if (att.status === 'Late') {
        presentDays++;
        lateDays++;
        dailyRecords.push({
          date: dateStr,
          dayNumber: day,
          dayName,
          isSunday: false,
          isToday,
          isPastOrToday: true,
          status: 'Late',
          checkIn: att.checkIn || '09:45 AM',
          checkOut: att.checkOut || (isToday ? 'In Progress' : '06:30 PM'),
          workingHours: att.workingHours || '8h 45m',
          notes: att.remarks || 'Late punch (After 09:30 AM)'
        });
      } else if (att.status === 'Leave') {
        leaveDays++;
        dailyRecords.push({
          date: dateStr,
          dayNumber: day,
          dayName,
          isSunday: false,
          isToday,
          isPastOrToday: true,
          status: 'Leave',
          checkIn: null,
          checkOut: null,
          workingHours: '0h',
          notes: att.remarks || 'Approved Leave'
        });
      } else if (att.status === 'Absent') {
        absentDays++;
        dailyRecords.push({
          date: dateStr,
          dayNumber: day,
          dayName,
          isSunday: false,
          isToday,
          isPastOrToday: true,
          status: 'Absent',
          checkIn: null,
          checkOut: null,
          workingHours: '0h',
          notes: att.remarks || 'Unaccounted Absence / LOP'
        });
      } else {
        presentDays++;
        dailyRecords.push({
          date: dateStr,
          dayNumber: day,
          dayName,
          isSunday: false,
          isToday,
          isPastOrToday: true,
          status: 'Present',
          checkIn: att.checkIn || '09:00 AM',
          checkOut: att.checkOut || '06:30 PM',
          workingHours: att.workingHours || '9h 30m',
          notes: 'Present'
        });
      }
    } else if (onLeave) {
      leaveDays++;
      dailyRecords.push({
        date: dateStr,
        dayNumber: day,
        dayName,
        isSunday: false,
        isToday,
        isPastOrToday: true,
        status: 'Leave',
        checkIn: null,
        checkOut: null,
        workingHours: '0h',
        notes: `${onLeave.leaveType} (${onLeave.reason})`
      });
    } else if (onWFH) {
      wfhDays++;
      dailyRecords.push({
        date: dateStr,
        dayNumber: day,
        dayName,
        isSunday: false,
        isToday,
        isPastOrToday: true,
        status: 'WFH',
        checkIn: '09:15 AM',
        checkOut: isToday ? 'In Progress' : '06:30 PM',
        workingHours: isToday ? 'Active Remote' : '9h 15m',
        notes: `WFH: ${onWFH.reason}`
      });
    } else {
      // Unrecorded past working day -> Unaccounted Absent!
      absentDays++;
      dailyRecords.push({
        date: dateStr,
        dayNumber: day,
        dayName,
        isSunday: false,
        isToday,
        isPastOrToday: true,
        status: 'Absent',
        checkIn: null,
        checkOut: null,
        workingHours: '0h',
        notes: 'No biometric punch or leave approved (Loss of Pay)'
      });
    }
  }

  const attendancePercentage =
    workingDaysTillDate > 0
      ? Math.round(((presentDays + wfhDays) / workingDaysTillDate) * 100 * 10) / 10
      : 100;

  return {
    employeeId,
    employeeName,
    monthName: `${monthNames[targetMonth]} ${targetYear}`,
    totalCalendarDaysInMonth: daysInMonth,
    passedDaysTillDate: currentDayNumber,
    workingDaysTillDate,
    presentDays,
    wfhDays,
    leaveDays,
    absentDays,
    lateDays,
    attendancePercentage,
    dailyRecords
  };
}

export interface MonthLeaveLedger {
  monthIndex: number; // 1 to 12
  monthName: string; // 'January', 'February', ...
  monthShort: string; // 'Jan', 'Feb', ...
  creditedDays: number; // 1.5
  cumulativeCredited: number; // 1.5, 3.0, 4.5, ...
  availedDays: number; // approved leaves taken in this month
  unavailedRollover: number; // unused days carried forward
  cumulativeBalance: number; // closing balance after this month
  status: 'Past' | 'Current' | 'Upcoming';
}

export interface EmployeeLeaveAccrual {
  employeeId: string;
  employeeName: string;
  monthlyAccrualRate: number; // 1.5
  annualQuota: number; // 18.0
  currentYear: number; // 2026
  currentMonthIndex: number; // 1 to 12 (e.g. 9 for September)
  currentMonthName: string; // 'September'
  totalAccruedTillDate: number; // currentMonthIndex * 1.5 (e.g. 13.5)
  totalApprovedAvailed: number; // sum of approved leave days in current year
  totalPendingDays: number; // sum of pending leave requests
  currentAvailableBalance: number; // Math.max(0, totalAccruedTillDate - totalApprovedAvailed)
  remainingYearAccrual: number; // (12 - currentMonthIndex) * 1.5
  ledger: MonthLeaveLedger[];
}

/**
 * Calculates unified 1.5 Days/Month Leave Accrual & Cumulative Carry-Forward
 * Unused leaves roll over and accumulate month-to-month.
 */
export function calculateEmployeeLeaveAccrual(
  employeeId: string,
  employeeName: string,
  leavesList: LeaveRequest[],
  targetYear: number = 2026,
  targetMonth: number = 8 // 0-indexed: 8 is September (9th month)
): EmployeeLeaveAccrual {
  const cleanName = (employeeName || '').split('(')[0].trim().toLowerCase();
  const empLeaves = leavesList.filter((l) => {
    const matchId = l.employeeId === employeeId;
    const matchName = (l.employeeName || '').toLowerCase().includes(cleanName);
    return matchId || matchName;
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const monthlyRate = 1.5;
  const annualQuota = 18.0;
  const currentMonthIdx1Based = targetMonth + 1; // e.g. 9 for September
  const totalAccruedTillDate = Math.round(currentMonthIdx1Based * monthlyRate * 10) / 10; // e.g. 13.5

  let runningBalance = 0;
  let totalApprovedAvailed = 0;
  let totalPendingDays = 0;

  const ledger: MonthLeaveLedger[] = [];

  for (let m = 0; m < 12; m++) {
    const monthNum1Based = m + 1;
    const isPast = m < targetMonth;
    const isCurrent = m === targetMonth;
    const isUpcoming = m > targetMonth;

    // Approved leaves in this calendar month
    const monthApprovedLeaves = empLeaves.filter((l) => {
      if (l.status !== 'Approved') return false;
      const leaveDate = new Date(l.startDate);
      const leaveYear = leaveDate.getFullYear() || targetYear;
      const leaveMonth = leaveDate.getMonth();
      return leaveYear === targetYear && leaveMonth === m;
    });

    const availedInMonth = monthApprovedLeaves.reduce((sum, l) => sum + (l.days || 1), 0);

    if (m <= targetMonth) {
      totalApprovedAvailed += availedInMonth;
    }

    // Pending requests in this month
    const monthPending = empLeaves.filter((l) => {
      if (l.status !== 'Pending') return false;
      const leaveDate = new Date(l.startDate);
      const leaveMonth = leaveDate.getMonth();
      return leaveMonth === m;
    });
    totalPendingDays += monthPending.reduce((sum, l) => sum + (l.days || 1), 0);

    let status: 'Past' | 'Current' | 'Upcoming' = 'Past';
    if (isCurrent) status = 'Current';
    if (isUpcoming) status = 'Upcoming';

    if (m <= targetMonth) {
      runningBalance = Math.round((runningBalance + monthlyRate - availedInMonth) * 10) / 10;
      if (runningBalance < 0) runningBalance = 0;
    } else {
      runningBalance = Math.round((runningBalance + monthlyRate) * 10) / 10;
    }

    const unavailedRollover = Math.max(0, monthlyRate - availedInMonth);

    ledger.push({
      monthIndex: monthNum1Based,
      monthName: monthNames[m],
      monthShort: monthShorts[m],
      creditedDays: monthlyRate,
      cumulativeCredited: Math.round(monthNum1Based * monthlyRate * 10) / 10,
      availedDays: availedInMonth,
      unavailedRollover,
      cumulativeBalance: runningBalance,
      status
    });
  }

  const currentAvailableBalance = Math.max(
    0,
    Math.round((totalAccruedTillDate - totalApprovedAvailed) * 10) / 10
  );
  const remainingYearAccrual = Math.max(0, Math.round((12 - currentMonthIdx1Based) * monthlyRate * 10) / 10);

  return {
    employeeId,
    employeeName,
    monthlyAccrualRate: monthlyRate,
    annualQuota,
    currentYear: targetYear,
    currentMonthIndex: currentMonthIdx1Based,
    currentMonthName: monthNames[targetMonth],
    totalAccruedTillDate,
    totalApprovedAvailed,
    totalPendingDays,
    currentAvailableBalance,
    remainingYearAccrual,
    ledger
  };
}
