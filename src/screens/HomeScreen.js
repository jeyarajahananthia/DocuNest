
import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import {
  getDashboardStats,
  getRecentDocuments,
} from '../database/database';

// ========================================
// FORMAT STORAGE SIZE
// ========================================

function formatStorage(bytes) {
  const size = Number(bytes) || 0;

  if (size === 0) {
    return '0 Bytes';
  }

  if (size < 1024) {
    return `${size} Bytes`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// ========================================
// HOME SCREEN
// ========================================

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalCategories: 0,
    totalStorage: 0,
  });

  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========================================
  // LOAD DASHBOARD DATA
  // ========================================

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadDashboard() {
        try {
          setLoading(true);

          const dashboardData = await getDashboardStats();
          const recentData = await getRecentDocuments();

          if (active) {
            setStats(dashboardData);
            setRecentDocuments(recentData);
          }
        } catch (error) {
          console.error('Dashboard loading error:', error);
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      loadDashboard();

      return () => {
        active = false;
      };
    }, [])
  );

  // ========================================
  // UI
  // ========================================

  return (
    <ScrollView style={styles.container}>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>
          Welcome to DocuNest!
        </Text>

        <Text style={styles.welcomeSubtitle}>
          Your personal file organizer
        </Text>
      </View>

      {/* Dashboard Statistics */}
      <Text style={styles.sectionTitle}>
        Dashboard Overview
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#34495E"
          style={styles.loader}
        />
      ) : (
        <View style={styles.statsContainer}>

          {/* Total Documents */}
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {stats.totalDocuments}
            </Text>

            <Text style={styles.statLabel}>
              Documents
            </Text>
          </View>

          {/* Total Categories */}
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {stats.totalCategories}
            </Text>

            <Text style={styles.statLabel}>
              Categories
            </Text>
          </View>

          {/* Total Storage */}
          <View style={styles.statCard}>
            <Text style={styles.storageNumber}>
              {formatStorage(stats.totalStorage)}
            </Text>

            <Text style={styles.statLabel}>
              Storage Used
            </Text>
          </View>

        </View>
      )}

      {/* Quick Access Menu */}
      <Text style={styles.sectionTitle}>
        Quick Access
      </Text>

      <View style={styles.menuContainer}>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('AllDocuments')}
        >
          <Text style={styles.menuButtonText}>
            📁 All Documents
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => navigation.navigate('AddDocument')}
        >
          <Text style={styles.quickButtonText}>
            📁 Import Document
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Categories')}
        >
          <Text style={styles.menuButtonText}>
            📂 Categories
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.menuButtonText}>
            🔍 Search Documents
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.menuButtonText}>
            ⚙️ Settings
          </Text>
        </TouchableOpacity>

      </View>

      {/* Recent Documents */}
      <Text style={styles.sectionTitle}>
        Recent Documents
      </Text>

      {loading ? (
        <ActivityIndicator
          size="small"
          color="#34495E"
        />
      ) : recentDocuments.length === 0 ? (
        <Text style={styles.emptyText}>
          No documents available. Import your first document!
        </Text>
      ) : (
        recentDocuments.map((item) => (
          <TouchableOpacity
            key={String(item.id)}
            style={styles.documentCard}
            onPress={() =>
              navigation.navigate('DocumentDetails', {
                document: item,
              })
            }
          >
            <Text style={styles.documentName}>
              📄 {item.name}
            </Text>

            <Text style={styles.documentInfo}>
              Category: {item.categoryName || 'Uncategorized'}
            </Text>

            <Text style={styles.documentInfo}>
              Type: {item.fileType || 'Unknown'}
            </Text>

            <Text style={styles.documentInfo}>
              Size: {formatStorage(item.fileSize)}
            </Text>
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: 30 }} />

    </ScrollView>
  );
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    padding: 15,
  },

  welcomeSection: {
    backgroundColor: '#34495E',
    padding: 25,
    borderRadius: 12,
    marginBottom: 20,
  },

  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },

  welcomeSubtitle: {
    fontSize: 15,
    color: '#E0E6ED',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 15,
    marginBottom: 12,
  },

  loader: {
    marginVertical: 20,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  statNumber: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#34495E',
  },

  storageNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#34495E',
    textAlign: 'center',
  },

  statLabel: {
    fontSize: 12,
    color: '#555555',
    marginTop: 8,
    textAlign: 'center',
  },

  menuContainer: {
    gap: 12,
  },

  menuButton: {
    backgroundColor: '#34495E',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },

  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  quickButton: {
    backgroundColor: '#34495E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },

  quickButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },

  documentCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },

  documentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },

  documentInfo: {
    fontSize: 13,
    color: '#666666',
    marginTop: 3,
  },

  emptyText: {
    color: '#777777',
    fontSize: 14,
    padding: 15,
    textAlign: 'center',
  },
});
