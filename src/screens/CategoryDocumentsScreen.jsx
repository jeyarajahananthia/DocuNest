
import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { getAllDocuments } from '../database/database';

export default function CategoryDocumentsScreen({ route, navigation }) {
  const { category } = route.params;

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadDocuments = async () => {
        try {
          setLoading(true);

          const allDocuments = await getAllDocuments();

          const filteredDocuments = allDocuments.filter(
            (document) =>
              String(document.categoryId) === String(category.id)
          );

          if (active) {
            setDocuments(filteredDocuments);
          }
        } catch (error) {
          console.error('Category documents loading error:', error);
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      loadDocuments();

      return () => {
        active = false;
      };
    }, [category.id])
  );

  const renderDocument = ({ item }) => (
    <TouchableOpacity
      style={styles.documentCard}
      onPress={() =>
        navigation.navigate('DocumentDetails', {
          document: item,
        })
      }
    >
      <View style={styles.documentInfo}>
        <Text style={styles.documentName}>
          📄 {item.name}
        </Text>

        <Text style={styles.documentType}>
          File type: {item.fileType || 'Unknown'}
        </Text>

        <Text style={styles.documentDescription}>
          {item.description || 'No description available.'}
        </Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Categories')}
      >
        <Text style={styles.backText}>
          ← Back to Categories
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        {category.name}
      </Text>

      <Text style={styles.subtitle}>
        Documents in this category
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#34495E"
          style={styles.loader}
        />
      ) : documents.length === 0 ? (
        <Text style={styles.emptyText}>
          No documents found in this category.
        </Text>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderDocument}
          contentContainerStyle={styles.list}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F4F6F9',
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: '#2980B9',
    fontSize: 15,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 20,
  },
  loader: {
    marginTop: 30,
  },
  list: {
    paddingBottom: 20,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 7,
  },
  documentType: {
    fontSize: 13,
    color: '#2980B9',
    marginBottom: 5,
  },
  documentDescription: {
    fontSize: 13,
    color: '#777777',
  },
  arrow: {
    fontSize: 28,
    color: '#3498DB',
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777777',
    marginTop: 30,
    fontSize: 15,
  },
});
