import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

interface AppIconProps {
  month: string;
  day: number;
  size?: number;
}

export function AppIcon({ month, day, size = 36 }: AppIconProps) {
  const topHeight = size * 0.32;
  return (
    <View style={[styles.icon, { width: size, height: size, borderRadius: size * 0.24 }]}>
      <View style={[styles.top, { height: topHeight }]}>
        <Text style={[styles.month, { fontSize: size * 0.22 }]} numberOfLines={1}>
          {month}
        </Text>
      </View>
      <Text style={[styles.day, { fontSize: size * 0.52, lineHeight: size * 0.56 }]}>
        {day}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
  },
  top: {
    alignSelf: 'stretch',
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  day: {
    color: '#1C1C1E',
    fontWeight: '300',
  },
});
