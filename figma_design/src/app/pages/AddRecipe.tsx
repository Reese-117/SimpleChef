import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { RouterLink } from '../components/RouterLink';
import { useAddRecipeWebController, useManualRecipeWebController } from '@/controllers';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { ArrowLeft, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function AddRecipe() {
  const [searchParams] = useSearchParams();
  const initialData = searchParams.get('initialData') ?? undefined;
  const editId = searchParams.get('edit') ?? undefined;

  const [activeTab, setActiveTab] = useState<'manual' | 'paste'>('manual');
  const add = useAddRecipeWebController();
  const manual = useManualRecipeWebController(initialData, editId);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'manual') setActiveTab('manual');
  }, [searchParams]);

  useEffect(() => {
    if (manual.snackbar) {
      toast.error(manual.snackbar);
      manual.setSnackbar(null);
    }
  }, [manual.snackbar, manual.setSnackbar]);

  useEffect(() => {
    if (add.snackbar) {
      toast.error(add.snackbar);
      add.setSnackbar(null);
    }
  }, [add.snackbar, add.setSnackbar]);

  if (manual.loadRecipeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading recipe…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center">
          <Button variant="ghost" size="icon" asChild>
            <RouterLink to="/">
              <ArrowLeft className="w-5 h-5" />
            </RouterLink>
          </Button>
          <h2 className="absolute left-1/2 -translate-x-1/2">{manual.isEdit ? 'Edit Recipe' : 'Add Recipe'}</h2>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'manual' | 'paste')} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="paste">Paste Text</TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <Label htmlFor="paste-text">Paste recipe text</Label>
                <Textarea
                  id="paste-text"
                  value={add.text}
                  onChange={(e) => add.setText(e.target.value)}
                  placeholder="Paste recipe text…"
                  className="min-h-48"
                />
                <Button
                  type="button"
                  className="w-full"
                  disabled={!add.text.trim() || add.loading}
                  onClick={async () => {
                    await add.parseAndContinue();
                    setActiveTab('manual');
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {add.loading ? 'Parsing…' : 'Parse with API'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Calls the same <code className="text-foreground">POST /recipes/parse</code> as the mobile app.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3>Basic</h3>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={manual.title} onChange={(e) => manual.setTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="prep">Prep (min)</Label>
                    <Input
                      id="prep"
                      inputMode="numeric"
                      value={manual.prepTime}
                      onChange={(e) => manual.setPrepTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cook">Cook (min)</Label>
                    <Input
                      id="cook"
                      inputMode="numeric"
                      value={manual.cookTime}
                      onChange={(e) => manual.setCookTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    inputMode="numeric"
                    value={manual.servings}
                    onChange={(e) => manual.setServings(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={manual.tagsText}
                    onChange={(e) => manual.setTagsText(e.target.value)}
                    placeholder="vegetarian, quick"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3>Ingredients</h3>
                  <Button type="button" variant="outline" size="sm" onClick={manual.addIngredient}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                {manual.ingredients.map((ing, i) => (
                  <div key={i} className="space-y-2 border-b border-border pb-4">
                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5 space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={ing.name}
                          onChange={(e) => manual.updateIngredient(i, 'name', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Qty</Label>
                        <Input
                          value={ing.quantity}
                          onChange={(e) => manual.updateIngredient(i, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Unit</Label>
                        <Input
                          value={ing.unit}
                          onChange={(e) => manual.updateIngredient(i, 'unit', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Step #</Label>
                        <Input
                          value={ing.stepOrder}
                          onChange={(e) => manual.updateIngredient(i, 'stepOrder', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button type="button" variant="ghost" size="icon" onClick={() => manual.removeIngredient(i)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3>Steps</h3>
                  <Button type="button" variant="outline" size="sm" onClick={manual.addStep}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                {manual.steps.map((s, i) => (
                  <div key={i} className="space-y-2 border-b border-border pb-4">
                    <div className="flex justify-between gap-2">
                      <span className="text-sm text-muted-foreground">Step {i + 1}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => manual.removeStep(i)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={s.instruction}
                      onChange={(e) => manual.updateStep(i, 'instruction', e.target.value)}
                      placeholder="Instruction"
                    />
                    <div className="space-y-1">
                      <Label className="text-xs">Timer (seconds, optional)</Label>
                      <Input
                        value={s.timer_seconds}
                        onChange={(e) => manual.updateStep(i, 'timer_seconds', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button type="button" className="w-full" size="lg" disabled={manual.loading} onClick={manual.handleSave}>
              {manual.loading ? 'Saving…' : manual.isEdit ? 'Update recipe' : 'Create recipe'}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
