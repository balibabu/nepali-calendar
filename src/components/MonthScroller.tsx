import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { BSDate, BS_MONTHS, monthFromIndex, monthIndex } from '../utils/nepaliDate';
import { MonthGrid } from './MonthGrid';
import { CalendarEvent } from '../utils/events';
import { colors, spacing, typography } from '../theme';

interface MonthScrollerProps {
  today: BSDate;
  selected: BSDate;
  events: Record<string, CalendarEvent[]>;
  onSelectDay: (date: BSDate, monthIndexTarget?: number) => void;
  onCollapseToYear: (anchorYear: number) => void;
}

const MONTH_ITEM_HEIGHT_ESTIMATE = 420;
const MONTHS_TOTAL = (2100 - 1992 + 1) * 12;

export function MonthScroller({
  today,
  selected,
  events,
  onSelectDay,
  onCollapseToYear,
}: MonthScrollerProps) {
  const listRef = useRef<FlatList<number>>(null);
  const [currentMonthIdx, setCurrentMonthIdx] = useState(() =>
    monthIndex(today.year, today.month),
  );

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
      setCurrentMonthIdx(viewableItems[0].index as number);
    }
  }).current;

  const currentYear = monthFromIndex(currentMonthIdx).year;

  const renderItem = useCallback(
    ({ item }: { item: number }) => {
      const { year, month } = monthFromIndex(item);
      return (
        <View style={styles.monthBlock}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>{BS_MONTHS[month - 1]}</Text>
          </View>
          <MonthGrid
            year={year}
            month={month}
            today={today}
            selected={selected}
            events={events}
            onSelectDay={d => onSelectDay(d)}
          />
        </View>
      );
    },
    [today, selected, events, onSelectDay],
  );

  return (
    <View style={styles.root}>
      <Pressable
        style={[styles.yearChip, { left: 0 }]}
        onPress={() => onCollapseToYear(currentYear)}
      >
        <Text style={styles.yearChipText}>{currentYear}</Text>
        <ChevronDown size={14} color={colors.textSecondary} />
      </Pressable>
      <FlatList
        ref={listRef}
        data={monthIds}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        renderItem={renderItem}
        initialScrollIndex={Math.max(0, monthIndex(today.year, today.month) - 1)}
        initialNumToRender={3}
        maxToRenderPerBatch={4}
        windowSize={5}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 40 }}
        contentContainerStyle={{ paddingBottom: 340 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  yearChip: {
    position: 'absolute',
    top: 2,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.surface,
    gap: 2,
  },
  yearChipText: {
    fontSize: typography.footnote,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  monthBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 8,
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
