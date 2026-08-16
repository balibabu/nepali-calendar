import React, { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlashList, ViewToken } from '@shopify/flash-list';
import { BSDate, BS_MONTHS, monthFromIndex } from '../utils/nepaliDate';
import { MonthGrid } from './MonthGrid';
import { CalendarEvent } from '../utils/events';
import { colors, spacing, typography } from '../theme';
import { useWindowedList } from '../hooks/useWindowedList';

interface MonthScrollerProps {
  today: BSDate;
  selected: BSDate;
  events: Record<string, CalendarEvent[]>;
  anchorMonthIdx: number;
  onSelectDay: (date: BSDate) => void;
  onVisibleMonthChange: (monthIdx: number) => void;
}

const MONTHS_TOTAL = (2100 - 1992 + 1) * 12;
const VIEWABILITY = { itemVisiblePercentThreshold: 40 };

function ListFooter() {
  return <View style={styles.footer} />;
}

export function MonthScroller({
  today,
  selected,
  events,
  anchorMonthIdx,
  onSelectDay,
  onVisibleMonthChange,
}: MonthScrollerProps) {
  const reportRef = useRef(onVisibleMonthChange);
  reportRef.current = onVisibleMonthChange;

  const { indices, start, extendStart, extendEnd, onScroll } = useWindowedList({
    total: MONTHS_TOTAL,
    anchor: Math.max(0, anchorMonthIdx - 1),
    padEnd: 12,
  });

  const keyExtractor = useCallback((id: number) => `m-${id}`, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<number>[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        reportRef.current(start + viewableItems[0].index);
      }
    },
    [start],
  );

  const renderItem = useCallback(
    ({ item }: { item: number }) => {
      const { year, month } = monthFromIndex(item);
      return (
        <View style={styles.monthBlock}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>{BS_MONTHS[month - 1]}</Text>
            {month === 1 && <Text style={styles.monthYear}>{year}</Text>}
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
      <FlashList
        data={indices}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        onStartReached={extendStart}
        onEndReached={extendEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY}
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
});
