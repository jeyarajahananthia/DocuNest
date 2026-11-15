
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import { registerUser } from '../services/authService';

import CustomMessageBox from '../components/CustomMessageBox';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // CUSTOM MESSAGE BOX STATE
  const [messageBox, setMessageBox] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
  });

  // SHOW MESSAGE
  const showMessage = (
    title,
    message,
    type = 'info',
    onConfirm = null
  ) => {
    setMessageBox({
      visible: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  // CLOSE MESSAGE BOX
  const closeMessageBox = () => {
    setMessageBox((previous) => ({
      ...previous,
      visible: false,
      onConfirm: null,
    }));
  };

  // HANDLE MESSAGE CONFIRMATION
  const handleMessageConfirm = () => {
    const callback = messageBox.onConfirm;

    closeMessageBox();

    if (callback) {
      callback();
    }
  };

  // REGISTER
  async function handleRegister() {
    if (loading) return;

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      showMessage(
        'Missing Information',
        'Please fill in all fields.',
        'error'
      );
      return;
    }

    if (password !== confirmPassword) {
      showMessage(
        'Password Error',
        'Passwords do not match.',
        'error'
      );
      return;
    }

    if (password.length < 8) {
      showMessage(
        'Password Error',
        'Password must contain at least 8 characters.',
        'error'
      );
      return;
    }

    try {
      setLoading(true);

      const result = await registerUser(
        name.trim(),
        email.trim(),
        password
      );

      if (result && result.success === false) {
        showMessage(
          'Registration Failed',
          result.message || 'Unable to create your account.',
          'error'
        );
        return;
      }

      showMessage(
        'Registration Successful',
        'Your DocuNest account has been created. Please log in.',
        'success',
        () => navigation.navigate('Login')
      );

    } catch (error) {
      console.error('Registration error:', error);

      showMessage(
        'Registration Failed',
        error.message || 'Unable to create your account.',
        'error'
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.logo}>📁 DocuNest</Text>

          <Text style={styles.subtitle}>
            Create your local account
          </Text>

          <Text style={styles.label}>Full Name</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />

          <Text style={styles.label}>Email Address</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={styles.label}>Password</Text>

          <TextInput
            style={styles.input}
            placeholder="Minimum 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <Text style={styles.label}>Confirm Password</Text>

          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.disabledButton,
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.loginLink}> Login</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            Your account is stored locally on this device.
          </Text>
        </View>
      </ScrollView>

      {/* CUSTOM MESSAGE BOX */}

      <CustomMessageBox
        visible={messageBox.visible}
        title={messageBox.title}
        message={messageBox.message}
        type={messageBox.type}
        confirmText="OK"
        onConfirm={handleMessageConfirm}
        onCancel={closeMessageBox}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#F4F6F8',
    padding: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 15,
    elevation: 3,
  },

  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#34495E',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    padding: 13,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
  },

  button: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
    flexWrap: 'wrap',
  },

  loginText: {
    color: '#666666',
    fontSize: 14,
  },

  loginLink: {
    color: '#3498DB',
    fontWeight: 'bold',
    fontSize: 14,
  },

  footer: {
    textAlign: 'center',
    color: '#7F8C8D',
    fontSize: 12,
    marginTop: 20,
  },
});
