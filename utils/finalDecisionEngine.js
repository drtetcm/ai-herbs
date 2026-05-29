export function finalDecisionEngine(data) {

  console.log(
    "FINAL ENGINE INPUT:",
    JSON.stringify(data, null, 2)
  );

  let {
    object_type,
    is_herb,
    ai_confidence,
    unknown_probability,
    authenticity_score,
    scene_interference,
    possible_candidates,
    ocr_text_density,
    contains_chinese_text,
    contains_packaging,
    contains_logo,
    contains_product_layout,
    contains_price_tag
  } = data;

  let final_label = "UNKNOWN";

  let final_confidence = ai_confidence || 0;

  let reasons = [];

  // =========================
  // HARD FOOD REJECTION
  // =========================

  if (object_type === "food") {

    return {
      final_label: "FOOD",
      final_confidence: 0,
      reasons: [
        "Object classified as food"
      ],
      possible_candidates: []
    };

  }

  // =========================
  // COMMERCIAL CONTAMINATION
  // =========================

  const commercialScene =

    scene_interference === "herb_packaging" ||
    scene_interference === "medicine_cabinet" ||
    scene_interference === "product_page" ||
    scene_interference === "advertisement" ||

    contains_product_layout === true ||
    contains_price_tag === true ||
    contains_logo === true;

  if (commercialScene) {

    final_label = "UNKNOWN";

    final_confidence = 0;

    reasons.push(
      "Commercial scene contamination detected"
    );

    console.log(
      "FINAL ENGINE RESULT:",
      {
        final_label,
        final_confidence,
        reasons
      }
    );

    return {
      final_label,
      final_confidence,
      reasons,
      possible_candidates: []
    };

  }

  // =========================
  // OCR CONTAMINATION
  // =========================

  if (ocr_text_density >= 40) {

    final_label = "UNKNOWN";

    final_confidence = 0;

    reasons.push(
      "Heavy OCR contamination detected"
    );

    console.log(
      "FINAL ENGINE RESULT:",
      {
        final_label,
        final_confidence,
        reasons
      }
    );

    return {
      final_label,
      final_confidence,
      reasons,
      possible_candidates: []
    };

  }

  // =========================
  // SCENE INTERFERENCE
  // =========================

  if (
    scene_interference &&
    scene_interference !== "none" &&
    scene_interference !== "clean"
  ) {

    final_confidence -= 15;

    reasons.push(
      `Scene interference: ${scene_interference}`
    );

  }

  // =========================
  // CHINESE LABEL
  // =========================

  if (contains_chinese_text) {

    final_confidence -= 15;

    reasons.push(
      "Chinese label contamination"
    );

  }

  // =========================
  // PACKAGING
  // =========================

  if (contains_packaging) {

    final_confidence -= 20;

    reasons.push(
      "Packaging detected"
    );

  }

  // =========================
  // CANDIDATE CONFLICT
  // =========================

  if (
    possible_candidates &&
    possible_candidates.length >= 4
  ) {

    final_confidence -= 10;

    reasons.push(
      "Candidate conflict detected"
    );

  }

  // =========================
  // AUTHENTICITY WARNING
  // =========================

  if (
    authenticity_score <= 30
  ) {

    reasons.push(
      "Low authenticity score"
    );

  }

  // =========================
  // UNKNOWN WARNING
  // =========================

  if (
    unknown_probability >= 70
  ) {

    reasons.push(
      "High unknown probability"
    );

  }

  // =========================
  // LOW CONFIDENCE WARNING
  // =========================

  if (
    ai_confidence <= 20
  ) {

    reasons.push(
      "Low AI confidence"
    );

  }

  // =========================
  // HERB VALIDATION
  // =========================

  if (

    is_herb === true &&

    authenticity_score >= 60 &&

    unknown_probability <= 40 &&

    ai_confidence >= 35

  ) {

    final_label = "HERB";

    reasons.push(
      "Passed industrial herb validation"
    );

  }

  // =========================
  // HERB RECOVERY
  // =========================

  if (

    object_type === "herb" &&
  ai_confidence >= 50 &&
  unknown_probability <= 30 &&
  scene_interference !== "commercial"
) {
  final_label = "HERB";

    final_confidence = Math.max(
      final_confidence,
      ai_confidence
    );

    reasons.push(
      "Recovered by herb confidence"
    );

  }

// =========================
// SHADOW RECOVERY
// =========================

if (
  final_label === "UNKNOWN" &&
  object_type === "herb" &&
  ai_confidence >= 28 &&
  unknown_probability <= 50 &&
  scene_interference === "shadow"
) {
  final_label = "HERB";

  final_confidence = Math.max(
    final_confidence,
    ai_confidence
  );

  reasons.push(
    "Recovered from shadow scene"
  );
}

// =========================
// DARK RECOVERY
// =========================

if (
  final_label === "UNKNOWN" &&
  object_type === "herb" &&
  ai_confidence >= 25 &&
  unknown_probability <= 45 &&
  (
    scene_interference === "dark" ||
    scene_interference === "low_light"
  )
) {
  final_label = "HERB";

  final_confidence = Math.max(
    final_confidence,
    ai_confidence
  );

  reasons.push(
    "Recovered from dark scene"
  );
}

  // =========================
  // FORCE UNKNOWN
  // =========================

  if (

    authenticity_score <= 30 ||

    unknown_probability >= 70 ||

    ai_confidence <= 20

  ) {

    final_label = "UNKNOWN";

    possible_candidates = [];

  }

  // =========================
  // NORMALIZE CONFIDENCE
  // =========================

  if (final_confidence < 0) {
    final_confidence = 0;
  }

  if (final_confidence > 100) {
    final_confidence = 100;
  }

  console.log(
    "FINAL ENGINE RESULT:",
    {
      final_label,
      final_confidence,
      reasons
    }
  );

  return {

    final_label,

    final_confidence,

    reasons,

    possible_candidates

  };

}