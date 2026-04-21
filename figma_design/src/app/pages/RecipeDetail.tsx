import { useParams } from 'react-router';
import { RouterLink } from '../components/RouterLink';
import { useRecipeDetailWebController, RECIPE_DETAIL_MEAL_TYPES } from '@/controllers';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Clock, Users, Flame, ChefHat, Calendar, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';

export default function RecipeDetail() {
  const { id } = useParams();
  const c = useRecipeDetailWebController(id);

  if (c.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading recipe…</p>
      </div>
    );
  }

  const recipe = c.recipe;
  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2">Recipe not found</h2>
          <Button asChild>
            <RouterLink to="/">Back to Home</RouterLink>
          </Button>
        </div>
      </div>
    );
  }

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
  const tags = recipe.tags ?? [];

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" asChild>
            <RouterLink to="/">
              <ArrowLeft className="w-5 h-5" />
            </RouterLink>
          </Button>
          <h2 className="absolute left-1/2 -translate-x-1/2">Recipe</h2>
          {c.isOwner && (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" asChild>
                <RouterLink to={`/add?edit=${recipe.id}`}>
                  <Edit className="w-5 h-5" />
                </RouterLink>
              </Button>
              <Button variant="ghost" size="icon" type="button" onClick={() => c.setDeleteOpen(true)}>
                <Trash2 className="w-5 h-5 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {recipe.image_url ? (
            <ImageWithFallback
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Flame className="w-20 h-20 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="px-4">
          <div className="py-6">
            <h1 className="mb-2">{recipe.title}</h1>
            {recipe.description && <p className="text-muted-foreground">{recipe.description}</p>}
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recipe.prep_time_minutes != null && recipe.prep_time_minutes > 0 && (
                  <div className="text-center">
                    <div className="text-muted-foreground text-sm mb-1">Prep</div>
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.prep_time_minutes} min</span>
                    </div>
                  </div>
                )}
                {recipe.cook_time_minutes != null && recipe.cook_time_minutes > 0 && (
                  <div className="text-center">
                    <div className="text-muted-foreground text-sm mb-1">Cook</div>
                    <div className="flex items-center justify-center gap-1">
                      <Flame className="w-4 h-4" />
                      <span>{recipe.cook_time_minutes} min</span>
                    </div>
                  </div>
                )}
                {totalTime > 0 && (
                  <div className="text-center">
                    <div className="text-muted-foreground text-sm mb-1">Total</div>
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{totalTime} min</span>
                    </div>
                  </div>
                )}
                {recipe.servings != null && recipe.servings > 0 && (
                  <div className="text-center">
                    <div className="text-muted-foreground text-sm mb-1">Servings</div>
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{recipe.servings}</span>
                    </div>
                  </div>
                )}
                {recipe.difficulty && (
                  <div className="text-center">
                    <div className="text-muted-foreground text-sm mb-1">Difficulty</div>
                    <div className="capitalize">{recipe.difficulty}</div>
                  </div>
                )}
                {recipe.total_calories != null && (
                  <div className="text-center">
                    <div className="text-muted-foreground text-sm mb-1">Calories</div>
                    <div className="flex items-center justify-center gap-1">
                      <Flame className="w-4 h-4" />
                      <span>{recipe.total_calories}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Collapsible open={c.ingredientsOpen} onOpenChange={c.setIngredientsOpen} className="mb-6">
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardContent className="p-4 flex items-center justify-between">
                  <h3>Ingredients ({recipe.ingredients.length})</h3>
                  {c.ingredientsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </CardContent>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="px-4 pb-4 pt-0">
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient) => (
                      <li key={ingredient.id} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>
                          {ingredient.quantity != null && `${ingredient.quantity} `}
                          {ingredient.unit && `${ingredient.unit} `}
                          {ingredient.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="mb-4">Instructions</h3>
              <ol className="space-y-4">
                {recipe.steps.map((step) => (
                  <li key={step.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      {step.order_index}
                    </div>
                    <div className="flex-1 pt-1">
                      <p>{step.instruction}</p>
                      {step.timer_seconds ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                          <Clock className="w-4 h-4" />
                          <span>{Math.floor(step.timer_seconds / 60)} minutes</span>
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button asChild className="flex-1" size="lg">
              <RouterLink to={`/recipe/${recipe.id}/cook`}>
                <ChefHat className="w-5 h-5 mr-2" />
                Begin Cooking
              </RouterLink>
            </Button>
            <Button variant="outline" size="lg" type="button" onClick={() => c.setPlanOpen(true)}>
              <Calendar className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={c.planOpen} onOpenChange={c.setPlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Calendar</DialogTitle>
            <DialogDescription>Schedule this recipe for a specific date and meal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <input
                id="date"
                type="date"
                value={c.planDate}
                onChange={(e) => c.setPlanDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Meal type</Label>
              <Select value={c.mealType} onValueChange={(v) => c.setMealType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECIPE_DETAIL_MEAL_TYPES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => c.setPlanOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={c.addToCalendar} disabled={c.planSaving}>
              {c.planSaving ? 'Saving…' : 'Add to Calendar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={c.deleteOpen} onOpenChange={c.setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{recipe.title}&quot;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => c.setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" type="button" onClick={c.handleDelete} disabled={c.deleting}>
              {c.deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
