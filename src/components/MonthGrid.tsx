import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GridCell, WEEKDAYS, getMonthGrid, BSDate } from '../utils/nepaliDate';
import { CalendarEvent } from '../utils/events';
import { CATEGORY_COLORS, colors, typography } from '../theme';

interface MonthGridProps {
  year: number;
  month: number;
  today: BSDate;
  selected: BSDate;
  events: Record<string, CalendarEvent[]>;
  compact?: boolean;
  onSelectDay: (date: BSDate) => void;
}

export function MonthGrid({
  year,
  month,
  today,
  selected,
  events,
  compact = false,
  onSelectDay,
}: MonthGridProps) {
  const weeks = getMonthGrid(year, month, today);

  return (
    <View>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map(w => (
          <Text key={w} style={styles.weekday}>
            {w.charAt(0)}
          </Text>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={`w-${wi}`} style={styles.weekRow}>
          {week.map(cell => (
            <DayCell
              key={cell.key}
              cell={cell}
              compact={compact}
              isSelected={
                cell.date !== undefined &&
                cell.date.year === selected.year &&
                cell.date.month === selected.month &&
                cell.date.day === selected.day
              }
              dots={dotsForCell(cell, events)}
              onPress={onSelectDay}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function dotsForCell(
  cell: GridCell,
  events: Record<string, CalendarEvent[]>,
): string[] {
  if (!cell.date) {
    return [];
  }
  const key = `${cell.date.year}-${String(cell.date.month).padStart(2, '0')}-${String(
    cell.date.day,
  ).padStart(2, '0')}`;
  const list = events[key] ?? [];
  const uniqueColors: string[] = [];
  for (const e of list) {
    const c = CATEGORY_COLORS[e.category] ?? colors.blue;
    if (!uniqueColors.includes(c)) {
      uniqueColors.push(c);
    }
  }
  return uniqueColors.slice(0, 3);
}

interface DayCellProps {
  cell: GridCell;
  compact: boolean;
  isSelected: boolean;
  dots: string[];
  onPress: (date: BSDate) => void;
}

function DayCell({ cell, compact, isSelected, dots, onPress }: DayCellProps) {
  if (cell.day === null) {
    return <View style={compact ? styles.cellCompact : styles.cell} />;
  }

  const circleSize = compact ? 30 : 36;
  const dotRow = dots.length > 0;

  return (
    <Pressable
      style={compact ? styles.cellCompact : styles.cell}
      onPress={() => cell.date && onPress(cell.date)}
    >
      <View
        style={[
          styles.circle,
          { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
          cell.isToday && styles.todayCircle,
          isSelected && !cell.isToday && styles.selectedCircle,
        ]}
      >
        <Text
          style={[
            compact ? styles.dayTextCompact : styles.dayText,
            cell.isSaturday && styles.satText,
            cell.isToday && styles.todayText,
            isSelected && !cell.isToday && styles.selectedText,
          ]}
        >
          {cell.day}
        </Text>
      </View>
      {dotRow && (
        <View style={styles.dots}>
          {dots.map(c => (
            <View key={c} style={[styles.dot, { backgroundColor: c }]} />
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.caption,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  weekRow: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  cellCompact: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    backgroundColor: colors.red,
  },
  selectedCircle: {
    backgroundColor: colors.surfaceAlt,
  },
  dayText: {
    fontSize: 17,
    color: colors.text,
  },
  dayTextCompact: {
    fontSize: 14,
    color: colors.text,
  },
  satText: {
    color: colors.saturday,
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  selectedText: {
    color: colors.text,
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
