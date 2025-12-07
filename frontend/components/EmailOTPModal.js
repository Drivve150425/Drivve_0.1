import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import SuccessAnimation from '../components/SuccessAnimation';

const { width, height } = Dimensions.get('window');

export default function EmailOTPModal({
  visible,
  email,
  onClose,
  onVerify,
  isLoading,
  verificationSuccess, // NEW: Pass success state from parent
  verificationError, // NEW: Pass error from parent
}) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [totalTime] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // FIX 2: Watch for verification success/error from parent
  useEffect(() => {
    if (verificationSuccess) {
      console.log('✅ Verification successful, showing success animation');
      setShowSuccess(true);
      setError('');
    } else if (verificationError) {
      console.log('❌ Verification failed:', verificationError);
      setError(verificationError);
      setShowSuccess(false);
    }
  }, [verificationSuccess, verificationError]);

  // Timer effect
  useEffect(() => {
    if (visible && timeLeft > 0 && !showSuccess) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible, timeLeft, showSuccess]);

  // Main animation effect
  useEffect(() => {
    if (visible && !showSuccess) {
      setTimeLeft(300);
      setCanResend(false);
      setOtp('');
      setError('');
      setResendCount(0);
      setIsFocused(false);
      setShowSuccess(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.8,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, showSuccess]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const timerProgress = 1 - (timeLeft / totalTime);

  const handleOTPChange = (value) => {
    const cleanValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(cleanValue);
    setError(''); // Clear error when user types

    if (cleanValue.length === 6 && !isLoading) {
      setTimeout(() => {
        handleVerify(cleanValue);
      }, 200);
    }
  };

  const handleVerify = (otpValue) => {
    if (!otpValue || otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (isLoading) return;
    
    console.log('📤 Verifying OTP:', otpValue);
    // Call parent verify - parent will handle success/error
    onVerify(otpValue);
  };

  const handleResend = () => {
    if (isLoading || resendCount >= 2) return;

    setOtp('');
    setError('');
    setTimeLeft(300);
    setCanResend(false);
    setResendCount(resendCount + 1);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // FIX 1: Only allow closing with X button or after verification completes
  const handleClose = () => {
    // Don't allow closing during loading
    if (isLoading) {
      console.log('⏳ Cannot close while verifying');
      return;
    }
    
    console.log('❌ Closing email OTP modal');
    Keyboard.dismiss();
    setShowSuccess(false);
    setOtp('');
    setError('');
    onClose();
  };

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  const handleSuccessClose = () => {
    console.log('✅ Closing success animation');
    setShowSuccess(false);
    Keyboard.dismiss();
    onClose();
  };

  // FIX 3: Use SuccessAnimation component instead of LottieView
  if (showSuccess) {
    return (
      <SuccessAnimation
        visible={visible && showSuccess}
        message="Email Verified!"
        subMessage="Your email has been successfully verified"
        onAnimationComplete={handleSuccessClose}
        autoClose={true}
        autoCloseDelay={2500}
      />
    );
  }

  // OTP Modal
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => {}} // FIX 1: Disable back button closing
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Backdrop - FIX 1: Disable backdrop tap */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.backdropTouchable} />
        </Animated.View>

        {/* Centered Modal Content */}
        <View style={styles.centerContainer}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* FIX 1: Close button always visible */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={isLoading}
            >
              <MaterialIcons 
                name="close" 
                size={24} 
                color={isLoading ? '#D1D5DB' : Colors.primary} 
              />
            </TouchableOpacity>

            {/* Header Icon */}
            <View style={styles.headerIconSection}>
              <View style={styles.largeIconContainer}>
                <MaterialIcons name="mark-email-read" size={64} color={Colors.primary} />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>OTP Verification</Text>

            {/* Email Info */}
            <View style={styles.emailSection}>
              <Text style={styles.instructionText}>
                Enter the verification code sent to
              </Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>

            {/* Hidden TextInput */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={otp}
              onChangeText={handleOTPChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="000000"
              placeholderTextColor={Colors.gray}
              keyboardType="number-pad"
              maxLength={6}
              editable={!isLoading}
              autoFocus={true}
              returnKeyType="done"
            />

            {/* OTP Input Boxes with Dynamic Border Colors */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => !isLoading && inputRef.current?.focus()}
              style={styles.otpDisplayContainer}
              disabled={isLoading}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => {
                let borderColor = '#D1D5DB';
                let backgroundColor = '#F9FAFB';

                if (error) {
                  borderColor = '#EF4444';
                  backgroundColor = '#FEE2E2';
                } else if (otp[index]) {
                  borderColor = '#0FAB0F';
                  backgroundColor = '#F0FDF4';
                } else if (isFocused) {
                  borderColor = Colors.primary;
                  backgroundColor = `${Colors.primary}08`;
                }

                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      {
                        borderColor,
                        backgroundColor,
                      },
                    ]}
                  >
                    <Text style={styles.otpBoxText}>
                      {otp[index] ? otp[index] : ''}
                    </Text>
                  </View>
                );
              })}
            </TouchableOpacity>

            {/* FIX 2: Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Timer Bar */}
            <View style={styles.timerBarContainer}>
              <View style={styles.timerBarBackground}>
                <View
                  style={[
                    styles.timerBarFill,
                    {
                      width: `${timerProgress * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (isLoading || otp.length < 6) && styles.verifyButtonDisabled,
              ]}
              onPress={() => handleVerify(otp)}
              disabled={isLoading || otp.length < 6}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.primary, '#0D3A6F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color={Colors.white}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.verifyButtonText}>Verifying...</Text>
                  </>
                ) : (
                  <>
                    
                    <Text style={styles.verifyButtonText}>Verify OTP</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend Section */}
            <View style={styles.resendSection}>
              <Text style={styles.resendQuestion}>Didn't receive the code?</Text>
              {canResend && resendCount < 2 ? (
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={isLoading}
                >
                  <View style={styles.resendButton}>
                    <MaterialIcons name="refresh" size={16} color={Colors.white} />
                    <Text style={styles.resendButtonText}>
                      Resend
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : canResend && resendCount >= 2 ? (
                <Text style={styles.resendLimitText}>
                  Max resend attempts reached
                </Text>
              ) : (
                <Text style={styles.resendDisabledText}>
                  Resend in {formatTime(timeLeft)}
                </Text>
              )}
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
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
    maxWidth: 380,
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
  headerIconSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  largeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emailSection: {
    marginBottom: 32,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  emailText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  otpDisplayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 28,
  },
  otpBox: {
    flex: 1,
    height: 60,
    borderWidth: 2,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxText: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
    flex: 1,
  },
  timerBarContainer: {
    marginBottom: 24,
  },
  timerBarBackground: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  timerBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  timerText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  verifyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  resendSection: {
    alignItems: 'center',
  },
  resendQuestion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  resendButtonText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
  resendDisabledText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  resendLimitText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
  },
});
