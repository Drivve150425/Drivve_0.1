import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Typography } from '../constants/Colors';

// import SVG avatars (requires react-native-svg + svg transformer)
import AvatarM1 from '../assets/avatars/avatarM1.svg';
import AvatarM2 from '../assets/avatars/avatarM2.svg';
import AvatarF1 from '../assets/avatars/avatarF1.svg';
import AvatarF2 from '../assets/avatars/avatarF2.svg';
import AvatarD1 from '../assets/avatars/avatarD1.svg';

const AVATARS = {
  male: [
    { id: 'avatarM1.svg', component: AvatarM1, name: 'Male 1', filename: 'avatarM1.svg' },
    { id: 'avatarM2.svg', component: AvatarM2, name: 'Male 2', filename: 'avatarM2.svg' },
  ],
  female: [
    { id: 'avatarF1.svg', component: AvatarF1, name: 'Female 1', filename: 'avatarF1.svg' },
    { id: 'avatarF2.svg', component: AvatarF2, name: 'Female 2', filename: 'avatarF2.svg' },
  ],
  default: [
    { id: 'avatarD1.svg', component: AvatarD1, name: 'Default 1', filename: 'avatarD1.svg' },
  ]
};

export default function AvatarPicker({ visible, onClose, onSelect, selectedAvatar }) {
  if (!visible) return null;

  const renderAvatar = (avatar, isGrayScale) => {
    const Icon = avatar.component;
    return Icon ? (
      <Icon width={40} height={40} style={isGrayScale ? styles.grayScaleSvg : null} />
    ) : (
      <Text style={[styles.avatarEmoji, isGrayScale && styles.grayScaleEmoji]}>
        {avatar.emoji}
      </Text>
    );
  };

  const renderAvatarSection = (title, avatars, isGrayScale = false) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.avatarRow}>
          {avatars.map((avatar) => (
            <TouchableOpacity
              key={avatar.id}
              style={[
                styles.avatarButton,
                selectedAvatar?.id === avatar.id && styles.selectedAvatar,
                isGrayScale && styles.grayScaleAvatar
              ]}
              onPress={() => {
                onSelect(avatar);
                onClose();
              }}
            >
              {renderAvatar(avatar, isGrayScale)}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Avatar</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {renderAvatarSection('Male Avatars', AVATARS.male)}
          {renderAvatarSection('Female Avatars', AVATARS.female)}
          {renderAvatarSection('Default Avatars', AVATARS.default, true)}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  title: {
    ...Typography.h3,
    color: Colors.primary,
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    color: Colors.gray,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    ...Typography.body1,
    color: Colors.dark,
    fontWeight: '600',
    marginBottom: 15,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 15,
  },
  avatarButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatar: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  avatarEmoji: {
    fontSize: 30,
  },
  grayScaleAvatar: {
    backgroundColor: '#f0f0f0',
  },
  grayScaleEmoji: {
    opacity: 0.6,
  },
  grayScaleSvg: {
    opacity: 0.6,
  },
});