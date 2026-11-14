
import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import {
  getCategories,
  addDocument,
} from '../database/database';

// ========================================
// WEB TEXT EDITOR
// ========================================

function WebTextEditor({ editorRef }) {
  return (
    <div
      ref={editorRef}
      contentEditable="true"
      suppressContentEditableWarning
      spellCheck={true}
      role="textbox"
      aria-label="Document content editor"
      aria-multiline="true"
      data-placeholder="Start writing your document here..."
      style={{
        minHeight: '350px',
        padding: '15px',
        fontSize: '16px',
        color: '#222222',
        backgroundColor: '#FFFFFF',
        outline: 'none',
        cursor: 'text',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        width: '100%',
        boxSizing: 'border-box',
        lineHeight: '1.6',
      }}
    />
  );
}

// ========================================
// MAIN CREATE DOCUMENT SCREEN
// ========================================

export default function CreateDocumentScreen({ navigation }) {
  const editorRef = useRef(null);
  const savedSelection = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ========================================
  // LOAD CATEGORIES
  // ========================================

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
      window.alert('Unable to load categories.');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // PRESERVE TEXT SELECTION
  // ========================================

  const rememberSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (editor.contains(range.commonAncestorContainer)) {
      savedSelection.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const editor = editorRef.current;

    if (!editor) return;

    editor.focus();

    const selection = window.getSelection();

    if (selection && savedSelection.current) {
      selection.removeAllRanges();
      selection.addRange(savedSelection.current);
    }
  };

  // ========================================
  // FORMATTING
  // ========================================

  const applyFormatting = (command, value = null) => {
    const editor = editorRef.current;

    if (!editor) return;

    restoreSelection();

    document.execCommand(command, false, value);

    rememberSelection();
  };

  // ========================================
  // SAVE DOCUMENT AS TXT
  // ========================================

  const handleSave = async () => {
    if (!title.trim()) {
      window.alert('Please enter a document title.');
      return;
    }

    if (!selectedCategory) {
      window.alert('Please select a category.');
      return;
    }

    try {
      setSaving(true);

      const editor = editorRef.current;

      const plainText = editor?.innerText?.trim() || '';

      if (!plainText) {
        window.alert('Please enter some content.');
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

      window.alert('Your TXT document has been saved successfully!');

      // Clear form
      setTitle('');
      setDescription('');

      setSelectedCategory(
        categories.length > 0 ? categories[0] : null
      );

      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }

      savedSelection.current = null;

      // Navigate to Documents tab
      navigation.navigate('Documents');

    } catch (error) {
      console.error('Save document error:', error);
      window.alert('Unable to save the document.');
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // LOADING SCREEN
  // ========================================

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

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
        />

        {/* Category Selection */}

        <Text style={styles.label}>
          Select Category
        </Text>

        <View style={styles.categoryContainer}>
          {categories.length === 0 ? (
            <Text style={styles.emptyText}>
              No categories available. Please create a category first.
            </Text>
          ) : (
            categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory?.id === category.id &&
                    styles.selectedCategoryChip,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory?.id === category.id &&
                      styles.selectedCategoryText,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Editor Heading */}

        <Text style={styles.label}>
          Write Your Document
        </Text>

        {/* Formatting Toolbar */}

        <View style={styles.toolbar}>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => applyFormatting('bold')}
            onPressIn={rememberSelection}
          >
            <Text style={styles.boldText}>B</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => applyFormatting('italic')}
            onPressIn={rememberSelection}
          >
            <Text style={styles.italicText}>I</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => applyFormatting('underline')}
            onPressIn={rememberSelection}
          >
            <Text style={styles.underlineText}>U</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => applyFormatting('formatBlock', 'H1')}
            onPressIn={rememberSelection}
          >
            <Text style={styles.toolText}>H1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => applyFormatting('formatBlock', 'H2')}
            onPressIn={rememberSelection}
          >
            <Text style={styles.toolText}>H2</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => applyFormatting('insertUnorderedList')}
            onPressIn={rememberSelection}
          >
            <Text style={styles.toolText}>• List</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => applyFormatting('insertOrderedList')}
            onPressIn={rememberSelection}
          >
            <Text style={styles.toolText}>1. List</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => applyFormatting('justifyLeft')}
            onPressIn={rememberSelection}
          >
            <Text style={styles.toolText}>Left</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => applyFormatting('justifyCenter')}
            onPressIn={rememberSelection}
          >
            <Text style={styles.toolText}>Center</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => applyFormatting('justifyRight')}
            onPressIn={rememberSelection}
          >
            <Text style={styles.toolText}>Right</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => applyFormatting('undo')}
          >
            <Text style={styles.toolText}>↶</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => applyFormatting('redo')}
          >
            <Text style={styles.toolText}>↷</Text>
          </TouchableOpacity>

        </View>

        {/* Text Colours */}

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
              onPress={() => applyFormatting('foreColor', color)}
              onPressIn={rememberSelection}
            />
          ))}
        </View>

        {/* Web Rich Text Editor */}

        <View style={styles.editorContainer}>
          <WebTextEditor editorRef={editorRef} />
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
    </View>
  );
}

// ========================================
// STYLES
// ========================================

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
    color: '#555555',
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495E',
    marginTop: 12,
    marginBottom: 8,
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

  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryChip: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5D8DC',
  },

  selectedCategoryChip: {
    backgroundColor: '#34495E',
    borderColor: '#34495E',
  },

  categoryChipText: {
    color: '#34495E',
    fontSize: 14,
  },

  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  emptyText: {
    color: '#777777',
    paddingVertical: 10,
  },

  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    padding: 6,
    gap: 5,
  },

  toolButton: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 7,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F4',
    borderRadius: 5,
  },

  toolText: {
    color: '#34495E',
    fontSize: 13,
    fontWeight: '600',
  },

  boldText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#34495E',
  },

  italicText: {
    fontStyle: 'italic',
    fontSize: 16,
    color: '#34495E',
  },

  underlineText: {
    textDecorationLine: 'underline',
    fontSize: 16,
    color: '#34495E',
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
    cursor: 'pointer',
  },

  editorContainer: {
    minHeight: 350,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
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

});
