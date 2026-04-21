import { RouterLink } from '../components/RouterLink';
import { Button } from '../components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="mb-2">404</h1>
        <h2 className="mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Button asChild>
          <RouterLink to="/">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </RouterLink>
        </Button>
      </div>
    </div>
  );
}
