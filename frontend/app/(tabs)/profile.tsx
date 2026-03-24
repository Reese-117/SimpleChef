import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Button,
  ActivityIndicator,
  TextInput,
  Switch,
  Divider,
  Snackbar,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { userService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { spacing } from '../../theme/spacing';

const DIETARY_PRESETS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut-free'];

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { token, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [calorieGoal, setCalorieGoal] = useState('2000');
  const [dietaryText, setDietaryText] = useState('');
  const [keepAwake, setKeepAwake] = useState(true);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const loadUser = async () => {
    if (!token) return;
    try {
      const u = await userService.getMe();
      setFullName(u.full_name || '');
      setBio(u.bio || '');
      setCalorieGoal(String(u.calorie_goal ?? 2000));
      setDietaryText(Array.isArray(u.dietary_restrictions) ? u.dietary_restrictions.join(', ') : '');
      setKeepAwake(u.is_screen_always_on !== false);
    } catch {
      setSnackbar('Could not load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  const handleSave = async () => {
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

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" style={styles.loading} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="headlineSmall" style={styles.title}>
          Profile
        </Text>
        <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
          Friends / social features are out of scope for this build; see CONTINUATION_CHECKLIST.
        </Text>

        <TextInput label="Full name" value={fullName} onChangeText={setFullName} mode="outlined" style={styles.field} />
        <TextInput label="Bio" value={bio} onChangeText={setBio} mode="outlined" multiline style={styles.field} />
        <TextInput
          label="Calorie goal (kcal/day)"
          value={calorieGoal}
          onChangeText={setCalorieGoal}
          keyboardType="numeric"
          mode="outlined"
          style={styles.field}
        />
        <TextInput
          label="Dietary restrictions (comma-separated)"
          value={dietaryText}
          onChangeText={setDietaryText}
          mode="outlined"
          placeholder={DIETARY_PRESETS.join(', ')}
          style={styles.field}
        />

        <View style={styles.row}>
          <Text variant="bodyLarge">Keep screen on while cooking</Text>
          <Switch value={keepAwake} onValueChange={setKeepAwake} accessibilityLabel="Keep screen on while cooking" />
        </View>

        <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={styles.save}>
          Save
        </Button>

        <Divider style={styles.divider} />

        <Button mode="outlined" onPress={handleLogout} style={styles.button} icon="logout" accessibilityLabel="Sign out">
          Sign out
        </Button>
      </ScrollView>
      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar(null)} duration={3000}>
        {snackbar}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl + spacing.lg,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  hint: {
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
  },
  save: {
    marginTop: spacing.sm,
  },
  divider: {
    marginVertical: spacing.xl,
  },
  button: {
    marginTop: spacing.sm,
  },
});
