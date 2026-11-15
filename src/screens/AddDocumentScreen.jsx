
import React, { useState, useCallback } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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

import CustomMessageBox from '../components/CustomMessageBox';

// Maximum file size for browser testing: 5 MB
const MAX_WEB_FILE_SIZE = 20 * 1024 * 1024;

// Convert browser file into a Base64 data URL
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

export default function AddDocumentScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Custom message box state
  const [messageBox, setMessageBox] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
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

  // Handle OK button
  const handleMessageConfirm = () => {
    const callback = messageBox.onConfirm;

    closeMessageBox();

    if (callback) {
      callback();
    }
  };

  // Load categories from SQLite
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

          if (active) {
            showMessage(
              'Loading Failed',
              'Unable to load categories. Please try again.',
              'error'
            );
          }
        }
      }

      loadCategories();

      return () => {
        active = false;
      };
    }, [])
  );

  // Select a document
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
        'Selection Failed',
        'Unable to select the document.',
        'error'
      );
    }
  };

  // Save document
  const handleSave = async () => {
    console.log('Save button clicked');

    if (saving) {
      return;
    }

    if (!selectedFile) {
      showMessage(
        'Missing File',
        'Please select a document.',
        'error'
      );
      return;
    }

    if (!name.trim()) {
      showMessage(
        'Missing Name',
        'Please enter a document name.',
        'error'
      );
      return;
    }

    if (!selectedCategory) {
      showMessage(
        'Missing Category',
        'Please select a category.',
        'error'
      );
      return;
    }

    const fileSize = selectedFile.size || 0;

    if (
      Platform.OS === 'web' &&
      fileSize > MAX_WEB_FILE_SIZE
    ) {
      showMessage(
        'File Too Large',
        'Please select a file smaller than 5 MB for browser testing.',
        'error'
      );
      return;
    }

    let copiedFile = null;

    try {
      setSaving(true);

      console.log('Starting document save...');
      console.log('File:', selectedFile.name);
      console.log('Category:', selectedCategory);

      let savedFileUri = '';

      // WEB: Store file content in SQLite
      if (Platform.OS === 'web') {
        let browserFile = selectedFile.file;

        if (!browserFile) {
          const response = await fetch(selectedFile.uri);
          browserFile = await response.blob();
        }

        const base64Data = await convertFileToBase64(browserFile);

        savedFileUri = base64Data;

        console.log('Browser file converted successfully.');
      }

      // ANDROID / IOS: Copy file into app storage
      else {
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

        const sourceFile = new File(selectedFile.uri);

        copiedFile = new File(folder, uniqueName);

        await sourceFile.copy(copiedFile);

        savedFileUri = copiedFile.uri;

        console.log('File copied to:', savedFileUri);
      }

      // Get file extension
      const extension = selectedFile.name.includes('.')
        ? selectedFile.name.split('.').pop().toUpperCase()
        : 'FILE';

      // Save document details in SQLite
      await addDocument(
        name.trim(),
        description.trim(),
        extension,
        fileSize,
        selectedCategory,
        savedFileUri
      );

      console.log('Document saved successfully!');

      // Clear form after successful save
      setName('');
      setDescription('');
      setSelectedFile(null);
      setSelectedCategory(null);

      // Show success message before navigation
      showMessage(
        'Import Successful!',
        'Your document has been imported and saved successfully.',
        'success',
        () => navigation.navigate('Documents')
      );

    } catch (error) {
      console.error('Document import error:', error);

      // Remove copied file if SQLite saving failed
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
        error.message || 'Unable to save the document.',
        'error'
      );

    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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

            <Text>
              Size: {fileSizeInKB(selectedFile.size).toFixed(2)} KB
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
          editable={!saving}
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
          editable={!saving}
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

      {/* Custom Message Box */}
      <CustomMessageBox
        visible={messageBox.visible}
        title={messageBox.title}
        message={messageBox.message}
        type={messageBox.type}
        confirmText="OK"
        onConfirm={handleMessageConfirm}
        onCancel={closeMessageBox}
      />
    </>
  );
}

function fileSizeInKB(size) {
  return Number(size || 0) / 1024;
}

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
