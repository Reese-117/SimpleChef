import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  IconButton,
  Divider,
  Snackbar,
  Menu,
  useTheme,
} from 'react-native-paper';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../../theme/spacing';
import { useManualRecipeController } from '../../controllers';

export default function ManualEntryScreen() {
  const theme = useTheme();
  const [difficultyMenuVisible, setDifficultyMenuVisible] = React.useState(false);
  const { initialData, editId } = useLocalSearchParams<{
    initialData?: string;
    editId?: string;
  }>();
  const c = useManualRecipeController(initialData, editId);

  if (c.loadRecipeLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: c.isEdit ? 'Edit recipe' : 'New recipe' }} />
        <Text style={{ padding: spacing.lg }}>Loading recipe...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: c.isEdit ? 'Edit recipe' : 'New recipe' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <TextInput label="Recipe Title" value={c.title} onChangeText={c.setTitle} style={styles.input} />

        <View style={styles.row}>
          <TextInput label="Prep (min)" value={c.prepTime} onChangeText={c.setPrepTime} style={[styles.input, styles.half]} keyboardType="numeric" />
          <TextInput label="Cook (min)" value={c.cookTime} onChangeText={c.setCookTime} style={[styles.input, styles.half]} keyboardType="numeric" />
        </View>
        <TextInput label="Servings" value={c.servings} onChangeText={c.setServings} style={styles.input} keyboardType="numeric" />
        <Text variant="labelLarge" style={styles.fieldLabel}>Difficulty</Text>
        <Menu
          visible={difficultyMenuVisible}
          onDismiss={() => setDifficultyMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              icon="chevron-down"
              style={styles.input}
              contentStyle={styles.dropdownButtonContent}
              onPress={() => setDifficultyMenuVisible(true)}
            >
              {c.difficulty}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              c.setDifficulty('Easy');
              setDifficultyMenuVisible(false);
            }}
            title="Easy"
          />
          <Menu.Item
            onPress={() => {
              c.setDifficulty('Medium');
              setDifficultyMenuVisible(false);
            }}
            title="Medium"
          />
          <Menu.Item
            onPress={() => {
              c.setDifficulty('Hard');
              setDifficultyMenuVisible(false);
            }}
            title="Hard"
          />
        </Menu>
        <TextInput
          label="Tags (comma-separated)"
          value={c.tagsText}
          onChangeText={c.setTagsText}
          style={styles.input}
          placeholder="e.g. vegetarian, quick"
        />

        <Divider style={styles.divider} />
        <Text variant="titleMedium">Ingredients</Text>
        {c.ingredients.map((ing, i) => (
          <View key={i} style={styles.ingBlock}>
            <View style={styles.row}>
              <TextInput
                placeholder="Name"
                value={ing.name}
                onChangeText={(v) => c.updateIngredient(i, 'name', v)}
                style={[styles.input, { flex: 2 }]}
              />
              <TextInput
                placeholder="Qty"
                value={String(ing.quantity)}
                onChangeText={(v) => c.updateIngredient(i, 'quantity', v)}
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
              />
              <TextInput
                placeholder="Unit"
                value={ing.unit}
                onChangeText={(v) => c.updateIngredient(i, 'unit', v)}
                style={[styles.input, { flex: 1 }]}
              />
              <IconButton icon="delete" onPress={() => c.removeIngredient(i)} accessibilityLabel="Remove ingredient" />
            </View>
            <TextInput
              label="Link to step # (optional)"
              value={String(ing.stepOrder || '')}
              onChangeText={(v) => c.updateIngredient(i, 'stepOrder', v)}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        ))}
        <Button mode="text" onPress={c.addIngredient} icon="plus">Add Ingredient</Button>

        <Divider style={styles.divider} />
        <Text variant="titleMedium">Steps</Text>
        {c.steps.map((step, i) => (
          <View key={i} style={[styles.stepContainer, { borderColor: theme.colors.outline }]}>
            <View style={styles.row}>
              <Text style={styles.stepNum}>{i + 1}.</Text>
              <IconButton icon="delete" onPress={() => c.removeStep(i)} size={20} />
            </View>
            <TextInput
              placeholder="Instruction..."
              value={step.instruction}
              onChangeText={(v) => c.updateStep(i, 'instruction', v)}
              multiline
              style={styles.input}
            />
            <TextInput
              label="Timer (seconds)"
              value={String(step.timer_seconds || '')}
              onChangeText={(v) => c.updateStep(i, 'timer_seconds', v)}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        ))}
        <Button mode="text" onPress={c.addStep} icon="plus">Add Step</Button>

        <View style={styles.spacer} />
        <Button mode="contained" onPress={c.handleSave} loading={c.loading} disabled={c.loading}>
          {c.isEdit ? 'Update recipe' : 'Save recipe'}
        </Button>
      </ScrollView>
      <Snackbar
        visible={!!c.snackbar}
        onDismiss={() => c.setSnackbar(null)}
        duration={4000}
        action={{ label: 'Dismiss', onPress: () => c.setSnackbar(null) }}
      >
        {c.snackbar}
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
  fieldLabel: {
    marginBottom: spacing.xs,
  },
  dropdownButtonContent: {
    justifyContent: 'space-between',
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
