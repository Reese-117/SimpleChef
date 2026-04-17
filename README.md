# SimpleChef

A smart cooking assistant app.

## Project Structure
- `backend/`: FastAPI Python Backend
- `frontend/`: React Native (Expo) Frontend

## Getting Started

### Prerequisites
- **Docker Desktop**: Required for the PostgreSQL database. Install from [docker.com](https://www.docker.com/products/docker-desktop/).
- **Node.js**: Required for the frontend.
- **Python 3.8+**: Required for the backend.

### Backend
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Create virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Mac/Linux
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start Database (Ensure Docker Desktop is running):
   ```bash
   docker compose up -d
   ```
5. Set up postgres:
   ```bash
   sudo su - postgres
   createuser -s postgres
   ```
6. Start local DB:
   ```bash
   createdb -U postgres simplechef
   ```

7. Run Migrations:
   ```bash
   alembic upgrade head
   ```
8. Start Server:
   ```bash
   python run.py
   ```
   API will be available at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

### Frontend
1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Expo:
   ```bash
   npx expo start
   ```
   Scan the QR code with Expo Go app or press `a` for Android emulator / `w` for Web.

## Environment variables

- **Backend:** `DATABASE_URL` or `POSTGRES_*` (see `backend/app/core/config.py`), `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`.
- **Frontend:** `EXPO_PUBLIC_API_URL` — full API base including `/api/v1` (e.g. `http://192.168.1.5:8000/api/v1` for a device on LAN).

## Tests and seed data

- **Pytest** (from `backend/`): `pip install -r requirements.txt` then `pytest tests/`.
- **Demo seed** (from `backend/` after migrations): `python -m scripts.seed_demo` — creates `demo@simplechef.local` / `demo12345` and a sample recipe.

## Known limitations

- Recipe parse is a **demo** (no production LLM). URL paste is rejected; use plain text.
- **Friends/social** is out of scope; see `CONTINUATION_CHECKLIST.md`.
- `frontend/app/(tabs)/explore.tsx` is leftover starter code and is not in the tab bar.

## Features implemented (high level)

- **Auth:** Login/signup, JWT, safe 401 handling on the client.
- **Recipes:** Owner/public visibility, search/filter/tags, grid on wide screens, detail, edit/delete for owner, add-to-planner from detail.
- **Cooking:** Step flow, mise en place (optional per-step ingredient links), timers with expand dock + haptics, keep screen on from profile, all-ingredients sheet.
- **Planner:** Month grid, add from library, recipe titles on meals, delete (PATCH also on API).
- **Grocery:** Merge from meal plan (rolling window from UI), share as text, delete items, optimistic check toggle with rollback.
- **Profile:** `PATCH /users/me`, calorie goal, dietary text list, keep-awake preference; Paper theme (Sea Green / accent).

See `docs/API.md` and `docs/ARCHITECTURE.md` for integration details.
