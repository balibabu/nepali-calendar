import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CalendarRange, Inbox } from 'lucide-react-native';
import { colors, spacing, typography } from '../theme';

interface BottomBarProps {
  inboxCount: number;
  onToday: () => void;
  onCalendars: () => void;
  onInbox: () => void;
}

export function BottomBar({ inboxCount, onToday, onCalendars, onInbox }: BottomBarProps) {
  return (
    <View style={styles.bar}>
      <Pressable style={styles.item} onPress={onToday} hitSlop={6}>
        <Text style={styles.itemText}>Today</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={onCalendars} hitSlop={6}>
        <View style={styles.centerItem}>
          <CalendarRange size={20} color={colors.text} />
          <Text style={styles.itemText}>Calendars</Text>
        </View>
      </Pressable>
      <Pressable style={styles.item} onPress={onInbox} hitSlop={6}>
        <View style={styles.centerItem}>
          <Inbox size={20} color={colors.text} />
          {inboxCount > 0 && <View style={styles.badge} />}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  item: {
    alignItems: 'center',
  },
  centerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: typography.callout,
    color: colors.text,
    fontWeight: '500',
    marginLeft: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});
