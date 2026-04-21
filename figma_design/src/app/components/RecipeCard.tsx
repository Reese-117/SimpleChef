import { Link } from 'react-router';
import type { RecipeListItemDto } from '@/lib/dto';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, Flame } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RecipeCardProps {
  recipe: RecipeListItemDto;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
  const tags = recipe.tags ?? [];

  return (
    <Link to={`/recipe/${recipe.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {recipe.image_url ? (
            <ImageWithFallback
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Flame className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          {recipe.difficulty && (
            <Badge variant="secondary" className="absolute top-2 right-2 capitalize">
              {recipe.difficulty}
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2">{recipe.title}</h3>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-4">
              {totalTime > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{totalTime} min</span>
                </div>
              )}
              {recipe.total_calories != null && (
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  <span>{recipe.total_calories} cal</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
