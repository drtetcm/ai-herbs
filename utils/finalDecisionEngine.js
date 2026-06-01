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

  console.log(
  "OCR DEBUG:",
  {
    ocr_text_density,
    contains_chinese_text,
    contains_packaging,
    contains_logo,
    contains_product_layout,
    contains_price_tag
  }
);

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

const commercialIndicators =
  (contains_product_layout ? 1 : 0) +
  (contains_price_tag ? 1 : 0) +
  (contains_packaging ? 1 : 0);

const commercialScene =

  scene_interference === "herb_packaging" ||
  scene_interference === "product_page" ||
  scene_interference === "medicine_cabinet" ||
  scene_interference === "advertisement" ||

  commercialIndicators >= 2;

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
  
    if (ocr_text_density >= 20) {
  contaminationScore += 20;
}

if (ocr_text_density >= 40) {
  contaminationScore += 40;
}

if (ocr_text_density >= 60) {
  contaminationScore += 60;
}
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

  // 中药常见场景
  if (
    scene_interference === "background_objects"
  ) {

    final_confidence -= 5;

    reasons.push(
      `Minor scene interference: ${scene_interference}`
    );

  }

  // 其它干扰
  else {

    final_confidence -= 15;

    reasons.push(
      `Scene interference: ${scene_interference}`
    );

  }

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

let contaminationScore = 0;

if (contains_packaging) {
  contaminationScore += 25;

  reasons.push(
    "Packaging detected"
  );
}

if (contains_logo) {
  contaminationScore += 10;

  reasons.push(
    "Logo detected"
  );
}

if (contains_price_tag) {
  contaminationScore += 30;

  reasons.push(
    "Price tag detected"
  );
}

if (contains_product_layout) {
  contaminationScore += 35;

  reasons.push(
    "Commercial layout detected"
  );
}

// =========================
// COMMERCIAL DECISION
// =========================

const commercialSignals =
  (contains_packaging ? 1 : 0) +
  (contains_price_tag ? 1 : 0) +
  (contains_product_layout ? 1 : 0);

// 必须多个证据同时存在
if (
  commercialSignals >= 2 ||
  contaminationScore >= 60
) {
  scene_interference = "commercial";

  reasons.push(
    "Commercial scene contamination detected"
  );
}

  // =========================
// CANDIDATE CONFLICT
// =========================

const candidateCount =
  possible_candidates?.length || 0;

if (candidateCount >= 4) {

  unknown_probability += 15;

  final_confidence -= 10;

  reasons.push(
    "Low candidate consistency"
  );

}

if (candidateCount >= 6) {

  unknown_probability += 25;

  final_confidence -= 15;

  reasons.push(
    "Very low candidate consistency"
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