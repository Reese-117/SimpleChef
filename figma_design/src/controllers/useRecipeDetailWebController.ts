import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { plannerService, recipeService, userService } from '@/lib/api';
import type { RecipeDto, UserDto } from '@/lib/dto';

export const RECIPE_DETAIL_MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

export function useRecipeDetailWebController(recipeId: string | undefined) {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeDto | null>(null);
  const [me, setMe] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [planOpen, setPlanOpen] = useState(false);
  const [planDate, setPlanDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState<string>('Dinner');
  const [planSaving, setPlanSaving] = useState(false);
  const [ingredientsOpen, setIngredientsOpen] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!recipeId) return;
    setLoading(true);
    try {
      const [data, user] = await Promise.all([
        recipeService.getById(Number(recipeId)),
        userService.getMe().catch(() => null),
      ]);
      setRecipe(data);
      setMe(user);
    } catch (error) {
      console.error(error);
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    load();
  }, [load]);

  const isOwner = Boolean(me?.id != null && recipe && recipe.created_by_id === me.id);

  const addToCalendar = async () => {
    if (!recipe) return;
    setPlanSaving(true);
    try {
      await plannerService.addPlan({
        date: planDate,
        meal_type: mealType,
        recipe_id: recipe.id,
        calories: recipe.total_calories ?? undefined,
        custom_food_name: recipe.title,
      });
      setPlanOpen(false);
      navigate('/calendar');
    } catch (e) {
      console.error(e);
    } finally {
      setPlanSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!recipe) return;
    setDeleting(true);
    try {
      await recipeService.delete(recipe.id);
      setDeleteOpen(false);
      navigate('/', { replace: true });
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  return {
    recipe,
    me,
    loading,
    planOpen,
    setPlanOpen,
    planDate,
    setPlanDate,
    mealType,
    setMealType,
    planSaving,
    ingredientsOpen,
    setIngredientsOpen,
    deleteOpen,
    setDeleteOpen,
    deleting,
    isOwner,
    addToCalendar,
    handleDelete,
    navigate,
  };
}
