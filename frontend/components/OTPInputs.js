import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography } from '../constants/Colors';

export default function OTPInputs({ 
  length = 6, 
  value, 
  onChangeText, 
  onFocus, 
  onBlur, 
  error,
  focused 
}) {
  const inputRefs = useRef([]);
  const digits = value.split('');
  const { width } = Dimensions.get('window');

  const getBorderColor = (index) => {
    if (error) return Colors.secondary; // Orange for error
    if (digits[index]) return '#0FAB0F'; // Green when filled
    if (focused && index === digits.length) return Colors.primary; // Blue when focused
    return Colors.gray; // Default gray
  };

  const handleChangeText = (text, index) => {
    if (text.length > 1) {
      // Handle paste scenario
      const pastedDigits = text.slice(0, length).split('');
      const newValue = pastedDigits.join('');
      onChangeText(newValue);
      
      // Focus the last filled input or next empty one
      const nextIndex = Math.min(pastedDigits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Handle single digit input
    const newDigits = [...digits];
    newDigits[index] = text;
    
    // Remove empty elements and join
    const newValue = newDigits.join('').slice(0, length);
    onChangeText(newValue);

    // Auto-focus next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      // Focus previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index) => {
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    if (onBlur) onBlur();
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }, (_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.input,
            { borderColor: getBorderColor(index) },
          ]}
          value={digits[index] || ''}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          maxLength={1}
          keyboardType="numeric"
          textAlign="center"
          selectTextOnFocus
          blurOnSubmit={false}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8, // Better spacing between inputs
    paddingHorizontal: 10,
  },
  input: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: Colors.white,
    ...Typography.h3,
    color: Colors.dark,
    fontWeight: '600',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
