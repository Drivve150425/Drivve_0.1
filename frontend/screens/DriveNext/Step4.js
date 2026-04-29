import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import CustomAlert from '../../components/CustomAlert';

export default function Step4({
  seatsAvailable,
  setSeatsAvailable,
  pricePerSeat,
  setPricePerSeat,
  selectedRoute,
  vehicleId,
  maxSeats = 4,
  onPost,
  isEdit = false
}) {

  const [posting, setPosting] = useState(false);
  const buttonText = isEdit ? 'Update Ride' : 'Post Ride';

  // Custom Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "check-circle",
    iconColor: "#10B981",
    buttons: []
  });

  const showCustomAlert = (title, message, type = 'success', onConfirm = null) => {
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
    
    const buttons = onConfirm 
      ? [
          { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
          { text: 'OK', onPress: () => {
              setAlertVisible(false);
              onConfirm();
            }
          }
        ]
      : [{ text: 'OK', onPress: () => setAlertVisible(false) }];
    
    setAlertConfig({
      title,
      message,
      icon,
      iconColor,
      buttons
    });
    setAlertVisible(true);
  };

  /* =====================================
     ESTIMATED PRICE CALCULATION
     Using: price / (maxSeats + 1)
  ===================================== */

  const estimatedPrice = useMemo(() => {
    if (!selectedRoute?.price) return 0;
    // Divide by maxSeats + 1 (the +1 is for the driver)
    return selectedRoute.price / (maxSeats + 1);
  }, [selectedRoute, maxSeats]);

  const minAllowed = Math.floor(estimatedPrice * 0.8);
  const maxAllowed = Math.ceil(estimatedPrice * 1.2);

  /* =====================================
     AUTO UPDATE PRICE WHEN SEATS CHANGE
  ===================================== */

  useEffect(() => {
    if (estimatedPrice > 0) {
      setPricePerSeat(Math.round(estimatedPrice).toString());
    }
  }, [estimatedPrice]);

  /* =====================================
     VALIDATION
  ===================================== */

  const numericPrice = Number(pricePerSeat);
  const isPriceValid = numericPrice && 
    numericPrice >= minAllowed && 
    numericPrice <= maxAllowed;

  const handlePost = async () => {
    const numericPrice = Number(pricePerSeat);

    if (!numericPrice) {
      showCustomAlert("Invalid Price", "Please enter valid price per seat.", "warning");
      return;
    }

    if (numericPrice < minAllowed || numericPrice > maxAllowed) {
      showCustomAlert(
        "Price Out of Range",
        `Price must be between ₹${minAllowed} and ₹${maxAllowed}`,
        "warning"
      );
      return;
    }

    setPosting(true);
    try {
      // Call the onPost function which should return a promise
      const result = await onPost({
        seatsAvailable,
        pricePerSeat: numericPrice,
      });
      
      // Show success message - ONLY ONE CUSTOM ALERT
      const successMessage = isEdit 
        ? "Your ride has been updated successfully!" 
        : "Your ride has been posted successfully!";
      
      showCustomAlert(
        isEdit ? "Ride Updated!" : "Ride Posted!",
        successMessage,
        "success",
        () => {
          // Navigate back or to success screen after alert is dismissed
          if (result?.navigateToSuccess) {
            // Navigation will be handled by parent
          }
        }
      );
    } catch (error) {
      console.error('Error posting ride:', error);
      // Show error message - ONLY ONE CUSTOM ALERT
      showCustomAlert(
        "Error", 
        error?.message || "Failed to post ride. Please try again.", 
        "error"
      );
    } finally {
      setPosting(false);
    }
  };

  /* =====================================
     UI
  ===================================== */

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Seats & Pricing</Text>

      {/* Seats Selector */}
      <View style={styles.seatRow}>
        <TouchableOpacity
          onPress={() => setSeatsAvailable(Math.max(1, seatsAvailable - 1))}
          style={styles.seatBtn}
          disabled={posting}
        >
          <Text style={styles.seatBtnText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.seatCount}>{seatsAvailable}</Text>

        <TouchableOpacity
          onPress={() => setSeatsAvailable(Math.min(maxSeats, seatsAvailable + 1))}
          style={[styles.seatBtn, seatsAvailable >= maxSeats && styles.seatBtnDisabled]}
          disabled={seatsAvailable >= maxSeats || posting}
        >
          <Text style={[styles.seatBtnText, seatsAvailable >= maxSeats && styles.seatBtnTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.maxSeatsHint}>Max seats available: {maxSeats}</Text>

      {/* Estimated */}
      <View style={{ marginTop: 18 }}>
        <Text style={styles.estimateLabel}>
          Estimated per seat:
        </Text>
        <Text style={styles.estimateValue}>
          ₹ {Math.round(estimatedPrice)}
        </Text>
        <Text style={styles.rangeText}>
          Allowed range: ₹{minAllowed} – ₹{maxAllowed}
        </Text>
      </View>

      {/* Manual Input */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.inputLabel}>Set Price per Seat (₹)</Text>
        <TextInput
          value={pricePerSeat}
          onChangeText={setPricePerSeat}
          keyboardType="numeric"
          style={styles.input}
          editable={!posting}
        />
      </View>

      {/* Post Button with ActivityIndicator */}
      <TouchableOpacity
        style={[
          styles.postBtn,
          (!isPriceValid || posting) && styles.postBtnDisabled
        ]}
        disabled={!isPriceValid || posting}
        onPress={handlePost}
        activeOpacity={0.8}
      >
        {posting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.postBtnText}>
              {isEdit ? "Updating..." : "Posting..."}
            </Text>
          </View>
        ) : (
          <Text style={styles.postBtnText}>{buttonText}</Text>
        )}
      </TouchableOpacity>

      {/* Custom Alert - Shows only once for success or error */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        buttons={alertConfig.buttons}
        onBackdropPress={() => setAlertVisible(false)}
      />
    </View>
  );
}

/* =====================================
   STYLES
===================================== */

const styles = StyleSheet.create({

  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: Colors.dark
  },

  seatRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12
  },

  seatBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6eef8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  seatBtnDisabled: {
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },

  seatBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark,
  },

  seatBtnTextDisabled: {
    color: '#c0c0c0',
  },

  seatCount: {
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 24,
    color: Colors.dark,
  },
  
  maxSeatsHint: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 8,
  },

  estimateLabel: {
    fontSize: 14,
    color: Colors.gray
  },

  estimateValue: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
    color: Colors.primary
  },

  rangeText: {
    fontSize: 12,
    marginTop: 4,
    color: Colors.gray
  },

  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
    color: Colors.gray
  },

  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: Colors.dark,
  },

  postBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 22,
    minHeight: 52,
    justifyContent: 'center',
  },

  postBtnDisabled: {
    opacity: 0.6,
  },

  postBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});