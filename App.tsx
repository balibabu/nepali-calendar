import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CalendarHeader } from './src/components/CalendarHeader';
import { BottomBar } from './src/components/BottomBar';
import { MonthScroller } from './src/components/MonthScroller';
import { YearScroller } from './src/components/YearScroller';
import { DayScroller } from './src/components/DayScroller';
import { AddEventSheet } from './src/components/AddEventSheet';
import { CalendarsSheet } from './src/components/CalendarsSheet';
import { SearchSheet } from './src/components/SearchSheet';
import { InboxSheet } from './src/components/InboxSheet';
import {
  BSDate,
  BS_MONTHS,
  getTodayBS,
  monthFromIndex,
  monthIndex,
} from './src/utils/nepaliDate';
import { useEventStore } from './src/utils/events';
import { colors } from './src/theme';

type Level = 'year' | 'month' | 'day';

export default function App() {
  const today = useMemo(() => getTodayBS(), []);
  const [level, setLevel] = useState<Level>('month');
  const [selected, setSelected] = useState<BSDate>(today);
  const [anchorMonthIdx, setAnchorMonthIdx] = useState(() =>
    monthIndex(today.year, today.month),
  );
  const [anchorYear, setAnchorYear] = useState(today.year);
  const [addOpen, setAddOpen] = useState(false);
  const [calendarsOpen, setCalendarsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);

  const {
    events,
    hidden,
    inbox,
    addEvent,
    deleteEvent,
    toggleCategory,
    clearInboxItem,
    visibleEvents,
  } = useEventStore();

  const zoom = useRef(new Animated.Value(0)).current;

  const transition = useCallback(
    (target: Level) => {
      Animated.sequence([
        Animated.timing(zoom, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setLevel(target);
        zoom.setValue(0);
      });
    },
    [zoom],
  );

  const handleSelectDay = useCallback(
    (date: BSDate) => {
      setSelected(date);
    },
    [],
  );

  const openDayLevel = useCallback(
    (date: BSDate) => {
      setSelected(date);
      transition('day');
    },
    [transition],
  );

  const collapseToYear = useCallback(
    (year: number) => {
      setAnchorYear(year);
      transition('year');
    },
    [transition],
  );

  const openMonthLevel = useCallback(
    (year: number, month: number) => {
      setAnchorMonthIdx(monthIndex(year, month));
      transition('month');
    },
    [transition],
  );

  const goToday = useCallback(() => {
    setSelected(today);
    setAnchorMonthIdx(monthIndex(today.year, today.month));
    setAnchorYear(today.year);
    if (level !== 'month') {
      transition('month');
    }
  }, [today, level, transition]);

  const headerTitle =
    level === 'year'
      ? 'Years'
      : level === 'month'
        ? `${BS_MONTHS[selected.month - 1]} ${selected.year}`
        : `${selected.day} ${BS_MONTHS[selected.month - 1]}`;

  const backLabel =
    level === 'day'
      ? BS_MONTHS[selected.month - 1]
      : level === 'month'
        ? String(monthFromIndex(anchorMonthIdx).year)
        : null;

  const onBack = () => {
    if (level === 'day') {
      openMonthLevel(selected.year, selected.month);
    } else if (level === 'month') {
      collapseToYear(monthFromIndex(anchorMonthIdx).year);
    }
  };

  const scale = zoom.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.93],
  });

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.root}>
        <CalendarHeader
          backLabel={backLabel}
          title={headerTitle}
          showSplitToggle={false}
          splitMode={false}
          onBack={onBack}
          onSearch={() => setSearchOpen(true)}
          onToggleSplit={() => undefined}
          onAdd={() => setAddOpen(true)}
        />

        <Animated.View style={[styles.body, { transform: [{ scale }] }]}>
          {level === 'month' && (
            <MonthScroller
              key={`month-${anchorMonthIdx}`}
              today={today}
              selected={selected}
              events={visibleEvents}
              onSelectDay={handleSelectDay}
              onCollapseToYear={collapseToYear}
            />
          )}
          {level === 'year' && (
            <YearScroller
              key={`year-${anchorYear}`}
              today={today}
              selected={selected}
              anchorYear={anchorYear}
              onSelectDay={openDayLevel}
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
        </Animated.View>

        <BottomBar
          inboxCount={inbox.length}
          onToday={goToday}
          onCalendars={() => setCalendarsOpen(true)}
          onInbox={() => setInboxOpen(true)}
        />

        <AddEventSheet
          visible={addOpen}
          date={selected}
          onClose={() => setAddOpen(false)}
          onSave={data => addEvent(selected, data)}
        />
        <CalendarsSheet
          visible={calendarsOpen}
          hidden={hidden}
          onClose={() => setCalendarsOpen(false)}
          onToggle={toggleCategory}
        />
        <SearchSheet
          visible={searchOpen}
          events={events}
          hidden={hidden}
          onClose={() => setSearchOpen(false)}
          onSelectDate={d => {
            setSelected(d);
            setAnchorMonthIdx(monthIndex(d.year, d.month));
            setLevel('month');
          }}
        />
        <InboxSheet
          visible={inboxOpen}
          items={inbox}
          onClose={() => setInboxOpen(false)}
          onClear={clearInboxItem}
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
  body: {
    flex: 1,
  },
});
