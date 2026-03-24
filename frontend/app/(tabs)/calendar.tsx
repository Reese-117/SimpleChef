import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Pressable, FlatList, Dimensions } from 'react-native';
import {
  Text,
  Card,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  IconButton,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { plannerService, recipeService } from '../../services/api';
import { spacing } from '../../theme/spacing';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function toISODate(d: Date) {
  return d.toISOString().split('T')[0];
}

export default function CalendarScreen() {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [plans, setPlans] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [pickMealType, setPickMealType] = useState<string>('Dinner');

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const dim = daysInMonth(year, month);
  const firstDow = new Date(year, month, 1).getDay();
  const grid = useMemo(() => {
    const cells: ({ day: number } | null)[] = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= dim; d++) cells.push({ day: d });
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month, firstDow, dim]);

  const theme = useTheme();
  const width = Dimensions.get('window').width - spacing.xxl;
  const cell = Math.floor(width / 7);

  useEffect(() => {
    loadPlans();
  }, [selectedDate]);

  const loadPlans = async () => {
    try {
      const data = await plannerService.getPlans(selectedDate, selectedDate);
      setPlans(data);
    } catch (error) {
      console.error(error);
    }
  };

  const addMeal = async () => {
    try {
      await plannerService.addPlan({
        date: selectedDate,
        meal_type: 'Dinner',
        custom_food_name: mealName,
        calories: parseInt(calories, 10) || 0,
      });
      setModalVisible(false);
      setMealName('');
      setCalories('');
      loadPlans();
    } catch (error) {
      console.error(error);
    }
  };

  const addRecipeMeal = async (recipeId: number, title: string) => {
    try {
      await plannerService.addPlan({
        date: selectedDate,
        meal_type: pickMealType,
        recipe_id: recipeId,
        custom_food_name: title,
      });
      setLibraryOpen(false);
      loadPlans();
    } catch (e) {
      console.error(e);
    }
  };

  const openLibrary = async () => {
    setLibraryOpen(true);
    setLoadingRecipes(true);
    try {
      const data = await recipeService.getAll();
      setRecipes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const deletePlan = async (id: number) => {
    try {
      await plannerService.deletePlan(id);
      loadPlans();
    } catch (e) {
      console.error(e);
    }
  };

  const selectDay = (day: number) => {
    const d = new Date(year, month, day);
    setSelectedDate(toISODate(d));
  };

  const isSelected = (day: number) => {
    const d = toISODate(new Date(year, month, day));
    return d === selectedDate;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.monthHeader}>
        <IconButton icon="chevron-left" onPress={() => setViewMonth(new Date(year, month - 1, 1))} accessibilityLabel="Previous month" />
        <Text variant="titleLarge">
          {viewMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <IconButton icon="chevron-right" onPress={() => setViewMonth(new Date(year, month + 1, 1))} accessibilityLabel="Next month" />
      </View>

      <View style={styles.weekRow}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <Text key={`${d}-${i}`} style={[styles.weekLabel, { width: cell, color: theme.colors.onSurfaceVariant }]}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {grid.map((cellData, idx) =>
          cellData ? (
            <Pressable
              key={idx}
              onPress={() => selectDay(cellData.day)}
              style={[
                styles.dayCell,
                { width: cell, height: cell * 0.85 },
                isSelected(cellData.day) && { backgroundColor: theme.colors.primaryContainer || '#e8f5e9' },
              ]}
              accessibilityLabel={`Select day ${cellData.day}`}
            >
              <Text variant="bodyMedium">{cellData.day}</Text>
            </Pressable>
          ) : (
            <View key={idx} style={{ width: cell, height: cell * 0.85 }} />
          )
        )}
      </View>

      <Text variant="titleMedium" style={styles.selectedLabel}>
        Meals on {selectedDate}
      </Text>

      <FlatList
        data={plans}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title
              title={item.recipe_title || item.custom_food_name || 'Meal'}
              subtitle={`${item.meal_type || ''} · ${item.calories || 0} kcal`}
              right={() => (
                <IconButton icon="delete" onPress={() => deletePlan(item.id)} accessibilityLabel="Delete meal" />
              )}
            />
          </Card>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>No meals planned for this day.</Text>
        }
        contentContainerStyle={styles.list}
      />

      <FAB icon="plus" style={styles.fab} onPress={() => setModalVisible(true)} label="Quick add" />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge">Quick add meal</Text>
          <TextInput label="Food name" value={mealName} onChangeText={setMealName} mode="outlined" />
          <TextInput label="Calories" value={calories} onChangeText={setCalories} keyboardType="numeric" mode="outlined" />
          <Button mode="contained" onPress={addMeal}>
            Add
          </Button>
          <Button onPress={openLibrary}>Add from library</Button>
        </Modal>

        <Modal
          visible={libraryOpen}
          onDismiss={() => setLibraryOpen(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge">Pick recipe</Text>
          <Text variant="labelLarge">Meal type</Text>
          <View style={styles.mealRow}>
            {MEAL_TYPES.map((m) => (
              <Button key={m} mode={pickMealType === m ? 'contained' : 'outlined'} compact onPress={() => setPickMealType(m)}>
                {m}
              </Button>
            ))}
          </View>
          {loadingRecipes ? (
            <ActivityIndicator />
          ) : (
            <FlatList
              data={recipes}
              keyExtractor={(r) => r.id.toString()}
              style={{ maxHeight: 280 }}
              renderItem={({ item }) => (
                <Button mode="text" onPress={() => addRecipeMeal(item.id, item.title)}>
                  {item.title}
                </Button>
              )}
            />
          )}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  weekLabel: {
    textAlign: 'center',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  dayCell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedLabel: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  card: {
    marginBottom: spacing.sm,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
  },
  modal: {
    padding: spacing.xl,
    margin: spacing.lg,
    borderRadius: 8,
    gap: spacing.md,
  },
  mealRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
