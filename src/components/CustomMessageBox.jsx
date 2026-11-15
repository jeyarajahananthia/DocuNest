
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';

export default function CustomMessageBox({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  onConfirm,
  onCancel,
}) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'confirm':
        return '?';
      default:
        return 'ℹ';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#27AE60';
      case 'error':
        return '#E74C3C';
      case 'confirm':
        return '#E67E22';
      default:
        return '#3498DB';
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleCancel}
        />

        <View style={styles.messageBox}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${getIconColor()}18` },
            ]}
          >
            <Text style={[styles.icon, { color: getIconColor() }]}>
              {getIcon()}
            </Text>
          </View>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: getIconColor() },
                showCancel && styles.buttonWithCancel,
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
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
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },

  iconContainer: {
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  icon: {
    fontSize: 34,
    fontWeight: 'bold',
  },

  title: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
  },

  message: {
    fontSize: 15,
    color: '#667085',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 25,
  },

  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 9,
    backgroundColor: '#EDF0F4',
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#34495E',
    fontSize: 15,
    fontWeight: 'bold',
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 9,
    alignItems: 'center',
  },

  buttonWithCancel: {
    flex: 1,
  },

  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
