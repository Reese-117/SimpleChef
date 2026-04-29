# SimpleChef — continuation checklist

Use this as a working backlog: **P0** = fix before wider testing / demo; **P1** = core proposal gaps; **P2** = polish and stretch goals. Check items off as you ship.

---

## P0 — Security, correctness, and broken affordances

### API authorization and data ownership

- [x] **Scope recipe reads to the authenticated user (or explicit “public” flag).** `GET /recipes/` returns owned + `is_public`; `GET /recipes/{id}` uses the same visibility rule (404 if hidden). `PUT`/`DELETE` are owner-only (403).
- [x] **Authorize grocery item updates by list ownership.** `PUT /grocery/items/{id}` joins `GroceryItem` → `GroceryList` and requires `user_id == current_user.id`; otherwise 404.
- [x] **Add the same ownership pattern for any future delete/update endpoints** (meal plans, recipes) so ids are not guessable cross-tenant. (Documented in `docs/ARCHITECTURE.md` section 6.)

### Client bugs and fragile behavior

- [x] **Wire Home header actions.** Search is a `Searchbar` under the header (filters the list). Non-functional app bar icons removed.
- [x] **Fix `RecipeCard` prep time display.** Card shows **Total** prep + cook minutes.
- [x] **Cooking screen: reload when `id` changes.** `loadRecipe` is tied to `id` in `useEffect`.
- [x] **Cooking screen: remove dead state.** Removed unused `checkedIngredients` / `Checkbox`; zero-step guard added.
- [x] **Replace `alert()` with in-app feedback.** Parse/save errors use Paper `Snackbar`.
- [x] **401 interceptor + redirect.** Logout runs only on **401** (backend JWT errors use 401). **403** no longer clears the session. `AuthSessionSync` redirects to `/login` when token is cleared on protected routes. See `frontend/README.md`.

### Parsing and API contract

- [x] **Replace / gate `AIService` mock** — UI labels demo parse; server docstring states no real LLM.
- [x] **URL paste** — not supported; server returns 400 with clear message; UI copy says paste text only.
- [x] **Validate parse output** — `recipe_parse_validation.validate_parsed_recipe` before returning `RecipeCreate`.

---

## P1 — Proposal-aligned features

### Home / recipe library

- [x] **Search:** debounced query + server `q` param; empty state when no matches.
- [ ] **Filter:** max cook/prep time in **UI** (API: `max_total_minutes`, `tags_all`; home still difficulty-only); profile-tied dietary defaults.
- [x] **Grid density:** `numColumns` 2 when width ≥ 720.
- [x] **Badges on cards:** total time, tags (up to 3), calories when present.

### Recipe detail

- [x] **Expandable ingredients** — `List.Accordion`.
- [x] **Key info strip** — prep / cook / total / servings / difficulty / calories note.
- [x] **“Add to calendar” from detail** — modal with date + meal type.
- [x] **Hero image fallback** — placeholder block when no `image_url`.
- [x] **Edit / delete recipe** — `PUT`/`DELETE` + owner UI; manual `editId` flow.

### Step-by-step cooking mode

- [x] **Mise en place** — optional `ingredient.step_id` + `step_order_index` on create; checklist for unlinked (step 0) + linked to current step.
- [x] **Timer dock** — expand/collapse stack; haptic on complete; keep awake via `expo-keep-awake` when `is_screen_always_on`.
- [x] **“View all ingredients”** — modal from app bar.
- [x] **Recipe name in header** — subtitle on `Appbar.Content`.
- [x] **Zero steps** — dedicated message + back.

### Add recipe

- [ ] **Image capture / upload** — still deferred.
- [ ] **Video import (stretch)** — deferred.
- [X] **Manual form** — validation polish (title required), difficulty picker, `image_url` field optional.
- [x] **Edit existing recipe** from detail.

### Meal planner / calendar

- [x] **Month grid** + prev/next month.
- [x] **Tap day** selects date (replaces static header-only UX).
- [x] **Add meal from library** + meal type chips.
- [x] **Recipe title** on plan cards via API `recipe_title`.
- [x] **Daily calorie total** vs goal — `GET /planner/day-summary` + calendar line (logged kcal vs profile goal); not color-coded by meal type.
- [x] **Delete meal** — `DELETE` + trash on card; `PATCH` available for edits (no dedicated edit UI).
- [ ] **Statistics / charts** — deferred.

### Grocery list

- [x] **Generate from plan** — `POST /grocery/from-plan` merges last 7 days from UI; dedupe name+unit, sum qty; keyword categories.
- [x] **Category inference** — keyword defaults on merge rows.
- [ ] **Full item editor** — still PUT-only from check; no inline edit form.
- [x] **Delete item** + **Share** export text.
- [ ] **Reorder / drag** — deferred.
- [x] **Export** — `Share` + `/grocery/export.txt`.
- [x] **Merge** preserves manual rows (only merges aggregated plan ingredients into existing keys).

### Profile and settings

- [x] **`PATCH /users/me`** — `UserSelfUpdate` + profile form.
- [x] **Profile UI** — comma dietary list, calorie goal, keep-awake toggle, save.
- [X] **Profile image upload** — URL field in API only; no upload pipeline.
- [ ] **Friends** — **explicitly out of scope** for this build (`user_friends` unused).

### Design system (proposal)

- [x] **Palette** — Paper theme Sea Green / accent in `frontend/theme/paperTheme.ts`.
- [ ] **Cooking typography scale** — partial (same Paper scale); larger body TBD.

---

## P2 — Quality, accessibility, and operations

### Accessibility and cooking context

- [x] **Labels** — tab bar `tabBarAccessibilityLabel`; some icon buttons labeled (cooking list, timer expand).
- [ ] **Full pass** — FABs, all icon-only controls, 44pt targets.
- [ ] **High-contrast cooking mode** — deferred.
- [x] **Recipe detail** — removed emoji stats (text + structure).

### Offline, performance, resilience

- [ ] **Loading/error/retry** — partial (pull-to-refresh on recipe list); not every screen.
- [ ] **Grocery check** — optimistic with rollback on failure.
- [ ] **Image caching** — deferred (`expo-image` not wired on cards).

### Testing and dev experience

- [x] **API tests** — `pytest` for parse validation (see `backend/tests/`); expand for authz integration when CI DB available.
- [x] **Seed script** — `python -m scripts.seed_demo` from `backend/`.
- [x] **Env docs** — root `README`, `frontend/README`, `docs/API.md`.
- [ ] **`explore.tsx`** — file remains unused (not in tab layout); delete or repurpose later.

### Housekeeping

- [x] **Shared types** — `frontend/types/recipe.ts` (wire into screens incrementally).
- [ ] **Centralized API error mapping** — deferred.
- [x] **Migrations** — `is_public`, `tags` JSONB, `ingredient.step_id`.

---

## Quick reference — what exists today

| Area | Implemented (summary) |
|------|------------------------|
| Auth | Signup, login, JWT; 401 clears session; 403 does not |
| Recipes | Scoped list/detail; `q`/difficulty/tag; create/update/delete; tags; demo parse + validation |
| Cooking | Mise checklist, timers + haptics, keep awake, all-ingredients modal, zero-step guard |
| Add | Manual + edit; paste demo parse; ingredient step link |
| Planner | Month grid, library add, `recipe_title`, delete; PATCH API |
| Grocery | Merge from plan, share text, delete item, optimistic toggle |
| Profile | PATCH profile, theme colors |
| Docs | `docs/ARCHITECTURE.md`, `docs/API.md`, tests, seed |

