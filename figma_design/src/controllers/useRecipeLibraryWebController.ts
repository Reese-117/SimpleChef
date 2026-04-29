import { useCallback, useEffect, useState } from 'react';
import { recipeService } from '@/lib/api';
import type { RecipeListItemDto } from '@/lib/dto';

type Options = {
  searchQuery: string;
  difficulty: string;
  maxTotalMinutes?: number;
  tagsAll?: string;
};

export function useRecipeLibraryWebController({
  searchQuery,
  difficulty,
  maxTotalMinutes,
}: Options) {
  const [recipes, setRecipes] = useState<RecipeListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [debouncedQ, setDebouncedQ] = useState('');

  useEffect(() => {
    // Debounce to reduce request spam while the user is typing.
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
        max_total_minutes: maxTotalMinutes,
      });
      setRecipes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, difficulty, maxTotalMinutes]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const hasActiveFilters = Boolean(
    // Use the debounced value so UI state matches the query currently sent to the API.
    debouncedQ.trim() || difficulty.trim() || maxTotalMinutes != null
  );

  return {
    recipes,
    loading,
    refresh: loadRecipes,
    debouncedSearch: debouncedQ,
    hasActiveFilters,
  };
}
