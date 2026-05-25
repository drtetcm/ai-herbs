export function calculateRisk(result) {

  let totalRisk = 0;

  /* =========================
     BASIC VALUES
  ========================= */

  const confidence =
    Number(result.confidence || 0);

  const visibility =
    parseInt(result.visibility || 0);

  const clarity =
    result.clarity || "";

  const lighting =
    result.lighting || "";

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
     AI CONFIDENCE
  ========================= */

  if (confidence >= 90) {

    totalRisk += 5;

  }

  else if (confidence >= 75) {

    totalRisk += 15;

  }

  else if (confidence >= 60) {

    totalRisk += 30;

  }

  else if (confidence >= 40) {

    totalRisk += 50;

  }

  else {

    totalRisk += 75;

  }

  /* =========================
     VISIBILITY
  ========================= */

  if (visibility >= 85) {

    totalRisk += 5;

  }

  else if (visibility >= 70) {

    totalRisk += 15;

  }

  else if (visibility >= 50) {

    totalRisk += 30;

  }

  else {

    totalRisk += 60;

  }

  /* =========================
     BLUR ANALYSIS
  ========================= */

  const blurText =
    clarity.toUpperCase();

  if (

    blurText.includes("HIGH") ||

    clarity.includes("严重模糊") ||

    clarity.includes("极度模糊")

  ) {

    totalRisk += 50;

  }

  else if (

    blurText.includes("MEDIUM") ||

    clarity.includes("低度模糊") ||

    clarity.includes("轻微模糊")

  ) {

    totalRisk += 25;

  }

  else if (

    blurText.includes("LOW") ||

    clarity.includes("清晰")

  ) {

    totalRisk += 5;

  }

  /* =========================
     LIGHTING ANALYSIS
  ========================= */

  const lightingText =
    lighting.toUpperCase();

  if (

    lightingText.includes("DARK") ||

    lighting.includes("暗") ||

    lighting.includes("阴影")

  ) {

    totalRisk += 30;

  }

  else if (

    lightingText.includes("MEDIUM") ||

    lighting.includes("一般")

  ) {

    totalRisk += 15;

  }

  else if (

    lightingText.includes("GOOD") ||

    lighting.includes("良好")

  ) {

    totalRisk += 5;

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
    "animal"

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

    confidence < 45 ||

    visibility < 40 ||

    blurText.includes("HIGH") ||

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
     UNKNOWN OVERRIDE
  ========================= */

  let riskLevel = "LOW";

  if (

    isUnknown ||

    totalRisk >= 75

  ) {

    riskLevel = "HIGH";

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

  /* =========================
     RETURN
  ========================= */

  return {

    totalRisk,

    riskLevel,

    isUnknown,

    confidence,

    visibility,

    clarity,

    lighting,

    objectType,

    unknownProbability

  };

}