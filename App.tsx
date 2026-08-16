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
  const [visibleYear, setVisibleYearState] = useState(today.year);
  const [addOpen, setAddOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const setVisibleMonthIdx = useCallback((idx: number) => {
    if (visibleMonthIdxRef.current !== idx) {
      visibleMonthIdxRef.current = idx;
      setVisibleMonthIdxState(idx);
    }
  }, []);

  const setVisibleYear = useCallback((year: number) => {
    if (visibleYearRef.current !== year) {
      visibleYearRef.current = year;
      setVisibleYearState(year);
    }
  }, []);

  const { events, addEvent, deleteEvent, visibleEvents } = useEventStore();

  const handleSelectDay = useCallback((date: BSDate) => {
    setSelected(date);
  }, []);

  const openDayLevel = useCallback((date: BSDate) => {
    setSelected(date);
    setLevel('day');
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
      setSelected(date);
      setAnchorMonthIdx(idx);
      setVisibleMonthIdx(idx);
      setLevel('month');
    },
    [setVisibleMonthIdx],
  );

  const goToday = useCallback(() => {
    const idx = monthIndex(today.year, today.month);
    setSelected(today);
    setVisibleYear(today.year);
    setAnchorMonthIdx(idx);
    setVisibleMonthIdx(idx);
    setLevel('month');
    setMonthJump(j => j + 1);
  }, [today, setVisibleYear, setVisibleMonthIdx]);

  const visibleMonth = monthFromIndex(visibleMonthIdx);

  const headerTitle =
    level === 'months'
      ? String(visibleYear)
      : level === 'month'
        ? `${BS_MONTHS[visibleMonth.month - 1]} ${visibleMonth.year}`
        : `${selected.day} ${BS_MONTHS[selected.month - 1]}`;

  const backLabel =
    level === 'day'
      ? BS_MONTHS[selected.month - 1]
      : level === 'months'
        ? BS_MONTHS[visibleMonth.month - 1]
        : String(visibleMonth.year);

  const onBack = () => {
    if (level === 'day') {
      openMonthLevel(monthIndex(selected.year, selected.month));
    } else if (level === 'months') {
      openMonthLevel(visibleMonthIdx);
    }
  };

  const onHeaderTitle = () => {
    if (level === 'month') {
      openMonthsLevel(visibleMonth.year);
    } else if (level === 'day') {
      openMonthsLevel(selected.year);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.root}>
        <CalendarHeader
          backLabel={backLabel}
          title={headerTitle}
          titleAsButton={level !== 'months'}
          onBack={onBack}
          onTitlePress={onHeaderTitle}
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
            onSelectDay={openDayLevel}
            onVisibleYearChange={setVisibleYear}
          />
        )}
        {level === 'day' && (
          <DayScroller
            key="day-scroller"
            today={today}
            anchor={selected}
            events={visibleEvents}
            onSelectDay={handleSelectDay}
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
