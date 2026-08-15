import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { InboxItem } from '../utils/events';
import { colors, radius, spacing, typography } from '../theme';

interface InboxSheetProps {
  visible: boolean;
  items: InboxItem[];
  onClose: () => void;
  onClear: (id: string) => void;
}

export function InboxSheet({ visible, items, onClose, onClear }: InboxSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Text style={styles.title}>Inbox</Text>
          {items.length === 0 ? (
            <Text style={styles.empty}>No Invitations</Text>
          ) : (
            <ScrollView nestedScrollEnabled>
              {items.map(item => (
                <View key={item.id} style={styles.row}>
                  <View style={styles.content}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                  </View>
                  <Pressable hitSlop={10} onPress={() => onClear(item.id)}>
                    <Trash2 size={17} color={colors.textTertiary} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}
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
    maxHeight: '70%',
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
  empty: {
    fontSize: typography.callout,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
    marginRight: spacing.md,
  },
  itemTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
