import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface BottomBarProps {
  onToday: () => void;
}

export function BottomBar({ onToday }: BottomBarProps) {
  return (
    <View style={styles.bar}>
      <Pressable style={styles.item} onPress={onToday} hitSlop={6}>
        <Text style={styles.itemText}>Today</Text>
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
  itemText: {
    fontSize: typography.callout,
    color: colors.text,
    fontWeight: '500',
  },
});
