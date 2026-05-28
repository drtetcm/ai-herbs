export function finalDecisionEngine(data) {

  const {
    object_type,
    is_herb,
    ai_confidence,
    unknown_probability,
    authenticity_score,
    scene_interference,
    possible_candidates
  } = data;

  let final_label = "UNKNOWN";

  let final_confidence = ai_confidence || 0;

  let reasons = [];

  // =========================
  // HARD FOOD REJECTION
  // =========================

  if (object_type === "food") {

    final_label = "FOOD";

    final_confidence = 0;

    reasons.push(
      "Object classified as food"
    );

    return {
      final_label,
      final_confidence,
      reasons
    };
  }

  // =========================
  // AUTHENTICITY LOW
  // =========================

  if (
    authenticity_score <= 30
  ) {

    final_label = "UNKNOWN";

    reasons.push(
      "Low authenticity score"
    );
  }

  // =========================
  // UNKNOWN PROBABILITY
  // =========================

  if (
    unknown_probability >= 70
  ) {

    final_label = "UNKNOWN";

    reasons.push(
      "High unknown probability"
    );
  }

  // =========================
  // LOW AI CONFIDENCE
  // =========================

  if (
    ai_confidence <= 20
  ) {

    final_label = "UNKNOWN";

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
  // NORMALIZE CONFIDENCE
  // =========================

  if (final_confidence < 0) {
    final_confidence = 0;
  }

  if (final_confidence > 100) {
    final_confidence = 100;
  }

  return {

    final_label,

    final_confidence,

    reasons

  };

}