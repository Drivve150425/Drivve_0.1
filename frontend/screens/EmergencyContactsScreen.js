import React, { useEffect, useMemo, useState } from "react";
import LottieView from "lottie-react-native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  StatusBar,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";

import EmergencyContactService from "../services/emergencycontact_ds";
import { Colors, Typography } from "../constants/Colors";
import { useAuth } from "../context/AuthContext";

export default function EmergencyContactsScreen({ navigation, route }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

  const [systemContacts, setSystemContacts] = useState([]);
  const [userContacts, setUserContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [contactList, setContactList] = useState([]);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [editingId, setEditingId] = useState(null);
  
  /* ================= HELPERS ================= */

  const callNumber = (num) => {
    if (!num) return;
    Linking.openURL(`tel:${num}`);
  };

  const formatPhone = (num) => {
    if (!num) return "";
    let cleaned = num.replace(/\D/g, "");
    if (cleaned.length === 10) return `+91${cleaned}`;
    if (cleaned.startsWith("91") && cleaned.length === 12)
      return `+${cleaned}`;
    return num;
  };

  const isDuplicate = (num) => {
    const formatted = formatPhone(num);
    return userContacts.some(
      c => formatPhone(c.contact_number) === formatted
    );
  };

  /* ================= LOAD ================= */

  const loadContacts = async () => {
    if (!phoneNumber) return;

    setLoading(true);

    try {
      const res = await EmergencyContactService.getContacts(phoneNumber);
      setSystemContacts(res.system || []);
      setUserContacts(res.user || []);
    } catch (error) {
      console.error("Error loading contacts:", error);
      Alert.alert("Error", "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  /* ================= CONTACT PICKER ================= */

  const openContactPicker = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required");
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    setContactList(data.filter(c => c.phoneNumbers?.length));
    setPickerVisible(true);
  };

  const selectContact = (c) => {
    const phone = formatPhone(c.phoneNumbers[0].number);

    if (isDuplicate(phone)) {
      Alert.alert("Duplicate contact");
      return;
    }

    setName(c.name || "");
    setNumber(phone);
    setPickerVisible(false);
    setAddModal(true);
  };

  const addContact = async () => {
    if (!name || !number) {
      Alert.alert("Enter name & number");
      return;
    }
    
    // 🚫 BLOCK numbers in name (FINAL CHECK)
    if (/[^a-zA-Z\s]/.test(name)) {
      Alert.alert("Invalid Name", "Only letters allowed in name");
      return;
    }
    
    setSaving(true);
    
    try {
      if (editingId) {
        // ✏️ EDIT
        await EmergencyContactService.updateContact(
          editingId,
          {
            contact_name: name,
            contact_number: formatPhone(number),
          },
          phoneNumber
        );

        Alert.alert("Success", "Contact updated successfully");
      } else {
        // 🚫 LIMIT CHECK
        if (userContacts.length >= 3) {
          Alert.alert("Limit reached", "You can only add up to 3 contacts");
          setSaving(false);
          return;
        }

        // ➕ ADD
        if (isDuplicate(number)) {
          Alert.alert("Already exists");
          setSaving(false);
          return;
        }

        await EmergencyContactService.addContact({
          phone_number: phoneNumber,
          contact_name: name,
          contact_number: formatPhone(number),
        });
        
        Alert.alert("Success", "Contact added successfully");
      }

      // RESET
      setAddModal(false);
      setEditingId(null);
      setName("");
      setNumber("");

      await loadContacts();

    } catch (e) {
      console.log(e);
      Alert.alert("Error", "An error occurred while saving contact");
    } finally {
      setSaving(false);
    }
  };
  
  const deleteContact = async (id) => {
    Alert.alert("Delete?", "Remove this contact", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          setDeleting(true);
          try {
            await EmergencyContactService.deleteContact(id, phoneNumber);
            Alert.alert("Success", "Contact deleted successfully");
            await loadContacts();
          } catch (error) {
            console.error("Error deleting contact:", error);
            Alert.alert("Error", "Failed to delete contact");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  /* ================= FILTER ================= */

  const filteredContacts = useMemo(() => {
    if (!search) return contactList;
    return contactList.filter(c =>
      c.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, contactList]);

  /* ================= RENDER ================= */

  const renderContact = (c, locked = false) => (
    <View style={styles.card} key={c.id}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          {c.contact_name?.toLowerCase().includes("women") ? (
            <MaterialIcons name="girl" size={30} color="white" />
          ) : (
            <Text style={styles.avatarText}>
              {c.contact_name
                ?.split(" ")
                .map(word => word[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </Text>
          )}
        </View> 
        <View>
          <Text style={styles.name}>{c.contact_name}</Text>
          <Text style={styles.number}>{c.contact_number}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {locked ? (
          <>
            <TouchableOpacity onPress={() => callNumber(c.contact_number)}>
              <Ionicons name="call-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <Ionicons name="lock-closed-outline" size={20} color="#999" />
          </>
        ) : (
          <>
            <TouchableOpacity 
              onPress={() => {
                setEditingId(c.id);
                setName(c.contact_name);
                setNumber(c.contact_number);
                setAddModal(true);
              }}
              disabled={deleting}
            >
              <MaterialIcons name="edit" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => deleteContact(c.id)}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name="trash-outline" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
  
  const handleBack = () => {
    navigation.goBack();
  };
  
  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Emergency contact</Text>

          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() =>
              Alert.alert(
                "About Trusted Circle",
                "Your Trusted Circle contacts will be notified in case of emergency. You can add up to 3 trusted contacts."
              )
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={26}
              color={Colors.secondary}
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <LottieView
              source={require("../assets/loading.json")}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
            {/* <Text style={styles.loaderText}>Loading contacts...</Text> */}
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {/* EMERGENCY FIRST */}
            {systemContacts.length > 0 && (
              <>
                <Text style={styles.sectionTitleemergency}>
                  Emergency Numbers
                </Text>
                {systemContacts.map(c => renderContact(c, true))}
              </>
            )}

            {/* TRUSTED AFTER */}
            {userContacts.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  Your Trusted Circle
                </Text>
                {userContacts.map(c => renderContact(c))}
              </>
            )}

            {userContacts.length === 0 && systemContacts.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="call-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No contacts found</Text>
                <Text style={styles.emptySubText}>
                  Tap the + button to add emergency contacts
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* FLOAT BUTTON */}
      {!loading && (
        <TouchableOpacity style={styles.fab} onPress={openContactPicker}>
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* CONTACT PICKER MODAL */}
      <Modal visible={pickerVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
          <Text style={styles.modalTitle}>Select Contact</Text>
          <TextInput
            placeholder="Search contacts..."
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />

          <ScrollView>
            {filteredContacts.length > 0 ? (
              filteredContacts.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.pickerRow}
                  onPress={() => selectContact(c)}
                >
                  <Text style={styles.pickerName}>{c.name}</Text>
                  <Text style={styles.pickerNumber}>{c.phoneNumbers[0].number}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text>No contacts found</Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity 
            onPress={() => {
              setPickerVisible(false);
              setSearch("");
            }} 
            style={styles.closeButton}
          >
            <Text style={styles.cancel}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* ADD/EDIT CONTACT MODAL */}
      <Modal transparent visible={addModal} animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingId ? "Edit Contact" : "Add Contact"}
            </Text>
            
            <TextInput
              value={name}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^a-zA-Z\s]/g, "");
                setName(cleaned);
              }}
              placeholder="Name"
              style={styles.input}
              editable={!saving}
            />
            
            <TextInput
              value={number}
              onChangeText={setNumber}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              style={styles.input}
              editable={!saving}
            />

            <TouchableOpacity 
              style={[styles.primaryBtn, saving && styles.disabledBtn]} 
              onPress={addContact}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: "white", fontWeight: "600" }}>
                  {editingId ? "Update" : "Save"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                setAddModal(false);
                setEditingId(null);
                setName("");
                setNumber("");
              }}
              disabled={saving}
            >
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight:700
  },
  
  loaderText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "500",
  },

  keyboardAvoidingView: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  
  modernBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerTitle: {
    ...Typography.h2,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  
  headerSpacer: {
    width: 44,
  },
  
  infoButton: {
    padding: 8,
  },
  
  content: { 
    padding: 16,
    flexGrow: 1,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 12,
    marginTop: 0,
    color: Colors.primary,
  },
  
  sectionTitleemergency: {
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 12,
    marginTop: 3,
    color: Colors.primary,
  },
  
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFF",
    marginBottom: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 16,
  },

  name: { 
    fontWeight: "700", 
    fontSize: 16,
    color: "#1F2937",
  },
  
  number: { 
    color: "#6B7280", 
    fontSize: 14,
    marginTop: 2,
  },

  actions: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalCard: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: Colors.primary,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },

  primaryBtn: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  
  disabledBtn: {
    opacity: 0.6,
  },

  cancel: {
    textAlign: "center",
    marginTop: 16,
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },

  pickerRow: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  
  pickerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  
  pickerNumber: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  
  closeButton: {
    marginTop: 20,
    padding: 12,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 16,
  },
  
  emptySubText: {
    fontSize: 14,
    color: "#D1D5DB",
    marginTop: 8,
    textAlign: "center",
  },
});