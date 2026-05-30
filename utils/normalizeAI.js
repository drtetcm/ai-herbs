// utils/normalizeAI.js

/* =========================
   SAFE HELPERS
========================= */

function safeString(value, fallback = "") {

  if (typeof value === "string") {
    return value.trim();
  }

  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value).trim();

}

function safeNumber(value, fallback = 0) {

  const num = Number(value);

  if (Number.isNaN(num)) {
    return fallback;
  }

  return num;

}

function safeArray(value) {

  return Array.isArray(value)
    ? value
    : [];

}

/* =========================
   CANDIDATE NORMALIZER
========================= */

function normalizeCandidates(candidates) {

  const safeCandidates =
    safeArray(candidates);

  return safeCandidates.map((item) => {

    // STRING
    if (typeof item === "string") {

      return {

        herb_name: item,

        confidence: 0,

        reason: ""

      };

    }

    // OBJECT
    if (
      typeof item === "object" &&
      item !== null
    ) {

      return {

        herb_name:
          safeString(
            item.herb_name ||
            item.name ||
            item.herb ||
            "未知候选"
          ),

        confidence:
          safeNumber(
            item.confidence,
            0
          ),

        reason:
          safeString(
            item.reason,
            ""
          )

      };

    }

    return {

      herb_name: "未知候选",

      confidence: 0,

      reason: ""

    };

  });

}

/* =========================
   VISUAL ANALYSIS
========================= */

function normalizeVisualAnalysis(vf) {

  if (
    typeof vf !== "object" ||
    vf === null
  ) {

    return {

      color: "",
      texture: "",
      shape: "",
      surface: "",
      edges: "",
      structure: "",
      powder_characteristics: "",
      lighting_impact: "",
      occlusion_impact: "",
      scene_impact: ""

    };

  }

  return {

    color:
      safeString(vf.color),

    texture:
      safeString(vf.texture),

    shape:
      safeString(vf.shape),

    surface:
      safeString(vf.surface),

    edges:
      safeString(vf.edges),

    structure:
      safeString(vf.structure),

    powder_characteristics:
      safeString(
        vf.powder_characteristics
      ),

    lighting_impact:
      safeString(
        vf.lighting_impact
      ),

    occlusion_impact:
      safeString(
        vf.occlusion_impact
      ),

    scene_impact:
      safeString(
        vf.scene_impact
      )

  };

}

/* =========================
   MAIN NORMALIZER
========================= */

export function normalizeAI(raw) {

  const normalized = {

    herb_form:
  safeString(
    raw.herb_form,
    "unknown"
  ),

    herb_name:
      safeString(
        raw.herb_name,
        "待确认药材"
      ),

    confidence:
      safeNumber(
        raw.confidence,
        0
      ),

    risk_level:
      safeString(
        raw.risk_level,
        "UNKNOWN"
      ),

    visibility:
      safeNumber(
        raw.visibility ??
        raw.visibility_score,
        0
      ),

    clarity:
      safeString(
        raw.clarity ??
        raw.image_blur_level,
        "UNKNOWN"
      ),

    lighting:
      safeString(
        raw.lighting ??
        raw.lighting_quality,
        "UNKNOWN"
      ),

    occlusion_level:
      safeString(
        raw.occlusion_level,
        "unknown"
      ),

    scene_interference:
      safeString(
        raw.scene_interference,
        "unknown"
      ),

    subject_completeness:
      safeNumber(
        raw.subject_completeness,
        0
      ),

    morphology_integrity:
      safeNumber(
        raw.morphology_integrity,
        0
      ),

    texture_visibility:
      safeNumber(
        raw.texture_visibility,
        0
      ),

    object_type:
      safeString(
        raw.object_type,
        "unknown"
      ),

    is_herb_like:
  ![
    "plastic",
    "food",
    "table",
    "human_hand",
    "animal",
    "packaging",
    "mixed_objects",
    "unknown"
  ].includes(
    safeString(
      raw.object_type,
      "unknown"
    )
  ),  

    unknown_probability:
      safeNumber(
        raw.unknown_probability,
        0
      ),

    force_unknown:
      Boolean(
        raw.force_unknown
      ),

    abnormal_issues:
      safeString(
        raw.abnormal_issues,
        ""
      ),

    reasoning:
      safeString(
        raw.reasoning,
        ""
      ),

    possible_candidates:
      normalizeCandidates(
        raw.possible_candidates
      ),

    visual_analysis:
      normalizeVisualAnalysis(
        raw.visual_analysis
      )

  };

  /* =========================
     FALLBACKS
  ========================= */

  if (
    normalized.possible_candidates
      .length >= 1 &&
    !normalized.herb_name
  ) {

    normalized.herb_name =
      normalized
        .possible_candidates[0]
        .herb_name;

  }

  /* =========================
     HARD LIMIT
  ========================= */

  if (
    normalized.confidence > 100
  ) {

    normalized.confidence = 100;

  }

  if (
    normalized.confidence < 0
  ) {

    normalized.confidence = 0;

  }

  return normalized;

}