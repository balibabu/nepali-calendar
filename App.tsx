import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CalendarHeader } from './src/components/CalendarHeader';
import { BottomBar } from './src/components/BottomBar';
import { MonthScroller } from './src/components/MonthScroller';
import { MonthFlow } from './src/components/MonthFlow';
import { DayScroller } from './src/components/DayScroller';
import { AddEventSheet } from './src/components/AddEventSheet';
import { SearchSheet } from './src/components/SearchSheet';
import {
  BSDate,
  BS_MONTHS,
  getTodayBS,
  monthFromIndex,
  monthIndex,
} from './src/utils/nepaliDate';
import { Category, useEventStore } from './src/utils/events';
import { colors } from './src/theme';

type Level = 'months' | 'month' | 'day';

const NO_HIDDEN: Category[] = [];

export default function App() {
  const today = useMemo(() => getTodayBS(), []);
  const [level, setLevel] = useState<Level>('month');
  const [selected, setSelected] = useState<BSDate>(today);
  const [anchorMonthIdx, setAnchorMonthIdx] = useState(() =>
    monthIndex(today.year, today.month),
  );
  const [monthJump, setMonthJump] = useState(0);
  const visibleMonthIdxRef = useRef(anchorMonthIdx);
  const [visibleMonthIdx, setVisibleMonthIdxState] = useState(anchorMonthIdx);
  const [anchorYear, setAnchorYear] = useState(today.year);
  const visibleYearRef = useRef(today.year);
  const [addOpen, setAddOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const setVisibleMonthIdx = useCallback((idx: number) => {
    if (visibleMonthIdxRef.current !== idx) {
      visibleMonthIdxRef.current = idx;
      setVisibleMonthIdxState(idx);
    }
  }, []);

  const setVisibleYear = useCallback((year: number) => {
    visibleYearRef.current = year;
  }, []);

  const { events, addEvent, deleteEvent, visibleEvents } = useEventStore();

  const selectedRef = useRef(selected);

  const handleSelectDay = useCallback((date: BSDate) => {
    const prev = selectedRef.current;
    if (prev.year === date.year && prev.month === date.month && prev.day === date.day) {
      setLevel('day');
      return;
    }
    selectedRef.current = date;
    setSelected(date);
  }, []);

  const setSelectedDate = useCallback((date: BSDate) => {
    selectedRef.current = date;
    setSelected(date);
  }, []);

  const openMonthsLevel = useCallback((year: number) => {
    setAnchorYear(year);
    setVisibleYear(year);
    setLevel('months');
  }, [setVisibleYear]);

  const openMonthLevel = useCallback((monthIdx: number) => {
    setAnchorMonthIdx(monthIdx);
    setVisibleMonthIdx(monthIdx);
    setLevel('month');
  }, [setVisibleMonthIdx]);

  const openMonthLevelForDate = useCallback(
    (date: BSDate) => {
      const idx = monthIndex(date.year, date.month);
      setSelectedDate(date);
      setAnchorMonthIdx(idx);
      setVisibleMonthIdx(idx);
      setLevel('month');
    },
    [setVisibleMonthIdx, setSelectedDate],
  );

  const goToday = useCallback(() => {
    const idx = monthIndex(today.year, today.month);
    setSelectedDate(today);
    setVisibleYear(today.year);
    setAnchorMonthIdx(idx);
    setVisibleMonthIdx(idx);
    setLevel('month');
    setMonthJump(j => j + 1);
  }, [today, setVisibleYear, setVisibleMonthIdx, setSelectedDate]);

  const visibleMonth = monthFromIndex(visibleMonthIdx);

  const leftLabel =
    level === 'months'
      ? null
      : level === 'day'
        ? BS_MONTHS[selected.month - 1]
        : String(visibleMonth.year);

  const onLeftPress = () => {
    if (level === 'day') {
      openMonthLevel(monthIndex(selected.year, selected.month));
    } else if (level === 'month') {
      openMonthsLevel(visibleMonth.year);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.root}>
        <CalendarHeader
          leftLabel={leftLabel}
          leftAsButton={level === 'month'}
          onLeftPress={onLeftPress}
          onSearch={() => setSearchOpen(true)}
          onAdd={() => setAddOpen(true)}
        />

        {level === 'month' && (
          <MonthScroller
            key={`month-${anchorMonthIdx}-${monthJump}`}
            today={today}
            selected={selected}
            events={visibleEvents}
            anchorMonthIdx={anchorMonthIdx}
            onSelectDay={handleSelectDay}
            onVisibleMonthChange={setVisibleMonthIdx}
          />
        )}
        {level === 'months' && (
          <MonthFlow
            key={`months-${anchorYear}`}
            today={today}
            selected={selected}
            anchorYear={anchorYear}
            onSelectDay={openMonthLevelForDate}
            onVisibleYearChange={setVisibleYear}
          />
        )}
        {level === 'day' && (
          <DayScroller
            key="day-scroller"
            today={today}
            anchor={selected}
            events={visibleEvents}
            onSelectDay={setSelectedDate}
            onDelete={deleteEvent}
          />
        )}

        <BottomBar onToday={goToday} />

        <AddEventSheet
          visible={addOpen}
          date={selected}
          onClose={() => setAddOpen(false)}
          onSave={data => addEvent(selected, data)}
        />
        <SearchSheet
          visible={searchOpen}
          events={events}
          hidden={NO_HIDDEN}
          onClose={() => setSearchOpen(false)}
          onSelectDate={d => openMonthLevelForDate(d)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
