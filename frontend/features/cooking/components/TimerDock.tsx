import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, Card, IconButton, ProgressBar, useTheme } from 'react-native-paper';
import { useTimerStore } from '../../../store/useTimerStore';
import { spacing } from '../../../theme/spacing';

export const TimerDock = () => {
  const { timers, toggleTimer, removeTimer } = useTimerStore();
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  if (timers.length === 0) return null;

  const activeTimers = [...timers].sort((a, b) => a.remaining - b.remaining);
  const topTimer = activeTimers[0];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      {activeTimers.length > 1 && !expanded ? (
        <Pressable onPress={() => setExpanded(true)} accessibilityRole="button" accessibilityLabel="Expand timers">
          <View style={[styles.stackCard, { backgroundColor: theme.colors.elevation.level2 }]} />
        </Pressable>
      ) : null}
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={styles.row}>
            <Text variant="titleMedium">{topTimer.label}</Text>
            <View style={styles.rowRight}>
              {timers.length > 1 ? (
                <IconButton
                  icon={expanded ? 'chevron-up' : 'chevron-down'}
                  onPress={() => setExpanded(!expanded)}
                  accessibilityLabel={expanded ? 'Collapse timers' : 'Expand all timers'}
                />
              ) : null}
              <Text
                variant="headlineMedium"
                style={{
                  color: topTimer.status === 'completed' ? theme.colors.error : theme.colors.primary,
                }}
              >
                {formatTime(topTimer.remaining)}
              </Text>
            </View>
          </View>
          <ProgressBar
            progress={topTimer.duration ? 1 - topTimer.remaining / topTimer.duration : 0}
            style={styles.progress}
          />
          <View style={styles.controls}>
            <IconButton
              icon={topTimer.status === 'running' ? 'pause' : 'play'}
              onPress={() => toggleTimer(topTimer.id)}
              accessibilityLabel={topTimer.status === 'running' ? 'Pause timer' : 'Resume timer'}
            />
            <IconButton
              icon="close"
              onPress={() => removeTimer(topTimer.id)}
              accessibilityLabel="Remove timer"
            />
          </View>
          {expanded && activeTimers.length > 1 ? (
            <ScrollView style={styles.allTimers} nestedScrollEnabled>
              {activeTimers.map((t) => (
                <View key={t.id} style={[styles.timerRow, { borderTopColor: theme.colors.outline }]}>
                  <Text variant="bodyMedium" style={{ flex: 1 }}>
                    {t.label}
                  </Text>
                  <Text variant="titleMedium">{formatTime(t.remaining)}</Text>
                  <IconButton icon="close" size={20} onPress={() => removeTimer(t.id)} />
                </View>
              ))}
            </ScrollView>
          ) : null}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  stackCard: {
    height: 10,
    marginHorizontal: spacing.sm,
    borderTopLeftRadius: spacing.sm,
    borderTopRightRadius: spacing.sm,
    marginBottom: -5,
  },
  card: {
    elevation: 4,
  },
  content: {
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progress: {
    marginVertical: spacing.sm,
    height: 6,
    borderRadius: 3,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: -spacing.sm,
  },
  allTimers: {
    maxHeight: 160,
    marginTop: spacing.sm,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.xs,
  },
});
