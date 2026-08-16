import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BSDate, BS_MONTHS, getMonthGrid } from '../utils/nepaliDate';
import { colors, typography } from '../theme';

interface MiniMonthProps {
  year: number;
  month: number;
  today: BSDate;
  selected: BSDate;
  onSelectDay: (date: BSDate) => void;
}

export const MiniMonth = memo(function MiniMonthBase({
  year,
  month,
  today,
  selected,
  onSelectDay,
}: MiniMonthProps) {
  const weeks = useMemo(() => getMonthGrid(year, month, today), [year, month, today]);
  const isThisMonth = today.year === year && today.month === month;
  const selKey = selected.year === year && selected.month === month
    ? String(selected.day)
    : '';

  return (
    <View style={styles.wrap}>
      <Text style={[styles.monthName, isThisMonth && styles.monthNameCurrent]}>
        {BS_MONTHS[month - 1]}
      </Text>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map(cell => {
            if (cell.day === null) {
              return <View key={cell.key} style={styles.cell} />;
            }
            const d = cell.date!;
            const isSel = String(d.day) === selKey;
            return (
              <Pressable
                key={cell.key}
                style={styles.cell}
                onPress={() => onSelectDay(d)}
              >
                <View
                  style={[
                    styles.circle,
                    isSel && !cell.isToday && styles.circleSel,
                    cell.isToday && styles.circleToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.day,
                      cell.isSaturday && styles.daySat,
                      cell.isToday && styles.dayToday,
                      isSel && !cell.isToday && styles.daySel,
                    ]}
                  >
                    {cell.day}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
      {Array.from({ length: 6 - weeks.length }, (_, i) => (
        <View key={`pad-${i}`} style={styles.weekRow}>
          {Array.from({ length: 7 }, (_d, j) => (
            <View key={j} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );
}, (prev, next) => {
  if (
    prev.year !== next.year ||
    prev.month !== next.month ||
    prev.today !== next.today ||
    prev.onSelectDay !== next.onSelectDay
  ) {
    return false;
  }
  const inMonth = (s: BSDate) => s.year === next.year && s.month === next.month;
  return !inMonth(prev.selected) && !inMonth(next.selected);
});

const styles = StyleSheet.create({
  wrap: {
    width: '33.333%',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  monthName: {
    fontSize: typography.footnote,
    fontWeight: '600',
    lineHeight: 16,
    color: colors.text,
    marginBottom: 6,
  },
  monthNameCurrent: {
    color: colors.red,
  },
  weekRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    height: 26,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignSelf: 'stretch',
    aspectRatio: 1,
    maxHeight: 26,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSel: {
    backgroundColor: colors.surfaceAlt,
  },
  circleToday: {
    backgroundColor: colors.red,
  },
  day: {
    fontSize: 10,
    color: colors.text,
  },
  daySat: {
    color: colors.saturday,
  },
  dayToday: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  daySel: {
    fontWeight: '600',
  },
});
