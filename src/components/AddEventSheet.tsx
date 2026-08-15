import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Category, formatTime } from '../utils/events';
import { BSDate, formatBSDateFull } from '../utils/nepaliDate';
import { CATEGORY_COLORS, CATEGORY_LABELS, colors, radius, spacing, typography } from '../theme';

interface AddEventSheetProps {
  visible: boolean;
  date: BSDate;
  onClose: () => void;
  onSave: (data: { title: string; notes: string; hour: number; minute: number; category: Category }) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

export function AddEventSheet({ visible, date, onClose, onSave }: AddEventSheetProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [category, setCategory] = useState<Category>('personal');
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setTitle('');
      setNotes('');
      const now = new Date();
      setHour(now.getHours());
      setMinute(0);
      setCategory('personal');
      slide.setValue(0);
      Animated.timing(slide, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slide]);

  const close = () => {
    Animated.timing(slide, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const save = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    onSave({ title: trimmed, notes: notes.trim(), hour, minute, category });
    close();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={close} />
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                { translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) },
              ],
            },
          ]}
        >
          <View style={styles.grabber} />
          <View style={styles.headerRow}>
            <Pressable onPress={close} hitSlop={12}>
              <X size={22} color={colors.textSecondary} />
            </Pressable>
            <Text style={styles.headerTitle}>New Event</Text>
            <Pressable onPress={save} hitSlop={12} disabled={!title.trim()}>
              <Text
                style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
              >
                Add
              </Text>
            </Pressable>
          </View>

          <Text style={styles.dateLabel}>{formatBSDateFull(date)}</Text>

          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Notes (optional)"
            placeholderTextColor={colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            maxLength={200}
          />

          <Text style={styles.sectionLabel}>Time</Text>
          <View style={styles.timeRow}>
            {HOURS.map(h => (
              <Pressable
                key={h}
                style={[styles.chip, hour === h && styles.chipActive]}
                onPress={() => setHour(h)}
              >
                <Text style={[styles.chipText, hour === h && styles.chipTextActive]}>
                  {String(h).padStart(2, '0')}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.timeRow}>
            {MINUTES.map(m => (
              <Pressable
                key={m}
                style={[styles.chip, minute === m && styles.chipActive]}
                onPress={() => setMinute(m)}
              >
                <Text style={[styles.chipText, minute === m && styles.chipTextActive]}>
                  {String(m).padStart(2, '0')}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.selectedTime}>{formatTime(hour, minute)}</Text>

          <Text style={styles.sectionLabel}>Calendar</Text>
          <View style={styles.categoryRow}>
            {(Object.keys(CATEGORY_LABELS) as Category[]).map(c => (
              <Pressable
                key={c}
                style={[styles.categoryChip, category === c && styles.categoryChipActive]}
                onPress={() => setCategory(c)}
              >
                <View
                  style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[c] }]}
                />
                <Text style={styles.categoryText}>{CATEGORY_LABELS[c]}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
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
    maxHeight: '88%',
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.headline,
    fontWeight: '700',
    color: colors.text,
  },
  saveBtn: {
    color: colors.red,
    fontSize: typography.body,
    fontWeight: '700',
  },
  saveBtnDisabled: {
    color: colors.textTertiary,
  },
  dateLabel: {
    fontSize: typography.callout,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.md,
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontSize: typography.footnote,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.sm,
  },
  chip: {
    width: 44,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.red,
  },
  chipText: {
    fontSize: typography.callout,
    color: colors.text,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  selectedTime: {
    fontSize: typography.callout,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.bg,
  },
  categoryChipActive: {
    backgroundColor: colors.surfaceAlt,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  categoryText: {
    fontSize: typography.callout,
    color: colors.text,
  },
});
