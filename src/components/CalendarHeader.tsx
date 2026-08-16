import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronLeft, Plus, Search } from 'lucide-react-native';
import { colors, spacing, typography } from '../theme';

interface CalendarHeaderProps {
  backLabel: string | null;
  title: string;
  titleAsButton?: boolean;
  onBack: () => void;
  onTitlePress?: () => void;
  onSearch: () => void;
  onAdd: () => void;
}

export function CalendarHeader({
  backLabel,
  title,
  titleAsButton = false,
  onBack,
  onTitlePress,
  onSearch,
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
      <Pressable
        style={styles.titleWrap}
        onPress={titleAsButton ? onTitlePress : undefined}
        hitSlop={8}
        disabled={!titleAsButton}
      >
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {titleAsButton && <ChevronDown size={16} color={colors.textSecondary} />}
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
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
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
