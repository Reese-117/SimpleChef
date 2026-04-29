from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import date

class MealPlanBase(BaseModel):
    date: date
    meal_type: str = "Dinner"
    recipe_id: Optional[int] = None
    custom_food_name: Optional[str] = None
    calories: Optional[int] = None
    protein_grams: Optional[int] = None
    carbs_grams: Optional[int] = None
    fat_grams: Optional[int] = None

class MealPlanCreate(MealPlanBase):
    pass

class MealPlanUpdate(BaseModel):
    date: Optional[date] = None
    meal_type: Optional[str] = None
    recipe_id: Optional[int] = None
    custom_food_name: Optional[str] = None
    calories: Optional[int] = None
    protein_grams: Optional[int] = None
    carbs_grams: Optional[int] = None
    fat_grams: Optional[int] = None

class MealPlan(MealPlanBase):
    id: int
    user_id: int
    recipe_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PlannerDaySummary(BaseModel):
    """Aggregates logged calories for a single calendar day (meal rows only)."""

    date: date
    consumed_calories: int
    meal_count: int
    meals_with_calories_logged: int
    meals_without_calories: int
