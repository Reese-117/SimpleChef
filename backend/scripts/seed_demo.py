"""
Seed demo recipes for local testing (requires DB migrations applied).

Usage (from backend/ with venv active):
  python -m scripts.seed_demo
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.session import SessionLocal
from app import crud
from app.schemas.recipe import IngredientCreate, RecipeCreate, StepCreate
from app.schemas.user import UserCreate


def main() -> None:
    db = SessionLocal()
    try:
        email = "demo@simplechef.real"
        user = crud.user.get_by_email(db, email=email)
        if not user:
            user = crud.user.create(
                db,
                UserCreate(
                    email=email,
                    password="demo12345",
                    full_name="Demo Cook",
                ),
            )
            print("Created user", email, "/ demo12345")
        else:
            print("User exists", email)

        title = "Demo garden pasta"
        existing = crud.recipe.get_multi(db, skip=0, limit=200)
        if any(r.title == title for r in existing):
            print("Demo recipe already present")
            return

        r = RecipeCreate(
            title=title,
            description="Quick demo with tags and steps.",
            prep_time_minutes=10,
            cook_time_minutes=15,
            servings=2,
            difficulty="Easy",
            tags=["vegetarian", "quick"],
            ingredients=[
                IngredientCreate(name="Pasta", quantity=250, unit="g"),
                IngredientCreate(name="Olive oil", quantity=1, unit="tbsp"),
                IngredientCreate(name="Tomatoes", quantity=2, unit="pcs"),
            ],
            steps=[
                StepCreate(order_index=1, instruction="Boil salted water for pasta.", timer_seconds=300),
                StepCreate(order_index=2, instruction="Saute tomatoes in oil, toss with pasta.", timer_seconds=120),
            ],
        )
        crud.recipe.create_with_owner(db, obj_in=r, owner_id=user.id)
        print("Seeded recipe:", title)
    finally:
        db.close()


if __name__ == "__main__":
    main()
