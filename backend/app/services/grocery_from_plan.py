"""Aggregate planned recipe ingredients into grocery rows (merge rules: same name+unit)."""

from collections import defaultdict
from datetime import date
from typing import DefaultDict, Dict, List, Tuple

from sqlalchemy.orm import Session, joinedload

from app.models.meal_plan import MealPlan
from app.models.recipe import Recipe


def _category_guess(name: str) -> str:
    # Lightweight keyword categorization used only for default sectioning.
    n = name.lower()
    if any(x in n for x in ("milk", "cheese", "yogurt", "cream", "butter")):
        return "Dairy"
    if any(x in n for x in ("chicken", "beef", "pork", "fish", "egg", "turkey", "tofu")):
        return "Meat & protein"
    if any(
        x in n
        for x in (
            "lettuce",
            "tomato",
            "onion",
            "garlic",
            "pepper",
            "spinach",
            "carrot",
            "potato",
            "herb",
            "cilantro",
            "lime",
            "lemon",
        )
    ):
        return "Produce"
    return "Pantry"


def aggregate_for_range(
    db: Session, *, user_id: int, start_date: date, end_date: date
) -> List[Dict]:
    """
    Returns list of dicts: name, quantity, unit, category
    (merged by normalized name + unit).
    """
    plans: List[MealPlan] = (
        db.query(MealPlan)
        .options(joinedload(MealPlan.recipe).joinedload(Recipe.ingredients))
        .filter(
            MealPlan.user_id == user_id,
            MealPlan.date >= start_date,
            MealPlan.date <= end_date,
            MealPlan.recipe_id.isnot(None),
        )
        .all()
    )

    merged: DefaultDict[Tuple[str, str], Dict] = defaultdict(
        lambda: {"quantity": 0.0, "display_name": ""}
    )

    for plan in plans:
        recipe = plan.recipe
        if not recipe or not recipe.ingredients:
            continue
        for ing in recipe.ingredients:
            display = ing.name.strip()
            if not display:
                continue
            key = (display.lower(), (ing.unit or "").strip().lower())
            q = float(ing.quantity or 0)
            entry = merged[key]
            # Merge by normalized name+unit so repeated ingredients collapse into one row.
            entry["quantity"] += q
            entry["display_name"] = display
            entry["unit"] = ing.unit
            entry["category"] = _category_guess(display)

    out: List[Dict] = []
    for _key, data in merged.items():
        out.append(
            {
                "name": data["display_name"],
                "quantity": data["quantity"] or None,
                "unit": data.get("unit"),
                "category": data.get("category", "Pantry"),
            }
        )
    out.sort(key=lambda r: (r["category"], r["name"].lower()))
    return out
