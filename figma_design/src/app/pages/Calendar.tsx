import { useMemo } from 'react';
import { usePlannerWebController, MEAL_TYPE_DOT_COLORS, toISODate } from '@/controllers';
import { DayMacroRing } from '../components/DayMacroRing';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { ChevronDown, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

export default function Calendar() {
  const c = usePlannerWebController();
  const todayIso = toISODate(new Date());

  const servingsPreview = useMemo(() => {
    const r = c.pendingRecipe;
    if (!r) return null;
    const raw = parseFloat(String(c.libraryServings).replace(',', '.'));
    const userServings = Number.isFinite(raw) && raw > 0 ? raw : 1;
    const recipeYield = Math.max(1, r.servings ?? 1);
    const factor = userServings / recipeYield;
    const kcal =
      r.total_calories != null && Number.isFinite(r.total_calories)
        ? Math.max(0, Math.round(r.total_calories * factor))
        : null;
    return { recipeYield, userServings, factor, kcal };
  }, [c.pendingRecipe, c.libraryServings]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={c.prevWeek} aria-label="Previous week">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-base font-semibold text-center truncate px-1">{c.weekRangeLabel}</h1>
          <Button type="button" variant="ghost" size="icon" onClick={c.nextWeek} aria-label="Next week">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-4 space-y-6">
        <div className="grid grid-cols-7 gap-1">
          {c.weekStripDays.map((d) => {
            const dots = c.getDotsForDate(d.iso);
            const isSel = d.iso === c.selectedDate;
            const isToday = d.iso === todayIso;
            return (
              <button
                key={d.iso}
                type="button"
                onClick={() => c.setSelectedDate(d.iso)}
                className={`flex flex-col items-center rounded-xl border px-0.5 py-2 transition-colors ${
                  isSel ? 'border-primary bg-primary/10' : 'border-transparent bg-muted/40 hover:bg-muted'
                } ${isToday && !isSel ? 'ring-1 ring-primary/30' : ''}`}
              >
                <span className="text-[10px] font-medium uppercase text-muted-foreground">{d.weekdayShort}</span>
                <span className="text-lg font-semibold tabular-nums leading-tight">{d.dayNum}</span>
                <div className="mt-1 flex min-h-[8px] flex-wrap justify-center gap-0.5">
                  {dots.map((mt) => (
                    <span
                      key={mt}
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: MEAL_TYPE_DOT_COLORS[mt] }}
                      title={mt}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <Collapsible open={c.showFullMonth} onOpenChange={c.setShowFullMonth}>
          <CollapsibleTrigger asChild>
            <Button type="button" variant="outline" className="w-full justify-between">
              <span>Full month view</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${c.showFullMonth ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Button type="button" variant="ghost" size="icon" onClick={c.prevMonth} aria-label="Previous month">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-sm font-semibold">
                {c.viewMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <Button type="button" variant="ghost" size="icon" onClick={c.nextMonth} aria-label="Next month">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex text-xs text-muted-foreground mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={`${d}-${i}`} className="text-center flex-1 min-w-0">
                  {d}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap">
              {c.grid.map((cellData, idx) =>
                cellData ? (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => c.selectMonthGridDay(cellData.day)}
                    className={`flex flex-col items-center justify-center rounded-md border border-transparent text-sm flex-[1_1_calc(100%/7)] max-w-[calc(100%/7)] min-w-0 ${
                      c.isMonthGridDaySelected(cellData.day)
                        ? 'bg-primary/15 border-primary'
                        : 'hover:bg-muted'
                    }`}
                    style={{ height: Math.max(44, c.cell * 0.85) }}
                  >
                    <span>{cellData.day}</span>
                    <div className="mt-0.5 flex min-h-[8px] flex-wrap justify-center gap-0.5 px-0.5">
                      {c
                        .getDotsForDate(toISODate(new Date(c.year, c.month, cellData.day)))
                        .map((mt) => (
                          <span
                            key={mt}
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: MEAL_TYPE_DOT_COLORS[mt] }}
                          />
                        ))}
                    </div>
                  </button>
                ) : (
                  <div
                    key={idx}
                    className="flex-[1_1_calc(100%/7)] max-w-[calc(100%/7)]"
                    style={{ height: Math.max(44, c.cell * 0.85) }}
                  />
                )
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <DayMacroRing
          plans={c.plans}
          consumedCalories={c.daySummary?.consumed_calories}
          dailyCalorieGoal={c.calorieGoal}
        />

        <div>
          <h2 className="text-base font-semibold mb-1">Meals on {c.selectedDate}</h2>
          {c.daySummary ? (
            <p className="text-sm text-muted-foreground mb-4">
              Logged {c.daySummary.consumed_calories} kcal
              {c.calorieGoal != null ? ` · Goal ${c.calorieGoal} kcal/day` : ''}
              {c.daySummary.meals_without_calories > 0
                ? ` · ${c.daySummary.meals_without_calories} meal(s) without calories`
                : ''}
            </p>
          ) : null}

          <div className="space-y-2">
            {c.plans.length === 0 ? (
              <p className="text-sm text-muted-foreground">No meals planned for this day.</p>
            ) : (
              c.plans.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{item.recipe_title || item.custom_food_name || 'Meal'}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.meal_type || ''} · {item.calories ?? 0} kcal
                        {item.protein_grams != null || item.carbs_grams != null || item.fat_grams != null
                          ? ` · P ${item.protein_grams ?? '—'}g · C ${item.carbs_grams ?? '—'}g · F ${item.fat_grams ?? '—'}g`
                          : ''}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => c.deletePlan(item.id)}
                      aria-label="Delete meal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <Button type="button" className="w-full" onClick={() => c.setModalVisible(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Quick add meal
        </Button>
      </div>

      <Dialog open={c.modalVisible} onOpenChange={c.setModalVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick add meal</DialogTitle>
            <DialogDescription>Add a custom meal for the selected day.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Food name</Label>
              <Input value={c.mealName} onChange={(e) => c.setMealName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Calories</Label>
              <Input value={c.calories} onChange={(e) => c.setCalories(e.target.value)} inputMode="numeric" />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="button" onClick={c.addMeal}>
              Add
            </Button>
            <Button type="button" variant="outline" onClick={c.openLibrary}>
              Add from library
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={c.libraryOpen} onOpenChange={c.setLibraryOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto no-scrollbar">
          {c.pendingRecipe ? (
            <>
              <DialogHeader>
                <DialogTitle>Servings</DialogTitle>
                <DialogDescription>
                  How much of <span className="font-medium text-foreground">{c.pendingRecipe.title}</span> are you
                  adding?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground">
                  This recipe is set to yield{' '}
                  <span className="font-medium text-foreground">{servingsPreview?.recipeYield ?? 1}</span> serving
                  {(servingsPreview?.recipeYield ?? 1) === 1 ? '' : 's'}. Your logged calories and macros scale with
                  how many servings you choose.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="library-servings">Servings to log</Label>
                  <Input
                    id="library-servings"
                    inputMode="decimal"
                    value={c.libraryServings}
                    onChange={(e) => c.setLibraryServings(e.target.value)}
                    min={0.25}
                    step={0.25}
                  />
                </div>
                {servingsPreview?.kcal != null ? (
                  <p className="text-sm text-muted-foreground">
                    About <span className="font-medium text-foreground tabular-nums">{servingsPreview.kcal}</span>{' '}
                    kcal for this portion (from recipe total; exact values are saved when you confirm).
                  </p>
                ) : null}
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-col sm:justify-start">
                <Button type="button" onClick={c.confirmAddRecipeFromLibrary}>
                  Add to plan
                </Button>
                <Button type="button" variant="outline" onClick={c.clearRecipePick}>
                  Back to list
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Pick recipe</DialogTitle>
                <DialogDescription>Choose meal type, then a recipe.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label>Meal type</Label>
                <div className="flex flex-wrap gap-2">
                  {c.MEAL_TYPES.map((m) => (
                    <Button
                      key={m}
                      type="button"
                      size="sm"
                      variant={c.pickMealType === m ? 'default' : 'outline'}
                      onClick={() => c.setPickMealType(m)}
                    >
                      {m}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                {c.loadingRecipes ? (
                  <p className="text-sm text-muted-foreground">Loading recipes…</p>
                ) : (
                  c.recipes.map((r) => (
                    <Button
                      key={r.id}
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => c.selectRecipeForPlan(r)}
                    >
                      {r.title}
                    </Button>
                  ))
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
