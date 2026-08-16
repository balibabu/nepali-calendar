import React, { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlashList, ViewToken } from '@shopify/flash-list';
import { BSDate } from '../utils/nepaliDate';
import { MiniMonth } from './MiniMonth';
import { colors, spacing } from '../theme';
import { useWindowedList } from '../hooks/useWindowedList';

interface MonthFlowProps {
  today: BSDate;
  selected: BSDate;
  anchorYear: number;
  onSelectDay: (date: BSDate) => void;
  onVisibleYearChange?: (year: number) => void;
}

const MIN_YEAR = 1992;
const MAX_YEAR = 2100;
const YEARS_TOTAL = MAX_YEAR - MIN_YEAR + 1;
const ROWS_PER_YEAR = 4;
const ROWS_TOTAL = YEARS_TOTAL * ROWS_PER_YEAR;
const VIEWABILITY = { itemVisiblePercentThreshold: 20 };

function ListFooter() {
  return <View style={styles.footer} />;
}

export function MonthFlow({
  today,
  selected,
  anchorYear,
  onSelectDay,
  onVisibleYearChange,
}: MonthFlowProps) {
  const reportRef = useRef(onVisibleYearChange);
  reportRef.current = onVisibleYearChange;

  const { indices, start, extendStart, extendEnd, onScroll } = useWindowedList({
    total: ROWS_TOTAL,
    anchor: (anchorYear - MIN_YEAR) * ROWS_PER_YEAR,
    padEnd: 12,
  });

  const keyExtractor = useCallback((r: number) => `r-${r}`, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<number>[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        reportRef.current?.(
          MIN_YEAR + Math.floor((start + viewableItems[0].index) / ROWS_PER_YEAR),
        );
      }
    },
    [start],
  );

  const renderItem = useCallback(
    ({ item: row }: { item: number }) => {
      const year = MIN_YEAR + Math.floor(row / ROWS_PER_YEAR);
      const startMonth = (row % ROWS_PER_YEAR) * 3 + 1;
      const months = [0, 1, 2].map(i => startMonth + i).filter(m => m <= 12);
      return (
        <View style={styles.yearRowWrap}>
          {row % ROWS_PER_YEAR === 0 && (
            <Text style={[styles.yearTitle, today.year === year && styles.yearTitleCurrent]}>
              {year}
            </Text>
          )}
          <View style={styles.monthsGrid}>
            {months.map(m => (
              <MiniMonth
                key={`${year}-${m}`}
                year={year}
                month={m}
                today={today}
                selected={selected}
                onSelectDay={onSelectDay}
              />
            ))}
          </View>
        </View>
      );
    },
    [today, selected, onSelectDay],
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
  yearRowWrap: {
    paddingHorizontal: spacing.lg,
  },
  yearTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    color: colors.text,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  yearTitleCurrent: {
    color: colors.red,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
