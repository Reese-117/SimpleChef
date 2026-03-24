import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, View, StyleSheet, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { RecipeCard } from './RecipeCard';
import { recipeService } from '../../../services/api';
import { useRouter } from 'expo-router';
import { spacing } from '../../../theme/spacing';

type RecipeListProps = {
  searchQuery?: string;
  difficulty?: string;
};

export const RecipeList = ({ searchQuery = '', difficulty = '' }: RecipeListProps) => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debouncedQ, setDebouncedQ] = useState('');
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const numColumns = width >= 720 ? 2 : 1;

  useEffect(() => {
    if (searchQuery === '') {
      setDebouncedQ('');
      return;
    }
    const t = setTimeout(() => setDebouncedQ(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recipeService.getAll({
        q: debouncedQ.trim() || undefined,
        difficulty: difficulty.trim() || undefined,
      });
      setRecipes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, difficulty]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  if (loading && recipes.length === 0) {
    return <ActivityIndicator style={styles.loading} size="large" />;
  }

  return (
    <FlatList
      data={recipes}
      key={numColumns}
      numColumns={numColumns}
      keyExtractor={(item) => item.id.toString()}
      columnWrapperStyle={numColumns > 1 ? styles.columnWrap : undefined}
      refreshing={loading}
      onRefresh={loadRecipes}
      renderItem={({ item }) => (
        <View style={numColumns > 1 ? styles.gridCell : styles.fullWidth}>
          <RecipeCard
            id={item.id}
            title={item.title}
            image={item.image_url}
            totalTimeMinutes={(item.prep_time_minutes || 0) + (item.cook_time_minutes || 0)}
            difficulty={item.difficulty}
            tags={item.tags}
            calories={item.total_calories}
            compact={numColumns > 1}
            onPress={() => router.push(`/recipe/${item.id}`)}
          />
        </View>
      )}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Text style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
          {debouncedQ.trim() || difficulty
            ? 'No recipes match your filters.'
            : 'No recipes found. Add one!'}
        </Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xl,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  columnWrap: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  gridCell: {
    flex: 1,
    maxWidth: '50%',
    paddingHorizontal: spacing.xs,
  },
  fullWidth: {
    width: '100%',
  },
});
