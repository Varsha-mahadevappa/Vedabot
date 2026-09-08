import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import SanskritQuote from "./SanskritQuote";

const CONFIDENCE_COLORS = {
  high: "#4ade80",
  medium: "#facc15",
  low: "#f87171",
};

export default function MessageBubble({ message, onTopicClick }) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <View style={styles.userWrapper}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.botWrapper}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>🕉</Text>
      </View>

      <View style={styles.botContent}>
        {/* Answer */}
        <View style={styles.botBubble}>
          <Text style={styles.botText}>{message.content}</Text>

          {/* Sanskrit Quote */}
          {message.sanskrit_quote && (
            <SanskritQuote quote={message.sanskrit_quote} />
          )}

          {/* Related Topics */}
          {message.related_topics && message.related_topics.length > 0 && (
            <View style={styles.topicsSection}>
              <Text style={styles.topicsLabel}>Related topics:</Text>
              <View style={styles.topicsRow}>
                {message.related_topics.map((topic, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => onTopicClick && onTopicClick(topic)}
                    style={styles.topicChip}
                  >
                    <Text style={styles.topicText}>{topic}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {message.confidence && (
            <Text style={[styles.confidence, { color: CONFIDENCE_COLORS[message.confidence] || "#888" }]}>
              {message.confidence.charAt(0).toUpperCase() + message.confidence.slice(1)} confidence
            </Text>
          )}
          {message.logged_on_chain && (
            <View style={styles.chainBadge}>
              <Text style={styles.chainText}>✓ Logged on Shardeum</Text>
            </View>
          )}
        </View>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <View style={styles.sourcesSection}>
            <TouchableOpacity
              onPress={() => setSourcesOpen(!sourcesOpen)}
              style={styles.sourcesToggle}
            >
              <Text style={styles.sourcesToggleText}>
                📖 {message.sources.length} sources used {sourcesOpen ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>

            {sourcesOpen && message.sources.map((src, i) => (
              <View key={i} style={styles.sourceCard}>
                <View style={styles.sourceHeader}>
                  <Text style={styles.sourceName}>
                    {src.text_name}{src.chapter ? ` — ${src.chapter}` : ""}{src.verse ? ` ${src.verse}` : ""}
                  </Text>
                  {src.verified_on_chain && (
                    <Text style={styles.verifiedBadge}>✓ Verified</Text>
                  )}
                </View>
                <Text style={styles.sourceExcerpt}>{src.excerpt}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userWrapper: {
    alignItems: "flex-end",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  userBubble: {
    backgroundColor: "#c2410c",
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: "80%",
  },
  userText: { color: "#fff", fontSize: 14, lineHeight: 20 },

  botWrapper: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 12,
    alignItems: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#c2410c",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 2,
  },
  avatarText: { fontSize: 16 },
  botContent: { flex: 1 },
  botBubble: {
    backgroundColor: "#1f2937",
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  botText: { color: "#f3f4f6", fontSize: 14, lineHeight: 22 },

  topicsSection: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#374151" },
  topicsLabel: { color: "#6b7280", fontSize: 11, marginBottom: 6 },
  topicsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  topicChip: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#7c3d0040",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  topicText: { color: "#f99030", fontSize: 11 },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    paddingHorizontal: 4,
    flexWrap: "wrap",
  },
  confidence: { fontSize: 11 },
  chainBadge: {
    backgroundColor: "#14532d50",
    borderWidth: 1,
    borderColor: "#166534",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chainText: { color: "#4ade80", fontSize: 10 },

  sourcesSection: { marginTop: 6, paddingHorizontal: 4 },
  sourcesToggle: { paddingVertical: 4 },
  sourcesToggleText: { color: "#6b7280", fontSize: 11 },
  sourceCard: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#374151",
  },
  sourceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  sourceName: { color: "#f99030", fontSize: 11, fontWeight: "600", flex: 1 },
  verifiedBadge: { color: "#4ade80", fontSize: 10 },
  sourceExcerpt: { color: "#9ca3af", fontSize: 11, lineHeight: 16 },
});
