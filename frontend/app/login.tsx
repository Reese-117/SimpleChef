import React from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { spacing } from '../theme/spacing';
import { useAuthController } from '../controllers';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const c = useAuthController();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <Text variant="headlineMedium" style={styles.title}>SimpleChef</Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Sign in to continue
        </Text>

        <TextInput
          label="Email"
          value={c.email}
          onChangeText={c.setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Password"
          value={c.password}
          onChangeText={c.setPassword}
          secureTextEntry
          autoComplete="password"
          style={styles.input}
          mode="outlined"
        />

        {c.error ? <Text style={styles.error}>{c.error}</Text> : null}

        <Button
          mode="contained"
          onPress={() => c.login(() => router.replace('/'))}
          loading={c.loading}
          disabled={c.loading}
          style={styles.button}
        >
          Sign In
        </Button>

        <Button
          mode="text"
          onPress={() => router.push('/signup')}
          style={styles.link}
        >
          Create an account
        </Button>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  input: {
    marginBottom: spacing.lg,
  },
  error: {
    color: '#b00020',
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.sm,
  },
  link: {
    marginTop: spacing.lg,
  },
});
