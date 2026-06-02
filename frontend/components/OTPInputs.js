import React, { useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet,
  Platform
} from 'react-native';
import { Colors } from '../constants/Colors';

export default function OTPInputs({ 
  length = 6, 
  value, 
  onChangeText, 
  onFocus, 
  onBlur, 
  error,
  isLoading = false
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    // Ensure cursor is positioned correctly when focused
    if (inputRef.current && !isLoading) {
      // Set cursor position to the end of the current text
      const position = value ? value.length : 0;
      inputRef.current.setSelection(position, position);
    }
  }, [value, isLoading]);

  const handleChangeText = (text) => {
    // Remove non-numeric characters and limit to length
    const cleanText = text.replace(/[^0-9]/g, '').slice(0, length);
    onChangeText(cleanText);
  };

  const handleFocus = () => {
    // Set cursor to the end when focused
    if (inputRef.current) {
      const position = value ? value.length : 0;
      inputRef.current.setSelection(position, position);
    }
    if (onFocus) onFocus();
  };

  const getBorderColor = () => {
    if (error) return '#EF4444'; // Red for error
    if (value && value.length === length) return '#0FAB0F'; // Green when complete
    if (inputRef.current?.isFocused()) return Colors.primary; // Blue when focused
    return '#E5E7EB'; // Default gray
  };

  const getBackgroundColor = () => {
    if (error) return '#FEE2E2';
    if (value && value.length === length) return '#F0FDF4';
    if (inputRef.current?.isFocused()) return `${Colors.primary}08`;
    return '#F9FAFB';
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          }
        ]}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={onBlur}
        placeholder={`Enter ${length}-digit code`}
        placeholderTextColor="#9CA3AF"
        keyboardType="number-pad"
        maxLength={length}
        editable={!isLoading}
        autoFocus={true}
        returnKeyType="done"
        textAlign="center"
        textAlignVertical="center"
        fontSize={18}
        fontWeight="600"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '80%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
});