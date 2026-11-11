
import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { getAllDocuments } from '../database/database';

export default function AllDocumentsScreen({ navigation }) {
  const [documents, setDocuments] = useState([]);

  const loadDocuments = useCallback(async () => {
    try {
      const data = await getAllDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Document loading error:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [loadDocuments])
  );

  const renderDocument = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('DocumentDetails', {
          document: item,
        })
      }
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>
          {item.fileType === 'PDF' ? '📕' :
           item.fileType === 'JPG' ? '🖼️' :
           item.fileType === 'DOCX' ? '📘' : '📄'}
        </Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>

        <Text style={styles.description}>
          {item.description}
        </Text>

        <Text style={styles.category}>
          {item.categoryName || 'Uncategorized'} • {item.fileType}
        </Text>

        <Text style={styles.size}>
          {(item.fileSize / 1024).toFixed(1)} KB
        </Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Documents</Text>

      <Text style={styles.subtitle}>
        {documents.length} documents available
      </Text>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDocument}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No documents found.
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#34495E',
    marginTop: 10,
  },

  subtitle: {
    color: '#777',
    marginTop: 5,
    marginBottom: 20,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },

  iconContainer: {
    backgroundColor: '#EAF0F6',
    padding: 12,
    borderRadius: 10,
  },

  icon: {
    fontSize: 25,
  },

  details: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#34495E',
  },

  description: {
    color: '#777',
    fontSize: 12,
    marginTop: 4,
  },

  category: {
    color: '#4779A9',
    fontSize: 12,
    marginTop: 5,
  },

  size: {
    color: '#999',
    fontSize: 11,
    marginTop: 4,
  },

  arrow: {
    fontSize: 25,
    color: '#888',
  },

  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 50,
  },
});
