from datetime import date
from typing import Any, List

from app.schemas.meal_plan import PlannerDaySummary


def compute_planner_day_summary(day: date, plans: List[Any]) -> PlannerDaySummary:
    """Pure summary from ORM MealPlan rows (must have `.calories` attribute)."""
    with_cals = [p for p in plans if p.calories is not None]
    without = [p for p in plans if p.calories is None]
    consumed = sum(int(p.calories) for p in with_cals)
    return PlannerDaySummary(
        date=day,
        consumed_calories=consumed,
        meal_count=len(plans),
        meals_with_calories_logged=len(with_cals),
        meals_without_calories=len(without),
    )
