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

const MONTH_COUNT = (MAX_BS_YEAR - MIN_BS_YEAR + 1) * 12;
const MONTH_STARTS: number[] = new Array(MONTH_COUNT + 1);
MONTH_STARTS[0] = 0;
for (let i = 0; i < MONTH_COUNT; i++) {
  const year = MIN_BS_YEAR + Math.floor(i / 12);
  MONTH_STARTS[i + 1] = MONTH_STARTS[i] + daysInBSMonth(year, (i % 12) + 1);
}
export const TOTAL_BS_DAYS = MONTH_STARTS[MONTH_COUNT];

export function monthIndex(year: number, month: number): number {
  if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) {
    throw new Error(`BS year ${year} is out of supported range (1992-2100)`);
  }
  return (year - MIN_BS_YEAR) * 12 + (month - 1);
}

export function monthFromIndex(index: number): { year: number; month: number } {
  const year = MIN_BS_YEAR + Math.floor(index / 12);
  if (year > MAX_BS_YEAR) {
    throw new Error(`BS month index ${index} is out of supported range`);
  }
  return { year, month: (index % 12) + 1 };
}

const ANCHOR_DAY_INDEX = MONTH_STARTS[monthIndex(2056, 9)] + 16;
const ANCHOR_AD_UTC_MS = Date.UTC(2000, 0, 1);

export function bsToAd(bs: BSDate): Date {
  return new Date(ANCHOR_AD_UTC_MS + (dayIndex(bs) - ANCHOR_DAY_INDEX) * DAY_MS);
}

export function adToBs(ad: Date): BSDate {
  const target = Date.UTC(ad.getFullYear(), ad.getMonth(), ad.getDate());
  const idx = ANCHOR_DAY_INDEX + Math.floor((target - ANCHOR_AD_UTC_MS) / DAY_MS);
  if (idx < 0 || idx >= TOTAL_BS_DAYS) {
    throw new Error('Date outside supported range (1992-2100 BS)');
  }
  return dayFromIndex(idx);
}

export function getTodayBS(): BSDate {
  return adToBs(new Date());
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

interface StaticCell {
  key: string;
  day: number | null;
  weekday: number;
}

const gridCache = new Map<string, StaticCell[]>();

function getStaticCells(year: number, month: number): StaticCell[] {
  const cacheKey = `${year}-${month}`;
  const cached = gridCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const total = daysInBSMonth(year, month);
  const lead = bsToAd({ year, month, day: 1 }).getUTCDay();
  const cells: StaticCell[] = [];
  for (let i = 0; i < lead; i++) {
    cells.push({ key: `blank-${i}`, day: null, weekday: i });
  }
  for (let d = 1; d <= total; d++) {
    cells.push({ key: `${year}-${month}-${d}`, day: d, weekday: (lead + d - 1) % 7 });
  }
  let tail = 0;
  while (cells.length % 7 !== 0) {
    cells.push({ key: `tail-${tail++}`, day: null, weekday: cells.length % 7 });
  }
  gridCache.set(cacheKey, cells);
  return cells;
}

export function getMonthGrid(
  year: number,
  month: number,
  today: BSDate,
): GridCell[][] {
  const staticCells = getStaticCells(year, month);
  const todayOrd = today.year * 10000 + today.month * 100 + today.day;
  const baseOrd = year * 10000 + month * 100;

  const cells: GridCell[] = staticCells.map(c => {
    if (c.day === null) {
      return {
        key: c.key,
        day: null,
        weekday: c.weekday,
        isToday: false,
        isSaturday: false,
        isPast: false,
      };
    }
    const ord = baseOrd + c.day;
    return {
      key: c.key,
      day: c.day,
      date: { year, month, day: c.day },
      weekday: c.weekday,
      isToday: ord === todayOrd,
      isSaturday: c.weekday === 6,
      isPast: ord < todayOrd,
    };
  });

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

export function formatBSDateFull(bs: BSDate): string {
  return `${bs.day} ${BS_MONTHS[bs.month - 1]} ${bs.year}`;
}

export function toKey(bs: BSDate): string {
  const m = String(bs.month).padStart(2, '0');
  const d = String(bs.day).padStart(2, '0');
  return `${bs.year}-${m}-${d}`;
}
