# Backend refinement notes

This document records **known design and maintainability improvements** for the FastAPI backend. It does not block feature work; prioritize entries by **Priority** when refactoring.

Each entry: **Area**, **Issue**, **Principle violated**, **Suggested change**, **Priority**.

---

## 1. Grocery endpoint orchestration

| Field | Detail |
|--------|--------|
| **Area** | [backend/app/api/api_v1/endpoints/grocery.py](backend/app/api/api_v1/endpoints/grocery.py) |
| **Issue** | `merge_grocery_from_plan` and `_get_or_create_list` mix HTTP concerns, ORM queries, and merge rules in the route module. |
| **Principle violated** | Single Responsibility; testability (hard to unit test without DB). |
| **Suggested change** | Move merge and list resolution into `app/services/grocery_service.py` (or extend [grocery_from_plan.py](backend/app/services/grocery_from_plan.py)) with functions that accept `Session` and return domain results; routes stay thin. |
| **Priority** | P1 |

---

## 2. Recipe update and ingredient/step replacement

| Field | Detail |
|--------|--------|
| **Area** | [backend/app/crud/crud_recipe.py](backend/app/crud/crud_recipe.py) `update` |
| **Issue** | Full delete-and-replace of ingredients and steps on any partial update can surprise API consumers and complicates transactional boundaries. |
| **Principle violated** | Predictable API semantics; minimize destructive side effects. |
| **Suggested change** | Document contract clearly in OpenAPI; or support granular PATCH for steps/ingredients; or use a dedicated “replace recipe body” endpoint. |
| **Priority** | P2 |

---

## 3. Pydantic v2 config style

| Field | Detail |
|--------|--------|
| **Area** | [backend/app/schemas/](backend/app/schemas/) (multiple `class Config: from_attributes = True`) |
| **Issue** | Pydantic v2 deprecates class-based `Config` in favor of `model_config = ConfigDict(from_attributes=True)`. |
| **Principle violated** | Long-term maintainability / upgrade path. |
| **Suggested change** | Mechanical migration per schema file; run tests after each batch. |
| **Priority** | P2 |

---

## 4. AI parse vs validation boundaries

| Field | Detail |
|--------|--------|
| **Area** | [backend/app/services/ai_service.py](backend/app/services/ai_service.py), [backend/app/services/recipe_parse_validation.py](backend/app/services/recipe_parse_validation.py) |
| **Issue** | Demo parser and validation are separate (good) but naming and docstrings should make the “no real LLM” contract impossible to miss for new contributors. |
| **Principle violated** | Clarity of module boundaries. |
| **Suggested change** | Keep validation in one place; add a short module docstring on `ai_service` listing extension points (env key, timeouts, provider interface). |
| **Priority** | P2 |

---

## 5. Test coverage vs API surface

| Field | Detail |
|--------|--------|
| **Area** | [backend/tests/](backend/tests/) |
| **Issue** | Most routes lack integration tests (auth, recipe filters, planner CRUD, grocery ownership). |
| **Principle violated** | Regression safety; refactor confidence. |
| **Suggested change** | Add `pytest` + `TestClient` with dependency overrides or a transactional test DB; cover authz (403/404) for recipes and grocery items. |
| **Priority** | P1 |

---

## 6. Planner day summary and calorie semantics

| Field | Detail |
|--------|--------|
| **Area** | [backend/app/services/planner_summary.py](backend/app/services/planner_summary.py), [planner.py](backend/app/api/api_v1/endpoints/planner.py) |
| **Issue** | `consumed_calories` only sums explicit `MealPlan.calories`; meals tied to recipes without logged calories contribute zero. |
| **Principle violated** | Domain clarity (users may expect recipe totals). |
| **Suggested change** | Document in API; optional v2 field `estimated_from_recipes` if product wants inferred totals (with clear rules per serving). |
| **Priority** | P2 |

---

## 7. Dependency injection and settings

| Field | Detail |
|--------|--------|
| **Area** | [backend/app/core/config.py](backend/app/core/config.py), service modules |
| **Issue** | Services that will call external APIs (future real LLM) should receive timeouts and keys via injected settings rather than global reads scattered in code. |
| **Principle violated** | Testability; explicit configuration. |
| **Suggested change** | Constructor or factory parameters for third-party clients; FastAPI `Depends` for shared clients where appropriate. |
| **Priority** | P2 |

---

## Changelog

- **2026-03-28:** Initial list. Added `GET /planner/day-summary` and recipe filters (`max_total_minutes`, `tags_all`); pure summary helper is testable, route remains thin.
