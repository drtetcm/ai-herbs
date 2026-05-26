export function calculateRisk(result) {

  let totalRisk = 0;

  let adjustedConfidence =
    Number(result.confidence || 0);

  /* =========================
     BASIC VALUES
  ========================= */

  const visibility =
    parseInt(result.visibility || 0);

  const clarity =
    String(result.clarity || "");

  const lighting =
    String(result.lighting || "");

  const herbName =
    result.herb_name ||
    result.herbName ||
    "";

  const abnormal =
    result.abnormal_issues ||
    result.abnormal ||
    "";

  const unknownProbability =
    Number(
      result.unknown_probability || 0
    );

  const objectType =
    result.object_type || "unknown";

  const forceUnknown =
    Boolean(result.force_unknown);

  let isUnknown = false;

  /* =========================
     NORMALIZED TEXT
  ========================= */

  const blurText =
    clarity.toUpperCase();

  const lightingText =
    lighting.toUpperCase();

  /* =========================
     IMAGE QUALITY PENALTIES
     (工业级视觉风控核心)
  ========================= */

  // -------------------------
  // BLUR PENALTY
  // -------------------------

  if (

    blurText.includes("EXTREME") ||

    blurText.includes("VERY_LOW") ||

    clarity.includes("严重模糊") ||

    clarity.includes("极度模糊")

  ) {

    adjustedConfidence -= 35;

    totalRisk += 45;

  }

  else if (

    blurText.includes("MEDIUM") ||

    clarity.includes("中度模糊")

  ) {

    adjustedConfidence -= 20;

    totalRisk += 25;

  }

  else if (

    blurText.includes("LOW") ||

    clarity.includes("轻微模糊")

  ) {

    adjustedConfidence -= 10;

    totalRisk += 10;

  }

  // -------------------------
  // VISIBILITY PENALTY
  // -------------------------

  if (visibility < 20) {

    adjustedConfidence -= 40;

    totalRisk += 50;

  }

  else if (visibility < 40) {

    adjustedConfidence -= 30;

    totalRisk += 35;

  }

  else if (visibility < 60) {

    adjustedConfidence -= 20;

    totalRisk += 20;

  }

  else if (visibility < 75) {

    adjustedConfidence -= 10;

    totalRisk += 10;

  }

  // -------------------------
  // LIGHTING PENALTY
  // -------------------------

  // 极暗

  if (

    lightingText.includes("POOR") ||

    lightingText.includes("DARK") ||

    lighting.includes("极暗") ||

    lighting.includes("严重暗光")

  ) {

    adjustedConfidence -= 35;

    totalRisk += 40;

  }

  // 中暗

  else if (

    lightingText.includes("MODERATE") ||

    lighting.includes("暗") ||

    lighting.includes("阴影")

  ) {

    adjustedConfidence -= 20;

    totalRisk += 20;

  }

  // 曝光过度

  if (

    lightingText.includes("OVEREXPOSED") ||

    lighting.includes("曝光")

  ) {

    adjustedConfidence -= 45;

    totalRisk += 60;

  }

  // 黄光 / 色温污染

  if (

    lightingText.includes("WARM") ||

    lightingText.includes("YELLOW") ||

    lighting.includes("黄光")

  ) {

    adjustedConfidence -= 15;

    totalRisk += 15;

  }

  // 强阴影

  if (

    lightingText.includes("SHADOW") ||

    lighting.includes("强阴影")

  ) {

    adjustedConfidence -= 20;

    totalRisk += 25;

  }

  // 反光

  if (

    lightingText.includes("REFLECTION") ||

    lighting.includes("反光")

  ) {

    adjustedConfidence -= 30;

    totalRisk += 35;

  }

  /* =========================
     CONFIDENCE ANALYSIS
  ========================= */

  if (adjustedConfidence >= 90) {

    totalRisk += 5;

  }

  else if (adjustedConfidence >= 75) {

    totalRisk += 15;

  }

  else if (adjustedConfidence >= 60) {

    totalRisk += 30;

  }

  else if (adjustedConfidence >= 40) {

    totalRisk += 50;

  }

  else {

    totalRisk += 75;

  }

  /* =========================
     UNKNOWN PROBABILITY
  ========================= */

  if (unknownProbability >= 80) {

    totalRisk += 60;

  }

  else if (unknownProbability >= 60) {

    totalRisk += 45;

  }

  else if (unknownProbability >= 40) {

    totalRisk += 30;

  }

  else if (unknownProbability >= 20) {

    totalRisk += 15;

  }

  else {

    totalRisk += 5;

  }

  /* =========================
     OBJECT TYPE ANALYSIS
  ========================= */

  const dangerousObjects = [

    "plastic",
    "food",
    "packaging",
    "table",
    "human_hand",
    "animal",
    "tool"

  ];

  if (
    dangerousObjects.includes(objectType)
  ) {

    totalRisk += 60;

    isUnknown = true;

  }

  if (objectType === "powder") {

    totalRisk += 45;

    isUnknown = true;

  }

  if (objectType === "unknown") {

    totalRisk += 40;

    isUnknown = true;

  }

  /* =========================
     UNKNOWN MODE
  ========================= */

  if (

    herbName.includes("未知") ||

    herbName.includes("非药材") ||

    adjustedConfidence < 45 ||

    visibility < 40 ||

    blurText.includes("EXTREME") ||

    blurText.includes("VERY_LOW") ||

    unknownProbability >= 60 ||

    forceUnknown

  ) {

    isUnknown = true;

    totalRisk += 40;

  }

  /* =========================
     ABNORMAL ANALYSIS
  ========================= */

  if (abnormal.length > 180) {

    totalRisk += 25;

  }

  else if (abnormal.length > 100) {

    totalRisk += 15;

  }

  /* =========================
     HARD LIMIT
  ========================= */

  if (adjustedConfidence < 5) {

    adjustedConfidence = 5;

  }

  if (adjustedConfidence > 99) {

    adjustedConfidence = 99;

  }

  /* =========================
     FINAL RISK LEVEL
  ========================= */

  let riskLevel = "GOOD";

  if (

    isUnknown ||

    totalRisk >= 75

  ) {

    riskLevel = "POOR";

  }

  else if (totalRisk >= 50) {

    riskLevel = "MEDIUM";

  }

  else if (totalRisk >= 25) {

    riskLevel = "ELEVATED";

  }

  /* =========================
     HARD LIMIT
  ========================= */

  if (totalRisk > 100) {

    totalRisk = 100;

  }

  totalRisk =
    Math.round(totalRisk);

  adjustedConfidence =
    Math.round(adjustedConfidence);

  /* =========================
     RETURN
  ========================= */

  return {

    totalRisk,

    riskLevel,

    isUnknown,

    confidence:
      adjustedConfidence,

    visibility,

    clarity,

    lighting,

    objectType,

    unknownProbability

  };

}