import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, TextInput, Modal, Portal, ActivityIndicator, Snackbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { recipeService } from '../../services/api';
import { spacing } from '../../theme/spacing';

export default function AddScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [text, setText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const handleManual = () => {
    router.push('/add/manual');
  };

  const handleParse = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const parsedData = await recipeService.parse(text);
      // Pass data to manual screen (edit mode)
      // We can use context or params. Params for large objects might be tricky in some navs, 
      // but expo-router handles generic objects via params if stringified.
      router.push({
        pathname: '/add/manual',
        params: { initialData: JSON.stringify(parsedData) }
      });
      setModalVisible(false);
      setText('');
    } catch (error) {
      console.error(error);
      setSnackbar('Failed to parse recipe. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.header}>Add New Recipe</Text>
        
        <Button 
          mode="contained" 
          icon="pencil" 
          onPress={handleManual} 
          style={styles.button}
        >
          Enter Manually
        </Button>

        <Button 
          mode="contained" 
          icon="magic-staff" 
          onPress={() => setModalVisible(true)} 
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
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
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
            value={text}
            onChangeText={setText}
            placeholder="Paste ingredients and instructions here..."
            style={styles.input}
          />
          <Button 
            mode="contained" 
            onPress={handleParse} 
            loading={loading}
            disabled={loading || !text}
          >
            Parse with AI
          </Button>
        </Modal>
      </Portal>
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
