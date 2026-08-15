import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, Columns2, Plus, Search } from 'lucide-react-native';
import { colors, spacing, typography } from '../theme';

interface CalendarHeaderProps {
  backLabel: string | null;
  title: string;
  showSplitToggle: boolean;
  splitMode: boolean;
  onBack: () => void;
  onSearch: () => void;
  onToggleSplit: () => void;
  onAdd: () => void;
}

export function CalendarHeader({
  backLabel,
  title,
  showSplitToggle,
  splitMode,
  onBack,
  onSearch,
  onToggleSplit,
  onAdd,
}: CalendarHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.back} onPress={onBack} hitSlop={10} disabled={!backLabel}>
        {backLabel ? (
          <>
            <ChevronLeft size={22} color={colors.red} />
            <Text style={styles.backLabel} numberOfLines={1}>
              {backLabel}
            </Text>
          </>
        ) : (
          <View style={styles.backSpacer} />
        )}
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.actions}>
        <Pressable onPress={onSearch} hitSlop={8} style={styles.iconBtn}>
          <Search size={21} color={colors.text} />
        </Pressable>
        {showSplitToggle && (
          <Pressable onPress={onToggleSplit} hitSlop={8} style={styles.iconBtn}>
            <Columns2 size={21} color={splitMode ? colors.red : colors.text} />
          </Pressable>
        )}
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
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 130,
  },
  backLabel: {
    color: colors.red,
    fontSize: typography.body,
    maxWidth: 100,
  },
  backSpacer: {
    width: 28,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.headline,
    fontWeight: '700',
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginLeft: spacing.md,
  },
});
