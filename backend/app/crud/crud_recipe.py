from typing import Dict, List, Optional
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from app.models.recipe import Recipe, Ingredient, Step
from app.models.meal_plan import MealPlan
from app.schemas.recipe import RecipeCreate, RecipeUpdate


def _steps_order_to_id_map(db: Session, recipe_id: int) -> Dict[int, int]:
    rows = db.query(Step).filter(Step.recipe_id == recipe_id).all()
    return {s.order_index: s.id for s in rows}


def _ingredient_from_payload(
    ing: dict, *, recipe_id: int, steps_by_order: Dict[int, int]
) -> Ingredient:
    data = {k: v for k, v in ing.items() if k not in ("step_order_index", "step_id")}
    soi = ing.get("step_order_index")
    step_id = steps_by_order.get(soi) if soi is not None else ing.get("step_id")
    return Ingredient(**data, recipe_id=recipe_id, step_id=step_id)


class CRUDRecipe:
    def get(self, db: Session, id: int) -> Optional[Recipe]:
        return db.query(Recipe).filter(Recipe.id == id).first()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[Recipe]:
        return db.query(Recipe).offset(skip).limit(limit).all()

    def get_multi_for_user(
        self,
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        q: Optional[str] = None,
        difficulty: Optional[str] = None,
        tag: Optional[str] = None,
        max_total_minutes: Optional[int] = None,
        tags_all: Optional[List[str]] = None,
    ) -> List[Recipe]:
        """Recipes owned by user or marked public, with optional filters."""
        qry = db.query(Recipe).filter(
            or_(Recipe.created_by_id == user_id, Recipe.is_public.is_(True))
        )
        if q and q.strip():
            qry = qry.filter(Recipe.title.ilike(f"%{q.strip()}%"))
        if difficulty and difficulty.strip():
            qry = qry.filter(Recipe.difficulty == difficulty.strip())
        if tag and tag.strip():
            qry = qry.filter(Recipe.tags.contains([tag.strip()]))
        if max_total_minutes is not None and max_total_minutes >= 0:
            total_mins = func.coalesce(Recipe.prep_time_minutes, 0) + func.coalesce(
                Recipe.cook_time_minutes, 0
            )
            qry = qry.filter(total_mins <= max_total_minutes)
        if tags_all:
            for t in tags_all:
                tt = t.strip()
                if tt:
                    qry = qry.filter(Recipe.tags.contains([tt]))
        return (
            qry.order_by(Recipe.id.desc()).offset(skip).limit(limit).all()
        )

    def get_visible_for_user(
        self, db: Session, recipe_id: int, user_id: int
    ) -> Optional[Recipe]:
        r = self.get(db, recipe_id)
        if not r:
            return None
        if r.created_by_id == user_id or r.is_public:
            return r
        return None

    def create_with_owner(
        self, db: Session, *, obj_in: RecipeCreate, owner_id: int
    ) -> Recipe:
        obj_in_data = jsonable_encoder(obj_in)
        ingredients_data = obj_in_data.pop("ingredients", [])
        steps_data = obj_in_data.pop("steps", [])

        db_obj = Recipe(**obj_in_data, created_by_id=owner_id)
        db.add(db_obj)
        # Persist first so child Step/Ingredient rows can reference recipe_id.
        db.commit()
        db.refresh(db_obj)

        for step in steps_data:
            db_step = Step(**step, recipe_id=db_obj.id)
            db.add(db_step)

        db.flush()
        steps_by_order = _steps_order_to_id_map(db, db_obj.id)
        for ingredient in ingredients_data:
            db.add(
                _ingredient_from_payload(
                    ingredient,
                    recipe_id=db_obj.id,
                    steps_by_order=steps_by_order,
                )
            )

        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: Recipe, obj_in: RecipeUpdate
    ) -> Recipe:
        update_data = obj_in.model_dump(exclude_unset=True)
        ingredients_data = update_data.pop("ingredients", None)
        steps_data = update_data.pop("steps", None)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        if steps_data is not None:
            db.query(Ingredient).filter(Ingredient.recipe_id == db_obj.id).delete()
            db.query(Step).filter(Step.recipe_id == db_obj.id).delete()
            for step in steps_data:
                db.add(Step(**step, recipe_id=db_obj.id))
            db.flush()
        if ingredients_data is not None:
            db.query(Ingredient).filter(Ingredient.recipe_id == db_obj.id).delete()
            steps_by_order = _steps_order_to_id_map(db, db_obj.id)
            for ingredient in ingredients_data:
                db.add(
                    _ingredient_from_payload(
                        ingredient,
                        recipe_id=db_obj.id,
                        steps_by_order=steps_by_order,
                    )
                )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Optional[Recipe]:
        obj = self.get(db, id)
        if not obj:
            return None
        # Detach planner rows that reference this recipe so historical plans remain
        # while satisfying FK constraints on recipe delete.
        linked_plans = db.query(MealPlan).filter(MealPlan.recipe_id == id).all()
        for plan in linked_plans:
            if not plan.custom_food_name:
                plan.custom_food_name = obj.title
            plan.recipe_id = None
        db.delete(obj)
        db.commit()
        return obj

recipe = CRUDRecipe()
