import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { recipeService } from '../services/api';
import type { RecipeDto } from '../types/recipe';

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

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

export function useManualRecipeController(
  initialData: string | undefined,
  editId: string | undefined
) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>('Medium');
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
      setPrepTime(
        data.prep_time_minutes != null ? String(data.prep_time_minutes) : ''
      );
      setCookTime(
        data.cook_time_minutes != null ? String(data.cook_time_minutes) : ''
      );
      setServings(data.servings != null ? String(data.servings) : '');
      const incomingDifficulty = String(data.difficulty || '').trim();
      const normalizedDifficulty =
        incomingDifficulty.charAt(0).toUpperCase() + incomingDifficulty.slice(1).toLowerCase();
      setDifficulty(
        DIFFICULTIES.includes(normalizedDifficulty as (typeof DIFFICULTIES)[number])
          ? (normalizedDifficulty as (typeof DIFFICULTIES)[number])
          : 'Medium'
      );
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
        setPrepTime(data.prep_time_minutes?.toString() || '');
        setCookTime(data.cook_time_minutes?.toString() || '');
        setServings(data.servings?.toString() || '');
        const incomingDifficulty = String(data.difficulty || '').trim();
        const normalizedDifficulty =
          incomingDifficulty.charAt(0).toUpperCase() + incomingDifficulty.slice(1).toLowerCase();
        setDifficulty(
          DIFFICULTIES.includes(normalizedDifficulty as (typeof DIFFICULTIES)[number])
            ? (normalizedDifficulty as (typeof DIFFICULTIES)[number])
            : 'Medium'
        );
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

  const updateIngredient = useCallback((index: number, field: keyof ManualIngredientRow, value: string) => {
    setIngredients((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

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
        prep_time_minutes: parseInt(prepTime, 10) || 0,
        cook_time_minutes: parseInt(cookTime, 10) || 0,
        servings: parseInt(servings, 10) || 1,
        difficulty,
        tags,
        ingredients: ingredients.map((i) => {
          const so = String(i.stepOrder || '').trim();
          const parsedStep = so === '' ? undefined : parseInt(so, 10);
          return {
            name: i.name,
            quantity: parseFloat(String(i.quantity)) || 0,
            unit: i.unit || null,
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
        router.back();
      } else {
        await recipeService.create(payload);
        router.dismissAll();
        router.replace('/');
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
    prepTime,
    setPrepTime,
    cookTime,
    setCookTime,
    servings,
    setServings,
    difficulty,
    setDifficulty,
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
