import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { recipeService } from '@/lib/api';
import type { RecipeDto } from '@/lib/dto';

export type ManualIngredientRow = {
  name: string;
  quantity: string;
  unit: string;
  stepOrder: string;
};

export type ManualStepRow = {
  instruction: string;
  timer_seconds: string;
};

export function useManualRecipeWebController(
  initialData: string | undefined,
  editId: string | undefined
) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [ingredients, setIngredients] = useState<ManualIngredientRow[]>([
    { name: '', quantity: '', unit: '', stepOrder: '' },
  ]);
  const [steps, setSteps] = useState<ManualStepRow[]>([{ instruction: '', timer_seconds: '' }]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [loadRecipeLoading, setLoadRecipeLoading] = useState(!!editId);

  useEffect(() => {
    if (!initialData) return;
    try {
      const data = JSON.parse(initialData) as Record<string, unknown>;
      setTitle((data.title as string) || '');
      setImageUrl((data.image_url as string) || '');
      setPrepTime(data.prep_time_minutes != null ? String(data.prep_time_minutes) : '');
      setCookTime(data.cook_time_minutes != null ? String(data.cook_time_minutes) : '');
      setServings(data.servings != null ? String(data.servings) : '');
      const parsedDifficulty = String((data.difficulty as string) || 'Medium').trim().toLowerCase();
      setDifficulty(
        parsedDifficulty === 'easy' || parsedDifficulty === 'hard' || parsedDifficulty === 'medium'
          ? parsedDifficulty
          : 'medium'
      );
      setCalories(data.total_calories != null ? String(data.total_calories) : '');
      setProtein(data.protein_grams != null ? String(data.protein_grams) : '');
      setCarbs(data.carbs_grams != null ? String(data.carbs_grams) : '');
      setFat(data.fat_grams != null ? String(data.fat_grams) : '');
      setTagsText(Array.isArray(data.tags) ? (data.tags as string[]).join(', ') : '');
      const ing = data.ingredients as unknown[] | undefined;
      setIngredients(
        ing?.length
          ? (ing as Record<string, unknown>[]).map((i) => ({
              name: (i.name as string) || '',
              quantity: i.quantity != null ? String(i.quantity) : '',
              unit: (i.unit as string) || '',
              stepOrder: '',
            }))
          : [{ name: '', quantity: '', unit: '', stepOrder: '' }]
      );
      const st = data.steps as ManualStepRow[] | undefined;
      setSteps(
        st?.length
          ? st.map((s) => ({
              instruction: (s as { instruction?: string }).instruction || '',
              timer_seconds:
                (s as { timer_seconds?: number | string }).timer_seconds != null
                  ? String((s as { timer_seconds?: number | string }).timer_seconds)
                  : '',
            }))
          : [{ instruction: '', timer_seconds: '' }]
      );
    } catch (e) {
      console.error('Failed to parse initial data', e);
    }
  }, [initialData]);

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    (async () => {
      setLoadRecipeLoading(true);
      try {
        const data: RecipeDto = await recipeService.getById(Number(editId));
        if (cancelled) return;
        setTitle(data.title || '');
        setImageUrl(data.image_url || '');
        setPrepTime(data.prep_time_minutes?.toString() || '');
        setCookTime(data.cook_time_minutes?.toString() || '');
        setServings(data.servings?.toString() || '');
        const parsedDifficulty = String(data.difficulty || 'Medium').trim().toLowerCase();
        setDifficulty(
          parsedDifficulty === 'easy' || parsedDifficulty === 'hard' || parsedDifficulty === 'medium'
            ? parsedDifficulty
            : 'medium'
        );
        setCalories(data.total_calories?.toString() || '');
        setProtein(data.protein_grams?.toString() || '');
        setCarbs(data.carbs_grams?.toString() || '');
        setFat(data.fat_grams?.toString() || '');
        setTagsText(Array.isArray(data.tags) ? data.tags.join(', ') : '');
        setSteps(
          data.steps?.length
            ? data.steps.map((s) => ({
                instruction: s.instruction || '',
                timer_seconds: s.timer_seconds != null ? String(s.timer_seconds) : '',
              }))
            : [{ instruction: '', timer_seconds: '' }]
        );
        setIngredients(
          data.ingredients?.length
            ? data.ingredients.map((i) => {
                let stepOrder = '';
                if (i.step_id && data.steps?.length) {
                  const st = data.steps.find((s) => s.id === i.step_id);
                  if (st) stepOrder = String(st.order_index);
                }
                return {
                  name: i.name || '',
                  quantity: i.quantity != null ? String(i.quantity) : '',
                  unit: i.unit || '',
                  stepOrder,
                };
              })
            : [{ name: '', quantity: '', unit: '', stepOrder: '' }]
        );
      } catch (e) {
        console.error(e);
        if (!cancelled) setSnackbar('Could not load recipe for editing.');
      } finally {
        // Prevent state updates after unmount or route change during async fetch.
        if (!cancelled) setLoadRecipeLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editId]);

  const addIngredient = useCallback(() => {
    setIngredients((prev) => [...prev, { name: '', quantity: '', unit: '', stepOrder: '' }]);
  }, []);

  const removeIngredient = useCallback((index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateIngredient = useCallback(
    (index: number, field: keyof ManualIngredientRow, value: string) => {
      setIngredients((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    },
    []
  );

  const addStep = useCallback(() => {
    setSteps((prev) => [...prev, { instruction: '', timer_seconds: '' }]);
  }, []);

  const removeStep = useCallback((index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateStep = useCallback((index: number, field: keyof ManualStepRow, value: string) => {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const tags = tagsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        title,
        image_url: imageUrl.trim() || null,
        prep_time_minutes: parseInt(prepTime, 10) || 0,
        cook_time_minutes: parseInt(cookTime, 10) || 0,
        servings: parseInt(servings, 10) || 1,
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        total_calories: parseInt(calories, 10) || null,
        protein_grams: parseInt(protein, 10) || null,
        carbs_grams: parseInt(carbs, 10) || null,
        fat_grams: parseInt(fat, 10) || null,
        tags,
        ingredients: ingredients.map((i) => {
          const so = String(i.stepOrder || '').trim();
          const parsedStep = so === '' ? undefined : parseInt(so, 10);
          return {
            name: i.name,
            quantity: parseFloat(String(i.quantity)) || 0,
            unit: i.unit || null,
            // API resolves this 1-based index to step_id after steps are persisted.
            step_order_index:
              parsedStep !== undefined && !Number.isNaN(parsedStep) ? parsedStep : undefined,
          };
        }),
        steps: steps.map((s, i) => ({
          instruction: s.instruction,
          order_index: i + 1,
          timer_seconds: parseInt(String(s.timer_seconds), 10) || null,
        })),
      };

      if (editId) {
        await recipeService.update(Number(editId), payload);
        navigate(-1);
      } else {
        await recipeService.create(payload);
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error(error);
      setSnackbar('Could not save recipe. Check required fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    title,
    setTitle,
    imageUrl,
    setImageUrl,
    prepTime,
    setPrepTime,
    cookTime,
    setCookTime,
    servings,
    setServings,
    difficulty,
    setDifficulty,
    calories,
    setCalories,
    protein,
    setProtein,
    carbs,
    setCarbs,
    fat,
    setFat,
    tagsText,
    setTagsText,
    ingredients,
    steps,
    loading,
    snackbar,
    setSnackbar,
    loadRecipeLoading,
    addIngredient,
    removeIngredient,
    updateIngredient,
    addStep,
    removeStep,
    updateStep,
    handleSave,
    isEdit: !!editId,
  };
}
