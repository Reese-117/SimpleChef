import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useRecipeLibraryWebController } from '@/controllers';
import { recipeService } from '@/lib/api';
import type { RecipeListItemDto } from '@/lib/dto';
import type { RecipeFilters } from '../types';
import RecipeCard from '../components/RecipeCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Search, Filter } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';

function difficultyForApi(d?: 'easy' | 'medium' | 'hard'): string {
  if (!d) return '';
  const map = { easy: 'Easy', medium: 'Medium', hard: 'Hard' } as const;
  return map[d];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [allRecipes, setAllRecipes] = useState<RecipeListItemDto[]>([]);

  const library = useRecipeLibraryWebController({
    searchQuery,
    difficulty: difficultyForApi(filters.difficulty),
    maxTotalMinutes: filters.maxTime,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await recipeService.getAll({ limit: 500 });
        if (!cancelled) setAllRecipes(all);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const availableTags = useMemo(() => {
    const byLower = new Map<string, string>();
    for (const r of allRecipes) {
      for (const tag of r.tags || []) {
        const raw = String(tag || '').trim();
        if (!raw) continue;
        const lower = raw.toLowerCase();
        if (!byLower.has(lower)) byLower.set(lower, raw);
      }
    }
    return Array.from(byLower.values()).sort((a, b) => a.localeCompare(b));
  }, [allRecipes]);

  const filteredRecipes = useMemo(() => {
    const selected = (filters.tags || [])
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (selected.length === 0) return library.recipes;
    return library.recipes.filter((recipe) => {
      const recipeTags = (recipe.tags || []).map((t) => String(t).trim().toLowerCase());
      return selected.every((tag) => recipeTags.includes(tag));
    });
  }, [library.recipes, filters.tags]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <h1 className="mb-4">SimpleChef</h1>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" type="button">
                  <Filter className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto no-scrollbar">
                <SheetHeader>
                  <SheetTitle>Filter Recipes</SheetTitle>
                  <SheetDescription>Refine your search with these filters</SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select
                      value={filters.difficulty || 'all'}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          difficulty: value === 'all' ? undefined : (value as 'easy' | 'medium' | 'hard'),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All levels</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Maximum cooking time</Label>
                    <Select
                      value={filters.maxTime?.toString() || 'all'}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          maxTime: value === 'all' ? undefined : parseInt(value, 10),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any duration</SelectItem>
                        <SelectItem value="15">Under 15 minutes</SelectItem>
                        <SelectItem value="30">Under 30 minutes</SelectItem>
                        <SelectItem value="60">Under 1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Dietary preferences</Label>
                    <div className="space-y-2">
                      {availableTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={tag}
                            checked={(filters.tags || []).some((t) => t.toLowerCase() === tag.toLowerCase())}
                            onCheckedChange={(checked) => {
                              setFilters((prev) => ({
                                ...prev,
                                tags: checked
                                  ? [...(prev.tags || []), tag].filter(
                                      (v, i, arr) =>
                                        arr.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i
                                    )
                                  : (prev.tags || []).filter((t) => t.toLowerCase() !== tag.toLowerCase()),
                              }));
                            }}
                          />
                          <label htmlFor={tag} className="text-sm leading-none">
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" type="button" onClick={() => setFilters({})}>
                    Clear filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {(filters.difficulty || filters.maxTime || (filters.tags && filters.tags.length > 0)) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filters.difficulty && (
                <Badge variant="secondary" className="capitalize">
                  {filters.difficulty}
                </Badge>
              )}
              {filters.maxTime && (
                <Badge variant="secondary">Under {filters.maxTime} min</Badge>
              )}
              {filters.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {library.loading ? (
          <p className="text-center text-muted-foreground py-12">Loading recipes…</p>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-4">
              {searchQuery || library.hasActiveFilters ? 'No recipes match your search' : 'No recipes yet'}
            </p>
            <p className="text-muted-foreground mb-6">
              {searchQuery || library.hasActiveFilters ? 'Try adjusting your filters' : 'Add your first recipe to get started'}
            </p>
            <Button asChild>
              <Link to="/add">Add Recipe</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
