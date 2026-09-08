import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function SanskritQuote({ quote }) {
  const [expanded, setExpanded] = useState(true);
  if (!quote) return null;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.titleRow}>
          <Text style={styles.om}>🕉</Text>
          <Text style={styles.title}>SANSKRIT SHLOKA</Text>
        </View>
        <Text style={styles.toggle}>{expanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          <Text style={styles.devanagari}>{quote.devanagari}</Text>
          <Text style={styles.transliteration}>{quote.transliteration}</Text>
          <View style={styles.divider} />
          <Text style={styles.translation}>{quote.translation}</Text>
          {quote.source && (
            <Text style={styles.source}>— {quote.source}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#2d1200",
    borderWidth: 1,
    borderColor: "#7c3d00",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  om: { fontSize: 16 },
  title: {
    color: "#f99030",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
  },
  toggle: { color: "#888", fontSize: 10 },
  body: {},
  devanagari: {
    color: "#fdd5a5",
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 6,
  },
  transliteration: {
    color: "#888",
    fontSize: 11,
    fontStyle: "italic",
    marginBottom: 8,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#7c3d0040",
    marginBottom: 8,
  },
  translation: {
    color: "#ccc",
    fontSize: 13,
    lineHeight: 20,
  },
  source: {
    color: "#f77010",
    fontSize: 11,
    marginTop: 6,
  },
});
