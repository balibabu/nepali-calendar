import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BSDate, toKey } from './nepaliDate';

export type Category = 'personal' | 'work' | 'family';

export interface CalendarEvent {
  id: string;
  dateKey: string;
  title: string;
  notes?: string;
  hour: number; // 0..23
  minute: number; // 0..59
  category: Category;
  createdAt: number;
}

export interface InboxItem {
  id: string;
  title: string;
  subtitle: string;
  createdAt: number;
}

interface EventStore {
  events: Record<string, CalendarEvent[]>;
  hidden: Category[];
  inbox: InboxItem[];
}

const STORAGE_KEY = 'nepali_calendar_events_v2';

const EMPTY: EventStore = { events: {}, hidden: [], inbox: [] };

function parseStore(raw: string | null): EventStore {
  if (!raw) {
    return EMPTY;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<EventStore>;
    return {
      events: parsed.events ?? {},
      hidden: parsed.hidden ?? [],
      inbox: parsed.inbox ?? [],
    };
  } catch {
    return EMPTY;
  }
}

export function useEventStore() {
  const [store, setStore] = useState<EventStore>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then(async raw => {
        if (raw === null) {
          const seed: EventStore = {
            events: {},
            hidden: [],
            inbox: [
              {
                id: 'welcome',
                title: 'Welcome to Calendar',
                subtitle: 'Tap + to schedule your first event',
                createdAt: Date.now(),
              },
            ],
          };
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
          return seed;
        }
        return parseStore(raw);
      })
      .then(parsed => {
        if (!cancelled) {
          setStore(parsed);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
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

  const clearInboxItem = useCallback(
    (id: string) => {
      commit({ ...store, inbox: store.inbox.filter(i => i.id !== id) });
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

  const sortedDay = useCallback(
    (dateKey: string): CalendarEvent[] =>
      (visibleEvents[dateKey] ?? [])
        .slice()
        .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute)),
    [visibleEvents],
  );

  return {
    events: store.events,
    hidden: store.hidden,
    inbox: store.inbox,
    ready,
    addEvent,
    deleteEvent,
    toggleCategory,
    clearInboxItem,
    visibleEvents,
    sortedDay,
  };
}

export function formatTime(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h12}:${String(minute).padStart(2, '0')} ${ampm}`;
}
