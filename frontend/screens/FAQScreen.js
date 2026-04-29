import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import DatabaseService from "../services/faq_ds";
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
  const [loading, setLoading] = useState(true);
  const [loadingFaqs, setLoadingFaqs] = useState(false);

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const cats = await DatabaseService.getFAQCategories();
        setCategories(cats);
        if (cats.length > 0) setActiveCategory(cats[0]);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  /* ================= LOAD FAQS ================= */
  useEffect(() => {
    if (!activeCategory) return;
    
    const loadFaqs = async () => {
      try {
        setLoadingFaqs(true);
        const faqData = await DatabaseService.getFAQs(activeCategory);
        setFaqs(faqData);
        setExpandedId(null);
        setSearch(""); // Clear search when changing category
      } catch (error) {
        console.error("Error loading FAQs:", error);
      } finally {
        setLoadingFaqs(false);
      }
    };
    
    loadFaqs();
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
  
  const handleBack = () => {
    navigation.goBack();
  };

  // Show loader while fetching categories
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.loaderContainer}>
          <LottieView
            source={require("../assets/loading.json")}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Show loader while fetching FAQs
  if (loadingFaqs) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.loaderContainer}>
          <LottieView
            source={require("../assets/loading.json")}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FAQ</Text>
          <View style={styles.headerSpacer} />
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
              color={Colors.orange1}
            />
            <TextInput
              placeholder="Search for answers..."
              placeholderTextColor="#9CA3AF"
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
          {filteredFaqs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color={Colors.primary} />
              <Text style={styles.emptyTitle}>No FAQs Found</Text>
              <Text style={styles.emptySubtitle}>
                {search ? "Try searching with different keywords" : "No FAQs available in this category"}
              </Text>
            </View>
          ) : (
            filteredFaqs.map(item => (
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
                    color={Colors.orange1}
                  />
                </View>

                {expandedId === item.id && (
                  <Text style={styles.answer}>
                    {highlightText(item.answer, search)}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
  
  // Loader styles
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
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
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 19,
    backgroundColor: "#FFFFFF",
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: Colors.dark,
    paddingVertical: 0
  },

  /* TABS */
  tabsRow: {
    marginBottom: 19,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
    backgroundColor: "#FFFFFF",

    // 🔥 SHADOW (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,

    // 🔥 ANDROID SHADOW
    elevation: 3,
  },

  activeTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
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

    // 🔥 ANDROID
    elevation: 4,

    // 🔥 iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
  
  /* EMPTY STATE */
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 16,
  },
  
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
    textAlign: "center",
  },
});