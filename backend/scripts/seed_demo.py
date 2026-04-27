"""
Seed robust demo data for local testing (requires DB migrations applied).

Usage (from backend/ with venv active):
  python -m scripts.seed_demo
"""
from datetime import date, timedelta
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.session import SessionLocal
from app import crud
from app.models.meal_plan import MealPlan
from app.models.recipe import Recipe
from app.schemas.meal_plan import MealPlanCreate
from app.schemas.recipe import IngredientCreate, RecipeCreate, RecipeUpdate, StepCreate
from app.schemas.user import UserCreate


def kcal_from_macros(protein_g: int, carbs_g: int, fat_g: int) -> int:
    return protein_g * 4 + carbs_g * 4 + fat_g * 9


def ingredient(name: str, quantity: float | None = None, unit: str | None = None, step_idx: int | None = None):
    return IngredientCreate(name=name, quantity=quantity, unit=unit, step_order_index=step_idx)


def step(order: int, instruction: str, timer: int | None = None):
    return StepCreate(order_index=order, instruction=instruction, timer_seconds=timer)


def seed_or_update_recipe(db, *, owner_id: int, spec: dict) -> Recipe:
    calories = kcal_from_macros(spec["protein_grams"], spec["carbs_grams"], spec["fat_grams"])
    base = dict(
        title=spec["title"],
        description=spec["description"],
        image_url=spec.get("image_url"),
        prep_time_minutes=spec["prep_time_minutes"],
        cook_time_minutes=spec["cook_time_minutes"],
        servings=spec["servings"],
        difficulty=spec["difficulty"],
        total_calories=calories,
        protein_grams=spec["protein_grams"],
        carbs_grams=spec["carbs_grams"],
        fat_grams=spec["fat_grams"],
        tags=spec["tags"],
        ingredients=spec["ingredients"],
        steps=spec["steps"],
    )

    existing = (
        db.query(Recipe)
        .filter(Recipe.created_by_id == owner_id, Recipe.title == spec["title"])
        .first()
    )
    if existing:
        updated = crud.recipe.update(db, db_obj=existing, obj_in=RecipeUpdate(**base))
        print(f"Updated recipe: {updated.title}")
        return updated

    created = crud.recipe.create_with_owner(db, obj_in=RecipeCreate(**base), owner_id=owner_id)
    print(f"Created recipe: {created.title}")
    return created


def per_serving(recipe: Recipe) -> tuple[int, int, int, int]:
    servings = max(1, int(recipe.servings or 1))
    return (
        int(round((recipe.total_calories or 0) / servings)),
        int(round((recipe.protein_grams or 0) / servings)),
        int(round((recipe.carbs_grams or 0) / servings)),
        int(round((recipe.fat_grams or 0) / servings)),
    )


def seed_meal_calendar(db, *, user_id: int, recipes: list[Recipe]) -> None:
    db.query(MealPlan).filter(MealPlan.user_id == user_id).delete(synchronize_session=False)
    db.commit()

    by_title = {r.title: r for r in recipes}
    breakfast_pool = [
        by_title["Classic Waffles"],
        by_title["Classic Waffles"],
        by_title["Classic Waffles"],
    ]
    lunch_pool = [
        by_title["Beef Bowls"],
        by_title["Beef Broccoli Noodles"],
        by_title["Quick Vegetable Soup"],
        by_title["Crispy Prawn Burgers"],
    ]
    dinner_pool = [
        by_title["Lemon Garlic Salmon Tray Bake"],
        by_title["Carbonara"],
        by_title["Beef Bowls"],
        by_title["Beef Broccoli Noodles"],
    ]
    snack_pool = [
        by_title["Garlic Rice"],
        by_title["Quick Vegetable Soup"],
    ]

    start = date.today() - timedelta(days=7)
    days = 21
    meal_rows = 0

    for i in range(days):
        d = start + timedelta(days=i)

        b = breakfast_pool[i % len(breakfast_pool)]
        b_cal, b_p, b_c, b_f = per_serving(b)
        crud.meal_plan.create(
            db=db,
            user_id=user_id,
            obj_in=MealPlanCreate(
                date=d,
                meal_type="Breakfast",
                recipe_id=b.id,
                custom_food_name=b.title,
                calories=b_cal,
                protein_grams=b_p,
                carbs_grams=b_c,
                fat_grams=b_f,
            ),
        )
        meal_rows += 1

        l = lunch_pool[i % len(lunch_pool)]
        l_cal, l_p, l_c, l_f = per_serving(l)
        crud.meal_plan.create(
            db=db,
            user_id=user_id,
            obj_in=MealPlanCreate(
                date=d,
                meal_type="Lunch",
                recipe_id=l.id,
                custom_food_name=l.title,
                calories=l_cal,
                protein_grams=l_p,
                carbs_grams=l_c,
                fat_grams=l_f,
            ),
        )
        meal_rows += 1

        dn = dinner_pool[i % len(dinner_pool)]
        d_cal, d_p, d_c, d_f = per_serving(dn)
        crud.meal_plan.create(
            db=db,
            user_id=user_id,
            obj_in=MealPlanCreate(
                date=d,
                meal_type="Dinner",
                recipe_id=dn.id,
                custom_food_name=dn.title,
                calories=d_cal,
                protein_grams=d_p,
                carbs_grams=d_c,
                fat_grams=d_f,
            ),
        )
        meal_rows += 1

        if i % 2 == 0:
            s = snack_pool[(i // 2) % len(snack_pool)]
            s_cal, s_p, s_c, s_f = per_serving(s)
            crud.meal_plan.create(
                db=db,
                user_id=user_id,
                obj_in=MealPlanCreate(
                    date=d,
                    meal_type="Snack",
                    recipe_id=s.id,
                    custom_food_name=s.title,
                    calories=s_cal,
                    protein_grams=s_p,
                    carbs_grams=s_c,
                    fat_grams=s_f,
                ),
            )
            meal_rows += 1
        else:
            # Intentionally no macros: helps demo the "other/untracked" ring category.
            crud.meal_plan.create(
                db=db,
                user_id=user_id,
                obj_in=MealPlanCreate(
                    date=d,
                    meal_type="Snack",
                    custom_food_name="Cafe iced latte",
                    calories=120,
                ),
            )
            meal_rows += 1

    print(f"Seeded meal calendar rows: {meal_rows} across {days} days")


def main() -> None:
    db = SessionLocal()
    try:
        email = "demo@email.com"
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

        recipe_specs = [
            {
                "title": "Beef Bowls",
                "description": "Savory soy-garlic beef mince served over rice with fresh cucumber and carrot.",
                "image_url": "https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&w=1200&q=80",
                "prep_time_minutes": 12,
                "cook_time_minutes": 13,
                "servings": 4,
                "difficulty": "Easy",
                "protein_grams": 128,
                "carbs_grams": 188,
                "fat_grams": 56,
                "tags": ["asian", "beef", "bowl", "meal-prep"],
                "ingredients": [
                    ingredient("Lean beef mince", 700, "g", 1),
                    ingredient("Jasmine rice (cooked)", 900, "g", 4),
                    ingredient("Garlic", 5, "cloves", 1),
                    ingredient("Ginger", 20, "g", 1),
                    ingredient("Soy sauce", 70, "ml", 2),
                    ingredient("Brown sugar", 20, "g", 2),
                    ingredient("Sesame oil", 12, "g", 2),
                    ingredient("Carrot", 180, "g", 3),
                    ingredient("Cucumber", 220, "g", 3),
                    ingredient("Green onions", 25, "g", 3),
                ],
                "steps": [
                    step(1, "Brown beef mince in a hot pan, breaking it up.", 360),
                    step(2, "Add garlic, ginger, soy sauce, sugar, and sesame oil; simmer until glossy.", 300),
                    step(3, "Shred carrot and slice cucumber.", 180),
                    step(4, "Serve beef over rice and top with vegetables and green onion."),
                ],
            },
            {
                "title": "Beef Broccoli Noodles",
                "description": "Tender beef and broccoli tossed with noodles in a savory oyster-soy sauce.",
                "image_url": None,
                "prep_time_minutes": 15,
                "cook_time_minutes": 12,
                "servings": 4,
                "difficulty": "Medium",
                "protein_grams": 132,
                "carbs_grams": 230,
                "fat_grams": 52,
                "tags": ["asian", "beef", "noodles"],
                "ingredients": [
                    ingredient("Beef strips", 650, "g", 1),
                    ingredient("Egg noodles (dry)", 320, "g", 2),
                    ingredient("Broccoli florets", 450, "g", 2),
                    ingredient("Garlic", 4, "cloves", 1),
                    ingredient("Oyster sauce", 60, "ml", 3),
                    ingredient("Soy sauce", 45, "ml", 3),
                    ingredient("Cornstarch", 12, "g", 1),
                    ingredient("Sesame oil", 10, "g", 3),
                ],
                "steps": [
                    step(1, "Marinate beef with soy and cornstarch.", 300),
                    step(2, "Cook noodles until just tender and drain.", 360),
                    step(3, "Stir-fry beef and garlic over high heat.", 240),
                    step(4, "Add broccoli and sauce; toss with noodles.", 240),
                ],
            },
            {
                "title": "Lemon Garlic Salmon Tray Bake",
                "description": "Oven-baked salmon with potatoes, broccoli, and lemon garlic butter.",
                "image_url": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80",
                "prep_time_minutes": 15,
                "cook_time_minutes": 25,
                "servings": 4,
                "difficulty": "Easy",
                "protein_grams": 136,
                "carbs_grams": 160,
                "fat_grams": 76,
                "tags": ["salmon", "tray-bake", "dinner", "healthy"],
                "ingredients": [
                    ingredient("Salmon fillet", 800, "g", 1),
                    ingredient("Baby potatoes", 900, "g", 2),
                    ingredient("Broccoli", 500, "g", 2),
                    ingredient("Butter", 40, "g", 3),
                    ingredient("Olive oil", 20, "g", 2),
                    ingredient("Garlic", 4, "cloves", 3),
                    ingredient("Lemon", 2, "pcs", 3),
                    ingredient("Parsley", 12, "g", 4),
                ],
                "steps": [
                    step(1, "Roast potatoes with oil, salt, and pepper.", 900),
                    step(2, "Add broccoli and salmon to tray.", 120),
                    step(3, "Mix melted butter, garlic, and lemon; pour over salmon.", 120),
                    step(4, "Bake until salmon is just cooked, then finish with parsley.", 720),
                ],
            },
            {
                "title": "Crispy Prawn Burgers",
                "description": "Crispy crumbed prawn patties in buns with crunchy slaw and sauce.",
                "image_url": None,
                "prep_time_minutes": 20,
                "cook_time_minutes": 12,
                "servings": 4,
                "difficulty": "Medium",
                "protein_grams": 96,
                "carbs_grams": 188,
                "fat_grams": 68,
                "tags": ["seafood", "burger", "crispy"],
                "ingredients": [
                    ingredient("Raw prawns (peeled)", 650, "g", 1),
                    ingredient("Panko breadcrumbs", 130, "g", 2),
                    ingredient("Egg", 1, "pcs", 2),
                    ingredient("Burger buns", 4, "pcs", 4),
                    ingredient("Cabbage slaw", 220, "g", 3),
                    ingredient("Mayonnaise", 60, "g", 3),
                    ingredient("Sweet chili sauce", 35, "g", 3),
                    ingredient("Oil for frying", 18, "g", 2),
                ],
                "steps": [
                    step(1, "Pulse prawns into a coarse mince and season."),
                    step(2, "Form patties, coat with egg and panko.", 240),
                    step(3, "Pan-fry patties until golden and cooked through.", 420),
                    step(4, "Toast buns and assemble with slaw and sauce."),
                ],
            },
            {
                "title": "Quick Vegetable Soup",
                "description": "Light broth soup with mixed vegetables, ginger, and noodles.",
                "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80",
                "prep_time_minutes": 10,
                "cook_time_minutes": 15,
                "servings": 4,
                "difficulty": "Easy",
                "protein_grams": 20,
                "carbs_grams": 126,
                "fat_grams": 16,
                "tags": ["soup", "vegetarian", "quick", "healthy"],
                "ingredients": [
                    ingredient("Vegetable stock", 1400, "ml", 1),
                    ingredient("Mushrooms", 220, "g", 2),
                    ingredient("Bok choy", 240, "g", 2),
                    ingredient("Carrot", 140, "g", 2),
                    ingredient("Noodles (dry)", 180, "g", 3),
                    ingredient("Soy sauce", 25, "ml", 1),
                    ingredient("Ginger", 15, "g", 1),
                    ingredient("Sesame oil", 8, "g", 4),
                ],
                "steps": [
                    step(1, "Bring stock, soy, and ginger to a simmer.", 300),
                    step(2, "Add mushrooms, carrot, and bok choy.", 360),
                    step(3, "Add noodles and cook until tender.", 240),
                    step(4, "Finish with a drizzle of sesame oil."),
                ],
            },
            {
                "title": "Classic Waffles",
                "description": "Golden waffles with crisp edges and fluffy centers.",
                "image_url": "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=1200&q=80",
                "prep_time_minutes": 10,
                "cook_time_minutes": 15,
                "servings": 4,
                "difficulty": "Easy",
                "protein_grams": 30,
                "carbs_grams": 248,
                "fat_grams": 58,
                "tags": ["breakfast", "waffles", "brunch"],
                "ingredients": [
                    ingredient("All-purpose flour", 260, "g", 1),
                    ingredient("Milk", 500, "ml", 1),
                    ingredient("Eggs", 2, "pcs", 1),
                    ingredient("Butter (melted)", 60, "g", 1),
                    ingredient("Sugar", 24, "g", 1),
                    ingredient("Baking powder", 12, "g", 1),
                    ingredient("Vanilla extract", 5, "ml", 1),
                ],
                "steps": [
                    step(1, "Whisk dry ingredients in a bowl."),
                    step(2, "Whisk milk, eggs, butter, and vanilla; combine with dry ingredients."),
                    step(3, "Cook batter in a hot waffle iron until golden.", 600),
                ],
            },
            {
                "title": "Garlic Rice",
                "description": "Fragrant buttery garlic rice, ideal as a side for mains.",
                "image_url": None,
                "prep_time_minutes": 5,
                "cook_time_minutes": 18,
                "servings": 6,
                "difficulty": "Easy",
                "protein_grams": 26,
                "carbs_grams": 250,
                "fat_grams": 34,
                "tags": ["rice", "side", "quick"],
                "ingredients": [
                    ingredient("Jasmine rice (uncooked)", 420, "g", 1),
                    ingredient("Garlic", 6, "cloves", 2),
                    ingredient("Butter", 30, "g", 2),
                    ingredient("Oil", 10, "g", 2),
                    ingredient("Chicken stock", 800, "ml", 3),
                    ingredient("Green onion", 20, "g", 4),
                ],
                "steps": [
                    step(1, "Rinse rice and drain."),
                    step(2, "Saute garlic in butter and oil until fragrant.", 90),
                    step(3, "Add rice and stock, then cook covered until tender.", 1080),
                    step(4, "Fluff and top with green onion."),
                ],
            },
            {
                "title": "Carbonara",
                "description": "Creamy Roman-style pasta with bacon, egg, parmesan, and black pepper.",
                "image_url": "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80",
                "prep_time_minutes": 10,
                "cook_time_minutes": 15,
                "servings": 4,
                "difficulty": "Medium",
                "protein_grams": 88,
                "carbs_grams": 270,
                "fat_grams": 84,
                "tags": ["italian", "pasta", "dinner"],
                "ingredients": [
                    ingredient("Spaghetti (dry)", 400, "g", 1),
                    ingredient("Bacon or pancetta", 220, "g", 2),
                    ingredient("Eggs", 4, "pcs", 3),
                    ingredient("Parmesan", 120, "g", 3),
                    ingredient("Black pepper", 4, "g", 3),
                    ingredient("Garlic", 2, "cloves", 2),
                ],
                "steps": [
                    step(1, "Cook spaghetti until al dente.", 600),
                    step(2, "Cook bacon until crisp; reserve a little fat.", 360),
                    step(3, "Whisk eggs, parmesan, and black pepper."),
                    step(4, "Toss hot pasta with bacon and egg mixture off heat to create sauce."),
                ],
            },
        ]

        seeded_recipes = [seed_or_update_recipe(db, owner_id=user.id, spec=spec) for spec in recipe_specs]
        seed_meal_calendar(db, user_id=user.id, recipes=seeded_recipes)
        print(f"Seed complete. Recipes: {len(seeded_recipes)}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
