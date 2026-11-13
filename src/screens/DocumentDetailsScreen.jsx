
import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { deleteDocument } from '../database/database';

export default function DocumentDetailsScreen({ route, navigation }) {
  const [document, setDocument] = useState(route.params?.document);
  const [opening, setOpening] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setDocument(route.params?.document);
  }, [route.params?.document]);

  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Open the imported document
  const openDocument = async () => {
    if (!document?.fileUri) {
      showMessage('File Not Found', 'This document does not have a saved file.');
      return;
    }

    try {
      setOpening(true);

      if (Platform.OS === 'web') {
        let fileUrl = document.fileUri;

        if (fileUrl.startsWith('data:')) {
          const newTab = window.open('about:blank', '_blank');

          if (!newTab) {
            showMessage(
              'Popup Blocked',
              'Please allow popups for DocuNest and try again.'
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
            showMessage('Popup Blocked', 'Please allow popups for DocuNest.');
          }
        }

        return;
      }

      await Linking.openURL(document.fileUri);

    } catch (error) {
      console.error('Document opening error:', error);

      showMessage(
        'Unable to Open',
        'Could not open this document. Make sure your device has an application that supports this file type.'
      );
    } finally {
      setOpening(false);
    }
  };

  // Navigate to Edit Document screen
  const handleEdit = () => {
    navigation.navigate('EditDocument', {
      documentId: document.id,
    });
  };

  // Delete document
  
const handleDelete = () => {
  const confirmDelete = async () => {
    try {
      setDeleting(true);

      await deleteDocument(document.id);

      showMessage(
        'Deleted Successfully',
        'The document has been deleted successfully.'
      );

      navigation.goBack();

    } catch (error) {
      console.error('Document deletion error:', error);

      showMessage(
        'Delete Failed',
        error.message || 'Unable to delete the document.'
      );
    } finally {
      setDeleting(false);
    }
  };

  if (Platform.OS === 'web') {
    const confirmed = window.confirm(
      'Are you sure you want to delete this file?'
    );

    if (confirmed) {
      confirmDelete();
    }
  } else {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this file?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
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
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>📄</Text>

        <Text style={styles.title}>
          {document.name}
        </Text>

        <Text style={styles.subtitle}>
          Document Information
        </Text>
      </View>

      {/* Open Document Button */}
      <TouchableOpacity
        style={styles.openButton}
        onPress={openDocument}
        disabled={opening}
      >
        {opening ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.openButtonText}>
            📂 Open Document
          </Text>
        )}
      </TouchableOpacity>

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
            {(Number(document.fileSize || 0) / (1024 * 1024)).toFixed(2)} MB
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    padding: 20,
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
