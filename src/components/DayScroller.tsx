import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
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

const DAY_HEADER_ESTIMATE = 120;
const DAY_COUNT = TOTAL_BS_DAYS;

export function DayScroller({ today, anchor, events, onSelectDay, onDelete }: DayScrollerProps) {
  const listRef = useRef<FlatList<DayItem>>(null);
  const anchorIdxRef = useRef<number>(-1);
  const firstLayoutRef = useRef(true);
  const isInternalScrollRef = useRef(false);

  const dayItems = useMemo<DayItem[]>(
    () =>
      Array.from({ length: DAY_COUNT }, (_, i) => {
        const date = dayFromIndex(i);
        return { date, key: toKey(date) };
      }),
    [],
  );

  const anchorIdx = useMemo(() => dayIndex(anchor), [anchor]);

  useEffect(() => {
    if (firstLayoutRef.current) {
      anchorIdxRef.current = anchorIdx;
      return;
    }
    if (anchorIdx === anchorIdxRef.current) {
      return;
    }
    anchorIdxRef.current = anchorIdx;
    isInternalScrollRef.current = true;
    listRef.current?.scrollToIndex({
      index: Math.max(0, anchorIdx),
      animated: false,
      viewPosition: 0,
    });
  }, [anchorIdx]);

  const onScrollEnd = useCallback(() => {
    isInternalScrollRef.current = false;
  }, []);

  const keyExtractor = useCallback((item: DayItem) => item.key, []);

  const getItemLayout = useCallback(
    (_data: unknown, index: number) => ({
      length: DAY_HEADER_ESTIMATE,
      offset: DAY_HEADER_ESTIMATE * index,
      index,
    }),
    [],
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ item: DayItem; index?: number | null }> }) => {
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
  ).current;

  const onScrollToIndexFailed = (info: { index: number }) => {
    listRef.current?.scrollToOffset({
      offset: DAY_HEADER_ESTIMATE * info.index,
      animated: false,
    });
  };

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
      <FlatList
        ref={listRef}
        data={dayItems}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        initialScrollIndex={Math.max(0, anchorIdx)}
        getItemLayout={getItemLayout}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        onScrollEndDrag={onScrollEnd}
        onMomentumScrollEnd={onScrollEnd}
        onScrollToIndexFailed={onScrollToIndexFailed}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
  listContent: {
    paddingBottom: 24,
  },
});
