import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useChatStore from "../store/chatStore";
import MessageBubble from "../components/MessageBubble";
import { sendMessage } from "../services/api";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "hi", label: "HI" },
  { code: "sa", label: "SA" },
  { code: "ta", label: "TA" },
  { code: "te", label: "TE" },
  { code: "bn", label: "BN" },
];

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const flatListRef = useRef(null);

  const {
    messages,
    language,
    isLoading,
    error,
    sessionId,
    setLanguage,
    setLoading,
    setError,
    setSessionId,
    addMessage,
    clearMessages,
    getHistory,
  } = useChatStore();

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async (text) => {
    const query = (text || input).trim();
    if (!query || isLoading) return;

    setInput("");
    addMessage({ role: "user", content: query });
    setLoading(true);
    setError(null);

    try {
      const history = getHistory();
      const data = await sendMessage({
        message: query,
        language,
        sessionId,
        history,
      });

      if (data.session_id && !sessionId) {
        setSessionId(data.session_id);
      }

      addMessage({
        role: "assistant",
        content: data.answer,
        confidence: data.confidence?.toLowerCase(),
        sanskrit_quote: data.sanskrit_quote,
        related_topics: data.related_topics,
        sources: data.sources,
        logged_on_chain: data.logged_on_chain,
      });
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || "Connection error";
      setError(msg);
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    Alert.alert("Clear Chat", "Start a new conversation?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clearMessages },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>VedaBot</Text>
          <Text style={styles.headerSub}>Vedic Knowledge Assistant</Text>
        </View>
        <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
          <Text style={styles.clearText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Language Selector */}
      <View style={styles.langRow}>
        {LANGUAGES.map((l) => (
          <TouchableOpacity
            key={l.code}
            onPress={() => setLanguage(l.code)}
            style={[styles.langChip, language === l.code && styles.langChipActive]}
          >
            <Text style={[styles.langText, language === l.code && styles.langTextActive]}>
              {l.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🕉</Text>
            <Text style={styles.emptyTitle}>Ask about Vedic Knowledge</Text>
            <Text style={styles.emptySubtitle}>
              Questions about the Vedas, Upanishads,{"\n"}Bhagavad Gita, Yoga Sutras & more
            </Text>
            <View style={styles.suggestionsGrid}>
              {[
                "What is the meaning of Om?",
                "Explain karma and dharma",
                "What are the four Vedas?",
                "Tell me about meditation",
              ].map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.suggestion}
                  onPress={() => handleSend(s)}
                >
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <MessageBubble message={item} onTopicClick={handleSend} />
            )}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Loading */}
        {isLoading && (
          <View style={styles.loadingRow}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 14 }}>🕉</Text>
            </View>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="#f99030" />
              <Text style={styles.loadingText}>Consulting the Vedas…</Text>
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about Vedic wisdom…"
            placeholderTextColor="#4b5563"
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isLoading}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#111827" },
  flex: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  headerLeft: {},
  headerTitle: { color: "#f99030", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "#6b7280", fontSize: 11, marginTop: 1 },
  clearBtn: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  clearText: { color: "#9ca3af", fontSize: 12 },

  langRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
  },
  langChipActive: { backgroundColor: "#c2410c", borderColor: "#c2410c" },
  langText: { color: "#6b7280", fontSize: 12, fontWeight: "600" },
  langTextActive: { color: "#fff" },

  messageList: { paddingVertical: 12 },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: "#f3f4f6", fontSize: 18, fontWeight: "600", marginBottom: 8 },
  emptySubtitle: { color: "#6b7280", fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  suggestionsGrid: { width: "100%", gap: 8 },
  suggestion: {
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 12,
    padding: 12,
  },
  suggestionText: { color: "#d1d5db", fontSize: 13 },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#c2410c",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f2937",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  loadingText: { color: "#6b7280", fontSize: 12 },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#1f2937",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    color: "#f3f4f6",
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#374151",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#c2410c",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#374151" },
  sendIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
