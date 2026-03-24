import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Text, IconButton, Divider, Snackbar, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { recipeService } from '../../services/api';
import { spacing } from '../../theme/spacing';

export default function ManualEntryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { initialData, editId } = useLocalSearchParams<{
    initialData?: string;
    editId?: string;
  }>();

  const [title, setTitle] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [tagsText, setTagsText] = useState('');

  const [ingredients, setIngredients] = useState<any[]>([
    { name: '', quantity: '', unit: '', stepOrder: '' },
  ]);
  const [steps, setSteps] = useState<any[]>([{ instruction: '', timer_seconds: '' }]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [loadRecipeLoading, setLoadRecipeLoading] = useState(!!editId);

  useEffect(() => {
    if (initialData) {
      try {
        const data = JSON.parse(initialData as string);
        setTitle(data.title || '');
        setPrepTime(data.prep_time_minutes?.toString() || '');
        setCookTime(data.cook_time_minutes?.toString() || '');
        setServings(data.servings?.toString() || '');
        setTagsText(Array.isArray(data.tags) ? data.tags.join(', ') : '');
        setIngredients(
          data.ingredients?.length
            ? data.ingredients.map((i: any) => ({
                name: i.name || '',
                quantity: i.quantity != null ? String(i.quantity) : '',
                unit: i.unit || '',
                stepOrder: '',
              }))
            : [{ name: '', quantity: '', unit: '', stepOrder: '' }]
        );
        setSteps(data.steps || [{ instruction: '', timer_seconds: '' }]);
      } catch (e) {
        console.error('Failed to parse initial data', e);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    (async () => {
      setLoadRecipeLoading(true);
      try {
        const data = await recipeService.getById(Number(editId));
        if (cancelled) return;
        setTitle(data.title || '');
        setPrepTime(data.prep_time_minutes?.toString() || '');
        setCookTime(data.cook_time_minutes?.toString() || '');
        setServings(data.servings?.toString() || '');
        setTagsText(Array.isArray(data.tags) ? data.tags.join(', ') : '');
        setSteps(
          data.steps?.length
            ? data.steps.map((s: any) => ({
                instruction: s.instruction || '',
                timer_seconds: s.timer_seconds != null ? String(s.timer_seconds) : '',
              }))
            : [{ instruction: '', timer_seconds: '' }]
        );
        setIngredients(
          data.ingredients?.length
            ? data.ingredients.map((i: any) => {
                let stepOrder = '';
                if (i.step_id && data.steps?.length) {
                  const st = data.steps.find((s: any) => s.id === i.step_id);
                  if (st) stepOrder = String(st.order_index);
                }
                return {
                  name: i.name || '',
                  quantity: i.quantity != null ? String(i.quantity) : '',
                  unit: i.unit || '',
                  stepOrder,
                };
              })
            : [{ name: '', quantity: '', unit: '', stepOrder: '' }]
        );
      } catch (e) {
        console.error(e);
        if (!cancelled) setSnackbar('Could not load recipe for editing.');
      } finally {
        if (!cancelled) setLoadRecipeLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editId]);

  const addIngredient = () =>
    setIngredients([...ingredients, { name: '', quantity: '', unit: '', stepOrder: '' }]);
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (index: number, field: string, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addStep = () => setSteps([...steps, { instruction: '', timer_seconds: '' }]);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));
  const updateStep = (index: number, field: string, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const tags = tagsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        title,
        prep_time_minutes: parseInt(prepTime, 10) || 0,
        cook_time_minutes: parseInt(cookTime, 10) || 0,
        servings: parseInt(servings, 10) || 1,
        tags,
        ingredients: ingredients.map((i) => {
          const so = String(i.stepOrder || '').trim();
          const parsedStep = so === '' ? undefined : parseInt(so, 10);
          return {
            name: i.name,
            quantity: parseFloat(String(i.quantity)) || 0,
            unit: i.unit || null,
            step_order_index:
              parsedStep !== undefined && !Number.isNaN(parsedStep) ? parsedStep : undefined,
          };
        }),
        steps: steps.map((s, i) => ({
          instruction: s.instruction,
          order_index: i + 1,
          timer_seconds: parseInt(String(s.timer_seconds), 10) || null,
        })),
      };

      if (editId) {
        await recipeService.update(Number(editId), payload);
        router.back();
      } else {
        await recipeService.create(payload);
        router.dismissAll();
        router.replace('/');
      }
    } catch (error) {
      console.error(error);
      setSnackbar('Could not save recipe. Check required fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadRecipeLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: editId ? 'Edit recipe' : 'New recipe' }} />
        <Text style={{ padding: spacing.lg }}>Loading recipe...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: editId ? 'Edit recipe' : 'New recipe' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <TextInput label="Recipe Title" value={title} onChangeText={setTitle} style={styles.input} />

        <View style={styles.row}>
          <TextInput label="Prep (min)" value={prepTime} onChangeText={setPrepTime} style={[styles.input, styles.half]} keyboardType="numeric" />
          <TextInput label="Cook (min)" value={cookTime} onChangeText={setCookTime} style={[styles.input, styles.half]} keyboardType="numeric" />
        </View>
        <TextInput label="Servings" value={servings} onChangeText={setServings} style={styles.input} keyboardType="numeric" />
        <TextInput
          label="Tags (comma-separated)"
          value={tagsText}
          onChangeText={setTagsText}
          style={styles.input}
          placeholder="e.g. vegetarian, quick"
        />

        <Divider style={styles.divider} />
        <Text variant="titleMedium">Ingredients</Text>
        {ingredients.map((ing, i) => (
          <View key={i} style={styles.ingBlock}>
            <View style={styles.row}>
              <TextInput
                placeholder="Name"
                value={ing.name}
                onChangeText={(v) => updateIngredient(i, 'name', v)}
                style={[styles.input, { flex: 2 }]}
              />
              <TextInput
                placeholder="Qty"
                value={String(ing.quantity)}
                onChangeText={(v) => updateIngredient(i, 'quantity', v)}
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
              />
              <TextInput
                placeholder="Unit"
                value={ing.unit}
                onChangeText={(v) => updateIngredient(i, 'unit', v)}
                style={[styles.input, { flex: 1 }]}
              />
              <IconButton icon="delete" onPress={() => removeIngredient(i)} accessibilityLabel="Remove ingredient" />
            </View>
            <TextInput
              label="Link to step # (optional)"
              value={String(ing.stepOrder || '')}
              onChangeText={(v) => updateIngredient(i, 'stepOrder', v)}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        ))}
        <Button mode="text" onPress={addIngredient} icon="plus">Add Ingredient</Button>

        <Divider style={styles.divider} />
        <Text variant="titleMedium">Steps</Text>
        {steps.map((step, i) => (
          <View key={i} style={[styles.stepContainer, { borderColor: theme.colors.outline }]}>
            <View style={styles.row}>
              <Text style={styles.stepNum}>{i + 1}.</Text>
              <IconButton icon="delete" onPress={() => removeStep(i)} size={20} />
            </View>
            <TextInput 
              placeholder="Instruction..." 
              value={step.instruction} 
              onChangeText={v => updateStep(i, 'instruction', v)} 
              multiline 
              style={styles.input} 
            />
            <TextInput 
              label="Timer (seconds)" 
              value={String(step.timer_seconds || '')} 
              onChangeText={v => updateStep(i, 'timer_seconds', v)} 
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        ))}
        <Button mode="text" onPress={addStep} icon="plus">Add Step</Button>

        <View style={styles.spacer} />
        <Button mode="contained" onPress={handleSave} loading={loading} disabled={loading}>
          {editId ? 'Update recipe' : 'Save recipe'}
        </Button>
      </ScrollView>
      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar(null)}
        duration={4000}
        action={{ label: 'Dismiss', onPress: () => setSnackbar(null) }}
      >
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl + spacing.sm,
  },
  input: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  half: {
    flex: 1,
  },
  divider: {
    marginVertical: spacing.lg,
  },
  stepContainer: {
    marginBottom: spacing.lg,
    borderWidth: 1,
    padding: spacing.sm,
    borderRadius: 8,
  },
  stepNum: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  spacer: {
    height: spacing.xxl,
  },
  ingBlock: {
    marginBottom: spacing.md,
  },
});
