import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { Colors } from "../constants/Colors";
import { useAuth } from "../context/AuthContext";
import DatabaseService from "../services/DatabaseService";
import CustomAlert from '../components/CustomAlert';

export default function RideSuccessScreen({ navigation, route }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;
  const userId = user?.id || route?.params?.userId || null;
  const userData = user || route?.params?.userData || null;
  
  // Get ride details from route params
  const rideDetails = route?.params?.rideDetails || null;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Custom Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "check-circle",
    iconColor: "#10B981",
    buttons: []
  });

  const showCustomAlert = (title, message, type = 'success') => {
    let icon = "check-circle";
    let iconColor = "#10B981";
    
    if (type === 'error') {
      icon = "error";
      iconColor = "#EF4444";
    } else if (type === 'warning') {
      icon = "warning";
      iconColor = "#F59E0B";
    } else if (type === 'info') {
      icon = "info";
      iconColor = Colors.primary;
    }
    
    setAlertConfig({
      title,
      message,
      icon,
      iconColor,
      buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
    });
    setAlertVisible(true);
  };

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Note: Notification is now created by the backend when ride is posted
    // See backend/routers/ride.py - post_ride function
    // The notification will appear in UserNotificationScreen

    // Auto redirect
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Home",
            params: { phoneNumber, userData, userId },
          },
        ],
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: opacityAnim }
        ]}
      >
        <Animated.View
          style={[
            styles.circle,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Ionicons name="checkmark" size={50} color={Colors.primary} />
        </Animated.View>

        <Text style={styles.title}>Ride Posted!</Text>

        <Text style={styles.subtitle}>
          Your ride has been posted successfully.
          {"\n"}You'll be notified when passengers book.
        </Text>

        <View style={styles.notificationBadge}>
          <Ionicons name="notifications" size={16} color={Colors.primary} />
          <Text style={styles.notificationText}>Notification sent</Text>
        </View>
      </Animated.View>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        buttons={alertConfig.buttons}
        onBackdropPress={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    padding: 30,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FDEAD7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
    color: Colors.dark,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    fontSize: 15,
    lineHeight: 22,
  },
  notificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  notificationText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
});