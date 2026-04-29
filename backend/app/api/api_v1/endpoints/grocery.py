from typing import Any
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.api import deps
from app.models.grocery import GroceryList, GroceryItem
from app.services.grocery_from_plan import aggregate_for_range

router = APIRouter()


def _normalized_item_key(name: str, unit: str | None) -> tuple[str, str]:
    # Shared normalization keeps dedupe behavior consistent across merge paths.
    return (name.strip().lower(), (unit or "").strip().lower())


def _get_or_create_list(db: Session, user_id: int) -> GroceryList:
    g_list = (
        db.query(GroceryList)
        .options(joinedload(GroceryList.items))
        .filter(GroceryList.user_id == user_id)
        .first()
    )
    if not g_list:
        g_list = GroceryList(user_id=user_id)
        db.add(g_list)
        db.commit()
        db.refresh(g_list)
        g_list = (
            db.query(GroceryList)
            .options(joinedload(GroceryList.items))
            .filter(GroceryList.id == g_list.id)
            .first()
        )
    return g_list


@router.get("/", response_model=schemas.GroceryList)
def read_grocery_list(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user's grocery list.
    """
    return _get_or_create_list(db, current_user.id)

@router.post("/items", response_model=schemas.GroceryItem)
def add_item(
    *,
    db: Session = Depends(deps.get_db),
    item_in: schemas.GroceryItemCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Add item to grocery list.
    """
    g_list = _get_or_create_list(db, current_user.id)

    item = GroceryItem(**item_in.model_dump(), grocery_list_id=g_list.id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/items/{id}", response_model=schemas.GroceryItem)
def update_item(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    item_in: schemas.GroceryItemUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update grocery item (must belong to the current user's list).
    """
    item = (
        db.query(GroceryItem)
        .join(GroceryList, GroceryItem.grocery_list_id == GroceryList.id)
        .filter(GroceryItem.id == id, GroceryList.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/items/{id}", status_code=204)
def delete_item(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> None:
    item = (
        db.query(GroceryItem)
        .join(GroceryList, GroceryItem.grocery_list_id == GroceryList.id)
        .filter(GroceryItem.id == id, GroceryList.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()


@router.post("/from-plan", response_model=schemas.GroceryList)
def merge_grocery_from_plan(
    start_date: date,
    end_date: date,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Merge ingredients from planned meals in [start_date, end_date] into the user's list.
    Same normalized name + unit adds quantities; new keys create rows.
    """
    g_list = _get_or_create_list(db, current_user.id)
    rows = aggregate_for_range(
        db,
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
    )
    index = {_normalized_item_key(item.name, item.unit): item for item in g_list.items}
    for row in rows:
        key = _normalized_item_key(row["name"], row.get("unit"))
        qty = row.get("quantity") or 0.0
        if key in index:
            existing_item = index[key]
            # Existing rows are incremented instead of duplicated.
            existing_item.quantity = (existing_item.quantity or 0) + float(qty)
            if row.get("category") and existing_item.category == "Uncategorized":
                existing_item.category = row["category"]
        else:
            it = GroceryItem(
                grocery_list_id=g_list.id,
                name=row["name"],
                quantity=row.get("quantity"),
                unit=row.get("unit"),
                category=row.get("category") or "Uncategorized",
                is_checked=False,
            )
            db.add(it)
            index[key] = it
    db.commit()
    merged = (
        db.query(GroceryList)
        .options(joinedload(GroceryList.items))
        .filter(GroceryList.id == g_list.id)
        .first()
    )
    return merged


@router.get("/export.txt", response_class=PlainTextResponse)
def export_grocery_text(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> PlainTextResponse:
    """Plain-text grocery list for sharing (category headers + lines)."""
    g_list = db.query(GroceryList).filter(GroceryList.user_id == current_user.id).first()
    if not g_list:
        return PlainTextResponse("")
    items = (
        db.query(GroceryItem)
        .filter(GroceryItem.grocery_list_id == g_list.id)
        .order_by(GroceryItem.category, GroceryItem.name)
        .all()
    )
    lines: list[str] = ["SimpleChef grocery list", ""]
    cat = None
    for it in items:
        if it.category != cat:
            cat = it.category
            lines.append(f"{cat}:")
        q = it.quantity if it.quantity is not None else ""
        u = it.unit or ""
        lines.append(f"- {it.name} {q} {u}".strip())
    return PlainTextResponse("\n".join(lines))
