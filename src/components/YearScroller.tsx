import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { BSDate } from '../utils/nepaliDate';
import { MiniMonth } from './MiniMonth';
import { colors, spacing } from '../theme';

interface YearScrollerProps {
  today: BSDate;
  selected: BSDate;
  anchorYear: number;
  onSelectDay: (date: BSDate) => void;
}

const MIN_YEAR = 1992;
const MAX_YEAR = 2100;
const YEARS_TOTAL = MAX_YEAR - MIN_YEAR + 1;
const YEAR_BLOCK_ESTIMATE = 860;

export function YearScroller({
  today,
  selected,
  anchorYear,
  onSelectDay,
}: YearScrollerProps) {
  const listRef = useRef<FlatList<number>>(null);
  const [, setTopYear] = useState(anchorYear);

  const yearIds = useMemo(
    () => Array.from({ length: YEARS_TOTAL }, (_, i) => MIN_YEAR + i),
    [],
  );

  const keyExtractor = useCallback((y: number) => `y-${y}`, []);

  const getItemLayout = useCallback(
    (_data: unknown, index: number) => ({
      length: YEAR_BLOCK_ESTIMATE,
      offset: YEAR_BLOCK_ESTIMATE * index,
      index,
    }),
    [],
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index?: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setTopYear(MIN_YEAR + viewableItems[0].index);
      }
    },
  ).current;

  const renderItem = useCallback(
    ({ item: year }: { item: number }) => (
      <View style={styles.yearBlock}>
        <Text style={[styles.yearTitle, today.year === year && styles.yearTitleCurrent]}>
          {year}
        </Text>
        <View style={styles.monthsGrid}>
          {Array.from({ length: 12 }, (_, i) => (
            <MiniMonth
              key={`${year}-${i + 1}`}
              year={year}
              month={i + 1}
              today={today}
              selected={selected}
              onSelectDay={onSelectDay}
            />
          ))}
        </View>
      </View>
    ),
    [today, selected, onSelectDay],
  );

  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
        data={yearIds}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialScrollIndex={Math.max(0, anchorYear - MIN_YEAR)}
        initialNumToRender={2}
        maxToRenderPerBatch={1}
        windowSize={4}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 20 }}
        contentContainerStyle={{ paddingBottom: 340 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  yearBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  yearTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    color: colors.text,
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
