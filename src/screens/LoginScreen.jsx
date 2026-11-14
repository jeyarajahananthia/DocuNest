
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';

import { loginUser } from '../services/authService';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Details', 'Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser(email.trim(), password);

      if (result.success) {
        onLoginSuccess?.();
      } else {
        Alert.alert('Login Failed', result.message || 'Invalid email or password.');
      }
    } catch (error) {
      Alert.alert('Login Error', error.message || 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>

          <Text style={styles.logo}>📁</Text>

          <Text style={styles.title}>DocuNest</Text>

          <Text style={styles.subtitle}>
            Your Personal File Organizer
          </Text>

          <View style={styles.card}>
            <Text style={styles.heading}>Welcome Back!</Text>

            <Text style={styles.description}>
              Login to access your personal documents.
            </Text>

            <Text style={styles.label}>Email Address</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>LOGIN</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>
                Don't have an account?
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.registerLink}> Register</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>
            Secure • Simple • Offline
          </Text>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  container: {
    padding: 24,
    alignItems: 'center',
  },

  logo: {
    fontSize: 55,
    marginBottom: 8,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34495E',
  },

  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 5,
    marginBottom: 30,
  },

  card: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 15,
    elevation: 4,
  },

  heading: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 8,
  },

  description: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 8,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
  },

  loginButton: {
    height: 50,
    backgroundColor: '#34495E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },

  registerText: {
    color: '#666666',
    fontSize: 14,
  },

  registerLink: {
    color: '#3498DB',
    fontSize: 14,
    fontWeight: 'bold',
  },

  footer: {
    color: '#999999',
    fontSize: 12,
    marginTop: 25,
  },
});
