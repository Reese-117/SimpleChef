import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ChefHat } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthWebController, useSignupWebController } from '@/controllers';
import { useAuthStore } from '@/lib/authStore';

export default function Auth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const token = useAuthStore((s) => s.token);
  const loadToken = useAuthStore((s) => s.loadToken);

  const loginC = useAuthWebController();
  const signupC = useSignupWebController();

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

  if (token) {
    return <Navigate to="/" replace />;
  }

  const onLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginC.login(() => {
      toast.success('Welcome back');
      navigate('/', { replace: true });
    });
  };

  const onSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signupC.signup(() => {
      toast.success('Account ready');
      navigate('/', { replace: true });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
            <ChefHat className="w-8 h-8" />
          </div>
          <h1 className="mb-2">SimpleChef</h1>
          <p className="text-muted-foreground">Sign in with your SimpleChef account (same API as the Expo app).</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginC.email}
                      onChange={(e) => loginC.setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginC.password}
                      onChange={(e) => loginC.setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                  {loginC.error ? <p className="text-sm text-destructive">{loginC.error}</p> : null}
                  <Button type="submit" className="w-full" size="lg" disabled={loginC.loading}>
                    {loginC.loading ? 'Signing in…' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Uses the same backend as the mobile app</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSignupSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      value={signupC.fullName}
                      onChange={(e) => signupC.setFullName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupC.email}
                      onChange={(e) => signupC.setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupC.password}
                      onChange={(e) => signupC.setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <p className="text-xs text-muted-foreground">At least 6 characters</p>
                  </div>
                  {signupC.error ? <p className="text-sm text-destructive">{signupC.error}</p> : null}
                  <Button type="submit" className="w-full" size="lg" disabled={signupC.loading}>
                    {signupC.loading ? 'Creating…' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-4 bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              Set <code className="text-foreground">VITE_API_URL</code> to your API base (e.g.{' '}
              <code className="text-foreground">http://localhost:8000/api/v1</code>).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
