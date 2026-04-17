import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions } from 'react-native';
import { plannerService, recipeService, userService } from '../services/api';
import { spacing } from '../theme/spacing';
import type { MealPlanDto, PlannerDaySummaryDto, RecipeListItemDto } from '../types';

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function toISODate(d: Date) {
  return d.toISOString().split('T')[0];
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function usePlannerController() {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [plans, setPlans] = useState<MealPlanDto[]>([]);
  const [daySummary, setDaySummary] = useState<PlannerDaySummaryDto | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [recipes, setRecipes] = useState<RecipeListItemDto[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [pickMealType, setPickMealType] = useState<string>('Dinner');
  const [calorieGoal, setCalorieGoal] = useState<number | null>(null);
  const [mealCountsByDate, setMealCountsByDate] = useState<Record<string, number>>({});

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

  const width = Dimensions.get('window').width - spacing.xxl;
  const cell = Math.floor(width / 7);

  const loadPlans = useCallback(async () => {
    try {
      const data = await plannerService.getPlans(selectedDate, selectedDate);
      setPlans(data);
    } catch (error) {
      console.error(error);
    }
  }, [selectedDate]);

  const loadMonthMealCounts = useCallback(async () => {
    try {
      const start = toISODate(startOfMonth(viewMonth));
      const end = toISODate(endOfMonth(viewMonth));
      const monthPlans: MealPlanDto[] = await plannerService.getPlans(start, end);
      const counts = monthPlans.reduce<Record<string, number>>((acc, plan) => {
        acc[plan.date] = (acc[plan.date] || 0) + 1;
        return acc;
      }, {});
      setMealCountsByDate(counts);
    } catch (error) {
      console.error(error);
      setMealCountsByDate({});
    }
  }, [viewMonth]);

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
    loadPlans();
    loadDaySummary();
  }, [loadPlans, loadDaySummary]);

  useEffect(() => {
    loadMonthMealCounts();
  }, [loadMonthMealCounts]);

  useEffect(() => {
    userService
      .getMe()
      .then((u) => setCalorieGoal(u.calorie_goal ?? null))
      .catch(() => setCalorieGoal(null));
  }, []);

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
      await loadPlans();
      await loadDaySummary();
      await loadMonthMealCounts();
    } catch (error) {
      console.error(error);
    }
  };

  const addRecipeMeal = async (recipeId: number, title: string) => {
    try {
      await plannerService.addPlan({
        date: selectedDate,
        meal_type: pickMealType,
        recipe_id: recipeId,
        custom_food_name: title,
      });
      setLibraryOpen(false);
      await loadPlans();
      await loadDaySummary();
      await loadMonthMealCounts();
    } catch (e) {
      console.error(e);
    }
  };

  const openLibrary = async () => {
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
      await loadPlans();
      await loadDaySummary();
      await loadMonthMealCounts();
    } catch (e) {
      console.error(e);
    }
  };

  const selectDay = (day: number) => {
    const d = new Date(year, month, day);
    setSelectedDate(toISODate(d));
  };

  const isSelected = (day: number) => {
    const d = toISODate(new Date(year, month, day));
    return d === selectedDate;
  };

  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1));
  const mealCountForDay = (day: number) => {
    const dateKey = toISODate(new Date(year, month, day));
    return mealCountsByDate[dateKey] || 0;
  };

  return {
    viewMonth,
    selectedDate,
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
    selectDay,
    isSelected,
    prevMonth,
    nextMonth,
    mealCountForDay,
    MEAL_TYPES,
    calorieGoal,
  };
}
