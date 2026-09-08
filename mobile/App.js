import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import ChatScreen from "./src/screens/ChatScreen";
import KnowledgeScreen from "./src/screens/KnowledgeScreen";

const TABS = [
  { key: "chat", label: "Chat", icon: "💬" },
  { key: "knowledge", label: "Knowledge", icon: "📖" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#111827" />
      <View style={styles.container}>
        {/* Screen */}
        <View style={styles.screen}>
          {activeTab === "chat" ? <ChatScreen /> : <KnowledgeScreen />}
        </View>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {activeTab === tab.key && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#1f2937",
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    position: "relative",
  },
  tabIcon: { fontSize: 20, marginBottom: 2 },
  tabLabel: { color: "#6b7280", fontSize: 11, fontWeight: "500" },
  tabLabelActive: { color: "#f99030" },
  tabIndicator: {
    position: "absolute",
    top: 0,
    width: 24,
    height: 2,
    backgroundColor: "#c2410c",
    borderRadius: 1,
  },
});
