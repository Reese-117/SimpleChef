import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import {
  Text,
  Button,
  ActivityIndicator,
  List,
  Divider,
  useTheme,
  Portal,
  Modal,
  TextInput,
  Dialog,
  Chip,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { recipeService, userService, plannerService } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../../theme/spacing';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [planOpen, setPlanOpen] = useState(false);
  const [planDate, setPlanDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState<string>('Dinner');
  const [planSaving, setPlanSaving] = useState(false);
  const [ingredientsOpen, setIngredientsOpen] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [data, user] = await Promise.all([
        recipeService.getById(Number(id)),
        userService.getMe().catch(() => null),
      ]);
      setRecipe(data);
      setMe(user);
    } catch (error) {
      console.error(error);
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const isOwner = me && recipe && recipe.created_by_id === me.id;

  const addToCalendar = async () => {
    if (!recipe) return;
    setPlanSaving(true);
    try {
      await plannerService.addPlan({
        date: planDate,
        meal_type: mealType,
        recipe_id: recipe.id,
        calories: recipe.total_calories ?? undefined,
        custom_food_name: recipe.title,
      });
      setPlanOpen(false);
      router.push('/(tabs)/calendar');
    } catch (e) {
      console.error(e);
    } finally {
      setPlanSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!recipe) return;
    setDeleting(true);
    try {
      await recipeService.delete(recipe.id);
      setDeleteOpen(false);
      router.replace('/');
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.loading} size="large" />;
  }

  if (!recipe) {
    return <Text style={styles.missing}>Recipe not found</Text>;
  }

  const prep = recipe.prep_time_minutes ?? 0;
  const cook = recipe.cook_time_minutes ?? 0;
  const servings = recipe.servings ?? 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: recipe.title, headerBackTitle: 'Back' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {recipe.image_url ? (
          <Image source={{ uri: recipe.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.heroPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Recipe
            </Text>
          </View>
        )}

        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            {recipe.title}
          </Text>
          <View style={styles.strip}>
            <Text variant="bodyMedium">
              Prep {prep} min · Cook {cook} min · Total {prep + cook} min
            </Text>
            <Text variant="bodyMedium">Servings {servings}</Text>
            <Text variant="bodyMedium">Difficulty {recipe.difficulty}</Text>
            {recipe.total_calories != null ? (
              <Text variant="bodyMedium">About {recipe.total_calories} kcal (total)</Text>
            ) : null}
          </View>
        </View>

        {recipe.description ? (
          <Text variant="bodyMedium" style={styles.description}>
            {recipe.description}
          </Text>
        ) : null}

        <Divider />

        <List.Accordion
          title="Ingredients"
          expanded={ingredientsOpen}
          onPress={() => setIngredientsOpen(!ingredientsOpen)}
        >
          {(recipe.ingredients || []).map((ing: any) => (
            <List.Item
              key={ing.id}
              title={ing.name}
              description={`${ing.quantity ?? ''} ${ing.unit ?? ''}`.trim()}
              left={(props) => <List.Icon {...props} icon="circle-outline" />}
            />
          ))}
        </List.Accordion>

        <Divider />

        <List.Section>
          <List.Subheader>Instructions</List.Subheader>
          {(recipe.steps || []).map((step: any) => (
            <List.Item
              key={step.id}
              title={`Step ${step.order_index}`}
              description={step.instruction}
              descriptionNumberOfLines={20}
            />
          ))}
        </List.Section>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => router.push(`/cooking/${recipe.id}`)}
            style={styles.button}
            contentStyle={styles.buttonContent}
            accessibilityLabel="Begin cooking"
          >
            Begin cooking
          </Button>
          <Button mode="outlined" onPress={() => setPlanOpen(true)} style={styles.button}>
            Add to calendar
          </Button>
          {isOwner ? (
            <>
              <Button
                mode="outlined"
                onPress={() =>
                  router.push({
                    pathname: '/add/manual',
                    params: { editId: String(recipe.id) },
                  })
                }
                style={styles.button}
              >
                Edit recipe
              </Button>
              <Button mode="text" textColor={theme.colors.error} onPress={() => setDeleteOpen(true)}>
                Delete recipe
              </Button>
            </>
          ) : null}
        </View>
      </ScrollView>

      <Portal>
        <Modal
          visible={planOpen}
          onDismiss={() => setPlanOpen(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge">Add to calendar</Text>
          <TextInput
            label="Date (YYYY-MM-DD)"
            value={planDate}
            onChangeText={setPlanDate}
            mode="outlined"
          />
          <Text variant="labelLarge">Meal type</Text>
          <View style={styles.mealChips}>
            {MEAL_TYPES.map((m) => (
              <Chip key={m} selected={mealType === m} onPress={() => setMealType(m)} style={styles.mealChip}>
                {m}
              </Chip>
            ))}
          </View>
          <View style={styles.modalActions}>
            <Button onPress={() => setPlanOpen(false)}>Cancel</Button>
            <Button mode="contained" loading={planSaving} onPress={addToCalendar}>
              Save
            </Button>
          </View>
        </Modal>

        <Dialog visible={deleteOpen} onDismiss={() => setDeleteOpen(false)}>
          <Dialog.Title>Delete recipe?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteOpen(false)}>Cancel</Button>
            <Button loading={deleting} textColor={theme.colors.error} onPress={handleDelete}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  missing: {
    padding: spacing.xl,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  image: {
    width: '100%',
    height: 200,
  },
  heroPlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  strip: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  description: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    minHeight: 48,
  },
  modal: {
    padding: spacing.xl,
    margin: spacing.lg,
    borderRadius: 8,
    gap: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  mealChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
