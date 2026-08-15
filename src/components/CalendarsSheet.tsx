import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Category } from '../utils/events';
import { CATEGORY_COLORS, CATEGORY_LABELS, colors, radius, spacing, typography } from '../theme';

interface CalendarsSheetProps {
  visible: boolean;
  hidden: Category[];
  onClose: () => void;
  onToggle: (category: Category) => void;
}

export function CalendarsSheet({ visible, hidden, onClose, onToggle }: CalendarsSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Text style={styles.title}>Calendars</Text>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map(c => {
            const isHidden = hidden.includes(c);
            return (
              <Pressable key={c} style={styles.row} onPress={() => onToggle(c)}>
                <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[c] }]} />
                <Text style={styles.label}>{CATEGORY_LABELS[c]}</Text>
                <View style={[styles.toggle, !isHidden && styles.toggleOn]}>
                  <View style={[styles.knob, !isHidden && styles.knobOn]} />
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.scrim,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textTertiary,
    opacity: 0.5,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.headline,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  label: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.bg,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: colors.green,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: 0 }],
  },
  knobOn: {
    transform: [{ translateX: 18 }],
  },
});
