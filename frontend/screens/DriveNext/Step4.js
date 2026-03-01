import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet
} from 'react-native';
import { Colors } from '../../constants/Colors';

export default function Step4({
  seatsAvailable,
  setSeatsAvailable,
  pricePerSeat,
  setPricePerSeat,
  selectedRoute,
  vehicleId,
  maxSeats = 4,
  onPost
}) {

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

  const handlePost = () => {
    const numericPrice = Number(pricePerSeat);

    if (!numericPrice) {
      Alert.alert("Invalid Price", "Please enter valid price per seat.");
      return;
    }

    if (numericPrice < minAllowed || numericPrice > maxAllowed) {
      Alert.alert(
        "Price Out of Range",
        `Price must be between ₹${minAllowed} and ₹${maxAllowed}`
      );
      return;
    }

    onPost({
      seatsAvailable,
      pricePerSeat: numericPrice,
    });
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
        >
          <Text style={styles.seatBtnText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.seatCount}>{seatsAvailable}</Text>

        <TouchableOpacity
          onPress={() => setSeatsAvailable(Math.min(maxSeats, seatsAvailable + 1))}
          style={[styles.seatBtn, seatsAvailable >= maxSeats && styles.seatBtnDisabled]}
          disabled={seatsAvailable >= maxSeats}
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
        />
      </View>

      {/* Post Button */}
      <TouchableOpacity
        style={[styles.postBtn,
          { opacity: isPriceValid ? 1 : 0.4 }
        ]}
        disabled={!isPriceValid}
        onPress={handlePost}
      >
        <Text style={styles.postBtnText}>Post Ride</Text>
      </TouchableOpacity>

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
    alignItems: 'center'
  },

  seatBtnDisabled: {
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },

  seatBtnText: {
    fontSize: 22,
    fontWeight: '700'
  },

  seatBtnTextDisabled: {
    color: '#c0c0c0',
  },

  seatCount: {
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 24
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
    borderColor: Colors.gray,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16
  },

  postBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 22
  },

  postBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  }

});
