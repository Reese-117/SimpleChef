import React from 'react';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../../theme/spacing';

interface RecipeCardProps {
  id: number;
  title: string;
  image?: string;
  /** Prep + cook (minutes), shown as total active time */
  totalTimeMinutes: number;
  difficulty: string;
  tags?: string[];
  calories?: number | null;
  compact?: boolean;
  onPress: () => void;
}

export const RecipeCard = ({
  title,
  image,
  totalTimeMinutes,
  difficulty,
  tags = [],
  calories,
  compact,
  onPress,
}: RecipeCardProps) => {
  const theme = useTheme();

  return (
    <Card style={[styles.card, compact && styles.cardCompact]} onPress={onPress}>
      {image ? (
        <Card.Cover source={{ uri: image }} />
      ) : (
        <View style={[styles.placeholder, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            No image
          </Text>
        </View>
      )}
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.row}>
          <Chip
            icon="clock-outline"
            style={[styles.chip, { borderColor: theme.colors.outline }]}
            compact
          >
            Total {totalTimeMinutes} min
          </Chip>
          <Chip
            icon="chef-hat"
            style={[styles.chip, { borderColor: theme.colors.outline }]}
            compact
          >
            {difficulty}
          </Chip>
        </View>
        {calories != null && calories > 0 ? (
          <Chip
            icon="fire"
            style={[styles.chip, { borderColor: theme.colors.outline }]}
            compact
          >
            {calories} kcal
          </Chip>
        ) : null}
        {tags && tags.length > 0 ? (
          <View style={styles.tagRow}>
            {tags.slice(0, 3).map((t) => (
              <Chip
                key={t}
                compact
                style={{ backgroundColor: theme.colors.surfaceVariant }}
              >
                {t}
              </Chip>
            ))}
            {tags.length > 3 ? (
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                +{tags.length - 3}
              </Text>
            ) : null}
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.sm,
  },
  cardCompact: {
    marginHorizontal: 0,
  },
  placeholder: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: spacing.sm,
  },
  title: {
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
});
