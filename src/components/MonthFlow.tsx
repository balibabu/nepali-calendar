import React, { useCallback, useMemo, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { BSDate } from '../utils/nepaliDate';
import { MiniMonth } from './MiniMonth';
import { colors, spacing } from '../theme';

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
const MONTH_ROW_HEIGHT = 198;
const TITLE_BLOCK = 54;
const YEAR_BLOCK_ESTIMATE = MONTH_ROW_HEIGHT * ROWS_PER_YEAR + TITLE_BLOCK;

export function MonthFlow({
  today,
  selected,
  anchorYear,
  onSelectDay,
  onVisibleYearChange,
}: MonthFlowProps) {
  const listRef = useRef<FlatList<number>>(null);
  const reportRef = useRef(onVisibleYearChange);
  reportRef.current = onVisibleYearChange;

  const rowIds = useMemo(
    () => Array.from({ length: ROWS_TOTAL }, (_, i) => i),
    [],
  );

  const keyExtractor = useCallback((r: number) => `r-${r}`, []);

  const getItemLayout = useCallback(
    (_data: unknown, index: number) => {
      const year = Math.floor(index / ROWS_PER_YEAR);
      const rowInYear = index % ROWS_PER_YEAR;
      const offset = year * YEAR_BLOCK_ESTIMATE + TITLE_BLOCK + rowInYear * MONTH_ROW_HEIGHT;
      return { length: MONTH_ROW_HEIGHT, offset, index };
    },
    [],
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index?: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        reportRef.current?.(MIN_YEAR + Math.floor(viewableItems[0].index / ROWS_PER_YEAR));
      }
    },
  ).current;

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
      <FlatList
        ref={listRef}
        data={rowIds}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialScrollIndex={Math.max(
          0,
          Math.min(ROWS_TOTAL - 1, (anchorYear - MIN_YEAR) * ROWS_PER_YEAR),
        )}
        initialNumToRender={6}
        maxToRenderPerBatch={3}
        windowSize={7}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 20 }}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.2}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
  listContent: {
    paddingBottom: 24,
  },
});
