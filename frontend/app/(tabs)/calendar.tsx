import React from 'react';
import { View, StyleSheet, Pressable, FlatList } from 'react-native';
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
import { spacing } from '../../theme/spacing';
import { usePlannerController } from '../../controllers';

export default function CalendarScreen() {
  const theme = useTheme();
  const c = usePlannerController();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.monthHeader}>
        <IconButton icon="chevron-left" onPress={c.prevMonth} accessibilityLabel="Previous month" />
        <Text variant="titleLarge">
          {c.viewMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <IconButton icon="chevron-right" onPress={c.nextMonth} accessibilityLabel="Next month" />
      </View>

      <View style={styles.weekRow}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <Text key={`${d}-${i}`} style={[styles.weekLabel, { width: c.cell, color: theme.colors.onSurfaceVariant }]}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {c.grid.map((cellData, idx) =>
          cellData ? (
            <Pressable
              key={idx}
              onPress={() => c.selectDay(cellData.day)}
              style={[
                styles.dayCell,
                { width: c.cell, height: c.cell * 0.85 },
                c.isSelected(cellData.day) && { backgroundColor: theme.colors.primaryContainer || '#e8f5e9' },
              ]}
              accessibilityLabel={`Select day ${cellData.day}`}
            >
              <Text variant="bodyMedium">{cellData.day}</Text>
              {c.mealCountForDay(cellData.day) > 0 ? (
                <View style={styles.markerRow}>
                  {c.mealCountForDay(cellData.day) <= 3 ? (
                    Array.from({ length: c.mealCountForDay(cellData.day) }).map((_, markerIndex) => (
                      <View key={markerIndex} style={[styles.markerDot, { backgroundColor: theme.colors.primary }]} />
                    ))
                  ) : (
                    <Text variant="labelSmall" style={[styles.markerPlus, { color: theme.colors.primary }]}>
                      {c.mealCountForDay(cellData.day)}
                    </Text>
                  )}
                </View>
              ) : null}
            </Pressable>
          ) : (
            <View key={idx} style={{ width: c.cell, height: c.cell * 0.85 }} />
          )
        )}
      </View>

      <Text variant="titleMedium" style={styles.selectedLabel}>
        Meals on {c.selectedDate}
      </Text>
      {c.daySummary ? (
        <Text variant="bodySmall" style={[styles.summaryLine, { color: theme.colors.onSurfaceVariant }]}>
          Logged {c.daySummary.consumed_calories} kcal
          {c.calorieGoal != null ? ` · Goal ${c.calorieGoal} kcal/day` : ''}
          {c.daySummary.meals_without_calories > 0
            ? ` · ${c.daySummary.meals_without_calories} meal(s) without calories`
            : ''}
        </Text>
      ) : null}

      <FlatList
        data={c.plans}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title
              title={item.recipe_title || item.custom_food_name || 'Meal'}
              subtitle={`${item.meal_type || ''} · ${item.calories || 0} kcal`}
              right={() => (
                <IconButton icon="delete" onPress={() => c.deletePlan(item.id)} accessibilityLabel="Delete meal" />
              )}
            />
          </Card>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>No meals planned for this day.</Text>
        }
        contentContainerStyle={styles.list}
      />

      <FAB icon="plus" style={styles.fab} onPress={() => c.setModalVisible(true)} label="Quick add" />

      <Portal>
        <Modal
          visible={c.modalVisible}
          onDismiss={() => c.setModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge">Quick add meal</Text>
          <TextInput label="Food name" value={c.mealName} onChangeText={c.setMealName} mode="outlined" />
          <TextInput label="Calories" value={c.calories} onChangeText={c.setCalories} keyboardType="numeric" mode="outlined" />
          <Button mode="contained" onPress={c.addMeal}>
            Add
          </Button>
          <Button onPress={c.openLibrary}>Add from library</Button>
        </Modal>

        <Modal
          visible={c.libraryOpen}
          onDismiss={() => c.setLibraryOpen(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge">Pick recipe</Text>
          <Text variant="labelLarge">Meal type</Text>
          <View style={styles.mealRow}>
            {c.MEAL_TYPES.map((m) => (
              <Button key={m} mode={c.pickMealType === m ? 'contained' : 'outlined'} compact onPress={() => c.setPickMealType(m)}>
                {m}
              </Button>
            ))}
          </View>
          {c.loadingRecipes ? (
            <ActivityIndicator />
          ) : (
            <FlatList
              data={c.recipes}
              keyExtractor={(r) => r.id.toString()}
              style={{ maxHeight: 280 }}
              renderItem={({ item }) => (
                <Button mode="text" onPress={() => c.addRecipeMeal(item.id, item.title)}>
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
  markerRow: {
    marginTop: 3,
    minHeight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  markerDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  markerPlus: {
    lineHeight: 10,
    fontWeight: '700',
  },
  selectedLabel: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  summaryLine: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
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
