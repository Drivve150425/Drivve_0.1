import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function ProfilePictureModal({
  visible,
  onClose,
  onCamera,
  onGallery,
  onAvatar,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideUpAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.8,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    console.log('🔌 Closing image picker modal');
    onClose();
  };

  const handleCameraPress = async () => {
    console.log('📷 Camera button pressed');
    // Close modal first
    onClose();
    
    // Then call camera after a small delay to let modal close
    setTimeout(() => {
      onCamera();
    }, 300);
  };

  const handleGalleryPress = async () => {
    console.log('🖼️ Gallery button pressed');
    // Close modal first
    onClose();
    
    // Then call gallery after a small delay to let modal close
    setTimeout(() => {
      onGallery();
    }, 300);
  };

  const handleAvatarPress = async () => {
    console.log('😊 Avatar button pressed');
    // Close modal first
    onClose();
    
    // Then call avatar after a small delay to let modal close
    setTimeout(() => {
      onAvatar();
    }, 300);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* Modal Content */}
      <View style={styles.centerContainer}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideUpAnim },
              ],
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="close" size={24} color={Colors.primary} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.headerIconContainer}>
            <View style={styles.largeIconContainer}>
              <MaterialIcons name="add-a-photo" size={56} color={Colors.primary} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Select Profile Picture</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Choose an option</Text>

          {/* Options Grid */}
          <View style={styles.optionsContainer}>
            {/* Camera Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleCameraPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[ Colors.light, Colors.light ]}//'#0B4A8F', '#0D3A6F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.optionGradient}
              >
                <View style={styles.optionIconContainer}>
                  <MaterialIcons name="camera-alt" size={40} color={Colors.primary} />
                </View>
                <Text style={styles.optionText}>Camera</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Gallery Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleGalleryPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[ Colors.light, Colors.light ]}//'#0B4A8F', '#0D3A6F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.optionGradient}
              >
                <View style={styles.optionIconContainer}>
                  <MaterialIcons name="image" size={40} color={Colors.primary} />
                </View>
                <Text style={styles.optionText}>Gallery</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Avatar Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleAvatarPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[ Colors.light, Colors.light ]}//'#0B4A8F', '#0D3A6F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.optionGradient}
              >
                <View style={styles.optionIconContainer}>
                  <MaterialIcons name="face" size={40} color={Colors.primary} />
                </View>
                <Text style={styles.optionText}>Avatar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 32,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerIconContainer: {
    marginBottom: 20,
  },
  largeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 28,
  },
  optionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    flex: 1,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  optionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(35, 74, 152, 0.19)',//'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.primary,//'#F3F4F6',
    borderWidth: 1.5,
    borderColor: Colors.primary,//'#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,//'#6B7280',
    textAlign: 'center',
  },
});
