# SimpleChef - System Requirements Specification

## 1. Introduction
SimpleChef is a mobile-first cooking assistant designed to reduce friction in the cooking process, from recipe discovery to meal planning and grocery shopping.

## 2. Functional Requirements

### 2.1. User Authentication & Profile
- Users must be able to create an account and log in.
- **Profile Management:**
  - Users can set dietary restrictions (Vegetarian, Gluten-Free, etc.).
  - Users can set daily calorie goals.
  - Users can manage a friends list.
  - Users can toggle "Screen Always On" setting.

### 2.2. Recipe Management
- **View Recipes:**
  - Responsive grid layout (Hero image, Title, Time, Badges).
  - Search and Filter (Dietary, Time, Difficulty, Source).
- **Recipe Detail:**
  - View ingredients (scalable), instructions, prep/cook time, difficulty.
  - "Begin Cooking" mode.
- **Add/Edit Recipe:**
  - **Input Methods:** Paste Text/URL, Upload Image, Upload Video, Manual Entry.
  - **AI Parsing:** Automatically parse input into structured data (Name, Ingredients, Steps).
  - **Verification:** User must verify and edit parsed data before saving.
  - **Manual Edit:** Full control over all fields.

### 2.3. Cooking Mode (Core Feature)
- Step-by-step navigation
- **Mise en Place:** Checklist of ingredients specific to the current step.
- **Timers:**
  - Integrated timers within steps.
  - Multiple active timers (stacked UI).
  - Background operation support.
- **Display:** Screen stays awake during cooking.

### 2.4. Meal Planning (Calendar)
- **Monthly View:** Visual indicators for planned meals.
- **Daily View:**
  - Breakdown by meal type (Breakfast, Lunch, Dinner).
  - Calorie tracking (Consumed vs Goal).
  - Quick Add (Food database or Recipe Library).

### 2.5. Grocery List
- **Auto-Generation:** Aggregates ingredients from the Meal Plan.
- **Smart Categorization:** Items sorted by category (Produce, Dairy, etc.).
- **Editing:** Users can edit names, quantities, and categories.
- **Export:** Share list via text/email or other apps.

## 3. Non-Functional Requirements
- **Platform:** Cross-platform Mobile App (iOS/Android) and Web.
- **Performance:** Low latency interaction, especially in Cooking Mode.
- **Reliability:** Data sync between Plan and Grocery List must be accurate.
- **Security:** Secure storage of user data and credentials.
- **Usability:** High legibility, accessible UI (contrast, font size).
- **Maintainability:** Clear separation of concerns (Frontend/Backend).

## 4. Potential Issues & Risks
- **AI Parsing Accuracy:** Parsing recipes from video/images may be inconsistent. Requires robust fallback/editing UI.
- **Video Storage:** Storing user-uploaded videos can be costly and bandwidth-heavy.
- **Timer Management:** Handling background timers reliably across different OS restrictions (iOS vs Android).
- **Data Sync:** Ensuring offline edits sync correctly when online.
