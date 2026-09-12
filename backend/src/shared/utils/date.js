const TIMEZONE = 'Asia/Tashkent';

export const getTashkentTodayString = () => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date());
};

export const parseBusinessDate = (dateStr) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error('Invalid date format, expected YYYY-MM-DD');
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

export const formatBusinessDate = (date) => {
  if (!date) return null;
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const isPastDate = (dateStr) => {
  const todayStr = getTashkentTodayString();
  return dateStr < todayStr;
};

export const getDaysInMonth = (year, month) => {
  const daysCount = new Date(year, month, 0).getDate();
  const days = [];
  for (let d = 1; d <= daysCount; d++) {
    const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push(dayStr);
  }
  return days;
};

export const computeTimeStatus = (bookingDate) => {
  const dateStr = formatBusinessDate(bookingDate);
  const todayStr = getTashkentTodayString();
  return dateStr < todayStr ? 'PAST' : 'UPCOMING';
};

export const getTashkentTodayDate = () => {
  return parseBusinessDate(getTashkentTodayString());
};
