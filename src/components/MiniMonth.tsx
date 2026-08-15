import React from 'react';
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

export function MiniMonth({ year, month, today, selected, onSelectDay }: MiniMonthProps) {
  const weeks = getMonthGrid(year, month, today);
  const isThisMonth = today.year === year && today.month === month;

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
            const isSel =
              cell.date!.year === selected.year &&
              cell.date!.month === selected.month &&
              cell.date!.day === selected.day;
            return (
              <Pressable
                key={cell.key}
                style={styles.cell}
                onPress={() => cell.date && onSelectDay(cell.date)}
              >
                <View
                  style={[
                    styles.circle,
                    isSel && styles.circleSel,
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
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 24,
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
