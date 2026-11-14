
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';

export default function SettingsScreen({ onLogout }) {

  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const showAbout = () => {
    showMessage(
      'About DocuNest',
      'DocuNest is a personal file organizer application developed using React Native and SQLite. It allows users to organize and manage documents locally.'
    );
  };

  const showStorageInfo = () => {
    showMessage(
      'Storage Information',
      'DocuNest stores its document information in a local SQLite database. Imported files will also be stored locally.'
    );
  };

  const showOfflineInfo = () => {
    showMessage(
      'Offline Mode',
      'DocuNest is designed to work offline. No internet connection is required to access locally stored information.'
    );
  };

  // LOGOUT
  const confirmLogout = () => {

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Are you sure you want to log out of DocuNest?'
      );

      if (confirmed) {
        handleLogout();
      }

    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to log out of DocuNest?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: handleLogout,
          },
        ]
      );
    }
  };

  // EXECUTE LOGOUT
  const handleLogout = async () => {
    try {
      if (typeof onLogout !== 'function') {
        throw new Error('Logout function is not connected.');
      }

      await onLogout();

    } catch (error) {
      console.error('Logout failed:', error);

      showMessage(
        'Logout Error',
        error.message || 'Unable to log out. Please try again.'
      );
    }
  };

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>Settings</Text>

      <Text style={styles.subtitle}>
        Manage your DocuNest application.
      </Text>

      {/* APPLICATION SETTINGS */}
      <View style={styles.section}>

        <Text style={styles.sectionTitle}>Application</Text>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={showAbout}
        >
          <Text style={styles.settingIcon}>ℹ️</Text>

          <View style={styles.settingContent}>
            <Text style={styles.settingName}>
              About DocuNest
            </Text>
            <Text style={styles.settingDescription}>
              Application information
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={showStorageInfo}
        >
          <Text style={styles.settingIcon}>💾</Text>

          <View style={styles.settingContent}>
            <Text style={styles.settingName}>
              Storage Information
            </Text>
            <Text style={styles.settingDescription}>
              Learn about local storage
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={showOfflineInfo}
        >
          <Text style={styles.settingIcon}>📴</Text>

          <View style={styles.settingContent}>
            <Text style={styles.settingName}>
              Offline Mode
            </Text>
            <Text style={styles.settingDescription}>
              Learn about offline functionality
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

      </View>

      {/* ACCOUNT SETTINGS */}
      <View style={styles.section}>

        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={confirmLogout}
        >
          <Text style={styles.settingIcon}>🚪</Text>

          <View style={styles.settingContent}>
            <Text style={[styles.settingName, styles.logoutText]}>
              Logout
            </Text>

            <Text style={styles.settingDescription}>
              Sign out of your local account
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

      </View>

      {/* APPLICATION DETAILS */}
      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          Application Details
        </Text>

        <View style={styles.infoCard}>

          <Text style={styles.infoLabel}>
            Application Name
          </Text>
          <Text style={styles.infoValue}>DocuNest</Text>

          <View style={styles.separator} />

          <Text style={styles.infoLabel}>Technology</Text>
          <Text style={styles.infoValue}>
            React Native + Expo
          </Text>

          <View style={styles.separator} />

          <Text style={styles.infoLabel}>Database</Text>
          <Text style={styles.infoValue}>SQLite</Text>

          <View style={styles.separator} />

          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>

        </View>

      </View>

      <Text style={styles.footer}>
        DocuNest © 2026
        {'\n'}
        Your personal file organizer
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 12,
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },

  settingIcon: {
    fontSize: 23,
    marginRight: 14,
  },

  settingContent: {
    flex: 1,
  },

  settingName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3E50',
  },

  logoutText: {
    color: '#E74C3C',
  },

  settingDescription: {
    fontSize: 12,
    color: '#777777',
    marginTop: 5,
  },

  arrow: {
    fontSize: 25,
    color: '#777777',
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 10,
    elevation: 2,
  },

  infoLabel: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 5,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#34495E',
  },

  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 13,
  },

  footer: {
    textAlign: 'center',
    color: '#888888',
    fontSize: 13,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 30,
  },

});
