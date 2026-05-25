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

    totalRisk += 70;

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

    totalRisk += 55;

  }

  /* =========================
     CLARITY ANALYSIS
  ========================= */

  if (

    clarity.includes("严重模糊") ||

    clarity.includes("极度模糊")

  ) {

    totalRisk += 45;

  }

  else if (

    clarity.includes("低度模糊") ||

    clarity.includes("轻微模糊")

  ) {

    totalRisk += 20;

  }

  else if (

    clarity.includes("清晰")

  ) {

    totalRisk += 5;

  }

  /* =========================
     LIGHTING ANALYSIS
  ========================= */

  if (

    lighting.includes("暗") ||

    lighting.includes("阴影")

  ) {

    totalRisk += 25;

  }

  else if (

    lighting.includes("一般")

  ) {

    totalRisk += 12;

  }

  else if (

    lighting.includes("良好")

  ) {

    totalRisk += 5;

  }

  /* =========================
     UNKNOWN MODE
  ========================= */

  let isUnknown = false;

  if (

    herbName.includes("未知") ||

    confidence < 45 ||

    visibility < 40 ||

    clarity.includes("严重模糊")

  ) {

    isUnknown = true;

    totalRisk += 35;

  }

  /* =========================
     ABNORMAL ISSUE ANALYSIS
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

  if (totalRisk > 100) {

    totalRisk = 100;

  }

  totalRisk =
    Math.round(totalRisk);

  /* =========================
     RISK LEVEL
  ========================= */

  let riskLevel = "LOW";

  if (totalRisk >= 75) {

    riskLevel = "HIGH";

  }

  else if (totalRisk >= 50) {

    riskLevel = "MEDIUM";

  }

  else if (totalRisk >= 25) {

    riskLevel = "ELEVATED";

  }

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

    lighting

  };

}