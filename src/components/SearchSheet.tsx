import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { CalendarEvent, Category, formatTime } from '../utils/events';
import { BSDate, BS_MONTHS } from '../utils/nepaliDate';
import { CATEGORY_COLORS, colors, radius, spacing, typography } from '../theme';

export interface SearchHit {
  event: CalendarEvent;
  date: BSDate;
}

interface SearchSheetProps {
  visible: boolean;
  events: Record<string, CalendarEvent[]>;
  hidden: Category[];
  onClose: () => void;
  onSelectDate: (date: BSDate) => void;
}

export function SearchSheet({ visible, events, hidden, onClose, onSelectDate }: SearchSheetProps) {
  const [query, setQuery] = useState('');

  const hits = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) {
      return [];
    }
    const out: SearchHit[] = [];
    for (const [key, list] of Object.entries(events)) {
      for (const event of list) {
        if (hidden.includes(event.category)) {
          continue;
        }
        if (
          event.title.toLowerCase().includes(q) ||
          (event.notes ?? '').toLowerCase().includes(q)
        ) {
          const [y, m, d] = key.split('-').map(Number);
          out.push({ event, date: { year: y, month: m, day: d } });
        }
      }
    }
    return out.sort((a, b) => b.event.createdAt - a.event.createdAt).slice(0, 50);
  }, [query, events, hidden]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView style={styles.overlay} behavior="padding">
        <Pressable style={styles.backdrop} onPress={close} />
        <View style={styles.sheet}>
          <View style={styles.searchRow}>
            <Search size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Search events"
              placeholderTextColor={colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            {query.length > 0 && (
              <Pressable hitSlop={10} onPress={() => setQuery('')}>
                <X size={16} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
          <ScrollView style={styles.results} nestedScrollEnabled>
            {query.trim().length > 0 && hits.length === 0 && (
              <Text style={styles.empty}>No Results</Text>
            )}
            {hits.map(({ event, date }) => (
              <Pressable
                key={event.id}
                style={styles.row}
                onPress={() => {
                  onSelectDate(date);
                  close();
                }}
              >
                <View style={styles.dateCol}>
                  <Text style={styles.dayNum}>{date.day}</Text>
                  <Text style={styles.monthName}>{BS_MONTHS[date.month - 1].slice(0, 3)}</Text>
                </View>
                <View
                  style={[styles.bar, { backgroundColor: CATEGORY_COLORS[event.category] }]}
                />
                <View style={styles.content}>
                  <Text style={styles.title}>{event.title}</Text>
                  <Text style={styles.subtitle}>
                    {date.day} {BS_MONTHS[date.month - 1]} {date.year} · {formatTime(event.hour, event.minute)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.scrim,
  },
  sheet: {
    flex: 1,
    marginTop: 90,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: 42,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.body,
    color: colors.text,
  },
  results: {
    flex: 1,
  },
  empty: {
    fontSize: typography.callout,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dateCol: {
    width: 44,
    alignItems: 'center',
  },
  dayNum: {
    fontSize: typography.title,
    fontWeight: '600',
    color: colors.text,
  },
  monthName: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  bar: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginHorizontal: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.footnote,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
