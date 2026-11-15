
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
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../database/database';

import CustomMessageBox from '../components/CustomMessageBox';

export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Custom message box state
  const [messageBox, setMessageBox] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: false,
    confirmText: 'OK',
    onConfirm: null,
  });

  // Show custom message
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
      showCancel: false,
      confirmText: 'OK',
      onConfirm,
    });
  };

  // Show custom confirmation
  const showConfirmation = (
    title,
    message,
    onConfirm
  ) => {
    setMessageBox({
      visible: true,
      title,
      message,
      type: 'confirm',
      showCancel: true,
      confirmText: 'Delete',
      onConfirm,
    });
  };

  // Close message box
  const closeMessageBox = () => {
    setMessageBox((previous) => ({
      ...previous,
      visible: false,
      onConfirm: null,
    }));
  };

  // Handle message box confirmation
  const handleMessageConfirm = () => {
    const callback = messageBox.onConfirm;

    closeMessageBox();

    if (callback) {
      callback();
    }
  };

  // Load categories from SQLite
  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
    return data;
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

          if (active) {
            showMessage(
              'Loading Failed',
              'Unable to load categories. Please try again.',
              'error'
            );
          }
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

  // Open category documents
  const openCategory = (category) => {
    navigation.navigate('CategoryDocuments', {
      category: category,
    });
  };

  // Open add category modal
  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setModalVisible(true);
  };

  // Open edit category modal
  const openEditModal = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setModalVisible(true);
  };

  // Save category
  const handleSave = async () => {
    if (saving) return;

    if (!name.trim()) {
      showMessage(
        'Category Name Required',
        'Please enter a category name.',
        'error'
      );
      return;
    }

    try {
      setSaving(true);

      if (editingCategory) {
        await updateCategory(
          editingCategory.id,
          name.trim(),
          description.trim()
        );
      } else {
        await addCategory(
          name.trim(),
          description.trim()
        );
      }

      const wasEditing = Boolean(editingCategory);

      setModalVisible(false);
      setName('');
      setDescription('');
      setEditingCategory(null);

      await loadCategories();

      showMessage(
        wasEditing ? 'Category Updated!' : 'Category Created!',
        wasEditing
          ? 'Your category has been updated successfully.'
          : 'Your new category has been created successfully.',
        'success'
      );

    } catch (error) {
      console.error('Category saving error:', error);

      if (error.message?.includes('UNIQUE')) {
        showMessage(
          'Duplicate Category',
          'This category already exists. Please choose another name.',
          'error'
        );
      } else {
        showMessage(
          'Save Failed',
          error.message || 'Unable to save the category.',
          'error'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // Ask before deleting category
  const confirmDelete = (category) => {
    if (deleting) return;

    showConfirmation(
      'Delete Category?',
      `Are you sure you want to delete "${category.name}"? Its documents will be kept as Uncategorized.`,
      () => handleDelete(category.id)
    );
  };

  // Delete category
  const handleDelete = async (id) => {
    try {
      setDeleting(true);

      await deleteCategory(id);
      await loadCategories();

      showMessage(
        'Category Deleted!',
        'The category has been deleted successfully. Its documents have been kept as Uncategorized.',
        'success'
      );

    } catch (error) {
      console.error('Category deletion error:', error);

      showMessage(
        'Delete Failed',
        error.message || 'Unable to delete the category.',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  };

  // Render category card
  const renderCategory = ({ item }) => (
    <View style={styles.categoryCard}>

      {/* Clickable category information */}
      <TouchableOpacity
        style={styles.categoryInfo}
        onPress={() => openCategory(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.categoryName}>
          📂 {item.name}
        </Text>

        <Text style={styles.categoryDescription}>
          {item.description || 'No description available.'}
        </Text>

        <Text style={styles.documentCount}>
          {item.documentCount || 0} documents
        </Text>

        <Text style={styles.viewText}>
          Tap to view documents →
        </Text>
      </TouchableOpacity>

      {/* Edit and Delete buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
          disabled={saving || deleting}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item)}
          disabled={saving || deleting}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>

    </View>
  );

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>My Categories</Text>

        <Text style={styles.subtitle}>
          Create and manage your document categories.
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
          disabled={saving || deleting}
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

        {/* Add / Edit Category Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {
            if (!saving) setModalVisible(false);
          }}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingCategory
                  ? 'Edit Category'
                  : 'Add New Category'}
              </Text>

              <Text style={styles.inputLabel}>
                Category Name
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter category name"
                value={name}
                onChangeText={setName}
                maxLength={50}
                editable={!saving}
              />

              <Text style={styles.inputLabel}>
                Description
              </Text>

              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Enter category description"
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={200}
                editable={!saving}
              />

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  saving && styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    Save Category
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      {/* Reusable Custom Message Box */}
      <CustomMessageBox
        visible={messageBox.visible}
        title={messageBox.title}
        message={messageBox.message}
        type={messageBox.type}
        showCancel={messageBox.showCancel}
        confirmText={messageBox.confirmText}
        onConfirm={handleMessageConfirm}
        onCancel={closeMessageBox}
      />
    </>
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

  viewText: {
    fontSize: 13,
    color: '#2980B9',
    fontWeight: '600',
    marginTop: 10,
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

  disabledButton: {
    opacity: 0.6,
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
