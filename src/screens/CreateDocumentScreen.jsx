
import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';

import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';

import {
  getCategories,
  addDocument,
} from '../database/database';

import CustomMessageBox from '../components/CustomMessageBox';

export default function CreateDocumentScreen({ navigation }) {
  const richText = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [categoryModal, setCategoryModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Close message box
  const closeMessageBox = () => {
    setMessageBox((previous) => ({
      ...previous,
      visible: false,
      onConfirm: null,
    }));
  };

  // Handle message confirmation
  const handleMessageConfirm = () => {
    const callback = messageBox.onConfirm;

    closeMessageBox();

    if (callback) {
      callback();
    }
  };

  // Load categories from SQLite
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await getCategories();

      setCategories(result || []);

      if (result && result.length > 0) {
        setSelectedCategory(result[0]);
      }
    } catch (error) {
      console.error('Category loading error:', error);

      showMessage(
        'Loading Failed',
        'Unable to load categories. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Convert HTML content into readable plain text
  const convertHtmlToText = (html) => {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .trim();
  };

  // Save document as TXT
  const handleSave = async () => {
    if (saving) return;

    if (!title.trim()) {
      showMessage(
        'Missing Title',
        'Please enter a document title.',
        'warning'
      );
      return;
    }

    if (!selectedCategory) {
      showMessage(
        'Missing Category',
        'Please select a category.',
        'warning'
      );
      return;
    }

    try {
      setSaving(true);

      const htmlContent = await richText.current?.getContentHtml();

      const plainText = convertHtmlToText(htmlContent || '');

      if (!plainText) {
        showMessage(
          'Empty Document',
          'Please enter some content before saving.',
          'warning'
        );
        return;
      }

      await addDocument(
        title.trim(),
        description.trim(),
        'TXT',
        plainText.length,
        selectedCategory.id,
        '',
        plainText
      );

      showMessage(
        'Document Saved!',
        'Your TXT document has been saved successfully.',
        'success',
        () => navigation.navigate('Documents')
      );

    } catch (error) {
      console.error('Save document error:', error);

      showMessage(
        'Save Failed',
        error.message || 'Unable to save the document. Please try again.',
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
          Loading categories...
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Document Title */}
          <Text style={styles.label}>
            Document Title
          </Text>

          <TextInput
            style={styles.titleInput}
            placeholder="Enter document title"
            value={title}
            onChangeText={setTitle}
            editable={!saving}
          />

          {/* Description */}
          <Text style={styles.label}>
            Description (Optional)
          </Text>

          <TextInput
            style={styles.descriptionInput}
            placeholder="Enter document description"
            value={description}
            onChangeText={setDescription}
            multiline
            editable={!saving}
          />

          {/* Category Selection */}
          <Text style={styles.label}>
            Select Category
          </Text>

          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => setCategoryModal(true)}
            disabled={saving}
          >
            <Text style={styles.categoryText}>
              {selectedCategory
                ? selectedCategory.name
                : 'Select a category'}
            </Text>

            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>

          {/* Formatting Toolbar */}
          <Text style={styles.label}>
            Format Your Document
          </Text>

          <View style={styles.toolbarContainer}>
            <RichToolbar
              editor={richText}
              actions={[
                actions.setBold,
                actions.setItalic,
                actions.setUnderline,
                actions.heading1,
                actions.heading2,
                actions.insertBulletsList,
                actions.insertOrderedList,
                actions.alignLeft,
                actions.alignCenter,
                actions.alignRight,
                actions.undo,
                actions.redo,
              ]}
            />
          </View>

          {/* Text Colour Options */}
          <Text style={styles.colorLabel}>
            Text Colour
          </Text>

          <View style={styles.colorContainer}>
            {[
              '#000000',
              '#E74C3C',
              '#3498DB',
              '#27AE60',
              '#8E44AD',
              '#F39C12',
            ].map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                ]}
                onPress={() =>
                  richText.current?.setForeColor(color)
                }
                disabled={saving}
              />
            ))}
          </View>

          {/* Rich Text Editor */}
          <View style={styles.editorContainer}>
            <RichEditor
              ref={richText}
              style={styles.editor}
              initialContentHTML=""
              placeholder="Start writing your document here..."
              editorStyle={{
                backgroundColor: '#FFFFFF',
                color: '#222222',
                placeholderColor: '#999999',
                contentCSSText: 'font-size: 16px; padding: 10px;',
              }}
              useContainer={true}
            />
          </View>

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
                💾 Save TXT Document
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Category Selection Modal */}
        <Modal
          visible={categoryModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setCategoryModal(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                Select Category
              </Text>

              {categories.length === 0 ? (
                <Text style={styles.emptyText}>
                  No categories available. Please create a category first.
                </Text>
              ) : (
                <FlatList
                  data={categories}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.categoryItem}
                      onPress={() => {
                        setSelectedCategory(item);
                        setCategoryModal(false);
                      }}
                    >
                      <Text style={styles.categoryItemText}>
                        {item.name}
                      </Text>

                      {selectedCategory?.id === item.id && (
                        <Text style={styles.checkMark}>
                          ✓
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                />
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCategoryModal(false)}
              >
                <Text style={styles.closeButtonText}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      {/* Custom Message Box */}
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
    backgroundColor: '#F4F6F8',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#555',
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 8,
    marginTop: 12,
  },

  titleInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },

  descriptionInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 65,
    textAlignVertical: 'top',
  },

  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  categoryText: {
    fontSize: 15,
    color: '#34495E',
  },

  dropdownIcon: {
    color: '#34495E',
  },

  toolbarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D5D8DC',
  },

  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginTop: 12,
    marginBottom: 8,
  },

  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },

  editorContainer: {
    minHeight: 350,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    overflow: 'hidden',
  },

  editor: {
    minHeight: 350,
    backgroundColor: '#FFFFFF',
  },

  saveButton: {
    backgroundColor: '#34495E',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    maxHeight: '70%',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 15,
  },

  categoryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  categoryItemText: {
    fontSize: 16,
    color: '#333333',
  },

  checkMark: {
    color: '#27AE60',
    fontWeight: 'bold',
    fontSize: 18,
  },

  emptyText: {
    color: '#777777',
    paddingVertical: 15,
  },

  closeButton: {
    backgroundColor: '#34495E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },

  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
