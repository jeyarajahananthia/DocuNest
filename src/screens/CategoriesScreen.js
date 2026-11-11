
import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../database/database';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Categories loading error:', error);
      Alert.alert('Error', 'Unable to load categories.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadData() {
        try {
          setLoading(true);
          const data = await getCategories();

          if (active) {
            setCategories(data);
          }
        } catch (error) {
          console.error('Categories loading error:', error);
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

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setModalVisible(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a category name.');
      return;
    }

    try {
      setSaving(true);

      if (editingCategory) {
        await updateCategory(
          editingCategory.id,
          name,
          description
        );

        Alert.alert('Success', 'Category updated successfully.');
      } else {
        await addCategory(name, description);

        Alert.alert('Success', 'Category created successfully.');
      }

      setModalVisible(false);
      setName('');
      setDescription('');
      setEditingCategory(null);

      await loadCategories();
    } catch (error) {
      if (error.message?.includes('UNIQUE')) {
        Alert.alert('Duplicate Category', 'This category already exists.');
      } else {
        Alert.alert('Error', error.message || 'Unable to save category.');
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? Its documents will be kept as Uncategorized.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(category.id),
        },
      ]
    );
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      await loadCategories();

      Alert.alert('Success', 'Category deleted successfully.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to delete category.');
    }
  };

  const renderCategory = ({ item }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>📂 {item.name}</Text>

        <Text style={styles.categoryDescription}>
          {item.description || 'No description available.'}
        </Text>

        <Text style={styles.documentCount}>
          {item.documentCount || 0} documents
        </Text>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Categories</Text>

      <Text style={styles.subtitle}>
        Create and manage your document categories.
      </Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={openAddModal}
      >
        <Text style={styles.addButtonText}>
          + Add New Category
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#34495E"
          style={styles.loader}
        />
      ) : categories.length === 0 ? (
        <Text style={styles.emptyText}>
          No categories available.
        </Text>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCategory}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </Text>

            <Text style={styles.inputLabel}>Category Name</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter category name"
              value={name}
              onChangeText={setName}
              maxLength={50}
            />

            <Text style={styles.inputLabel}>Description</Text>

            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Enter category description"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={200}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {saving ? 'Saving...' : 'Save Category'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
              disabled={saving}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 18,
  },
  addButton: {
    backgroundColor: '#34495E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 18,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 30,
  },
  list: {
    paddingBottom: 20,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  categoryInfo: {
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666666',
  },
  documentCount: {
    fontSize: 12,
    color: '#26805B',
    marginTop: 8,
    fontWeight: 'bold',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#2980B9',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 7,
  },
  deleteButton: {
    backgroundColor: '#C0392B',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 7,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#777777',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 22,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#F4F6F9',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 15,
  },
  descriptionInput: {
    height: 85,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#34495E',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 13,
    alignItems: 'center',
    marginTop: 5,
  },
  cancelText: {
    color: '#C0392B',
    fontWeight: 'bold',
  },
});
