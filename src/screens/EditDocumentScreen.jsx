
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
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
  const [content, setContent] = useState('');

  const [isTextDocument, setIsTextDocument] = useState(false);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Custom message box
  const [messageVisible, setMessageVisible] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [messageAction, setMessageAction] = useState(null);

  const showMessage = (title, message, type = 'success', action = null) => {
    setMessageTitle(title);
    setMessageText(message);
    setMessageType(type);
    setMessageAction(() => action);
    setMessageVisible(true);
  };

  const closeMessage = () => {
    setMessageVisible(false);

    if (messageAction) {
      const action = messageAction;
      setMessageAction(null);
      action();
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
        showMessage(
          'Document Not Found',
          'The requested document could not be found.',
          'error',
          () => navigation.goBack()
        );
        return;
      }

      setName(document.name || '');
      setDescription(document.description || '');
      setCategoryId(document.categoryId ?? null);
      setCategories(categoryList || []);

      const isTXT =
        String(document.fileType || '').toUpperCase() === 'TXT';

      setIsTextDocument(isTXT);
      setContent(document.content || '');

    } catch (error) {
      console.error('Loading error:', error);

      showMessage(
        'Loading Failed',
        'Unable to load document details.',
        'error',
        () => navigation.goBack()
      );
    } finally {
      setLoading(false);
    }
  };

  // Save updated document
  const handleUpdate = async () => {
    if (saving) return;

    if (!name.trim()) {
      showMessage(
        'Validation Error',
        'Please enter a document name.',
        'error'
      );
      return;
    }

    if (isTextDocument && !content.trim()) {
      showMessage(
        'Empty Document',
        'Please enter some document content.',
        'error'
      );
      return;
    }

    try {
      setSaving(true);

      await updateDocument(
        documentId,
        name.trim(),
        description.trim(),
        categoryId,
        isTextDocument ? content : undefined
      );

      const updatedDocument = await getDocumentById(documentId);

      showMessage(
        'Updated Successfully!',
        'Your document has been updated successfully.',
        'success',
        () => {
          navigation.navigate('DocumentDetails', {
            document: updatedDocument,
          });
        }
      );

    } catch (error) {
      console.error('Update error:', error);

      showMessage(
        'Update Failed',
        error.message || 'Unable to update the document.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#34495E" />
        <Text style={styles.loadingText}>
          Loading document...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>✏️</Text>

          <Text style={styles.title}>
            Edit Document
          </Text>

          <Text style={styles.subtitle}>
            Update your document information and content
          </Text>
        </View>

        <View style={styles.formCard}>

          {/* Document Name */}
          <Text style={styles.label}>
            Document Name *
          </Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter document name"
            placeholderTextColor="#999"
          />

          {/* Description */}
          <Text style={styles.label}>
            Description
          </Text>

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

          {/* Existing TXT Content Editor */}
          {isTextDocument && (
            <View style={styles.editorSection}>

              <Text style={styles.label}>
                Document Content
              </Text>

              <Text style={styles.editorHint}>
                Your existing content is loaded below. Edit it and save your changes.
              </Text>

              <TextInput
                style={styles.contentEditor}
                value={content}
                onChangeText={setContent}
                placeholder="Start writing your document..."
                placeholderTextColor="#999"
                multiline
                textAlignVertical="top"
                scrollEnabled={false}
              />

              <Text style={styles.characterCount}>
                {content.length} characters
              </Text>

            </View>
          )}

          {/* Categories */}
          <Text style={styles.label}>
            Select Category
          </Text>

          <View style={styles.categoryContainer}>

            <TouchableOpacity
              style={[
                styles.categoryButton,
                categoryId === null && styles.selectedCategory,
              ]}
              onPress={() => setCategoryId(null)}
              disabled={saving}
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
              const selected =
                String(categoryId) === String(category.id);

              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selected && styles.selectedCategory,
                  ]}
                  onPress={() => setCategoryId(category.id)}
                  disabled={saving}
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
          style={[
            styles.saveButton,
            saving && styles.disabledButton,
          ]}
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

      {/* CENTRED CUSTOM MESSAGE BOX */}
      <Modal
        visible={messageVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMessage}
      >
        <View style={styles.messageOverlay}>
          <View style={styles.messageBox}>

            <View
              style={[
                styles.messageIcon,
                messageType === 'success'
                  ? styles.successIcon
                  : styles.errorIcon,
              ]}
            >
              <Text style={styles.messageIconText}>
                {messageType === 'success' ? '✓' : '!'}
              </Text>
            </View>

            <Text style={styles.messageTitle}>
              {messageTitle}
            </Text>

            <Text style={styles.messageText}>
              {messageText}
            </Text>

            <TouchableOpacity
              style={[
                styles.messageButton,
                messageType === 'success'
                  ? styles.successButton
                  : styles.errorButton,
              ]}
              onPress={closeMessage}
              activeOpacity={0.8}
            >
              <Text style={styles.messageButtonText}>
                OK
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },

  container: {
    flex: 1,
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
    textAlign: 'center',
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

  editorSection: {
    marginTop: 10,
  },

  editorHint: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 10,
    lineHeight: 20,
  },

  contentEditor: {
    minHeight: 300,
    borderWidth: 1,
    borderColor: '#B8C6D3',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    lineHeight: 25,
    color: '#2C3E50',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },

  characterCount: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'right',
    marginTop: 7,
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

  disabledButton: {
    opacity: 0.6,
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

  // Custom message box styles
  messageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  messageBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },

  messageIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  successIcon: {
    backgroundColor: '#D5F5E3',
  },

  errorIcon: {
    backgroundColor: '#FDEDEC',
  },

  messageIconText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34495E',
  },

  messageTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#34495E',
    textAlign: 'center',
    marginBottom: 10,
  },

  messageText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 22,
  },

  messageButton: {
    width: '100%',
    padding: 14,
    borderRadius: 9,
    alignItems: 'center',
  },

  successButton: {
    backgroundColor: '#27AE60',
  },

  errorButton: {
    backgroundColor: '#34495E',
  },

  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
