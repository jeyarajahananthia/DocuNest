
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';

import {
  getDocumentById,
  getCategories,
  updateDocument,
} from '../database/database';

export default function EditDocumentScreen({ route, navigation }) {
  const documentId = route.params?.documentId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Display messages on web and mobile
  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Load existing document and categories
  useEffect(() => {
    loadData();
  }, [documentId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const document = await getDocumentById(documentId);
      const categoryList = await getCategories();

      if (!document) {
        showMessage('Error', 'Document not found.');
        navigation.goBack();
        return;
      }

      setName(document.name || '');
      setDescription(document.description || '');
      setCategoryId(document.categoryId ?? null);
      setCategories(categoryList);

    } catch (error) {
      console.error('Loading error:', error);
      showMessage('Error', 'Unable to load document details.');
    } finally {
      setLoading(false);
    }
  };

  // Save updated document
  const handleUpdate = async () => {
    if (!name.trim()) {
      showMessage('Validation Error', 'Please enter a document name.');
      return;
    }

    try {
      setSaving(true);

      await updateDocument(
        documentId,
        name,
        description,
        categoryId
      );

      const updatedDocument = await getDocumentById(documentId);

      showMessage(
        'Success',
        'Document updated successfully!'
      );

      // Return to Document Details with updated information
      navigation.navigate('DocumentDetails', {
        document: updatedDocument,
      });

    } catch (error) {
      console.error('Update error:', error);
      showMessage(
        'Error',
        error.message || 'Unable to update document.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#34495E" />
        <Text style={styles.loadingText}>Loading document...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >

      <View style={styles.header}>
        <Text style={styles.headerIcon}>✏️</Text>
        <Text style={styles.title}>Edit Document</Text>
        <Text style={styles.subtitle}>
          Update your document information
        </Text>
      </View>

      {/* Document Name */}
      <View style={styles.formCard}>

        <Text style={styles.label}>Document Name *</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter document name"
          placeholderTextColor="#999"
        />

        {/* Description */}
        <Text style={styles.label}>Description</Text>

        <TextInput
          style={[styles.input, styles.descriptionInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter document description"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Categories */}
        <Text style={styles.label}>Select Category</Text>

        <View style={styles.categoryContainer}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              categoryId === null && styles.selectedCategory,
            ]}
            onPress={() => setCategoryId(null)}
          >
            <Text
              style={[
                styles.categoryText,
                categoryId === null && styles.selectedCategoryText,
              ]}
            >
              Uncategorized
            </Text>
          </TouchableOpacity>

          {categories.map((category) => {
            const selected = categoryId === category.id;

            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selected && styles.selectedCategory,
                ]}
                onPress={() => setCategoryId(category.id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selected && styles.selectedCategoryText,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleUpdate}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>
            💾 Save Changes
          </Text>
        )}
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
        disabled={saving}
      >
        <Text style={styles.cancelButtonText}>
          Cancel
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },

  content: {
    padding: 20,
    paddingBottom: 35,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F9',
  },

  loadingText: {
    marginTop: 12,
    color: '#34495E',
    fontSize: 15,
  },

  header: {
    backgroundColor: '#34495E',
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },

  headerIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: 14,
    color: '#E0E6ED',
    marginTop: 8,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: '#D5DCE3',
    borderRadius: 8,
    padding: 13,
    fontSize: 15,
    color: '#2C3E50',
    backgroundColor: '#FFFFFF',
  },

  descriptionInput: {
    height: 100,
  },

  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
  },

  categoryButton: {
    borderWidth: 1,
    borderColor: '#D5DCE3',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
  },

  selectedCategory: {
    backgroundColor: '#34495E',
    borderColor: '#34495E',
  },

  categoryText: {
    color: '#34495E',
    fontSize: 13,
    fontWeight: '500',
  },

  selectedCategoryText: {
    color: '#FFFFFF',
  },

  saveButton: {
    backgroundColor: '#27AE60',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cancelButton: {
    backgroundColor: '#E5E7EB',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#34495E',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
