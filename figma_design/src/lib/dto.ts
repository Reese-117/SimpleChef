/** Aligns with FastAPI responses (same shapes as `frontend/types`). */

export type IngredientDto = {
  id: number;
  recipe_id: number;
  name: string;
  quantity?: number | null;
  unit?: string | null;
  step_id?: number | null;
};

export type StepDto = {
  id: number;
  recipe_id: number;
  order_index: number;
  instruction: string;
  timer_seconds?: number | null;
};

export type RecipeDto = {
  id: number;
  title: string;
  description?: string | null;
  image_url?: string | null;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  servings?: number | null;
  difficulty?: string | null;
  total_calories?: number | null;
  created_by_id?: number | null;
  is_public?: boolean;
  tags?: string[];
  ingredients: IngredientDto[];
  steps: StepDto[];
};

export type RecipeListItemDto = {
  id: number;
  title: string;
  image_url?: string | null;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  difficulty?: string | null;
  tags?: string[];
  total_calories?: number | null;
};

export type UserDto = {
  id?: number;
  email?: string;
  full_name?: string | null;
  bio?: string | null;
  profile_image_url?: string | null;
  is_screen_always_on?: boolean;
  calorie_goal?: number | null;
  dietary_restrictions?: string[];
};

export type MealPlanDto = {
  id: number;
  user_id: number;
  date: string;
  meal_type: string;
  recipe_id?: number | null;
  custom_food_name?: string | null;
  calories?: number | null;
  recipe_title?: string | null;
};

export type PlannerDaySummaryDto = {
  date: string;
  consumed_calories: number;
  meal_count: number;
  meals_with_calories_logged: number;
  meals_without_calories: number;
};

export type GroceryItemDto = {
  id: number;
  grocery_list_id: number;
  name: string;
  quantity?: number | null;
  unit?: string | null;
  category?: string | null;
  is_checked: boolean;
};

export type GroceryListDto = {
  id: number;
  items: GroceryItemDto[];
};

export type GrocerySection = {
  title: string;
  data: GroceryItemDto[];
};
