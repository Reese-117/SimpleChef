from datetime import date
from types import SimpleNamespace

from app.services.planner_summary import compute_planner_day_summary


def test_compute_planner_day_summary_empty():
    s = compute_planner_day_summary(date(2026, 3, 1), [])
    assert s.consumed_calories == 0
    assert s.meal_count == 0
    assert s.meals_with_calories_logged == 0
    assert s.meals_without_calories == 0


def test_compute_planner_day_summary_mixed_calories():
    plans = [
        SimpleNamespace(calories=400),
        SimpleNamespace(calories=None),
        SimpleNamespace(calories=200),
    ]
    s = compute_planner_day_summary(date(2026, 3, 2), plans)
    assert s.consumed_calories == 600
    assert s.meal_count == 3
    assert s.meals_with_calories_logged == 2
    assert s.meals_without_calories == 1
