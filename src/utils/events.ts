import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BSDate, toKey } from './nepaliDate';

export type Category = 'personal' | 'work' | 'family';

export interface CalendarEvent {
  id: string;
  dateKey: string;
  title: string;
  notes?: string;
  hour: number;
  minute: number;
  category: Category;
  createdAt: number;
}

interface EventStore {
  events: Record<string, CalendarEvent[]>;
  hidden: Category[];
}

const STORAGE_KEY = 'nepali_calendar_events_v3';

const EMPTY: EventStore = { events: {}, hidden: [] };

function parseStore(raw: string | null): EventStore {
  if (!raw) {
    return EMPTY;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<EventStore>;
    return {
      events: parsed.events ?? {},
      hidden: parsed.hidden ?? [],
    };
  } catch {
    return EMPTY;
  }
}

export function useEventStore() {
  const [store, setStore] = useState<EventStore>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw === null) {
          const seed: EventStore = { events: {}, hidden: [] };
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed)).catch(() => {});
          return seed;
        }
        return parseStore(raw);
      })
      .then(parsed => {
        if (!cancelled) {
          setStore(parsed);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const commit = useCallback((next: EventStore) => {
    setStore(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addEvent = useCallback(
    (date: BSDate, event: Omit<CalendarEvent, 'id' | 'dateKey' | 'createdAt'>) => {
      const dateKey = toKey(date);
      const full: CalendarEvent = {
        ...event,
        dateKey,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
      };
      commit({
        ...store,
        events: { ...store.events, [dateKey]: [...(store.events[dateKey] ?? []), full] },
      });
    },
    [store, commit],
  );

  const deleteEvent = useCallback(
    (dateKey: string, id: string) => {
      const list = store.events[dateKey];
      if (!list) {
        return;
      }
      const events = { ...store.events, [dateKey]: list.filter(e => e.id !== id) };
      if (events[dateKey].length === 0) {
        delete events[dateKey];
      }
      commit({ ...store, events });
    },
    [store, commit],
  );

  const toggleCategory = useCallback(
    (category: Category) => {
      const hidden = store.hidden.includes(category)
        ? store.hidden.filter(c => c !== category)
        : [...store.hidden, category];
      commit({ ...store, hidden });
    },
    [store, commit],
  );

  const visibleEvents = useMemo(() => {
    if (store.hidden.length === 0) {
      return store.events;
    }
    const out: Record<string, CalendarEvent[]> = {};
    for (const [key, list] of Object.entries(store.events)) {
      const filtered = list.filter(e => !store.hidden.includes(e.category));
      if (filtered.length > 0) {
        out[key] = filtered;
      }
    }
    return out;
  }, [store.events, store.hidden]);

  return {
    events: store.events,
    hidden: store.hidden,
    addEvent,
    deleteEvent,
    toggleCategory,
    visibleEvents,
  };
}

export function formatTime(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h12}:${String(minute).padStart(2, '0')} ${ampm}`;
}
