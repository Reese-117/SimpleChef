from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import date

from app import crud, models, schemas
from app.api import deps
from app.models.meal_plan import MealPlan
from app.services.planner_summary import compute_planner_day_summary

router = APIRouter()


def _meal_plan_to_schema(p: MealPlan) -> schemas.MealPlan:
    return schemas.MealPlan(
        id=p.id,
        user_id=p.user_id,
        date=p.date,
        meal_type=p.meal_type,
        recipe_id=p.recipe_id,
        custom_food_name=p.custom_food_name,
        calories=p.calories,
        recipe_title=p.recipe.title if p.recipe else None,
    )


@router.get("/day-summary", response_model=schemas.PlannerDaySummary)
def read_planner_day_summary(
    date: date,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Sum `calories` on meal plan rows for the given day (null calories excluded from sum).
    Compare `consumed_calories` to `GET /users/me` `calorie_goal` on the client.
    """
    plans = (
        db.query(MealPlan)
        .filter(MealPlan.user_id == current_user.id, MealPlan.date == date)
        .all()
    )
    return compute_planner_day_summary(date, plans)


@router.get("/", response_model=List[schemas.MealPlan])
def read_meal_plans(
    start_date: date,
    end_date: date,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get meal plans for a date range (includes linked recipe title when `recipe_id` is set).
    """
    plans = (
        db.query(MealPlan)
        .options(joinedload(MealPlan.recipe))
        .filter(
            MealPlan.user_id == current_user.id,
            MealPlan.date >= start_date,
            MealPlan.date <= end_date,
        )
        .all()
    )
    return [_meal_plan_to_schema(p) for p in plans]

@router.post("/", response_model=schemas.MealPlan)
def create_meal_plan(
    *,
    db: Session = Depends(deps.get_db),
    meal_plan_in: schemas.MealPlanCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Add a meal to the plan.
    """
    created = crud.meal_plan.create(db=db, obj_in=meal_plan_in, user_id=current_user.id)
    p = (
        db.query(MealPlan)
        .options(joinedload(MealPlan.recipe))
        .filter(MealPlan.id == created.id)
        .first()
    )
    return _meal_plan_to_schema(p) if p else created


@router.patch("/{meal_id}", response_model=schemas.MealPlan)
def update_meal_plan(
    *,
    db: Session = Depends(deps.get_db),
    meal_id: int,
    meal_in: schemas.MealPlanUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    row = crud.meal_plan.get_owned(db, meal_id=meal_id, user_id=current_user.id)
    if not row:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    updated = crud.meal_plan.update(db=db, db_obj=row, obj_in=meal_in)
    p = (
        db.query(MealPlan)
        .options(joinedload(MealPlan.recipe))
        .filter(MealPlan.id == updated.id)
        .first()
    )
    return _meal_plan_to_schema(p) if p else _meal_plan_to_schema(updated)


@router.delete("/{meal_id}", status_code=204)
def delete_meal_plan(
    *,
    db: Session = Depends(deps.get_db),
    meal_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> None:
    row = crud.meal_plan.get_owned(db, meal_id=meal_id, user_id=current_user.id)
    if not row:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    crud.meal_plan.remove(db=db, meal_id=meal_id)
