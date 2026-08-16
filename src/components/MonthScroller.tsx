import React, { useCallback, useMemo, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { BSDate, BS_MONTHS, monthFromIndex } from '../utils/nepaliDate';
import { MonthGrid } from './MonthGrid';
import { CalendarEvent } from '../utils/events';
import { colors, spacing, typography } from '../theme';

interface MonthScrollerProps {
  today: BSDate;
  selected: BSDate;
  events: Record<string, CalendarEvent[]>;
  anchorMonthIdx: number;
  onSelectDay: (date: BSDate) => void;
  onVisibleMonthChange: (monthIdx: number) => void;
}

const MONTH_ITEM_HEIGHT_ESTIMATE = 420;
const MONTHS_TOTAL = (2100 - 1992 + 1) * 12;

export function MonthScroller({
  today,
  selected,
  events,
  anchorMonthIdx,
  onSelectDay,
  onVisibleMonthChange,
}: MonthScrollerProps) {
  const listRef = useRef<FlatList<number>>(null);
  const reportRef = useRef(onVisibleMonthChange);
  reportRef.current = onVisibleMonthChange;

  const monthIds = useMemo(
    () => Array.from({ length: MONTHS_TOTAL }, (_, i) => i),
    [],
  );

  const keyExtractor = useCallback((id: number) => `m-${id}`, []);

  const getItemLayout = useCallback(
    (_data: unknown, index: number) => ({
      length: MONTH_ITEM_HEIGHT_ESTIMATE,
      offset: MONTH_ITEM_HEIGHT_ESTIMATE * index,
      index,
    }),
    [],
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      reportRef.current(viewableItems[0].index as number);
    }
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: number }) => {
      const { year, month } = monthFromIndex(item);
      return (
        <View style={styles.monthBlock}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>{BS_MONTHS[month - 1]}</Text>
            {month===1 && <Text style={styles.monthYear}>{year}</Text>}
          </View>
          <MonthGrid
            year={year}
            month={month}
            today={today}
            selected={selected}
            events={events}
            onSelectDay={onSelectDay}
          />
        </View>
      );
    },
    [today, selected, events, onSelectDay],
  );

  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
        data={monthIds}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        renderItem={renderItem}
        initialScrollIndex={Math.max(0, Math.min(MONTHS_TOTAL - 1, anchorMonthIdx - 1))}
        initialNumToRender={3}
        maxToRenderPerBatch={2}
        windowSize={5}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 40 }}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  monthBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  monthTitle: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
  },
  monthYear: {
    fontSize: typography.callout,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  listContent: {
    paddingBottom: 24,
  },
});
