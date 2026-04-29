import { useCallback, useEffect, useMemo, useState } from 'react';
import { endOfMonth, endOfWeek, startOfWeek } from 'date-fns';
import { plannerService, recipeService, userService } from '@/lib/api';
import type { MealPlanDto, PlannerDaySummaryDto, RecipeDto, RecipeListItemDto } from '@/lib/dto';

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

export const MEAL_TYPE_DOT_COLORS: Record<(typeof MEAL_TYPES)[number], string> = {
  Breakfast: 'hsl(32 95% 44%)',
  Lunch: 'hsl(199 89% 48%)',
  Dinner: 'hsl(263 70% 52%)',
  Snack: 'hsl(160 84% 36%)',
};

export function startOfMonthDate(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** Local calendar date as YYYY-MM-DD (avoids UTC shifts from `toISOString()`). */
export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODateLocal(iso: string): Date {
  const [y, mo, da] = iso.split('-').map(Number);
  return new Date(y, mo - 1, da);
}

function useMonthGridCellWidth() {
  const [cell, setCell] = useState(44);
  useEffect(() => {
    // Keep a minimum tap target while adapting to available width.
    const update = () => setCell(Math.max(36, Math.floor((window.innerWidth - 48) / 7)));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return cell;
}

export function usePlannerWebController() {
  const cell = useMonthGridCellWidth();
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [viewMonth, setViewMonth] = useState(() => startOfMonthDate(new Date()));
  const [showFullMonth, setShowFullMonth] = useState(false);
  const [rangePlans, setRangePlans] = useState<MealPlanDto[]>([]);
  const [daySummary, setDaySummary] = useState<PlannerDaySummaryDto | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [pendingRecipe, setPendingRecipe] = useState<RecipeListItemDto | null>(null);
  const [libraryServings, setLibraryServings] = useState('1');
  const [recipes, setRecipes] = useState<RecipeListItemDto[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [pickMealType, setPickMealType] = useState<string>('Dinner');
  const [calorieGoal, setCalorieGoal] = useState<number | null>(null);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const dim = daysInMonth(year, month);
  const firstDow = new Date(year, month, 1).getDay();
  const grid = useMemo(() => {
    const cells: ({ day: number } | null)[] = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= dim; d++) cells.push({ day: d });
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month, firstDow, dim]);

  const loadRangePlans = useCallback(async () => {
    const selected = parseISODateLocal(selectedDate);
    const weekS = startOfWeek(selected, { weekStartsOn: 0 });
    const weekE = endOfWeek(selected, { weekStartsOn: 0 });
    const ws = toISODate(weekS);
    const we = toISODate(weekE);

    let start = ws;
    let end = we;
    if (showFullMonth) {
      // Expand to full calendar weeks so month view dots match visible cells.
      const mStart = startOfMonthDate(viewMonth);
      const mEnd = endOfMonth(viewMonth);
      const calS = startOfWeek(mStart, { weekStartsOn: 0 });
      const calE = endOfWeek(mEnd, { weekStartsOn: 0 });
      const cs = toISODate(calS);
      const ce = toISODate(calE);
      start = [ws, cs].sort()[0];
      end = [we, ce].sort().reverse()[0];
    }

    try {
      const data = await plannerService.getPlans(start, end);
      setRangePlans(data);
    } catch (error) {
      console.error(error);
    }
  }, [selectedDate, viewMonth, showFullMonth]);

  const loadDaySummary = useCallback(async () => {
    try {
      const s = await plannerService.getDaySummary(selectedDate);
      setDaySummary(s);
    } catch (e) {
      console.error(e);
      setDaySummary(null);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadRangePlans();
  }, [loadRangePlans]);

  useEffect(() => {
    loadDaySummary();
  }, [loadDaySummary]);

  useEffect(() => {
    userService
      .getMe()
      .then((u) => setCalorieGoal(u.calorie_goal ?? null))
      .catch(() => setCalorieGoal(null));
  }, []);

  const plans = useMemo(
    () => rangePlans.filter((p) => p.date === selectedDate),
    [rangePlans, selectedDate]
  );

  const weekStripDays = useMemo(() => {
    const anchor = startOfWeek(parseISODateLocal(selectedDate), { weekStartsOn: 0 });
    const out: { date: Date; iso: string; weekdayShort: string; dayNum: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() + i);
      out.push({
        date: d,
        iso: toISODate(d),
        weekdayShort: d.toLocaleString('default', { weekday: 'short' }),
        dayNum: d.getDate(),
      });
    }
    return out;
  }, [selectedDate]);

  const getDotsForDate = useCallback(
    (iso: string) => {
      const found = new Set<(typeof MEAL_TYPES)[number]>();
      for (const p of rangePlans) {
        if (p.date !== iso) continue;
        const raw = (p.meal_type || '').trim().toLowerCase();
        const mt = MEAL_TYPES.find((m) => m.toLowerCase() === raw);
        if (mt) found.add(mt);
      }
      return MEAL_TYPES.filter((m) => found.has(m));
    },
    [rangePlans]
  );

  const addMeal = async () => {
    try {
      await plannerService.addPlan({
        date: selectedDate,
        meal_type: 'Dinner',
        custom_food_name: mealName,
        calories: parseInt(calories, 10) || 0,
      });
      setModalVisible(false);
      setMealName('');
      setCalories('');
      await loadRangePlans();
      await loadDaySummary();
    } catch (error) {
      console.error(error);
    }
  };

  const addRecipeMeal = async (
    recipeId: number,
    title: string,
    calories?: number | null,
    proteinGrams?: number | null,
    carbsGrams?: number | null,
    fatGrams?: number | null
  ) => {
    try {
      await plannerService.addPlan({
        date: selectedDate,
        meal_type: pickMealType,
        recipe_id: recipeId,
        custom_food_name: title,
        calories: calories ?? undefined,
        protein_grams: proteinGrams ?? undefined,
        carbs_grams: carbsGrams ?? undefined,
        fat_grams: fatGrams ?? undefined,
      });
      setLibraryOpen(false);
      setPendingRecipe(null);
      setLibraryServings('1');
      await loadRangePlans();
      await loadDaySummary();
    } catch (e) {
      console.error(e);
    }
  };

  const selectRecipeForPlan = (r: RecipeListItemDto) => {
    setPendingRecipe(r);
    setLibraryServings('1');
  };

  const clearRecipePick = () => {
    setPendingRecipe(null);
    setLibraryServings('1');
  };

  const confirmAddRecipeFromLibrary = async () => {
    if (!pendingRecipe) return;
    const raw = parseFloat(String(libraryServings).replace(',', '.'));
    const userServings = Number.isFinite(raw) && raw > 0 ? raw : 1;
    let full: RecipeDto;
    try {
      full = await recipeService.getById(pendingRecipe.id);
    } catch (e) {
      console.error(e);
      return;
    }
    const recipeYield = Math.max(1, full.servings ?? 1);
    const factor = userServings / recipeYield;

    const scale = (v: number | null | undefined): number | undefined => {
      if (v == null || !Number.isFinite(Number(v))) return undefined;
      // Planner stores per-meal rounded values for quick daily totals.
      return Math.max(0, Math.round(Number(v) * factor));
    };

    await addRecipeMeal(
      full.id,
      full.title,
      scale(full.total_calories),
      scale(full.protein_grams),
      scale(full.carbs_grams),
      scale(full.fat_grams)
    );
  };

  const openLibrary = async () => {
    setPendingRecipe(null);
    setLibraryServings('1');
    setLibraryOpen(true);
    setLoadingRecipes(true);
    try {
      const data = await recipeService.getAll();
      setRecipes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const deletePlan = async (id: number) => {
    try {
      await plannerService.deletePlan(id);
      await loadRangePlans();
      await loadDaySummary();
    } catch (e) {
      console.error(e);
    }
  };

  const selectMonthGridDay = (day: number) => {
    const d = new Date(year, month, day);
    setSelectedDate(toISODate(d));
  };

  const isMonthGridDaySelected = (day: number) => {
    const d = toISODate(new Date(year, month, day));
    return d === selectedDate;
  };

  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1));

  const shiftSelectedByDays = (delta: number) => {
    const d = parseISODateLocal(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(toISODate(d));
  };
  const prevWeek = () => shiftSelectedByDays(-7);
  const nextWeek = () => shiftSelectedByDays(7);

  const weekRangeLabel = useMemo(() => {
    const a = weekStripDays[0]?.date;
    const b = weekStripDays[6]?.date;
    if (!a || !b) return '';
    const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    const left = a.toLocaleString('default', { month: 'short', day: 'numeric' });
    const right = sameMonth
      ? b.toLocaleString('default', { day: 'numeric', year: 'numeric' })
      : b.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${left} – ${right}`;
  }, [weekStripDays]);

  const toggleFullMonth = (open: boolean) => {
    if (open) setViewMonth(startOfMonthDate(parseISODateLocal(selectedDate)));
    setShowFullMonth(open);
  };

  return {
    viewMonth,
    selectedDate,
    setSelectedDate,
    plans,
    daySummary,
    modalVisible,
    setModalVisible,
    mealName,
    setMealName,
    calories,
    setCalories,
    libraryOpen,
    setLibraryOpen,
    pendingRecipe,
    libraryServings,
    setLibraryServings,
    selectRecipeForPlan,
    clearRecipePick,
    confirmAddRecipeFromLibrary,
    recipes,
    loadingRecipes,
    pickMealType,
    setPickMealType,
    year,
    month,
    grid,
    cell,
    addMeal,
    addRecipeMeal,
    openLibrary,
    deletePlan,
    selectMonthGridDay,
    isMonthGridDaySelected,
    prevMonth,
    nextMonth,
    prevWeek,
    nextWeek,
    MEAL_TYPES,
    calorieGoal,
    showFullMonth,
    setShowFullMonth: toggleFullMonth,
    weekStripDays,
    weekRangeLabel,
    getDotsForDate,
  };
}
