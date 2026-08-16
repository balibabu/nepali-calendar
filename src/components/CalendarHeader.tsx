import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, Plus, Search } from 'lucide-react-native';
import { colors, spacing, typography } from '../theme';

interface CalendarHeaderProps {
  leftLabel: string | null;
  leftAsButton?: boolean;
  onLeftPress: () => void;
  onSearch: () => void;
  onAdd: () => void;
}

export function CalendarHeader({
  leftLabel,
  leftAsButton = false,
  onLeftPress,
  onSearch,
  onAdd,
}: CalendarHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable
        style={styles.left}
        onPress={leftAsButton ? onLeftPress : undefined}
        hitSlop={8}
        disabled={!leftLabel}
      >
        {leftLabel ? (
          <>
            {leftAsButton ? null : <ChevronLeft size={22} color={colors.red} />}
            <Text
              style={[styles.leftLabel, leftAsButton && styles.leftLabelButton]}
              numberOfLines={1}
            >
              {leftLabel}
            </Text>
          </>
        ) : (
          <View style={styles.leftSpacer} />
        )}
      </Pressable>
      <View style={styles.actions}>
        <Pressable onPress={onSearch} hitSlop={8} style={styles.iconBtn}>
          <Search size={21} color={colors.text} />
        </Pressable>
        <Pressable onPress={onAdd} hitSlop={8} style={styles.iconBtn}>
          <Plus size={24} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 220,
  },
  leftLabel: {
    color: colors.red,
    fontSize: typography.body,
    maxWidth: 180,
  },
  leftLabelButton: {
    color: colors.text,
    fontSize: typography.headline,
    fontWeight: '700',
  },
  leftSpacer: {
    width: 28,
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconBtn: {
    marginLeft: spacing.md,
  },
});
