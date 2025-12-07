import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography } from '../constants/Colors';
import SplashLogo from '../components/SplashLogo';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation, onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
      navigation.replace('Login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, onFinish, fadeAnim]);

  const logoWidth = Math.min(width * 0.7, 300);
  const logoHeight = logoWidth * (125 / 204);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <SplashLogo 
          width={logoWidth} 
          height={logoHeight}
          textColor={Colors.logoCream}
          accentColor={Colors.logoRed}
        />
        
        <Text style={styles.tagline}>
          Share the Ride, Save the Cost
        </Text>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading DRIVVE...</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  tagline: {
    ...Typography.body1, // Inter Regular 16px
    color: Colors.light,
    textAlign: 'center',
    marginTop: -30,
    fontWeight: '300',
    letterSpacing: 1,
    lineHeight: 24,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: -200,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body2, // Inter Regular 14px
    color: Colors.white,
    fontWeight: '300',
  },
});
