import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  TextInput,
  Alert,
  StatusBar,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";

import EmergencyContactService from "../services/DatabaseService.js";
import { Colors, Typography } from "../constants/Colors";
import { useAuth } from "../context/AuthContext";

export default function EmergencyContactsScreen({ navigation, route }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

  /* ================= STATE ================= */
  const [systemContacts, setSystemContacts] = useState([]);
  const [userContacts, setUserContacts] = useState([]);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const [contactList, setContactList] = useState([]);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);

  /* ================= HELPERS ================= */

  // 📞 Dial number
  const callNumber = (num) => {
    if (!num) return;
    Linking.openURL(`tel:${num}`);
  };

  // 🇮🇳 Auto +91 formatter
  const formatPhone = (num) => {
    if (!num) return "";
    let cleaned = num.replace(/\D/g, "");
    if (cleaned.length === 10) return `+91${cleaned}`;
    if (cleaned.startsWith("91") && cleaned.length === 12)
      return `+${cleaned}`;
    return num;
  };

  // 🚫 Duplicate check
  const isDuplicate = (num) => {
    const formatted = formatPhone(num);
    return userContacts.some(
      c => formatPhone(c.contact_number) === formatted
    );
  };

  /* ================= LOAD CONTACTS ================= */
  const loadContacts = async () => {
    if (!phoneNumber) return;
    const res = await EmergencyContactService.getContacts(phoneNumber);
    setSystemContacts(res.system || []);
    setUserContacts(res.user || []);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  /* ================= PICK FROM PHONE CONTACTS ================= */
  const openContactPicker = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Contacts permission is needed");
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
      sort: Contacts.SortTypes.FirstName,
    });

    const valid = data.filter(c => c.phoneNumbers?.length);
    setContactList(valid);
    setPickerVisible(true);
  };

  /* ================= SELECT CONTACT ================= */
  const selectContact = (c) => {
    const phone = formatPhone(c.phoneNumbers[0].number);

    if (isDuplicate(phone)) {
      Alert.alert("Duplicate", "This contact is already added");
      return;
    }

    setName(c.name || "");
    setNumber(phone);
    setPickerVisible(false);
    setAddModal(true);
  };

  /* ================= ADD CONTACT ================= */
  const addContact = async () => {
    if (!name || !number) {
      Alert.alert("Required", "Name & phone number required");
      return;
    }

    if (isDuplicate(number)) {
      Alert.alert("Duplicate", "This contact already exists");
      return;
    }

    await EmergencyContactService.addContact({
      phone_number: phoneNumber,
      contact_name: name,
      contact_number: formatPhone(number),
    });

    setAddModal(false);
    setName("");
    setNumber("");
    loadContacts();
  };

  /* ================= DELETE CONTACT ================= */
  const deleteContact = async (id) => {
    Alert.alert("Delete Contact?", "This contact will be removed", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await EmergencyContactService.deleteContact(id, phoneNumber);
          loadContacts();
        },
      },
    ]);
  };

  /* ================= TOGGLE LIVE LOCATION ================= */
  const onToggle = (contact) => {
    if (!contact.share_live_location) {
      setSelectedContact(contact);
      setConfirmModal(true);
    } else {
      EmergencyContactService.updateContact(contact.id, {
        share_live_location: false,
      }).then(loadContacts);
    }
  };

  const confirmShare = async () => {
    await EmergencyContactService.updateContact(selectedContact.id, {
      share_live_location: true,
    });
    setConfirmModal(false);
    loadContacts();
  };

  /* ================= FILTER CONTACTS ================= */
  const filteredContacts = useMemo(() => {
    if (!search) return contactList;
    return contactList.filter(c =>
      c.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, contactList]);

  /* ================= RENDER CONTACT ================= */
 const renderContact = (c, locked = false) => (
  <View style={styles.card} key={c.id}>
    <View>
      <Text style={styles.name}>{c.contact_name}</Text>
      <Text style={styles.number}>{c.contact_number}</Text>
    </View>

    <View style={styles.actions}>
      {/* 📞 CALL ONLY FOR SYSTEM CONTACTS */}
      {locked && (
        <TouchableOpacity onPress={() => callNumber(c.contact_number)}>
          <Ionicons name="call-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      )}

      {/* 🔒 SYSTEM CONTACT */}
      {locked ? (
        <Ionicons name="lock-closed" size={18} color={Colors.gray} />
      ) : (
        <>
          {/* 🔁 LIVE LOCATION TOGGLE */}
          <Switch
            value={c.share_live_location}
            onValueChange={() => onToggle(c)}
          />

          {/* 🗑️ DELETE */}
          <TouchableOpacity onPress={() => deleteContact(c.id)}>
            <Ionicons name="trash-outline" size={20} color="red" />
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={26} color={Colors.orange1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Emergency Numbers</Text>
        {systemContacts.map(c => renderContact(c, true))}

        <Text style={styles.sectionTitle}>Trusted Contacts</Text>
        {userContacts.map(c => renderContact(c))}

        {userContacts.length < 3 && (
          <>
            <TouchableOpacity style={styles.pickBtn} onPress={openContactPicker}>
              <Ionicons name="people-outline" size={22} color={Colors.primary} />
              <Text style={styles.pickText}>Pick from Phone Contacts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setAddModal(true)}
            >
              <Ionicons name="add-circle-outline" size={22} color="white" />
              <Text style={styles.addText}>Add Manually</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* CONTACT PICKER */}
      <Modal visible={pickerVisible} animationType="slide">
        <SafeAreaView style={styles.sheet}>
          <TextInput
            placeholder="Search contact"
            value={search}
            onChangeText={setSearch}
            style={styles.search}
          />

          <ScrollView>
            {filteredContacts.map(c => (
              <TouchableOpacity
                key={c.id}
                style={styles.pickerRow}
                onPress={() => selectContact(c)}
              >
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.number}>{c.phoneNumbers[0].number}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={() => setPickerVisible(false)}>
            <Text style={styles.cancel}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* ADD CONTACT MODAL */}
      <Modal transparent visible={addModal}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Emergency Contact</Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              style={styles.input}
            />
            <TextInput
              value={number}
              onChangeText={setNumber}
              placeholder="Phone"
              keyboardType="phone-pad"
              style={styles.input}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={addContact}>
              <Text style={styles.primaryText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setAddModal(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CONFIRM SHARE */}
      <Modal transparent visible={confirmModal}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Share Live Location?</Text>

            <TouchableOpacity style={styles.primaryBtn} onPress={confirmShare}>
              <Text style={styles.primaryText}>Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setConfirmModal(false)}>
              <Text style={styles.cancel}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  header: { flexDirection: "row", alignItems: "center", padding: 16 },
  headerTitle: { ...Typography.h2, flex: 1, textAlign: "center" },

  content: { padding: 20 },
  sectionTitle: { ...Typography.h1, marginVertical: 12 },

  card: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  name: { fontWeight: "700", fontSize: 16 },
  number: { color: Colors.dark, marginTop: 4 },

  pickBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },

  pickText: { color: Colors.primary, fontWeight: "700", marginLeft: 8 },

  addBtn: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },

  addText: { color: "white", fontWeight: "700", marginLeft: 8 },

  sheet: { flex: 1, padding: 16 },

  search: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  pickerRow: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },

  modalCard: { backgroundColor: "white", borderRadius: 16, padding: 20 },
  modalTitle: { ...Typography.h2, textAlign: "center", marginBottom: 12 },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  primaryBtn: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  primaryText: { color: "white", fontWeight: "700" },
  cancel: { textAlign: "center", marginTop: 12, color: Colors.gray },
});
