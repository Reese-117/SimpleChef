import { useEffect } from 'react';
import { Outlet, useLocation, Link, Navigate } from 'react-router';
import { Home, Calendar, PlusCircle, ShoppingCart, User } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';

export default function Root() {
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const loadToken = useAuthStore((s) => s.loadToken);

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  const isCookingMode = location.pathname.includes('/cook');

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/add', icon: PlusCircle, label: 'Add' },
    { path: '/grocery', icon: ShoppingCart, label: 'Grocery' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {!isCookingMode && (
        <nav className="border-t border-border bg-card">
          <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-2 flex-1 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
