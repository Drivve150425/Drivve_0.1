import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DatabaseService from "../services/DatabaseService";
import { Colors, Typography } from "../constants/Colors";

/* ================= TEXT HIGHLIGHT HELPER ================= */
const highlightText = (text, search) => {
  if (!search) return <Text>{text}</Text>;

  const regex = new RegExp(`(${search})`, "gi");
  const parts = text.split(regex);

  return (
    <Text>
      {parts.map((part, index) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <Text key={index} style={styles.highlight}>
            {part}
          </Text>
        ) : (
          <Text key={index}>{part}</Text>
        )
      )}
    </Text>
  );
};

export default function FAQScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    const loadCategories = async () => {
      const cats = await DatabaseService.getFAQCategories();
      setCategories(cats);
      if (cats.length > 0) setActiveCategory(cats[0]);
    };
    loadCategories();
  }, []);

  /* ================= LOAD FAQS ================= */
  useEffect(() => {
    if (!activeCategory) return;
    DatabaseService.getFAQs(activeCategory).then(setFaqs);
    setExpandedId(null);
  }, [activeCategory]);

  /* ================= SEARCH FILTER + AUTO OPEN ================= */
  const filteredFaqs = faqs.filter(
    f =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  // Auto open first matched accordion
  useEffect(() => {
    if (search && filteredFaqs.length > 0) {
      setExpandedId(filteredFaqs[0].id);
    }

    if (!search) {
      setExpandedId(null); // close all when search cleared
    }
  }, [search]);

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

        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ================= SEARCH ================= */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={18}
            color={Colors.orange1} // 🔶 ORANGE ICON
          />
          <TextInput
            placeholder="Search for answers..."
            placeholderTextColor={Colors.dark} // 🖤 BLACK PLACEHOLDER
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* ================= CATEGORY TABS ================= */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsRow}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.tab,
                activeCategory === cat && styles.activeTab,
              ]}
              onPress={() => {
                setActiveCategory(cat);
                setSearch("");
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeCategory === cat && styles.activeTabText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ================= FAQ LIST ================= */}
        {filteredFaqs.map(item => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            style={styles.faqCard}
            onPress={() =>
              setExpandedId(expandedId === item.id ? null : item.id)
            }
          >
            <View style={styles.faqHeader}>
              <Text style={styles.question}>
                {highlightText(item.question, search)}
              </Text>

              <Ionicons
                name={
                  expandedId === item.id
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={18}
                color={Colors.orange1} // 🟧 ORANGE ACCORDION ARROW
              />
            </View>

            {expandedId === item.id && (
              <Text style={styles.answer}>
                {highlightText(item.answer, search)}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
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

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  /* SEARCH */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    backgroundColor: "#FFFFFF", // ⬜ WHITE BG
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: Colors.dark,
  },

  /* TABS */
  tabsRow: {
    marginBottom: 16,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },

  activeTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary, // 🎨 PRIMARY TEXT
  },

  activeTabText: {
    color: Colors.white,
  },

  /* FAQ CARD */
  faqCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },

  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  question: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
    width: "90%",
  },

  answer: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
  },

  /* SEARCH HIGHLIGHT */
  highlight: {
    backgroundColor: "#FFF3C4",
    color: Colors.primary,
    fontWeight: "700",
  },
});
