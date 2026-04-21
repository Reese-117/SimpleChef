# Figma UI system requirements (SimpleChef)

Single reference for **Figma prototypes** and **course submission**: merges [Prompt.md](../Prompt.md) (sections 2–4, 6), [docs/REQUIREMENTS.md](./REQUIREMENTS.md), [CONTINUATION_CHECKLIST.md](../CONTINUATION_CHECKLIST.md), and the project proposal LaTeX sources ([sec-goals.tex](./Assignments/Project%20Proposal/Latex/sec-goals.tex), [sec-proposedUI.tex](./Assignments/Project%20Proposal/Latex/sec-proposedUI.tex), [sec-issues.tex](./Assignments/Project%20Proposal/Latex/sec-issues.tex)). API truth: [API.md](./API.md).

---

## 1. Purpose and how to use this in Figma

**Priority prototypes (Prompt §2):**

1. **Cooking flow:** Home → Recipe detail → Step-by-step cooking (timer dock, mise, next/prev).
2. **Planning → grocery:** Calendar → add meals → grocery merge/export.

**Component library (Prompt §6):** Atoms (buttons, inputs, chips), molecules (recipe card, meal row, timer chip), organisms (bottom nav, cooking header + footer, modals). Tokens: [frontend/DESIGN_SYSTEM.md](../frontend/DESIGN_SYSTEM.md) and Sea Green `#2E8B57`, accent `#F4A261`, neutral text `#3D405B` (Prompt §5).

**Traceability:** Use **Requirement ID** below in Figma component descriptions. **Proposal** column cites LaTeX sections where relevant.

---

## 2. Global UX and navigation

| Requirement ID | Description | Source | Backend today | UI status |
|----------------|-------------|--------|---------------|-----------|
| NAV-01 | Bottom nav: Home, Calendar, Add, Grocery, Profile (5 items) | Prompt §3, Proposal sec-proposedUI | N/A | Implemented |
| NAV-02 | Back button top-left on sub-screens; title centered | Prompt §3 | N/A | Implemented (Expo stack) |
| NAV-03 | In cooking mode, replace bottom nav with timer / prev / next / all ingredients | Prompt §3, Proposal sec-proposedUI | N/A | **Partial** — cooking is a stack screen; tabs may still show depending on layout; Figma should show **target** dedicated bar |
| THEME-01 | Sea Green primary, Sandy Yellow accent, legible sans | Prompt §5, Proposal | N/A | Implemented (`paperTheme`) |

**Delta (document for Figma):** Prompt and proposal specify a **context-aware** cooking chrome. Current app uses **standard app bar + footer buttons** inside the tab stack; align high-fi mocks to Prompt, implementation can catch up later.

---

## 3. Screen-by-screen requirements

### A. Home (recipe library)

| Req ID | Description | Source | Backend today | UI status |
|--------|-------------|--------|---------------|-----------|
| HOME-01 | Responsive grid (2 cols wide) | Prompt A, Proposal | `GET /recipes/` | Implemented |
| HOME-02 | Card: image, title, time, tags, calories | Prompt A, SRS §2.2 | Same | Implemented |
| HOME-03 | Search (debounced) | Prompt A, Checklist | `q` | Implemented |
| HOME-04 | Filters: dietary, cook time, difficulty, “mine” | Prompt A, Proposal, SRS | `difficulty`, `tag`, `max_total_minutes`, `tags_all` | **Partial** — difficulty chips only in UI |
| HOME-05 | Empty: no recipes / no matches | Prompt A | — | Implemented |

### B. Recipe detail

| Req ID | Description | Source | Backend today | UI status |
|--------|-------------|--------|---------------|-----------|
| DET-01 | Hero image or placeholder | Prompt B, Checklist | `image_url` | Implemented |
| DET-02 | Strip: prep, cook, total, servings, difficulty, calories | Prompt B, SRS | `GET /recipes/{id}` | Implemented |
| DET-03 | Expandable ingredients | Prompt B | Same | Implemented |
| DET-04 | Begin cooking | Prompt B | N/A | Implemented |
| DET-05 | Add to calendar (date, meal type) | Checklist | `POST /planner/` | Implemented |
| DET-06 | Edit/delete for owner | Checklist | `PUT`/`DELETE` | Implemented |
| DET-07 | Favorite (optional) | Prompt B | — | Deferred |

### C. Cooking mode

| Req ID | Description | Source | Backend today | UI status |
|--------|-------------|--------|---------------|-----------|
| COOK-01 | Step N of M, recipe name | Prompt C, Proposal | N/A | Implemented |
| COOK-02 | Timer dock, stacked, expand | Prompt C, SRS §2.3 | Client timers | Implemented |
| COOK-03 | Mise en place per step | Prompt C, Proposal goals | `ingredient.step_id` | Implemented |
| COOK-04 | Start timer from step | Prompt C | Client | Implemented |
| COOK-05 | View all ingredients modal | Checklist | N/A | Implemented |
| COOK-06 | Keep awake when profile says so | SRS §2.3 | `GET /users/me` | Implemented |
| COOK-07 | Zero steps state | Checklist | N/A | Implemented |

### D. Calendar / planner

| Req ID | Description | Source | Backend today | UI status |
|--------|-------------|--------|---------------|-----------|
| CAL-01 | Month grid, prev/next | Prompt D, SRS | N/A | Implemented |
| CAL-02 | Tap day → list meals for day | Prompt D | `GET /planner/` | Implemented |
| CAL-03 | Quick add custom food + calories | Prompt D | `POST /planner/` | Implemented |
| CAL-04 | Add from library + meal type | Prompt D | Same | Implemented |
| CAL-05 | Daily calories vs goal | Prompt D, Proposal goals, SRS §2.4 | `GET /planner/day-summary`, `calorie_goal` | **Partial** — summary text under date; no donut chart |
| CAL-06 | Dots / color by meal type on month | Prompt D | N/A | Deferred |
| CAL-07 | Statistics modal | Prompt D | — | Deferred |

### E. Grocery

| Req ID | Description | Source | Backend today | UI status |
|--------|-------------|--------|---------------|-----------|
| GROC-01 | Sections by category | Prompt E, SRS | `GET /grocery/` | Implemented |
| GROC-02 | Merge from meal plan (date range) | Prompt E | `POST /grocery/from-plan` | Implemented (last 7 days in UI) |
| GROC-03 | Toggle checked, delete | SRS | `PUT`, delete endpoint | Implemented |
| GROC-04 | Add manual item | Prompt E | `POST` | Implemented |
| GROC-05 | Export / share text | Prompt E | `GET /grocery/export.txt` | Implemented |
| GROC-06 | Inline edit name/qty/category, drag reorder | Prompt E, SRS | `PUT` partial | **Partial** — no full inline editor / no drag |

### F. Add / edit recipe

| Req ID | Description | Source | Backend today | UI status |
|--------|-------------|--------|---------------|-----------|
| ADD-01 | Manual entry full form | Prompt F, SRS | `POST`/`PUT` | Implemented |
| ADD-02 | Paste text → demo parse → manual | Prompt F | `POST /recipes/parse` | Partial (demo, no LLM) |
| ADD-03 | Image / video import | Prompt F, SRS | — | Deferred |
| ADD-04 | Verification / tabbed edit UX | Prompt F | — | Partial (single scroll form) |

### G. Profile

| Req ID | Description | Source | Backend today | UI status |
|--------|-------------|--------|---------------|-----------|
| PROF-01 | Name, bio, calorie goal, dietary string | Prompt G, SRS | `PATCH /users/me` | Implemented |
| PROF-02 | Keep screen on toggle | Prompt G | Same | Implemented |
| PROF-03 | Friends list | Prompt G, Proposal | — | **Out of scope** |
| PROF-04 | Avatar upload | Checklist | URL field only | Deferred |

---

## 4. Consolidated checklist (100% named coverage)

Every bullet below appears **once** with explicit **Source** tags. Items not built are **Deferred** or **Out of scope** so Figma can still show future frames.

| Consolidated ID | Description | Source tags | Backend today | UI status |
|-----------------|-------------|-------------|---------------|-----------|
| C-01 | Unify browse → cook → plan → grocery | Proposal sec-goals | Multiple | Implemented |
| C-02 | Calm step-by-step cooking + mise | Proposal sec-goals, sec-issues | Recipe model | Implemented |
| C-03 | Timer dock behavior | Proposal sec-goals, Prompt C | Client | Implemented |
| C-04 | Grocery auto-fill + dedupe + export | Proposal sec-goals, Prompt E | `from-plan`, export | Partial (no drag/reorder UI) |
| C-05 | Multi input + AI parse + verify | Proposal sec-goals, Prompt F | parse endpoint | Partial |
| C-06 | Calendar + calories + dietary filter | Proposal sec-goals | planner + recipes | Partial |
| C-07 | HCI: clarity, progressive disclosure, warmth | Proposal sec-goals, Prompt §1 | N/A | Ongoing |
| C-08 | Problem: fragmented apps | sec-issues | — | Design rationale |
| C-09 | Problem: wall-of-text instructions | sec-issues | — | Addressed by step mode |
| C-10 | Problem: timers off-app | sec-issues | — | Addressed by dock |
| C-11 | Problem: manual grocery drudgery | sec-issues | — | Partial automation |
| C-12 | Problem: recipe input friction | sec-issues | — | Partial (text) |
| C-13 | Problem: calorie tracking disconnected | sec-issues | — | Partial |
| C-14 | Explore / friends recipes grid | Prompt §2 follow-up | — | Out of scope / deferred |
| C-15 | URL paste support | Prompt / checklist | 400 if URL-only | N/A — UI warns text-only |
| C-16 | Video stays with recipe while cooking | Prompt §2 | — | Deferred |
| C-17 | Hands-free / scroll modes | Prompt §2 | — | Deferred |
| C-18 | Tutorial | Prompt §2 | — | Deferred |

---

## 5. Data the UI should annotate (DTO summary)

Align Figma notes with FastAPI shapes (see [API.md](./API.md)):

- **User:** `email`, `full_name`, `bio`, `calorie_goal`, `dietary_restrictions[]`, `is_screen_always_on`, optional `profile_image_url`.
- **Recipe (detail):** `title`, `description`, `image_url`, `prep_time_minutes`, `cook_time_minutes`, `servings`, `difficulty`, `total_calories`, `tags[]`, `ingredients[]` (`name`, `quantity`, `unit`, `step_id`), `steps[]` (`order_index`, `instruction`, `timer_seconds`).
- **MealPlan:** `date`, `meal_type`, `recipe_id?`, `custom_food_name?`, `calories?`, `recipe_title?` (read).
- **PlannerDaySummary:** `date`, `consumed_calories`, `meal_count`, `meals_with_calories_logged`, `meals_without_calories`.
- **GroceryItem:** `name`, `quantity`, `unit`, `category`, `is_checked`, optional recipe linkage in future UI.

---

## 6. Empty, error, and permission states

| State | Where | Copy / behavior | Source |
|-------|--------|-----------------|--------|
| Empty library | Home | “No recipes… Add one!” / filter empty | Prompt A |
| Not found | Recipe detail | “Recipe not found” | SRS |
| 403 owner actions | Detail edit/delete | Handled server-side; show generic error if needed | ARCHITECTURE §6 |
| Empty day | Calendar | “No meals planned…” | — |
| Parse failure | Add flow | Snackbar | Checklist |
| 401 session | Global | Redirect login | frontend README |

---

## 7. Explicit deferrals (honest scope)

- Real LLM / image / video parsing and storage.
- Friends, social feed, “explore” recipes.
- Planner statistics charts.
- Full grocery inline editor and persisted drag reorder.
- Month grid meal dots / strong color coding by meal type.
- Cooking-mode bottom bar matching Prompt (until nav refactor).
- Profile photo upload pipeline.

---

## 8. Frontend architecture note for designers

Screens in `frontend/app/` should stay **thin**: business rules live in `frontend/controllers/` hooks; HTTP in `frontend/services/api.ts`; shared types in `frontend/types/`. See [ARCHITECTURE.md](./ARCHITECTURE.md) §9.

---

## 9. Related documents

- [REQUIREMENTS_TRACEABILITY.md](./REQUIREMENTS_TRACEABILITY.md) — matrix vs SRS/proposal.
- [BACKEND_REFINEMENT_NOTES.md](./BACKEND_REFINEMENT_NOTES.md) — design debt, no feature spec.
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system and API auth patterns.
