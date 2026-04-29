import React from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSignupController } from '../controllers';

export default function SignupScreen() {
  const router = useRouter();
  const c = useSignupController();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <Text variant="headlineMedium" style={styles.title}>Create account</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Sign up to use SimpleChef</Text>

        <TextInput
          label="Full Name"
          value={c.fullName}
          onChangeText={c.setFullName}
          autoComplete="name"
          style={styles.input}
          mode="outlined"
        />
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
          onPress={() => c.signup(() => router.replace('/'))}
          loading={c.loading}
          disabled={c.loading}
          style={styles.button}
        >
          Sign Up
        </Button>

        <Button
          mode="text"
          onPress={() => router.back()}
          style={styles.link}
        >
          Already have an account? Sign in
        </Button>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  error: {
    color: '#b00020',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  link: {
    marginTop: 16,
  },
});
