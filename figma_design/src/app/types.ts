// SimpleChef Data Types
// Based on FIGMA_UI_SYSTEM_REQUIREMENTS.md Section 5

export interface User {
  id: string;
  email: string;
  full_name: string;
  bio?: string;
  calorie_goal?: number;
  dietary_restrictions: string[];
  is_screen_always_on: boolean;
  profile_image_url?: string;
}

export interface Ingredient {
  id?: string;
  name: string;
  quantity: string;
  unit: string;
  step_id?: string | null;
  step_order_index?: number | null;
}

export interface Step {
  id?: string;
  order_index: number;
  instruction: string;
  timer_seconds?: number | null;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  total_calories?: number;
  protein_grams?: number;
  carbs_grams?: number;
  fat_grams?: number;
  tags: string[];
  ingredients: Ingredient[];
  steps: Step[];
  created_by_id?: string;
  is_public?: boolean;
}

export interface MealPlan {
  id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe_id?: string | null;
  custom_food_name?: string | null;
  calories?: number | null;
  protein_grams?: number | null;
  carbs_grams?: number | null;
  fat_grams?: number | null;
  recipe_title?: string | null;
  user_id: string;
}

export interface PlannerDaySummary {
  date: string;
  consumed_calories: number;
  meal_count: number;
  meals_with_calories_logged: number;
  meals_without_calories: number;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
  category: string;
  is_checked: boolean;
  user_id: string;
}

export interface Timer {
  id: string;
  label: string;
  seconds: number;
  startTime: number;
  isActive: boolean;
  isPaused: boolean;
}

// Filter types
export interface RecipeFilters {
  search?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  maxTime?: number;
  showMineOnly?: boolean;
}
