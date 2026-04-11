/**
 * Get today's date string in IST (UTC+5:30) as YYYY-MM-DD.
 * Avoids the UTC issue where toISOString() returns yesterday's date
 * when it's past midnight IST but still the previous day in UTC.
 */
export const getTodayIST = (): string => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000);
  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const roundToTwo = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round((value + Number.EPSILON) * 100) / 100;
};

export const formatAmount = (value: number): string => {
  return roundToTwo(value).toFixed(2);
};

export const convertToINR = (amountInNPR: number): number => {
  // Using 0.625 rate (1 / 1.6) to match backend configuration
  return roundToTwo(amountInNPR * 0.625);
};

export const formatDualCurrency = (amountInNPR: number): string => {
  const inrAmount = convertToINR(amountInNPR);
  return `NPR ${formatAmount(amountInNPR)} (₹${formatAmount(inrAmount)})`;
};
