
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';

import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';

import { initializeDatabase } from './src/database/database';

import {
  checkAuthSession,
  logout,
} from './src/services/authService';

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await initializeDatabase();

        console.log('DocuNest database initialized!');

        // Check whether a valid login session exists
        const session = await checkAuthSession();

        setAuthenticated(session.authenticated);
        setReady(true);
      } catch (err) {
        console.error('DocuNest setup error:', err);
        setError(err.message || 'Something went wrong.');
      }
    }

    setup();
  }, []);

  // Called after successful login
  const handleAuthSuccess = () => {
    setAuthenticated(true);
  };

  // Called after logout
  const handleLogout = async () => {
    try {
      await logout();
      setAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Database Error: {error}
        </Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#34495E" />
        <Text style={styles.loadingText}>
          Preparing DocuNest...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {authenticated ? (
        <AppNavigator onLogout={handleLogout} />
      ) : (
        <AuthNavigator onAuthSuccess={handleAuthSuccess} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
  },

  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});
