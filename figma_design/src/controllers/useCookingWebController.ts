import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { recipeService, userService } from '@/lib/api';
import { useTimerStore } from '@/lib/useTimerStore';
import type { IngredientDto, RecipeDto, StepDto } from '@/lib/dto';

export function useCookingWebController(recipeId: string | undefined) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<RecipeDto | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [allIngOpen, setAllIngOpen] = useState(false);
  const [keepAwakePref, setKeepAwakePref] = useState(false);

  const addTimer = useTimerStore((s) => s.addTimer);
  const tick = useTimerStore((s) => s.tick);

  const loadRecipe = useCallback(async () => {
    if (!recipeId) {
      setLoading(false);
      setRecipe(null);
      return;
    }
    setLoading(true);
    try {
      const data = await recipeService.getById(Number(recipeId));
      setRecipe(data);
    } catch (error) {
      console.error(error);
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    setCurrentStepIndex(0);
    setChecked({});
    loadRecipe();
  }, [recipeId, loadRecipe]);

  useEffect(() => {
    (async () => {
      try {
        const u = await userService.getMe();
        setKeepAwakePref(!!u.is_screen_always_on);
      } catch {
        setKeepAwakePref(false);
      }
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const steps: StepDto[] = recipe?.steps || [];
  const ingredients: IngredientDto[] = recipe?.ingredients || [];
  const currentStep = steps[currentStepIndex];

  const miseItems: IngredientDto[] = useMemo(() => {
    if (!currentStep) return [];
    const unlinked = ingredients.filter((i) => !i.step_id);
    const linked = ingredients.filter((i) => i.step_id === currentStep.id);
    const global = currentStepIndex === 0 ? unlinked : [];
    const map = new Map<number, IngredientDto>();
    [...global, ...linked].forEach((i) => map.set(i.id, i));
    return Array.from(map.values());
  }, [ingredients, currentStep, currentStepIndex]);

  const toggleIng = (ingId: number) => {
    setChecked((prev) => ({ ...prev, [ingId]: !prev[ingId] }));
  };

  const isLastStep = steps.length > 0 && currentStepIndex === steps.length - 1;

  const nextStep = () => {
    if (!isLastStep) setCurrentStepIndex(currentStepIndex + 1);
    else navigate(-1);
  };

  const prevStep = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
  };

  const handleStartTimer = () => {
    if (currentStep?.timer_seconds) {
      addTimer(`Step ${currentStep.order_index}`, currentStep.timer_seconds);
    }
  };

  return {
    loading,
    recipe,
    steps,
    ingredients,
    currentStep,
    currentStepIndex,
    miseItems,
    checked,
    allIngOpen,
    setAllIngOpen,
    keepAwakePref,
    toggleIng,
    isLastStep,
    nextStep,
    prevStep,
    handleStartTimer,
    navigate,
  };
}
