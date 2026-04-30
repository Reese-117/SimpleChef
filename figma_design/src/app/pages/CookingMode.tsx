import { useParams } from 'react-router';
import { RouterLink } from '../components/RouterLink';
import { useCookingWebController } from '@/controllers';
import { CookingTimerDock } from '../components/CookingTimerDock';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  List,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

export default function CookingMode() {
  const { id } = useParams();
  const c = useCookingWebController(id);

  if (c.loading || !c.recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const { recipe, steps, ingredients, currentStep, currentStepIndex, miseItems } = c;

  if (steps.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="mb-2">No steps available</h2>
          <p className="text-muted-foreground mb-6">Add steps in the recipe editor, then try again.</p>
          <Button asChild>
            <RouterLink to={`/recipe/${recipe.id}`}>Back to Recipe</RouterLink>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="bg-card border-b border-border px-4 py-3 shrink-0">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" asChild>
            <RouterLink to={`/recipe/${recipe.id}`}>
              <ArrowLeft className="w-5 h-5" />
            </RouterLink>
          </Button>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
            <h3 className="text-sm font-medium truncate max-w-[200px]">{recipe.title}</h3>
          </div>
          <Button variant="ghost" size="icon" type="button" onClick={() => c.setAllIngOpen(true)}>
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto no-scrollbar px-4 py-6 min-h-0">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg">
                  {currentStep!.order_index}
                </div>
                <div className="flex-1">
                  <p className="text-lg leading-relaxed">{currentStep!.instruction}</p>
                  {currentStep!.timer_seconds ? (
                    <Button className="mt-4" variant="outline" type="button" onClick={c.handleStartTimer}>
                      <Clock className="w-4 h-4 mr-2" />
                      Start {Math.floor(currentStep!.timer_seconds / 60)} min timer
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          {miseItems.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="mb-3">Ingredients</h4>
                <ul className="space-y-2">
                  {miseItems.map((ing) => (
                    <li key={ing.id} className="flex items-start gap-2">
                      <Checkbox
                        checked={!!c.checked[ing.id]}
                        onCheckedChange={() => c.toggleIng(ing.id)}
                      />
                      <span className="pt-0.5">
                        {ing.name}
                        {ing.quantity != null ? ` — ${ing.quantity} ${ing.unit || ''}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CookingTimerDock />

      <div className="border-t border-border bg-card px-4 py-3 flex justify-between gap-3 shrink-0">
        <Button variant="outline" type="button" disabled={currentStepIndex === 0} onClick={c.prevStep}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <Button type="button" onClick={c.nextStep}>
          {c.isLastStep ? 'Finish' : 'Next'}
          {!c.isLastStep ? <ChevronRight className="w-4 h-4 ml-1" /> : null}
        </Button>
      </div>

      <Dialog open={c.allIngOpen} onOpenChange={c.setAllIngOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>All ingredients</DialogTitle>
          </DialogHeader>
          <ul className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
            {ingredients.map((ing) => (
              <li key={ing.id} className="text-sm">
                <span className="font-medium">{ing.name}</span>
                <span className="text-muted-foreground">
                  {' '}
                  {ing.quantity != null ? `${ing.quantity} ${ing.unit || ''}` : ''}
                </span>
              </li>
            ))}
          </ul>
          <Button type="button" onClick={() => c.setAllIngOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
