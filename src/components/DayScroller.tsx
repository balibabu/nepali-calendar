import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FlashList, FlashListRef, ViewToken } from '@shopify/flash-list';
import { Trash2 } from 'lucide-react-native';
import { CalendarEvent, formatTime } from '../utils/events';
import {
  BSDate,
  TOTAL_BS_DAYS,
  WEEKDAYS,
  bsToAd,
  dayFromIndex,
  dayIndex,
  toKey,
} from '../utils/nepaliDate';
import { CATEGORY_COLORS, colors, spacing, typography } from '../theme';
import { useWindowedList } from '../hooks/useWindowedList';

interface DayScrollerProps {
  today: BSDate;
  anchor: BSDate;
  events: Record<string, CalendarEvent[]>;
  onSelectDay: (date: BSDate) => void;
  onDelete: (dateKey: string, id: string) => void;
}

interface DayItem {
  date: BSDate;
  key: string;
}

const VIEWABILITY = { itemVisiblePercentThreshold: 60 };

function ListFooter() {
  return <View style={styles.footer} />;
}

export function DayScroller({ today, anchor, events, onSelectDay, onDelete }: DayScrollerProps) {
  const listRef = useRef<FlashListRef<DayItem>>(null);
  const anchorIdxRef = useRef<number>(-1);
  const firstLayoutRef = useRef(true);
  const isInternalScrollRef = useRef(false);

  const anchorIdx = useMemo(() => dayIndex(anchor), [anchor]);

  const { indices, start, end, extendStart, extendEnd, onScroll } = useWindowedList({
    total: TOTAL_BS_DAYS,
    anchor: anchorIdx,
    padEnd: 30,
  });

  const dayItems = useMemo<DayItem[]>(
    () =>
      indices.map(i => {
        const date = dayFromIndex(i);
        return { date, key: toKey(date) };
      }),
    [indices],
  );

  useEffect(() => {
    if (firstLayoutRef.current) {
      anchorIdxRef.current = anchorIdx;
      return;
    }
    if (anchorIdx === anchorIdxRef.current) {
      return;
    }
    if (anchorIdx < start || anchorIdx > end) {
      return;
    }
    anchorIdxRef.current = anchorIdx;
    isInternalScrollRef.current = true;
    listRef.current?.scrollToIndex({
      index: anchorIdx - start,
      animated: false,
      viewPosition: 0,
    });
  }, [anchorIdx, start, end]);

  const onScrollEnd = useCallback(() => {
    isInternalScrollRef.current = false;
  }, []);

  const keyExtractor = useCallback((item: DayItem) => item.key, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<DayItem>[] }) => {
      if (firstLayoutRef.current && viewableItems.length > 0) {
        firstLayoutRef.current = false;
        return;
      }
      if (isInternalScrollRef.current) {
        return;
      }
      if (viewableItems.length > 0 && viewableItems[0].item) {
        onSelectDay(viewableItems[0].item.date);
      }
    },
    [onSelectDay],
  );

  const renderItem = useCallback(
    ({ item }: { item: DayItem }) => {
      const { date } = item;
      const list = (events[item.key] ?? [])
        .slice()
        .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
      const ad = bsToAd(date);
      const isToday =
        date.year === today.year && date.month === today.month && date.day === today.day;

      return (
        <View style={styles.dayBlock}>
          <View style={styles.headerRow}>
            <Text style={[styles.dayName, isToday && styles.todayText]}>
              {WEEKDAYS[ad.getUTCDay()]}
            </Text>
            <Text style={[styles.dayNumber, isToday && styles.todayText]}>
              {date.day}
            </Text>
            {isToday && <View style={styles.todayDot} />}
          </View>
          {list.length === 0 ? (
            <Text style={styles.noEvents}>No Events</Text>
          ) : (
            list.map(event => (
              <View key={event.id} style={styles.eventRow}>
                <View style={styles.timeCol}>
                  <Text style={styles.time}>{formatTime(event.hour, event.minute)}</Text>
                </View>
                <View
                  style={[styles.bar, { backgroundColor: CATEGORY_COLORS[event.category] }]}
                />
                <Text style={styles.title} numberOfLines={1}>
                  {event.title}
                </Text>
                <Pressable hitSlop={10} onPress={() => onDelete(event.dateKey, event.id)}>
                  <Trash2 size={16} color={colors.textTertiary} />
                </Pressable>
              </View>
            ))
          )}
        </View>
      );
    },
    [events, today, onDelete],
  );

  return (
    <View style={styles.root}>
      <FlashList
        ref={listRef}
        data={dayItems}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        onStartReached={extendStart}
        onEndReached={extendEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY}
        onScrollEndDrag={onScrollEnd}
        onMomentumScrollEnd={onScrollEnd}
        ListFooterComponent={ListFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  footer: {
    height: 24,
  },
  dayBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  dayName: {
    fontSize: typography.callout,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    width: 48,
  },
  dayNumber: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },
  todayText: {
    color: colors.red,
  },
  todayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
    marginLeft: spacing.sm,
    alignSelf: 'center',
  },
  noEvents: {
    fontSize: typography.callout,
    color: colors.textTertiary,
    paddingVertical: spacing.md,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  timeCol: {
    width: 64,
  },
  time: {
    fontSize: typography.footnote,
    color: colors.textSecondary,
  },
  bar: {
    width: 4,
    height: 30,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    fontWeight: '500',
  },
});
