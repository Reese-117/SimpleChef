import { useEffect, useState } from 'react';
import { useProfileWebController } from '@/controllers';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { User, Save, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

export default function Profile() {
  const c = useProfileWebController();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  useEffect(() => {
    if (c.snackbar) {
      toast.message(c.snackbar);
      c.setSnackbar(null);
    }
  }, [c.snackbar, c.setSnackbar]);

  if (c.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <h1>Profile</h1>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{c.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h3>Basic Information</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={c.fullName} onChange={(e) => c.setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={c.bio} onChange={(e) => c.setBio(e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h3>Health & Nutrition</h3>
              <div className="space-y-2">
                <Label htmlFor="calorie-goal">Daily Calorie Goal</Label>
                <Input
                  id="calorie-goal"
                  type="number"
                  value={c.calorieGoal}
                  onChange={(e) => c.setCalorieGoal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dietary">Dietary restrictions</Label>
                <Textarea
                  id="dietary"
                  value={c.dietaryText}
                  onChange={(e) => c.setDietaryText(e.target.value)}
                  placeholder="Comma-separated, e.g. Vegetarian, Gluten-free"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h3>Cooking Preferences</h3>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="screen-on">Keep screen on while cooking</Label>
                  <p className="text-sm text-muted-foreground">Matches mobile cooking preference.</p>
                </div>
                <Switch id="screen-on" checked={c.keepAwake} onCheckedChange={c.setKeepAwake} />
              </div>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full" type="button" disabled={c.saving} onClick={c.save}>
            <Save className="w-4 h-4 mr-2" />
            {c.saving ? 'Saving…' : 'Save Changes'}
          </Button>

          <Card>
            <CardContent className="p-4">
              <h4 className="mb-2">Account</h4>
              <Button variant="outline" className="w-full" type="button" onClick={() => setShowSignOutDialog(true)}>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>You will need to sign in again to use the app.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setShowSignOutDialog(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                setShowSignOutDialog(false);
                await c.logoutAndGoLogin();
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
