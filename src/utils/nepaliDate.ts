import miti from '../../miti.json';

export interface BSDate {
  year: number;
  month: number;
  day: number;
}

export interface GridCell {
  key: string;
  day: number | null;
  date?: BSDate;
  weekday: number;
  isToday: boolean;
  isSaturday: boolean;
  isPast: boolean;
}

export const MIN_BS_YEAR = 1992;
export const MAX_BS_YEAR = 2100;

const ANCHOR_BS_YEAR = 2000;
const ANCHOR_AD_UTC_MS = Date.UTC(1943, 3, 14);
const DAY_MS = 86400000;

const yearData = miti as Record<string, number[]>;

export function daysInBSMonth(year: number, month: number): number {
  const months = yearData[String(year)];
  if (!months) {
    throw new Error(`BS year ${year} is out of supported range (1992-2100)`);
  }
  return months[month - 1];
}

export function daysInBSYear(year: number): number {
  const months = yearData[String(year)];
  if (!months) {
    throw new Error(`BS year ${year} is out of supported range (1992-2100)`);
  }
  return months.reduce((sum, m) => sum + m, 0);
}

function daysBeforeBSYear(year: number): number {
  let total = 0;
  for (let y = ANCHOR_BS_YEAR; y < year; y++) {
    total += daysInBSYear(y);
  }
  return total;
}

function daysBeforeBSMonth(year: number, month: number): number {
  let total = 0;
  for (let m = 1; m < month; m++) {
    total += daysInBSMonth(year, m);
  }
  return total;
}

export function bsToAd(bs: BSDate): Date {
  const days =
    daysBeforeBSYear(bs.year) +
    daysBeforeBSMonth(bs.year, bs.month) +
    (bs.day - 1);
  return new Date(ANCHOR_AD_UTC_MS + days * DAY_MS);
}

function toUTCMs(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function adToBs(ad: Date): BSDate {
  const target = Date.UTC(ad.getFullYear(), ad.getMonth(), ad.getDate());
  if (target < ANCHOR_AD_UTC_MS) {
    throw new Error('Date before supported range (before 1943-04-14 AD)');
  }

  const approxYears = (target - ANCHOR_AD_UTC_MS) / (365.2588 * DAY_MS);
  let year = Math.min(
    MAX_BS_YEAR,
    Math.max(MIN_BS_YEAR, ANCHOR_BS_YEAR + Math.floor(approxYears) - 1),
  );

  while (
    year < MAX_BS_YEAR &&
    target >= toUTCMs(bsToAd({ year: year + 1, month: 1, day: 1 }))
  ) {
    year++;
  }
  while (
    year > MIN_BS_YEAR &&
    target < toUTCMs(bsToAd({ year, month: 1, day: 1 }))
  ) {
    year--;
  }

  let month = 1;
  while (
    month < 12 &&
    target >= toUTCMs(bsToAd({ year, month: month + 1, day: 1 }))
  ) {
    month++;
  }

  const day =
    Math.floor((target - toUTCMs(bsToAd({ year, month, day: 1 }))) / DAY_MS) +
    1;

  return { year, month, day };
}

export function getTodayBS(): BSDate {
  return adToBs(new Date());
}

export function isSameBS(a: BSDate, b: BSDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function getMonthGrid(
  year: number,
  month: number,
  today: BSDate,
): GridCell[][] {
  const total = daysInBSMonth(year, month);
  const firstAd = bsToAd({ year, month, day: 1 });
  const leadingBlanks = firstAd.getUTCDay();

  const todayMs = toUTCMs(bsToAd(today));

  const cells: GridCell[] = [];
  for (let i = 0; i < leadingBlanks; i++) {
    cells.push({
      key: `blank-${i}`,
      day: null,
      weekday: i,
      isToday: false,
      isSaturday: false,
      isPast: false,
    });
  }

  for (let d = 1; d <= total; d++) {
    const ad = bsToAd({ year, month, day: d });
    const ms = toUTCMs(ad);
    cells.push({
      key: `${year}-${month}-${d}`,
      day: d,
      date: { year, month, day: d },
      weekday: ad.getUTCDay(),
      isToday: ms === todayMs,
      isSaturday: ad.getUTCDay() === 6,
      isPast: ms < todayMs,
    });
  }

  let tail = 0;
  while (cells.length % 7 !== 0) {
    cells.push({
      key: `tail-${tail++}`,
      day: null,
      weekday: cells.length % 7,
      isToday: false,
      isSaturday: false,
      isPast: false,
    });
  }

  const weeks: GridCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const BS_MONTHS = [
  'Baisakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
];

const AD_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatADDate(ad: Date): string {
  return `${WEEKDAYS[ad.getUTCDay()]}, ${ad.getUTCDate()} ${
    AD_MONTHS_SHORT[ad.getUTCMonth()]
  } ${ad.getUTCFullYear()}`;
}

export function formatBSLabel(year: number, month: number): string {
  return `${BS_MONTHS[month - 1]} ${year}`;
}

export function formatBSDateFull(bs: BSDate): string {
  return `${bs.day} ${BS_MONTHS[bs.month - 1]} ${bs.year}`;
}

export function toKey(bs: BSDate): string {
  const m = String(bs.month).padStart(2, '0');
  const d = String(bs.day).padStart(2, '0');
  return `${bs.year}-${m}-${d}`;
}

export function monthCount(year: number): number {
  daysInBSYear(year);
  return 12;
}

export function monthIndex(year: number, month: number): number {
  daysInBSYear(year);
  return (year - MIN_BS_YEAR) * 12 + (month - 1);
}

const MONTH_COUNT = (MAX_BS_YEAR - MIN_BS_YEAR + 1) * 12;
const MONTH_STARTS: number[] = new Array(MONTH_COUNT + 1);
MONTH_STARTS[0] = 0;
for (let i = 0; i < MONTH_COUNT; i++) {
  const { year, month } = monthFromIndex(i);
  MONTH_STARTS[i + 1] = MONTH_STARTS[i] + daysInBSMonth(year, month);
}
export const TOTAL_BS_DAYS = MONTH_STARTS[MONTH_COUNT];

export function monthFromIndex(index: number): { year: number; month: number } {
  const year = MIN_BS_YEAR + Math.floor(index / 12);
  daysInBSYear(year);
  return { year, month: (index % 12) + 1 };
}

export function dayIndex(bs: BSDate): number {
  return MONTH_STARTS[monthIndex(bs.year, bs.month)] + bs.day - 1;
}

export function dayFromIndex(index: number): BSDate {
  const clamped = Math.max(0, Math.min(TOTAL_BS_DAYS - 1, index));
  let lo = 0;
  let hi = MONTH_COUNT - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    if (MONTH_STARTS[mid] <= clamped) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  const { year, month } = monthFromIndex(lo);
  return { year, month, day: clamped - MONTH_STARTS[lo] + 1 };
}

export function clampDay(bs: { year: number; month: number; day: number }): BSDate {
  const total = daysInBSMonth(bs.year, bs.month);
  return { year: bs.year, month: bs.month, day: Math.min(bs.day, total) };
}
