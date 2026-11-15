
import React, { useState, useCallback } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import {
  getAllDocuments,
  getCategories,
  deleteDocument,
} from '../database/database';

import CustomMessageBox from '../components/CustomMessageBox';

// ========================================
// FORMAT FILE SIZE
// ========================================

function formatFileSize(bytes, fileType) {
  const size = Number(bytes) || 0;

  if (String(fileType || '').toUpperCase() === 'TXT') {
    return `${size} Characters`;
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
// ALL DOCUMENTS SCREEN
// ========================================

export default function AllDocumentsScreen({ navigation }) {

  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [loading, setLoading] = useState(true);
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

  // ========================================
  // CUSTOM MESSAGE
  // ========================================

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

  // ========================================
  // CUSTOM CONFIRMATION
  // ========================================

  const showConfirmation = (title, message, onConfirm) => {
    setMessageBox({
      visible: true,
      title,
      message,
      type: 'confirm',
      showCancel: true,
      confirmText: 'Yes, Delete',
      onConfirm,
    });
  };

  // ========================================
  // CLOSE MESSAGE BOX
  // ========================================

  const closeMessageBox = () => {
    setMessageBox((previous) => ({
      ...previous,
      visible: false,
      onConfirm: null,
    }));
  };

  // ========================================
  // CONFIRM MESSAGE BOX
  // ========================================

  const handleMessageConfirm = () => {
    const callback = messageBox.onConfirm;

    closeMessageBox();

    if (callback) {
      callback();
    }
  };

  // ========================================
  // LOAD DOCUMENTS AND CATEGORIES
  // ========================================

  const loadDocuments = async () => {
    try {
      setLoading(true);

      const [documentData, categoryData] = await Promise.all([
        getAllDocuments(),
        getCategories(),
      ]);

      setDocuments(documentData || []);
      setCategories(categoryData || []);

    } catch (error) {
      console.error('Loading documents error:', error);

      showMessage(
        'Error',
        'Unable to load documents.',
        'error'
      );

    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [])
  );

  // ========================================
  // SEARCH AND CATEGORY FILTER
  // ========================================

  const filteredDocuments = documents.filter((document) => {

    const matchesSearch =
      (document.name || '')
        .toLowerCase()
        .includes(searchText.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      String(document.categoryId) === String(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // ========================================
  // VIEW DOCUMENT
  // ========================================

  const handleView = (document) => {
    navigation.navigate('DocumentDetails', {
      document: document,
    });
  };

  // ========================================
  // EDIT DOCUMENT
  // ========================================

  const handleEdit = (document) => {
    navigation.navigate('EditDocument', {
      documentId: document.id,
    });
  };

  // ========================================
  // DELETE DOCUMENT
  // ========================================

  const handleDelete = (document) => {

    showConfirmation(
      'Delete Document?',
      `Are you sure you want to delete "${document.name}"? This action cannot be undone.`,
      () => confirmDelete(document)
    );
  };

  // ========================================
  // CONFIRM AND PERFORM DELETION
  // ========================================

  const confirmDelete = async (document) => {

    try {
      setDeleting(true);

      await deleteDocument(document.id);

      setDocuments((previousDocuments) =>
        previousDocuments.filter(
          (item) => item.id !== document.id
        )
      );

      showMessage(
        'Deleted Successfully',
        'The document has been deleted successfully.',
        'success'
      );

    } catch (error) {

      console.error('Delete document error:', error);

      showMessage(
        'Delete Failed',
        error.message || 'Unable to delete the document.',
        'error'
      );

    } finally {
      setDeleting(false);
    }
  };

  // ========================================
  // DOCUMENT CARD
  // ========================================

  const renderDocument = (document) => {

    const category = categories.find(
      (item) =>
        String(item.id) === String(document.categoryId)
    );

    return (
      <View
        key={document.id}
        style={styles.documentCard}
      >

        <View style={styles.documentHeader}>

          <Text style={styles.documentIcon}>
            {String(document.fileType || '').toUpperCase() === 'TXT'
              ? '📝'
              : '📄'}
          </Text>

          <View style={styles.documentInfo}>

            <Text style={styles.documentName}>
              {document.name}
            </Text>

            <Text style={styles.documentCategory}>
              Category: {category?.name || 'Uncategorized'}
            </Text>

          </View>

        </View>

        {document.description ? (
          <Text style={styles.description}>
            {document.description}
          </Text>
        ) : null}

        <View style={styles.detailsContainer}>

          <Text style={styles.detailText}>
            File Type: {document.fileType || document.type || 'FILE'}
          </Text>

          <Text style={styles.detailText}>
            File Size: {formatFileSize(
              document.fileSize,
              document.fileType
            )}
          </Text>

        </View>

        <View style={styles.buttonContainer}>

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleView(document)}
            disabled={deleting}
          >
            <Text style={styles.buttonText}>
              View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(document)}
            disabled={deleting}
          >
            <Text style={styles.buttonText}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(document)}
            disabled={deleting}
          >
            <Text style={styles.buttonText}>
              Delete
            </Text>
          </TouchableOpacity>

        </View>

      </View>
    );
  };

  // ========================================
  // UI
  // ========================================

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >

        <Text style={styles.title}>
          All Documents
        </Text>

        <Text style={styles.subtitle}>
          Manage your imported and created documents.
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search documents..."
          value={searchText}
          onChangeText={setSearchText}
        />

        <Text style={styles.sectionTitle}>
          Filter by Category
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory === 'All' &&
                styles.selectedFilter,
            ]}
            onPress={() => setSelectedCategory('All')}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === 'All' &&
                  styles.selectedFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {categories.map((category) => (

            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterButton,
                String(selectedCategory) === String(category.id) &&
                  styles.selectedFilter,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  String(selectedCategory) === String(category.id) &&
                    styles.selectedFilterText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>

          ))}

        </ScrollView>

        <Text style={styles.countText}>
          {filteredDocuments.length} Document(s) Found
        </Text>

        {loading ? (

          <ActivityIndicator
            size="large"
            color="#34495E"
            style={styles.loader}
          />

        ) : filteredDocuments.length === 0 ? (

          <View style={styles.emptyContainer}>

            <Text style={styles.emptyIcon}>
              📂
            </Text>

            <Text style={styles.emptyTitle}>
              No Documents Found
            </Text>

            <Text style={styles.emptyText}>
              Import a document or try a different search.
            </Text>

          </View>

        ) : (

          filteredDocuments.map(renderDocument)

        )}

      </ScrollView>

      {/* CUSTOM MESSAGE BOX */}

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

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#34495E',
  },

  subtitle: {
    color: '#7F8C8D',
    marginTop: 5,
    marginBottom: 20,
  },

  searchInput: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5D8DC',
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 10,
  },

  categoryScroll: {
    marginBottom: 15,
  },

  filterButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D5D8DC',
  },

  selectedFilter: {
    backgroundColor: '#34495E',
    borderColor: '#34495E',
  },

  filterText: {
    color: '#34495E',
    fontWeight: '500',
  },

  selectedFilterText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  countText: {
    color: '#7F8C8D',
    marginBottom: 15,
    fontWeight: '600',
  },

  documentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },

  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  documentIcon: {
    fontSize: 30,
    marginRight: 12,
  },

  documentInfo: {
    flex: 1,
  },

  documentName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#34495E',
  },

  documentCategory: {
    color: '#7F8C8D',
    marginTop: 5,
  },

  description: {
    color: '#566573',
    marginTop: 12,
  },

  detailsContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },

  detailText: {
    color: '#566573',
    fontSize: 13,
    marginBottom: 5,
  },

  buttonContainer: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 8,
  },

  viewButton: {
    flex: 1,
    backgroundColor: '#3498DB',
    padding: 11,
    borderRadius: 7,
    alignItems: 'center',
  },

  editButton: {
    flex: 1,
    backgroundColor: '#F39C12',
    padding: 11,
    borderRadius: 7,
    alignItems: 'center',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#E74C3C',
    padding: 11,
    borderRadius: 7,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  loader: {
    marginTop: 40,
  },

  emptyContainer: {
    alignItems: 'center',
    padding: 35,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 10,
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
  },

  emptyText: {
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
  },

});
