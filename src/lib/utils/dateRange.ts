/**
 * Calculate date range based on current date:
 * - If current date is 1-3: Previous month second half (16-end)
 * - If current date is 4-18: Current month first half (1-15)
 * - If current date is 19-end: Current month second half (16-end)
 */
export function getDefaultDateRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let startDate: Date;
  let endDate: Date = new Date(currentYear, currentMonth, currentDay);

  if (currentDay >= 1 && currentDay <= 3) {
    // Previous month second half (16-end)
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Get last day of previous month
    const lastDayOfPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    startDate = new Date(prevYear, prevMonth, 16);
    endDate = new Date(prevYear, prevMonth, lastDayOfPrevMonth);
  } else if (currentDay >= 4 && currentDay <= 18) {
    // Current month first half (1-15)
    startDate = new Date(currentYear, currentMonth, 1);
    endDate = new Date(currentYear, currentMonth, 15);
  } else {
    // Current month second half (16-end)
    startDate = new Date(currentYear, currentMonth, 16);
    endDate = new Date(currentYear, currentMonth, currentDay);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

/**
 * Format date to YYYY-MM-DD string without timezone conversion
 */
function formatDateToString(year: number, month: number, day: number): string {
  const monthStr = String(month + 1).padStart(2, '0'); // month is 0-indexed
  const dayStr = String(day).padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}`;
}

/**
 * Get date range for current month half with 2-day grace period:
 * - Days 1-2: Previous month second half (16-end of previous month) - within 2 days of month start
 * - Days 3-17: Current month first half (1-15) - past grace period, show current first half
 * - Days 16-17: Current month first half (1-15) - within 2 days of second half start, show previous half
 * - Days 18-end: Current month second half (16-end) - past grace period, show current second half
 * 
 * @returns Object with startDate and endDate in YYYY-MM-DD format
 */
export function getCurrentMonthHalfDateRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let startDate: string;
  let endDate: string;

  if (currentDay >= 1 && currentDay <= 2) {
    // Within 2 days of month start: Show previous month's second half
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastDayOfPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    startDate = formatDateToString(prevYear, prevMonth, 16);
    endDate = formatDateToString(prevYear, prevMonth, lastDayOfPrevMonth);
  } else if (currentDay >= 3 && currentDay <= 17) {
    // Days 3-15: Current month first half (normal case)
    // Days 16-17: Within 2 days of second half start, show previous half (first half)
    startDate = formatDateToString(currentYear, currentMonth, 1);
    endDate = formatDateToString(currentYear, currentMonth, 15);
  } else {
    // Days 18-end: Current month second half (past 2-day grace period)
    startDate = formatDateToString(currentYear, currentMonth, 16);
    // Get last day of current month (0th day of next month gives last day of current month)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    endDate = formatDateToString(currentYear, currentMonth, lastDayOfMonth);
  }

  return {
    startDate,
    endDate
  };
}

