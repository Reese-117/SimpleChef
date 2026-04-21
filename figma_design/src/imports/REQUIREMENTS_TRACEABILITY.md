# Requirements traceability matrix

Maps **docs/REQUIREMENTS.md** functional requirements, **proposal** goals/UI (LaTeX `sec-goals.tex`, `sec-proposedUI.tex`), and selected **Prompt.md** / **CONTINUATION_CHECKLIST.md** themes to backend surfaces and implementation status.

| ID | Requirement (summary) | Source | Backend today | Status | Notes / action |
|----|------------------------|--------|---------------|--------|----------------|
| AUTH-1 | Sign up / login | SRS §2.1 | `POST /auth/register`, `POST /auth/login`, JWT | Met | — |
| PROF-1 | Dietary restrictions, calorie goal | SRS §2.1, Proposal goals | `PATCH /users/me`, `GET /users/me` | Met | Comma-separated / array on profile |
| PROF-2 | Friends list | SRS §2.1, Proposal UI | — | Out of scope | Checklist: friends deferred |
| PROF-3 | Screen always on | SRS §2.3, Prompt | `is_screen_always_on` on user | Met | Cooking respects pref |
| REC-1 | Recipe list search/filter | SRS §2.2, Proposal Home | `GET /recipes/` with `q`, `difficulty`, `tag`, `max_total_minutes`, `tags_all` | Partial | Home UI: search + difficulty; time/tags_all not exposed in UI yet |
| REC-2 | Recipe detail, cooking entry | SRS §2.2 | `GET /recipes/{id}` | Met | 404 if not visible |
| REC-3 | Parse text / manual / edit | SRS §2.2, Proposal | `POST /recipes/parse`, `POST`/`PUT /recipes/` | Partial | Demo parse; no real LLM; image/video deferred |
| COOK-1 | Step mode, mise, timers | SRS §2.3, Proposal | Mostly client; recipe shape with `step_id` | Met | Timer dock local |
| PLAN-1 | Month grid, add/delete plans | SRS §2.4 | `GET/POST/PATCH/DELETE /planner/` | Met | — |
| PLAN-2 | Daily calories vs goal | SRS §2.4, Proposal | `GET /planner/day-summary` + profile `calorie_goal` | Partial | Calendar shows summary line; no charts |
| PLAN-3 | Statistics / trends | Proposal, Checklist | — | Deferred | No API |
| GROC-1 | Merge from plan, categories | SRS §2.5 | `POST /grocery/from-plan`, list `GET` | Met | Keyword categories |
| GROC-2 | Inline edit / reorder | SRS §2.5, Proposal | `PUT /grocery/items/{id}` | Partial | Toggle + delete; no drag sort_order |
| GROC-3 | Export / share | SRS §2.5 | `GET /grocery/export.txt` + client Share | Met | — |
| NFR-1 | Cross-platform | SRS §3 | Expo | Met | — |
| NFR-2 | Secure credentials | SRS §3 | JWT, HTTPS dev | Met | — |

### Proposal goals (`sec-goals.tex`) — rollup

| Goal theme | Backend / client | Status |
|------------|------------------|--------|
| Unified workflow (browse → cook → plan → grocery) | Multiple endpoints + app | Met (integrated MVP) |
| Step-by-step UX + mise | Recipe relations + app | Met |
| Timer dock | Client (`useTimerStore`) | Met |
| Grocery automation | `from-plan` merge | Met |
| Multi input + AI parse | `parse` + validation | Partial (text demo) |
| Planning + calories + dietary filter | Planner + summary + recipe tags | Partial (filter UI incomplete) |
| HCI principles | Design system + docs | Ongoing |

### `sec-proposedUI.tex` features — rollup

| Feature | UI status | Backend |
|---------|-----------|---------|
| Bottom nav (5 tabs) | Implemented | N/A |
| Cooking replaces nav (Prompt) | Partial | N/A — still tab shell; Figma may show dedicated bar |
| Home grid + search | Implemented | `GET /recipes/` |
| Filters (diet, time, difficulty) | Partial | Params exist; UI partial |
| Recipe detail / cook | Implemented | As above |
| Calendar dots + bottom panel | Partial | Plans API; dots not in current UI |
| Grocery editable/draggable | Partial | No persisted reorder |
| Add image/video | Deferred | N/A |
| Profile friends | Out of scope | N/A |

---

For UI-centric annotations and Figma framing, see [FIGMA_UI_SYSTEM_REQUIREMENTS.md](./FIGMA_UI_SYSTEM_REQUIREMENTS.md). For backend maintainability debt, see [BACKEND_REFINEMENT_NOTES.md](./BACKEND_REFINEMENT_NOTES.md).
