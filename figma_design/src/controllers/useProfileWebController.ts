import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { userService } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';

export function useProfileWebController() {
  const navigate = useNavigate();
  const { token, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [calorieGoal, setCalorieGoal] = useState('2000');
  const [dietaryText, setDietaryText] = useState('');
  const [keepAwake, setKeepAwake] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const loadUser = useCallback(async () => {
    if (!token) return;
    try {
      const u = await userService.getMe();
      setFullName(u.full_name || '');
      setBio(u.bio || '');
      setCalorieGoal(String(u.calorie_goal ?? 2000));
      setDietaryText(Array.isArray(u.dietary_restrictions) ? u.dietary_restrictions.join(', ') : '');
      setKeepAwake(u.is_screen_always_on !== false);
      setProfileImageUrl(u.profile_image_url || '');
      setEmail(u.email || '');
    } catch {
      setSnackbar('Could not load profile.');
    } finally {
      // Always clear loading so the screen does not get stuck after an error.
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    loadUser();
  }, [loadUser]);

  const save = async () => {
    setSaving(true);
    try {
      const dietary_restrictions = dietaryText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const cg = parseInt(calorieGoal, 10);
      await userService.patchMe({
        full_name: fullName || null,
        bio: bio || null,
        profile_image_url: profileImageUrl.trim() || null,
        calorie_goal: Number.isNaN(cg) ? 2000 : cg,
        dietary_restrictions,
        is_screen_always_on: keepAwake,
      });
      setSnackbar('Profile saved.');
    } catch {
      setSnackbar('Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const logoutAndGoLogin = async () => {
    await logout();
    navigate('/auth', { replace: true });
  };

  return {
    loading,
    saving,
    fullName,
    setFullName,
    bio,
    setBio,
    calorieGoal,
    setCalorieGoal,
    dietaryText,
    setDietaryText,
    keepAwake,
    setKeepAwake,
    profileImageUrl,
    setProfileImageUrl,
    snackbar,
    setSnackbar,
    save,
    loadUser,
    logoutAndGoLogin,
    email,
  };
}
