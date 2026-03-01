import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors, Typography } from "../constants/Colors";

const SUPPORT_EMAIL = "social.drivve@gmail.com";

export default function EmailSupportScreen({ navigation }) {
  /* ================= HANDLERS ================= */

  // const openEmail = () => {
  //   const subject = "DRIVVE Support";
  //   const body = "Hi DRIVVE Team,%0D%0A%0D%0A";
  //   const mailUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

  //   Linking.openURL(mailUrl).catch(err =>
  //     console.error("❌ Email open failed", err)
  //   );
  // };

  // const openLink = url => {
  //   Linking.openURL(url).catch(err =>
  //     console.error("❌ Link open failed", err)
  //   );
  // };

  const openEmail = async () => {
    const subject = encodeURIComponent("DRIVVE Support");
    const body = encodeURIComponent("Hi DRIVVE Team,\n\n");

    const mailUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    const supported = await Linking.canOpenURL(mailUrl);

    if (supported) {
      await Linking.openURL(mailUrl);
    } else {
      alert("No email app found on this device.");
    }
  };

  const openLink = async (url) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      alert("Unable to open link.");
    }
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons
            name="arrow-back-ios"
            size={26}
            color={Colors.orange1}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Email Support</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ================= CONTENT ================= */}
      <View style={styles.content}>
        <Text style={styles.message}>
          Hi there! We’re always here and happy to help you anytime.
        </Text>

        {/* ================= EMAIL CARD ================= */}
        <TouchableOpacity
          style={styles.emailCard}
          activeOpacity={0.8}
          onPress={openEmail}
        >
          <View style={styles.emailIcon}>
            <Ionicons name="mail-outline" size={26} color={Colors.primary} />
          </View>

          <View style={{ marginLeft: 12 }}>
            <Text style={styles.emailTitle}>Email</Text>
            <Text style={styles.emailText}>{SUPPORT_EMAIL}</Text>
          </View>
        </TouchableOpacity>

        {/* ================= CONNECT ================= */}
       {/* ================= CONNECT ================= */}
<Text style={styles.connectText}>Connect with us</Text>

<View style={styles.socialWrapper}>
  <View style={styles.socialRow}>
    <TouchableOpacity
      onPress={() => openLink("https://wa.me/919999999999")}
      style={styles.socialBtn}
    >
      <Ionicons name="logo-whatsapp" size={26} color="#25D366" />
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => openLink("https://www.instagram.com/drivve")}
      style={styles.socialBtn}
    >
      <Ionicons name="logo-instagram" size={26} color="#E1306C" />
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => openLink("https://www.facebook.com/drivve")}
      style={styles.socialBtn}
    >
      <Ionicons name="logo-facebook" size={26} color="#1877F2" />
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => openLink("https://www.linkedin.com/company/drivve")}
      style={styles.socialBtn}
    >
      <Ionicons name="logo-linkedin" size={26} color="#0A66C2" />
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => openLink("https://twitter.com/drivve")}
      style={styles.socialBtn}
    >
      <Ionicons name="logo-twitter" size={26} color="#1DA1F2" />
    </TouchableOpacity>
  </View>
</View>

      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },

  headerTitle: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    flex: 1,
    textAlign: "center",
  },

  /* CONTENT */
  content: {
    padding: 20,
  },

  message: {
    fontSize: 28,
    fontWeight: "500",
    color: Colors.dark,
    marginBottom: 15,
    lineHeight: 30,
  },

  /* EMAIL CARD */
  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },

  emailIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  emailTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
  },

  emailText: {
    fontSize: 20,
    fontWeight: "500",
    color: Colors.dark,
    marginTop: 2,
  },

  

 /* CONNECT */
connectText: {
  marginTop: 28,
  fontSize: 20,
  fontWeight: "600",
  color: Colors.primary,
},

socialWrapper: {
  alignItems: "center",  // ✅ CENTER ROW
  marginTop: 16,
},

socialRow: {
  flexDirection: "row",
  justifyContent: "center", // ✅ CENTER ICONS
},

socialBtn: {
  marginHorizontal: 14,  // ✅ EVEN SPACING
  padding: 6,            // touch friendly
},

});
