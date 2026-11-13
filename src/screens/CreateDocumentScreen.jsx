
import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
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

export default function CreateDocumentScreen({ navigation }) {
  const richText = useRef(null);

  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [categoryModal, setCategoryModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
      console.log('Category loading error:', error);
      Alert.alert('Error', 'Unable to load categories.');
    } finally {
      setLoading(false);
    }
  };

  // Save document
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a document title.');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Missing Category', 'Please select a category.');
      return;
    }

    try {
      setSaving(true);

      const htmlContent = await richText.current?.getContentHtml();

      const plainText = (htmlContent || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();

      if (!plainText) {
        Alert.alert('Empty Document', 'Please enter some content.');
        setSaving(false);
        return;
      }

      await addDocument(
        title.trim(),
        '',
        'RICH_TEXT',
        0,
        selectedCategory.id,
        null,
        htmlContent
      );

      Alert.alert(
        'Success',
        'Your document has been saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log('Save document error:', error);
      Alert.alert('Error', 'Unable to save the document.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#34495E" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >

        {/* Document Title */}
        <Text style={styles.label}>Document Title</Text>

        <TextInput
          style={styles.titleInput}
          placeholder="Enter document title"
          value={title}
          onChangeText={setTitle}
        />

        {/* Category Selection */}
        <Text style={styles.label}>Select Category</Text>

        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => setCategoryModal(true)}
        >
          <Text style={styles.categoryText}>
            {selectedCategory
              ? selectedCategory.name
              : 'Select a category'}
          </Text>

          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>

        {/* Formatting Toolbar */}
        <Text style={styles.label}>Format Your Document</Text>

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
        <Text style={styles.colorLabel}>Text Colour</Text>

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
            />
          ))}
        </View>

        {/* Rich Text Editor */}
        <View style={styles.editorContainer}>
          <RichEditor
            ref={richText}
            style={styles.editor}
            initialContentHTML="<p>Start writing your document here...</p>"
            placeholder="Write your document..."
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
              💾 Save Document
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
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCategoryModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
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
