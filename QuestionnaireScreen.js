import React, { useMemo, useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Supabase } from "./Supabase.js";

function summarize(profile) {
  const parts = [];
  if (profile.baseline) {
    parts.push(`• Baseline stance: ${profile.baseline}.`);
  }
  // ... rest of summarize unchanged ...
  const cg = [];
  if (profile.cg_domestic_violence_prohibit !== undefined)
    cg.push(
      `DV buyer prohibition: ${stringify(profile.cg_domestic_violence_prohibit)}`
    );
  if (profile.cg_universal_background_checks !== undefined)
    cg.push(
      `Universal background checks: ${stringify(
        profile.cg_universal_background_checks
      )}`
    );
  if (profile.cg_safe_storage_required !== undefined)
    cg.push(
      `Safe storage required: ${stringify(profile.cg_safe_storage_required)}`
    );
  if (profile.cg_improve_mh_reporting !== undefined)
    cg.push(
      `Improve mental health reporting: ${stringify(
        profile.cg_improve_mh_reporting
      )}`
    );
  if (cg.length) parts.push(`• Common ground signals → ${cg.join(" | ")}.`);

  const cgScore = [
    profile.cg_domestic_violence_prohibit,
    profile.cg_universal_background_checks,
    profile.cg_safe_storage_required,
    profile.cg_improve_mh_reporting,
  ].reduce((acc, v) => (v === true ? acc + 1 : acc), 0);

  parts.push(`• Common ground index: ${cgScore}/4.`);

  return parts.join("\n");
}

function stringify(val) {
  if (val === true) return "Yes";
  if (val === false) return "No";
  return "Depends";
}

function QuestionnaireScreen({ route }) {
  const { questionnaireId } = route.params;
  const [nodes, setNodes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentId] = useState("start");
  const [profile, setProfile] = useState({});
  const [transcript, setTranscript] = useState([]);
  const [multiSelections, setMultiSelections] = useState({});

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      setLoading(true);
      const { data, error } = await Supabase
        .from("questionnaires")
        .select("nodes")
        .eq("id", questionnaireId)
        .single();

      if (error) {
        console.error("Error fetching questionnaire:", error);
      } else {
        setNodes(data.nodes);
      }
      setLoading(false);
    };

    if (questionnaireId) {
      fetchQuestionnaire();
    }
  }, [questionnaireId]);

  const node = useMemo(() => (nodes ? nodes[currentId] : null), [currentId, nodes]);
  const isEnd = node?.type === "end";

  // ✅ Always declare hooks before any return paths
  const summary = useMemo(() => {
    return isEnd ? summarize(profile) : "";
  }, [isEnd, profile]);

  const handleSingleSelect = (opt) => {
    setTranscript((t) => [
      ...t,
      { q: node.text, a: opt.label, id: node.id, value: opt.value },
    ]);
    if (opt.records) {
      setProfile((p) => ({ ...p, ...opt.records }));
    }
    setCurrentId(opt.next);
  };

  const toggleMulti = (value) => {
    const set = new Set(multiSelections[node.id] || []);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    setMultiSelections((m) => ({ ...m, [node.id]: set }));
  };

  const handleMultiContinue = () => {
    const selected = Array.from(multiSelections[node.id] || []);
    const labels = node.options
      .filter((o) => selected.includes(o.value))
      .map((o) => o.label);
    setTranscript((t) => [
      ...t,
      { q: node.text, a: labels.join(", ") || "(none selected)", id: node.id },
    ]);

    if (node.recordsKey) {
      setProfile((p) => ({ ...p, [node.recordsKey]: labels }));
    }

    setCurrentId(node.next);
  };

  const restart = () => {
    setCurrentId("start");
    setProfile({});
    setTranscript([]);
    setMultiSelections({});
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!node) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.title}>Questionnaire not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Gun Reform Dialogue</Text>
        <Text style={styles.subtitle}>
          Find stance • Test boundaries • Build common ground
        </Text>
      </View>

      <View style={styles.container}>
        <ScrollView style={styles.chat} contentContainerStyle={{ paddingBottom: 24 }}>
          {transcript.map((entry, i) => (
            <View key={i} style={styles.bubblePair}>
              <View style={[styles.bubble, styles.bubbleQ]}>
                <Text style={styles.qLabel}>Question</Text>
                <Text style={styles.qText}>{entry.q}</Text>
              </View>
              <View style={[styles.bubble, styles.bubbleA]}>
                <Text style={styles.aLabel}>Your answer</Text>
                <Text style={styles.aText}>{entry.a}</Text>
              </View>
            </View>
          ))}

          {!isEnd ? (
            <View style={[styles.bubble, styles.bubbleQ, { marginTop: 8 }]}>
              <Text style={styles.qLabel}>Question</Text>
              <Text style={styles.qText}>{node.text}</Text>

              {node.type === "single" && (
                <View style={{ marginTop: 8 }}>
                  {node.options.map((opt) => (
                    <Pressable
                      key={opt.value}
                      onPress={() => handleSingleSelect(opt)}
                      style={({ pressed }) => [
                        styles.choiceBtn,
                        pressed && styles.choiceBtnPressed,
                      ]}
                    >
                      <Text style={styles.choiceText}>{opt.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {node.type === "multi" && (
                <View style={{ marginTop: 8 }}>
                  {node.options.map((opt) => {
                    const selected = multiSelections[node.id]?.has(opt.value);
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => toggleMulti(opt.value)}
                        style={[
                          styles.choiceBtn,
                          selected && styles.choiceBtnSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.choiceText,
                            selected && styles.choiceTextSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                  <Pressable
                    onPress={handleMultiContinue}
                    disabled={!multiSelections[node.id] || multiSelections[node.id].size === 0}
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      (!multiSelections[node.id] ||
                        multiSelections[node.id].size === 0) && styles.disabledBtn,
                      pressed && styles.primaryBtnPressed,
                    ]}
                  >
                    <Text style={styles.primaryBtnText}>Continue</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.bubble, styles.bubbleA, { marginTop: 8 }]}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <Text style={styles.aText}>{summary}</Text>
              <Pressable onPress={restart} style={[styles.primaryBtn, { marginTop: 12 }]}>
                <Text style={styles.primaryBtnText}>Start over</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0e1116",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#0e1116",
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    fontSize: 12,
  },
  container: {
    flex: 1,
  },
  chat: {
    padding: 16,
  },
  bubblePair: {
    marginBottom: 12,
  },
  bubble: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  bubbleQ: {
    backgroundColor: "#141a22",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  bubbleA: {
    backgroundColor: "#10161d",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  qLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  qText: {
    color: "white",
    fontSize: 16,
    lineHeight: 22,
  },
  aLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  aText: {
    color: "white",
    fontSize: 15,
    lineHeight: 21,
  },
  choiceBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 8,
    backgroundColor: "#0f151c",
  },
  choiceBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.995 }],
  },
  choiceBtnSelected: {
    borderColor: "rgba(100,180,255,0.9)",
    backgroundColor: "#0f2233",
  },
  choiceText: {
    color: "white",
    fontSize: 15,
  },
  choiceTextSelected: {
    fontWeight: "700",
  },
  primaryBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#2563eb",
  },
  primaryBtnPressed: {
    opacity: 0.9,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
  summaryTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
});
