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

export default NODES;
