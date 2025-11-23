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

