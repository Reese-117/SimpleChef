/** Shared recipe shapes for UI (align with FastAPI `Recipe` responses). */

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
