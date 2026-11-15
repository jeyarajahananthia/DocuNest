
import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { deleteDocument } from '../database/database';
import CustomMessageBox from '../components/CustomMessageBox';

export default function DocumentDetailsScreen({ route, navigation }) {
  const [document, setDocument] = useState(route.params?.document);
  const [opening, setOpening] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [messageBox, setMessageBox] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: false,
    confirmText: 'OK',
    onConfirm: null,
  });

  useEffect(() => {
    setDocument(route.params?.document);
  }, [route.params?.document]);

  const isTextDocument =
    String(document?.fileType || '').toUpperCase() === 'TXT';

  // Show custom message box
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

  // Show custom confirmation box
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
      confirmText: 'Yes, Delete',
      onConfirm,
    });
  };

  const closeMessageBox = () => {
    setMessageBox((previous) => ({
      ...previous,
      visible: false,
      onConfirm: null,
    }));
  };

  const handleMessageConfirm = () => {
    const callback = messageBox.onConfirm;

    closeMessageBox();

    if (callback) {
      callback();
    }
  };

  // Open imported documents or show TXT content
  const openDocument = async () => {
    if (!document) return;

    if (isTextDocument) {
      if (!document.content || !document.content.trim()) {
        showMessage(
          'No Content',
          'This text document does not contain any saved content.',
          'info'
        );
      }
      return;
    }

    if (!document.fileUri) {
      showMessage(
        'File Not Found',
        'This document does not have a saved file.',
        'error'
      );
      return;
    }

    try {
      setOpening(true);

      if (Platform.OS === 'web') {
        const fileUrl = document.fileUri;

        if (fileUrl.startsWith('data:')) {
          const newTab = window.open('about:blank', '_blank');

          if (!newTab) {
            showMessage(
              'Popup Blocked',
              'Please allow popups for DocuNest and try again.',
              'error'
            );
            return;
          }

          try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            newTab.location.href = blobUrl;
          } catch (error) {
            newTab.close();
            throw error;
          }
        } else {
          const newTab = window.open(fileUrl, '_blank');

          if (!newTab) {
            showMessage(
              'Popup Blocked',
              'Please allow popups for DocuNest.',
              'error'
            );
          }
        }

        return;
      }

      await Linking.openURL(document.fileUri);

    } catch (error) {
      console.error('Document opening error:', error);

      showMessage(
        'Unable to Open',
        'Could not open this document. Make sure your device has an application that supports this file type.',
        'error'
      );
    } finally {
      setOpening(false);
    }
  };

  // Edit document
  const handleEdit = () => {
    navigation.navigate('EditDocument', {
      documentId: document.id,
    });
  };

  // Delete document
  const handleDelete = () => {
    showConfirmation(
      'Delete Document?',
      `Are you sure you want to delete "${document.name}"? This action cannot be undone.`,
      confirmDelete
    );
  };

  // Confirm and perform deletion
  const confirmDelete = async () => {
    try {
      setDeleting(true);

      await deleteDocument(document.id);

      showMessage(
        'Deleted Successfully',
        'The document has been deleted successfully.',
        'success',
        () => navigation.goBack()
      );

    } catch (error) {
      console.error('Document deletion error:', error);

      showMessage(
        'Delete Failed',
        error.message || 'Unable to delete the document.',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  };

  if (!document) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Document Not Found</Text>
        <Text>No document information is available.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>
            {isTextDocument ? '📝' : '📄'}
          </Text>

          <Text style={styles.title}>
            {document.name}
          </Text>

          <Text style={styles.subtitle}>
            Document Information
          </Text>
        </View>

        {/* Open Document Button */}
        {!isTextDocument && (
          <TouchableOpacity
            style={styles.openButton}
            onPress={openDocument}
            disabled={opening || deleting}
          >
            {opening ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.openButtonText}>
                📂 Open Document
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Edit Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
          disabled={deleting}
        >
          <Text style={styles.editButtonText}>
            ✏️ Edit Document
          </Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.deleteButtonText}>
              🗑️ Delete Document
            </Text>
          )}
        </TouchableOpacity>

        {/* TXT Document Content */}
        {isTextDocument && (
          <View style={styles.contentCard}>
            <Text style={styles.sectionTitle}>
              📝 Document Content
            </Text>

            {document.content && document.content.trim() ? (
              <Text selectable style={styles.documentContent}>
                {document.content}
              </Text>
            ) : (
              <Text style={styles.emptyContent}>
                No content has been saved in this document.
              </Text>
            )}
          </View>
        )}

        {/* General Information */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>
            General Information
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Document Name</Text>
            <Text style={styles.value}>
              {document.name || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>
              {document.description || 'No description available'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>
              {document.categoryName || 'Uncategorized'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>File Type</Text>
            <Text style={styles.value}>
              {document.fileType || 'Unknown'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>File Size</Text>
            <Text style={styles.value}>
              {isTextDocument
                ? `${Number(document.fileSize || 0)} characters`
                : `${(
                    Number(document.fileSize || 0) /
                    (1024 * 1024)
                  ).toFixed(2)} MB`}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Date Added</Text>
            <Text style={styles.value}>
              {document.dateAdded
                ? new Date(document.dateAdded).toLocaleDateString()
                : 'Not available'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Favorite</Text>
            <Text style={styles.value}>
              {document.isFavorite ? '⭐ Yes' : 'No'}
            </Text>
          </View>
        </View>

      </ScrollView>

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
    backgroundColor: '#F4F6F9',
    padding: 20,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  header: {
    alignItems: 'center',
    backgroundColor: '#34495E',
    padding: 25,
    borderRadius: 12,
    marginBottom: 20,
  },

  icon: {
    fontSize: 45,
    marginBottom: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#E0E6ED',
    marginTop: 8,
  },

  openButton: {
    backgroundColor: '#27AE60',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },

  openButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  editButton: {
    backgroundColor: '#3498DB',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },

  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  deleteButton: {
    backgroundColor: '#E74C3C',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },

  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  contentCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },

  documentContent: {
    fontSize: 16,
    lineHeight: 26,
    color: '#2C3E50',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },

  emptyContent: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 15,
  },

  detailRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 12,
  },

  label: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 5,
  },

  value: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2C3E50',
  },
});
