import { usePlannerWebController } from '@/controllers';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
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
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

export default function Calendar() {
  const c = usePlannerWebController();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon" onClick={c.prevMonth} aria-label="Previous month">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {c.viewMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h1>
          <Button type="button" variant="ghost" size="icon" onClick={c.nextMonth} aria-label="Next month">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="flex text-xs text-muted-foreground mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={`${d}-${i}`} className="text-center" style={{ width: c.cell }}>
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
                onClick={() => c.selectDay(cellData.day)}
                className={`flex items-center justify-center rounded-md border border-transparent text-sm ${
                  c.isSelected(cellData.day) ? 'bg-primary/15 border-primary' : 'hover:bg-muted'
                }`}
                style={{ width: c.cell, height: c.cell * 0.85 }}
              >
                {cellData.day}
              </button>
            ) : (
              <div key={idx} style={{ width: c.cell, height: c.cell * 0.85 }} />
            )
          )}
        </div>

        <h2 className="text-base font-semibold mt-6 mb-1">Meals on {c.selectedDate}</h2>
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

        <Button type="button" className="mt-6 w-full" onClick={() => c.setModalVisible(true)}>
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
        <DialogContent className="max-h-[85vh] overflow-y-auto">
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
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {c.loadingRecipes ? (
              <p className="text-sm text-muted-foreground">Loading recipes…</p>
            ) : (
              c.recipes.map((r) => (
                <Button
                  key={r.id}
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => c.addRecipeMeal(r.id, r.title)}
                >
                  {r.title}
                </Button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
