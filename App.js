
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

import { initializeDatabase } from './src/database/database';

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function setup() {
      try {
        await initializeDatabase();
        console.log('DocuNest database initialized!');
        setReady(true);
      } catch (err) {
        console.error('Database error:', err);
        setError(err.message);
      }
    }

    setup();
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Database Error: {error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#34495E" />
        <Text style={{ marginTop: 10 }}>
          Preparing DocuNest...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
