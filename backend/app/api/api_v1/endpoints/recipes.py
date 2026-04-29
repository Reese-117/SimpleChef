from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.services.ai_service import ai_service
from app.services.recipe_parse_validation import (
    reject_if_url_only,
    validate_parsed_recipe,
)

router = APIRouter()


@router.get("/", response_model=List[schemas.Recipe])
def read_recipes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    q: Optional[str] = None,
    difficulty: Optional[str] = None,
    tag: Optional[str] = None,
    max_total_minutes: Optional[int] = None,
    tags_all: Optional[str] = Query(
        None,
        description="Comma-separated tags; recipe must contain every tag (e.g. dietary filters).",
    ),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Recipes owned by the current user or marked public.
    Optional filters: title search (`q`), exact `difficulty`, JSONB `tags` contains `tag`,
    `max_total_minutes` (prep + cook), `tags_all` (AND match on tag strings).
    """
    tags_list: Optional[List[str]] = None
    if tags_all and tags_all.strip():
        # Normalize CSV input once so CRUD layer receives clean tag tokens.
        tags_list = [s.strip() for s in tags_all.split(",") if s.strip()]
    return crud.recipe.get_multi_for_user(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        q=q,
        difficulty=difficulty,
        tag=tag,
        max_total_minutes=max_total_minutes,
        tags_all=tags_list,
    )


@router.post("/", response_model=schemas.Recipe)
def create_recipe(
    *,
    db: Session = Depends(deps.get_db),
    recipe_in: schemas.RecipeCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new recipe (owned by current user).
    """
    return crud.recipe.create_with_owner(
        db=db, obj_in=recipe_in, owner_id=current_user.id
    )


@router.post("/parse", response_model=schemas.RecipeCreate)
def parse_recipe(
    *,
    text: str,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Demo parse only: returns a template recipe derived from input (no real LLM).
    Paste plain text only — URLs are not fetched.
    """
    reject_if_url_only(text)
    draft = ai_service.parse_text(text)
    validate_parsed_recipe(draft)
    return draft


@router.get("/{id}", response_model=schemas.Recipe)
def read_recipe(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get recipe by ID if visible to the current user (owner or public).
    """
    recipe = crud.recipe.get_visible_for_user(
        db, recipe_id=id, user_id=current_user.id
    )
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.put("/{id}", response_model=schemas.Recipe)
def update_recipe(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    recipe_in: schemas.RecipeUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a recipe (owner only).
    """
    recipe = crud.recipe.get(db=db, id=id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    # Owner-only mutation; visibility rules for reads are handled separately.
    if recipe.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.recipe.update(db=db, db_obj=recipe, obj_in=recipe_in)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> None:
    """
    Delete a recipe (owner only).
    """
    recipe = crud.recipe.get(db=db, id=id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if recipe.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    if not crud.recipe.remove(db=db, id=id):
        raise HTTPException(status_code=404, detail="Recipe not found")
    return None
