
import React, { useState, useCallback } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import { File, Directory, Paths } from 'expo-file-system';

import { useFocusEffect } from '@react-navigation/native';

import {
  getCategories,
  addDocument,
} from '../database/database';

// Maximum file size for browser testing: 5 MB
const MAX_WEB_FILE_SIZE = 5 * 1024 * 1024;

// ========================================
// DISPLAY FILE SIZE
// ========================================

function formatFileSize(bytes) {
  const size = Number(bytes) || 0;

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
// DISPLAY MESSAGES
// ========================================

function showMessage(title, message) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

// ========================================
// CONVERT BROWSER FILE TO BASE64
// ========================================

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);

    reader.onerror = () => {
      reject(new Error('Unable to read the selected file.'));
    };

    reader.readAsDataURL(file);
  });
}

// ========================================
// ADD DOCUMENT SCREEN
// ========================================

export default function AddDocumentScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // ========================================
  // LOAD CATEGORIES
  // ========================================

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadCategories() {
        try {
          const data = await getCategories();

          if (active) {
            setCategories(data);
          }
        } catch (error) {
          console.error('Category loading error:', error);
          showMessage('Error', 'Unable to load categories.');
        }
      }

      loadCategories();

      return () => {
        active = false;
      };
    }, [])
  );

  // ========================================
  // SELECT DOCUMENT
  // ========================================

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      setSelectedFile(file);

      if (!name.trim()) {
        setName(file.name.replace(/\.[^/.]+$/, ''));
      }

    } catch (error) {
      console.error('File selection error:', error);

      showMessage(
        'Error',
        'Unable to select the document.'
      );
    }
  };

  // ========================================
  // SAVE DOCUMENT
  // ========================================

  const handleSave = async () => {
    if (saving) return;

    if (!selectedFile) {
      showMessage('Missing File', 'Please select a document.');
      return;
    }

    if (!name.trim()) {
      showMessage('Missing Name', 'Please enter a document name.');
      return;
    }

    if (!selectedCategory) {
      showMessage('Missing Category', 'Please select a category.');
      return;
    }

    let copiedFile = null;

    try {
      setSaving(true);

      let savedFileUri = '';
      let fileSize = Number(selectedFile.size) || 0;

      console.log('Starting document save...');
      console.log('Selected file:', selectedFile.name);

      // ========================================
      // WEB STORAGE
      // ========================================

      if (Platform.OS === 'web') {
        let browserFile = selectedFile.file;

        if (!browserFile) {
          const response = await fetch(selectedFile.uri);
          browserFile = await response.blob();
        }

        // Get actual browser file size
        fileSize = browserFile.size;

        if (fileSize > MAX_WEB_FILE_SIZE) {
          showMessage(
            'File Too Large',
            'Please select a file smaller than 5 MB for browser testing.'
          );

          return;
        }

        const base64Data = await convertFileToBase64(browserFile);

        savedFileUri = base64Data;

        console.log('Browser file converted successfully.');
      }

      // ========================================
      // ANDROID / IOS STORAGE
      // ========================================

      else {
        const sourceFile = new File(selectedFile.uri);

        // Get actual file size if picker size is unavailable
        if (!fileSize) {
          fileSize = Number(sourceFile.size) || 0;
        }

        if (!fileSize) {
          throw new Error('Unable to determine the selected file size.');
        }

        const folder = new Directory(
          Paths.document,
          'DocuNestFiles'
        );

        if (!folder.exists) {
          folder.create({
            idempotent: true,
            intermediates: true,
          });
        }

        const safeName = selectedFile.name.replace(
          /[^a-zA-Z0-9._-]/g,
          '_'
        );

        const uniqueName = `${Date.now()}_${safeName}`;

        copiedFile = new File(folder, uniqueName);

        await sourceFile.copy(copiedFile);

        savedFileUri = copiedFile.uri;

        console.log('File copied to:', savedFileUri);
      }

      // ========================================
      // GET FILE EXTENSION
      // ========================================

      const extension = selectedFile.name.includes('.')
        ? selectedFile.name.split('.').pop().toUpperCase()
        : 'FILE';

      // ========================================
      // SAVE TO SQLITE
      // ========================================

      await addDocument(
        name.trim(),
        description.trim(),
        extension,
        fileSize,
        selectedCategory,
        savedFileUri
      );

      console.log('Document saved successfully!');
      console.log('Actual file size:', fileSize, 'bytes');

      showMessage(
        'Success',
        `Document imported successfully!\nFile size: ${formatFileSize(fileSize)}`
      );

      // Clear form
      setName('');
      setDescription('');
      setSelectedFile(null);
      setSelectedCategory(null);

      navigation.navigate('AllDocuments');

    } catch (error) {
      console.error('Document import error:', error);

      // Remove copied file if database saving failed
      if (copiedFile) {
        try {
          if (copiedFile.exists) {
            copiedFile.delete();
          }
        } catch (deleteError) {
          console.error('File cleanup error:', deleteError);
        }
      }

      showMessage(
        'Import Failed',
        error.message || 'Unable to save the document.'
      );

    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // UI
  // ========================================

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>
        Import Document
      </Text>

      {/* Select File */}
      <TouchableOpacity
        style={styles.fileButton}
        onPress={pickDocument}
        disabled={saving}
      >
        <Text style={styles.fileButtonText}>
          📁 Select Document
        </Text>
      </TouchableOpacity>

      {/* Selected File Information */}
      {selectedFile && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>
            Selected: {selectedFile.name}
          </Text>

          <Text style={styles.fileSize}>
            File Size: {formatFileSize(selectedFile.size)}
          </Text>
        </View>
      )}

      {/* Document Name */}
      <Text style={styles.label}>
        Document Name
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter document name"
        value={name}
        onChangeText={setName}
      />

      {/* Description */}
      <Text style={styles.label}>
        Description
      </Text>

      <TextInput
        style={[styles.input, styles.description]}
        placeholder="Enter document description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Categories */}
      <Text style={styles.label}>
        Select Category
      </Text>

      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id &&
              styles.selectedCategory,
          ]}
          onPress={() => setSelectedCategory(category.id)}
          disabled={saving}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.id &&
                styles.selectedCategoryText,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Save Button */}
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
          <Text style={styles.saveButtonText}>
            Save Document
          </Text>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F4F6F8',
    flexGrow: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 25,
  },

  fileButton: {
    backgroundColor: '#34495E',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },

  fileButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  fileInfo: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginTop: 15,
    borderRadius: 8,
  },

  fileName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },

  fileSize: {
    color: '#34495E',
    marginTop: 4,
  },

  label: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#34495E',
  },

  input: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D5D8DC',
  },

  description: {
    height: 90,
    textAlignVertical: 'top',
  },

  categoryButton: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D5D8DC',
  },

  selectedCategory: {
    backgroundColor: '#D6EAF8',
    borderColor: '#3498DB',
  },

  categoryText: {
    color: '#34495E',
  },

  selectedCategoryText: {
    fontWeight: 'bold',
  },

  saveButton: {
    backgroundColor: '#27AE60',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 30,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
