import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { searchKnowledge, listSources, getBlockchainStatus } from "../services/api";

export default function KnowledgeScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [sources, setSources] = useState([]);
  const [blockchainStatus, setBlockchainStatus] = useState(null);
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState("search"); // 'search' | 'sources' | 'blockchain'
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    loadSources();
    loadBlockchain();
  }, []);

  const loadSources = async () => {
    try {
      const data = await listSources();
      setSources(data.sources || []);
    } catch {}
  };

  const loadBlockchain = async () => {
    try {
      const data = await getBlockchainStatus();
      setBlockchainStatus(data);
    } catch {}
  };

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setResults([]);
    try {
      const data = await searchKnowledge(q, 8);
      setResults(data.results || []);
    } catch (err) {
      Alert.alert("Error", err.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const toggleCard = (id) => setExpandedCard(expandedCard === id ? null : id);

  /* ── Search Results ── */
  const renderResult = ({ item, index }) => {
    const id = `r${index}`;
    const open = expandedCard === id;
    return (
      <TouchableOpacity style={styles.card} onPress={() => toggleCard(id)} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardSource}>{item.source}</Text>
          <Text style={styles.cardChev}>{open ? "▲" : "▼"}</Text>
        </View>
        <Text style={styles.cardScore}>Relevance: {(item.score * 100).toFixed(0)}%</Text>
        {open && <Text style={styles.cardText}>{item.text}</Text>}
      </TouchableOpacity>
    );
  };

  /* ── Source List ── */
  const renderSource = ({ item, index }) => {
    const id = `s${index}`;
    const open = expandedCard === id;
    return (
      <TouchableOpacity style={styles.card} onPress={() => toggleCard(id)} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardSource}>{item.name}</Text>
          <View style={styles.row}>
            {item.on_chain && (
              <View style={styles.chainBadge}>
                <Text style={styles.chainText}>✓ On-chain</Text>
              </View>
            )}
            <Text style={styles.cardChev}>{open ? "▲" : "▼"}</Text>
          </View>
        </View>
        {open && (
          <View style={styles.sourceDetails}>
            <Text style={styles.detailLabel}>Chunks: <Text style={styles.detailVal}>{item.chunk_count}</Text></Text>
            {item.hash && (
              <Text style={styles.detailLabel}>Hash: <Text style={styles.hashVal}>{item.hash.slice(0, 20)}…</Text></Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Knowledge Base</Text>
        <Text style={styles.headerSub}>Search & explore Vedic texts</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: "search", label: "Search" },
          { key: "sources", label: "Sources" },
          { key: "blockchain", label: "Blockchain" },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Tab */}
      {tab === "search" && (
        <View style={styles.flex}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search Vedic passages…"
              placeholderTextColor="#4b5563"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              style={[styles.searchBtn, !query.trim() && styles.searchBtnDisabled]}
              onPress={handleSearch}
              disabled={!query.trim()}
            >
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>

          {searching ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#f99030" />
              <Text style={styles.loadingText}>Searching the Vedas…</Text>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(_, i) => String(i)}
              renderItem={renderResult}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>📖</Text>
              <Text style={styles.emptyText}>
                Search across thousands of passages{"\n"}from the Vedas, Upanishads, Gita & more
              </Text>
              <View style={styles.hintChips}>
                {["karma", "moksha", "Om", "dharma", "yoga"].map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={styles.hintChip}
                    onPress={() => { setQuery(h); }}
                  >
                    <Text style={styles.hintText}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Sources Tab */}
      {tab === "sources" && (
        <FlatList
          data={sources}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderSource}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <ActivityIndicator size="small" color="#f99030" />
            </View>
          }
        />
      )}

      {/* Blockchain Tab */}
      {tab === "blockchain" && (
        <FlatList
          data={[{ key: "bc" }]}
          keyExtractor={(item) => item.key}
          renderItem={() => (
            <View style={styles.bcContainer}>
              {blockchainStatus ? (
                <>
                  <View style={styles.bcCard}>
                    <Text style={styles.bcTitle}>Network</Text>
                    <View style={styles.bcRow}>
                      <View style={[styles.dot, { backgroundColor: blockchainStatus.connected ? "#4ade80" : "#f87171" }]} />
                      <Text style={styles.bcVal}>{blockchainStatus.connected ? "Connected" : "Disconnected"}</Text>
                    </View>
                    {blockchainStatus.network && (
                      <Text style={styles.bcSub}>Chain ID: {blockchainStatus.network.chain_id}</Text>
                    )}
                  </View>

                  <View style={styles.bcCard}>
                    <Text style={styles.bcTitle}>Smart Contracts</Text>
                    {blockchainStatus.contracts &&
                      Object.entries(blockchainStatus.contracts).map(([name, info]) => (
                        <View key={name} style={styles.contractRow}>
                          <Text style={styles.contractName}>{name}</Text>
                          <View style={[styles.dot, { backgroundColor: info.deployed ? "#4ade80" : "#f87171" }]} />
                        </View>
                      ))}
                  </View>

                  <View style={styles.bcCard}>
                    <Text style={styles.bcTitle}>Stats</Text>
                    <Text style={styles.detailLabel}>
                      Registered Sources:{" "}
                      <Text style={styles.detailVal}>{blockchainStatus.stats?.registered_sources ?? "—"}</Text>
                    </Text>
                    <Text style={styles.detailLabel}>
                      Logged Responses:{" "}
                      <Text style={styles.detailVal}>{blockchainStatus.stats?.logged_responses ?? "—"}</Text>
                    </Text>
                  </View>

                  <View style={styles.bcInfoCard}>
                    <Text style={styles.bcInfoText}>
                      Every chat response is cryptographically hashed and logged on the Shardeum blockchain for immutable auditability.
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.center}>
                  <ActivityIndicator size="small" color="#f99030" />
                  <Text style={styles.loadingText}>Fetching blockchain status…</Text>
                </View>
              )}
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#111827" },
  flex: { flex: 1 },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  headerTitle: { color: "#f99030", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "#6b7280", fontSize: 11, marginTop: 2 },

  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#c2410c" },
  tabText: { color: "#6b7280", fontSize: 13, fontWeight: "500" },
  tabTextActive: { color: "#f99030" },

  searchRow: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#1f2937",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#f3f4f6",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#374151",
  },
  searchBtn: {
    backgroundColor: "#c2410c",
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  searchBtnDisabled: { backgroundColor: "#374151" },
  searchBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  list: { paddingHorizontal: 12, paddingBottom: 20 },
  card: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardSource: { color: "#f99030", fontSize: 13, fontWeight: "600", flex: 1 },
  cardChev: { color: "#6b7280", fontSize: 11, marginLeft: 8 },
  cardScore: { color: "#6b7280", fontSize: 11, marginTop: 4 },
  cardText: { color: "#d1d5db", fontSize: 12, lineHeight: 18, marginTop: 8 },

  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  chainBadge: {
    backgroundColor: "#14532d50",
    borderWidth: 1,
    borderColor: "#166534",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chainText: { color: "#4ade80", fontSize: 9 },

  sourceDetails: { marginTop: 8 },
  detailLabel: { color: "#9ca3af", fontSize: 12, marginTop: 4 },
  detailVal: { color: "#f3f4f6", fontWeight: "600" },
  hashVal: { color: "#6b7280", fontFamily: "monospace" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyText: { color: "#6b7280", fontSize: 13, textAlign: "center", lineHeight: 20 },
  loadingText: { color: "#6b7280", fontSize: 12, marginTop: 8 },

  hintChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16, justifyContent: "center" },
  hintChip: {
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  hintText: { color: "#f99030", fontSize: 12 },

  bcContainer: { padding: 12, gap: 10 },
  bcCard: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#374151",
  },
  bcTitle: { color: "#f99030", fontSize: 13, fontWeight: "600", marginBottom: 10 },
  bcRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  bcVal: { color: "#f3f4f6", fontSize: 13 },
  bcSub: { color: "#6b7280", fontSize: 11, marginTop: 4 },
  contractRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  contractName: { color: "#d1d5db", fontSize: 12 },
  bcInfoCard: {
    backgroundColor: "#2d1200",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#7c3d00",
  },
  bcInfoText: { color: "#9ca3af", fontSize: 12, lineHeight: 18 },
});
