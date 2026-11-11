
import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import {
  getAllDocuments,
  getCategories,
} from '../database/database';

export default function SearchScreen({ navigation }) {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadData() {
        try {
          setLoading(true);

          const documentData = await getAllDocuments();
          const categoryData = await getCategories();

          if (active) {
            setDocuments(documentData);
            setCategories(categoryData);
          }
        } catch (error) {
          console.error('Search data loading error:', error);
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      loadData();

      return () => {
        active = false;
      };
    }, [])
  );

  const filteredDocuments = documents.filter((item) => {
    const search = searchText.toLowerCase().trim();

    const matchesSearch =
      item.name?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.categoryName?.toLowerCase().includes(search);

    const matchesCategory =
      selectedCategory === 'All' ||
      item.categoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const renderDocument = ({ item }) => (
    <TouchableOpacity
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

      <Text style={styles.documentDescription}>
        {item.description || 'No description available.'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Documents</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or description..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <Text style={styles.filterTitle}>Filter by Category</Text>

      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'All' && styles.selectedCategory,
          ]}
          onPress={() => setSelectedCategory('All')}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === 'All' && styles.selectedCategoryText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={String(category.id)}
            style={[
              styles.categoryButton,
              selectedCategory === category.name && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(category.name)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.name &&
                  styles.selectedCategoryText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.resultTitle}>
        Search Results ({filteredDocuments.length})
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#34495E"
          style={styles.loader}
        />
      ) : filteredDocuments.length === 0 ? (
        <Text style={styles.emptyText}>
          No matching documents found.
        </Text>
      ) : (
        <FlatList
          data={filteredDocuments}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    fontSize: 15,
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: '#E0E5EA',
    borderRadius: 20,
  },
  selectedCategory: {
    backgroundColor: '#34495E',
  },
  categoryText: {
    color: '#34495E',
    fontSize: 13,
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  documentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 8,
  },
  documentInfo: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 13,
    color: '#777777',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777777',
    marginTop: 25,
  },
  loader: {
    marginTop: 30,
  },
  list: {
    paddingBottom: 20,
  },
});
