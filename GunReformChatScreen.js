import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";

const NODES = {
  start: {
    id: "start",
    type: "single",
    text:
      "How would you describe your overall position on gun ownership in the U.S.?",
    options: [
      {
        label: "Strongly support the right to own guns",
        value: "strong_rights",
        next: "2A_Q1",
        records: { baseline: "Strong gun rights" },
      },
      {
        label: "There should be some restrictions",
        value: "mixed",
        next: "2B_Q1",
        records: { baseline: "Mixed / Some restrictions" },
      },
      {
        label: "Guns should be heavily restricted or banned",
        value: "strong_control",
        next: "2C_Q1",
        records: { baseline: "Strong gun control" },
      },
    ],
  },
  "2A_Q1": {
    id: "2A_Q1",
    type: "single",
    text:
      "Do you believe any group of people should not be allowed to own guns (e.g., people with violent criminal records, domestic abusers, severe mental illness)?",
    options: [
      {
        label: "Yes",
        value: "yes_exclusions",
        next: "2A_Q1_groups",
        records: { rights_exclusions_exist: true },
      },
      {
        label: "No",
        value: "no_exclusions",
        next: "3_rights_Q1",
        records: { rights_exclusions_exist: false },
      },
    ],
  },
  "2A_Q1_groups": {
    id: "2A_Q1_groups",
    type: "multi",
    text: "Which groups should be excluded from owning guns? (Select all that apply)",
    options: [
      { label: "Violent felony convictions", value: "violent_felons" },
      { label: "Domestic violence convictions", value: "domestic_violence" },
      { label: "Severe mental illness posing danger", value: "severe_mental" },
      { label: "Other serious threats", value: "other_threats" },
    ],
    next: "2A_Q2",
    recordsKey: "rights_excluded_groups",
  },
  "2A_Q2": {
    id: "2A_Q2",
    type: "single",
    text:
      "Would you support measures to screen out those groups (e.g., background checks or red-flag laws)?",
    options: [
      {
        label: "Yes, support screening measures",
        value: "support_screening",
        next: "3_rights_Q1",
        records: { rights_supports_screening: true },
      },
      {
        label: "No, oppose those measures",
        value: "oppose_screening",
        next: "3_rights_Q1",
        records: { rights_supports_screening: false },
      },
      {
        label: "Depends on details",
        value: "depends_screening",
        next: "3_rights_Q1",
        records: { rights_supports_screening: "depends" },
      },
    ],
  },
  "2B_Q1": {
    id: "2B_Q1",
    type: "multi",
    text: "Which restrictions do you think are reasonable? (Select all that apply)",
    options: [
      { label: "Universal background checks", value: "bg_checks" },
      { label: "Waiting periods", value: "waiting_periods" },
      { label: "Red-flag laws", value: "red_flag" },
      { label: "Assault weapon limits", value: "assault_limits" },
    ],
    next: "2B_Q2",
    recordsKey: "moderate_restrictions",
  },
  "2B_Q2": {
    id: "2B_Q2",
    type: "single",
    text:
      "Do you think law-abiding citizens should be able to own most types of firearms, or only certain ones?",
    options: [
      {
        label: "Most types",
        value: "most_types",
        next: "3_moderate_Q1",
        records: { moderate_scope: "most_types" },
      },
      {
        label: "Only certain ones",
        value: "certain_only",
        next: "3_moderate_Q1",
        records: { moderate_scope: "certain_only" },
      },
      {
        label: "Not sure / depends",
        value: "depends",
        next: "3_moderate_Q1",
        records: { moderate_scope: "depends" },
      },
    ],
  },
  "2C_Q1": {
    id: "2C_Q1",
    type: "single",
    text:
      "Would you support a complete ban on civilian gun ownership, or should exceptions (hunters, sport shooters, rural households) exist?",
    options: [
      {
        label: "Complete ban",
        value: "complete_ban",
        next: "3_control_Q1",
        records: { control_exceptions: "none" },
      },
      {
        label: "Allow exceptions",
        value: "allow_exceptions",
        next: "2C_Q2",
        records: { control_exceptions: "some" },
      },
    ],
  },
  "2C_Q2": {
    id: "2C_Q2",
    type: "multi",
    text: "If exceptions exist, how should they be regulated? (Select all that apply)",
    options: [
      { label: "Strict licensing & renewals", value: "licensing" },
      { label: "Mandatory training & testing", value: "training" },
      { label: "Safe storage & inspections", value: "storage" },
      { label: "Limited firearm types", value: "limited_types" },
    ],
    next: "3_control_Q1",
    recordsKey: "control_regulations",
  },
  "3_rights_Q1": {
    id: "3_rights_Q1",
    type: "single",
    text:
      "Would you accept universal background checks if it meant fewer proposals for bans?",
    options: [
      {
        label: "Yes",
        value: "yes_rights_bgchecks",
        next: "3_rights_Q2",
        records: { rights_trade_bgchecks_for_fewer_bans: true },
      },
      {
        label: "No",
        value: "no_rights_bgchecks",
        next: "3_rights_Q2",
        records: { rights_trade_bgchecks_for_fewer_bans: false },
      },
      {
        label: "Depends",
        value: "depends_rights_bgchecks",
        next: "3_rights_Q2",
        records: { rights_trade_bgchecks_for_fewer_bans: "depends" },
      },
    ],
  },
  "3_rights_Q2": {
    id: "3_rights_Q2",
    type: "single",
    text:
      "Would you support limits on high-capacity magazines if self-defense handguns are unaffected?",
    options: [
      {
        label: "Yes",
        value: "yes_rights_mags",
        next: "4_common_Q1",
        records: { rights_mag_limits_ok_if_handguns_ok: true },
      },
      {
        label: "No",
        value: "no_rights_mags",
        next: "4_common_Q1",
        records: { rights_mag_limits_ok_if_handguns_ok: false },
      },
      {
        label: "Depends",
        value: "depends_rights_mags",
        next: "4_common_Q1",
        records: { rights_mag_limits_ok_if_handguns_ok: "depends" },
      },
    ],
  },
  "3_moderate_Q1": {
    id: "3_moderate_Q1",
    type: "single",
    text:
      "If stronger background checks were guaranteed, would you be okay with people still owning AR-15s?",
    options: [
      {
        label: "Yes",
        value: "mod_ok_ar15",
        next: "3_moderate_Q2",
        records: { mod_ok_ar15_with_strong_checks: true },
      },
      {
        label: "No",
        value: "mod_not_ok_ar15",
        next: "3_moderate_Q2",
        records: { mod_ok_ar15_with_strong_checks: false },
      },
      {
        label: "Depends",
        value: "mod_dep_ar15",
        next: "3_moderate_Q2",
        records: { mod_ok_ar15_with_strong_checks: "depends" },
      },
    ],
  },
  "3_moderate_Q2": {
    id: "3_moderate_Q2",
    type: "single",
    text:
      "Would you trade shorter waiting periods for stronger red-flag laws?",
    options: [
      {
        label: "Yes",
        value: "mod_trade_yes",
        next: "4_common_Q1",
        records: { mod_trade_waiting_for_redflag: true },
      },
      {
        label: "No",
        value: "mod_trade_no",
        next: "4_common_Q1",
        records: { mod_trade_waiting_for_redflag: false },
      },
      {
        label: "Depends",
        value: "mod_trade_dep",
        next: "4_common_Q1",
        records: { mod_trade_waiting_for_redflag: "depends" },
      },
    ],
  },
  "3_control_Q1": {
    id: "3_control_Q1",
    type: "single",
    text:
      "Would you accept keeping handguns legal for self-defense if stronger restrictions applied to military-style weapons?",
    options: [
      {
        label: "Yes",
        value: "control_accept_handguns",
        next: "3_control_Q2",
        records: { control_keep_handguns_if_strict_on_military: true },
      },
      {
        label: "No",
        value: "control_reject_handguns",
        next: "3_control_Q2",
        records: { control_keep_handguns_if_strict_on_military: false },
      },
      {
        label: "Depends",
        value: "control_dep_handguns",
        next: "3_control_Q2",
        records: { control_keep_handguns_if_strict_on_military: "depends" },
      },
    ],
  },
  "3_control_Q2": {
    id: "3_control_Q2",
    type: "single",
    text:
      "Would you allow concealed carry with very strict training requirements?",
    options: [
      {
        label: "Yes",
        value: "control_allow_ccw",
        next: "4_common_Q1",
        records: { control_allow_ccw_with_training: true },
      },
      {
        label: "No",
        value: "control_disallow_ccw",
        next: "4_common_Q1",
        records: { control_allow_ccw_with_training: false },
      },
      {
        label: "Depends",
        value: "control_dep_ccw",
        next: "4_common_Q1",
        records: { control_allow_ccw_with_training: "depends" },
      },
    ],
  },
  "4_common_Q1": {
    id: "4_common_Q1",
    type: "single",
    text:
      "Should people with a history of domestic violence be prevented from buying guns?",
    options: [
      {
        label: "Yes",
        value: "cg_dv_yes",
        next: "4_common_Q2",
        records: { cg_domestic_violence_prohibit: true },
      },
      {
        label: "No",
        value: "cg_dv_no",
        next: "4_common_Q2",
        records: { cg_domestic_violence_prohibit: false },
      },
      {
        label: "Depends",
        value: "cg_dv_dep",
        next: "4_common_Q2",
        records: { cg_domestic_violence_prohibit: "depends" },
      },
    ],
  },
  "4_common_Q2": {
    id: "4_common_Q2",
    type: "single",
    text: "Should all gun buyers pass a background check?",
    options: [
      {
        label: "Yes",
        value: "cg_bg_yes",
        next: "4_common_Q3",
        records: { cg_universal_background_checks: true },
      },
      {
        label: "No",
        value: "cg_bg_no",
        next: "4_common_Q3",
        records: { cg_universal_background_checks: false },
      },
      {
        label: "Depends",
        value: "cg_bg_dep",
        next: "4_common_Q3",
        records: { cg_universal_background_checks: "depends" },
      },
    ],
  },
  "4_common_Q3": {
    id: "4_common_Q3",
    type: "single",
    text:
      "Should gun owners be required to store firearms safely away from children?",
    options: [
      {
        label: "Yes",
        value: "cg_storage_yes",
        next: "4_common_Q4",
        records: { cg_safe_storage_required: true },
      },
      {
        label: "No",
        value: "cg_storage_no",
        next: "4_common_Q4",
        records: { cg_safe_storage_required: false },
      },
      {
        label: "Depends",
        value: "cg_storage_dep",
        next: "4_common_Q4",
        records: { cg_safe_storage_required: "depends" },
      },
    ],
  },
  "4_common_Q4": {
    id: "4_common_Q4",
    type: "single",
    text:
      "Should we improve mental health reporting to keep firearms out of dangerous hands?",
    options: [
      {
        label: "Yes",
        value: "cg_mh_yes",
        next: "end",
        records: { cg_improve_mh_reporting: true },
      },
      {
        label: "No",
        value: "cg_mh_no",
        next: "end",
        records: { cg_improve_mh_reporting: false },
      },
      {
        label: "Depends",
        value: "cg_mh_dep",
        next: "end",
        records: { cg_improve_mh_reporting: "depends" },
      },
    ],
  },
  end: {
    id: "end",
    type: "end",
    text: "Thanks for sharing. Here’s a quick summary of your responses:",
    options: [],
  },
};

function summarize(profile) {
  const parts = [];
  if (profile.baseline) {
    parts.push(`• Baseline stance: ${profile.baseline}.`);
  }

  if (profile.rights_exclusions_exist !== undefined) {
    if (profile.rights_exclusions_exist) {
      const groups = profile.rights_excluded_groups?.length
        ? profile.rights_excluded_groups.join(", ")
        : "unspecified groups";
      parts.push(`• Believes some groups should be excluded: ${groups}.`);
      parts.push(
        `• Supports screening measures: ${stringify(profile.rights_supports_screening)}.`
      );
    } else {
      parts.push("• Does not support excluding specific groups from ownership.");
    }
  }

  if (profile.moderate_restrictions) {
    parts.push(
      `• Reasonable restrictions selected: ${profile.moderate_restrictions.join(
        ", "
      )}.`
    );
    if (profile.moderate_scope) {
      parts.push(
        `• Scope of allowed firearms for law-abiding citizens: ${profile.moderate_scope}.`
      );
    }
  }

  if (profile.control_exceptions) {
    parts.push(
      `• Control path—exceptions: ${
        profile.control_exceptions === "none" ? "No (complete ban)" : "Yes (some exceptions)"
      }.`
    );
  }
  if (profile.control_regulations?.length) {
    parts.push(
      `• Preferred regulations for exceptions: ${profile.control_regulations.join(
        ", "
      )}.`
    );
  }

  if (profile.rights_trade_bgchecks_for_fewer_bans !== undefined) {
    parts.push(
      `• Trade-off (rights): background checks for fewer bans → ${stringify(
        profile.rights_trade_bgchecks_for_fewer_bans
      )}.`
    );
  }
  if (profile.rights_mag_limits_ok_if_handguns_ok !== undefined) {
    parts.push(
      `• Limit high-capacity magazines if handguns unaffected → ${stringify(
        profile.rights_mag_limits_ok_if_handguns_ok
      )}.`
    );
  }
  if (profile.mod_ok_ar15_with_strong_checks !== undefined) {
    parts.push(
      `• Moderates: AR-15s okay with strong background checks → ${stringify(
        profile.mod_ok_ar15_with_strong_checks
      )}.`
    );
  }
  if (profile.mod_trade_waiting_for_redflag !== undefined) {
    parts.push(
      `• Moderates: trade shorter waits for stronger red-flag laws → ${stringify(
        profile.mod_trade_waiting_for_redflag
      )}.`
    );
  }
  if (profile.control_keep_handguns_if_strict_on_military !== undefined) {
    parts.push(
      `• Control: keep handguns legal if strict on military-style weapons → ${stringify(
        profile.control_keep_handguns_if_strict_on_military
      )}.`
    );
  }
  if (profile.control_allow_ccw_with_training !== undefined) {
    parts.push(
      `• Control: allow concealed carry with strict training → ${stringify(
        profile.control_allow_ccw_with_training
      )}.`
    );
  }

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

function GunReformChatScreen() {
  const [currentId, setCurrentId] = useState("start");
  const [profile, setProfile] = useState({});
  const [transcript, setTranscript] = useState([]);
  const [multiSelections, setMultiSelections] = useState({});

  const node = useMemo(() => NODES[currentId], [currentId]);

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

  const isEnd = node.type === "end";
  const summary = useMemo(() => (isEnd ? summarize(profile) : ""), [isEnd, profile]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Gun Reform Dialogue</Text>
        <Text style={styles.subtitle}>Find stance • Test boundaries • Build common ground</Text>
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

export default GunReformChatScreen;
