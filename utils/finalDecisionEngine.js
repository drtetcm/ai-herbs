export function finalDecisionEngine(data) {

  console.log(
  "FINAL ENGINE INPUT:",
  JSON.stringify(data, null, 2)
);

  const {
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
  // INDUSTRIAL CONTAMINATION
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

    possible_candidates = [];

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
      possible_candidates
    };

  }

  // =========================
  // OCR CONTAMINATION
  // =========================

  if (ocr_text_density >= 40) {

    final_label = "UNKNOWN";

    final_confidence = 0;

    possible_candidates = [];

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
      possible_candidates
    };

  }

  // =========================
  // AUTHENTICITY LOW
  // =========================

  if (
    authenticity_score <= 30
  ) {

    reasons.push(
      "Low authenticity score"
    );
  }

  // =========================
  // HIGH UNKNOWN PROBABILITY
  // =========================

  if (
    unknown_probability >= 70
  ) {

    reasons.push(
      "High unknown probability"
    );
  }

  // =========================
  // LOW CONFIDENCE
  // =========================

  if (
    ai_confidence <= 20
  ) {

    reasons.push(
      "Low AI confidence"
    );
  }

  // =========================
  // SCENE INTERFERENCE
  // =========================

  if (
    scene_interference === true
  ) {

    final_confidence -= 15;

    reasons.push(
      "Scene interference detected"
    );
  }

  // =========================
  // MULTI-CANDIDATE CONFLICT
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
  // FINAL HERB DECISION
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
  authenticity_score >= 80 &&

  unknown_probability <= 40

) {

  final_label = "HERB";

  final_confidence =
    Math.max(
      final_confidence,
      50
    );

  reasons.push(
    "Recovered by high authenticity"
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

// ============================
// CHINESE LABEL CONTAMINATION
// ============================

if (
  contains_chinese_text === true
) {

  final_confidence -= 15;

  reasons.push(
    "Chinese label contamination"
  );

}


// ============================
// PRODUCT PAGE CONTAMINATION
// ============================

if (
  contains_product_layout === true
) {

  final_label = "UNKNOWN";

  final_confidence -= 35;

  reasons.push(
    "E-commerce layout contamination"
  );

}


// ============================
// PACKAGING DETECTION
// ============================

if (
  contains_packaging === true
) {

  final_confidence -= 20;

  reasons.push(
    "Packaging detected"
  );

}


// ============================
// PRICE TAG DETECTION
// ============================

if (
  contains_price_tag === true
) {

  final_label = "UNKNOWN";

  final_confidence -= 30;

  reasons.push(
    "Commercial advertisement contamination"
  );

}
// =========================
// FINAL RETURN
// =========================

return {

  final_label,

  final_confidence,

  reasons

};
}