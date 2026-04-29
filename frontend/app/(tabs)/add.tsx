import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput, Modal, Portal, Snackbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../../theme/spacing';
import { useAddRecipeController } from '../../controllers';

export default function AddScreen() {
  const theme = useTheme();
  const c = useAddRecipeController();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.header}>Add New Recipe</Text>

        <Button
          mode="contained"
          icon="pencil"
          onPress={c.goManual}
          style={styles.button}
        >
          Enter Manually
        </Button>

        <Button
          mode="contained"
          icon="magic-staff"
          onPress={() => c.setModalVisible(true)}
          style={styles.button}
        >
          Paste Text / URL (AI)
        </Button>

        <Button
          mode="outlined"
          icon="camera"
          onPress={() => {}}
          style={styles.button}
          disabled
        >
          Scan Image (Coming Soon)
        </Button>
      </View>

      <Portal>
        <Modal
          visible={c.modalVisible}
          onDismiss={() => c.setModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge">Paste recipe text</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Demo parse (no real AI). URLs are not supported — paste ingredients and steps as text.
          </Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={6}
            value={c.text}
            onChangeText={c.setText}
            placeholder="Paste ingredients and instructions here..."
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={c.parseAndContinue}
            loading={c.loading}
            disabled={c.loading || !c.text}
          >
            Parse with AI
          </Button>
        </Modal>
      </Portal>
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
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  header: {
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  button: {
    paddingVertical: spacing.sm,
  },
  modal: {
    padding: spacing.xl,
    margin: spacing.lg,
    borderRadius: 8,
    gap: spacing.lg,
  },
  input: {
    maxHeight: 200,
  },
});
