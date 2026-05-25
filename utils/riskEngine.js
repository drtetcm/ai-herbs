export function calculateRisk(result) {

  // =========================
  // 基础风险值
  // =========================

  const moldRisk =
    Number(result.mold_risk || 0);

  const fakeRisk =
    Number(result.fake_probability || 0);

  const sulfurRisk =
    Number(result.sulfur_fumigation_risk || 0);

  const confidence =
    Number(result.confidence || 0);

  // =========================
  // 新增：
  // 图片质量评分
  // =========================

  const imageQualityScore =
    Number(result.image_quality_score || 60);

  // =========================
  // 新增：
  // 模糊等级
  // LOW / MEDIUM / HIGH
  // =========================

  const blurLevel =
    result.image_blur_level || "LOW";

  // =========================
  // Risk Weight Table
  // 不同风险不同权重
  // =========================

  const moldWeight = 0.25;

  const fakeWeight = 0.5;

  const sulfurWeight = 0.25;

  // =========================
  // 基础风险
  // =========================

  let totalRisk =

    moldRisk * moldWeight +
    fakeRisk * fakeWeight +
    sulfurRisk * sulfurWeight;

  // =========================
  // 连续置信度扣分
  // Confidence Curve
  // =========================

  if (confidence < 90) {

    totalRisk += 5;

  }

  if (confidence < 80) {

    totalRisk += 10;

  }

  if (confidence < 70) {

    totalRisk += 15;

  }

  if (confidence < 60) {

    totalRisk += 20;

  }

  if (confidence < 50) {

    totalRisk += 25;

  }

  if (confidence < 40) {

    totalRisk += 35;

  }

  // =========================
  // 图片质量惩罚
  // =========================

  if (imageQualityScore < 80) {

    totalRisk += 5;

  }

  if (imageQualityScore < 60) {

    totalRisk += 10;

  }

  if (imageQualityScore < 40) {

    totalRisk += 20;

  }

  // =========================
  // 模糊等级惩罚
  // =========================

  if (blurLevel === "MEDIUM") {

    totalRisk += 15;

  }

  if (blurLevel === "HIGH") {

    totalRisk += 30;

  }

  // =========================
  // Unknown Mode
  // =========================

  let isUnknown = false;

  if (

    confidence < 40 ||

    imageQualityScore < 35 ||

    blurLevel === "HIGH"

  ) {

    isUnknown = true;

    totalRisk += 30;

  }

  // =========================
  // 限制最大值
  // =========================

  totalRisk =
    Math.min(totalRisk, 100);

  // =========================
  // 风险等级
  // =========================

  let riskLevel = "LOW";

  if (totalRisk >= 70) {

    riskLevel = "HIGH";

  }
  else if (totalRisk >= 40) {

    riskLevel = "MEDIUM";

  }

  // =========================
  // 返回
  // =========================

  return {

    totalRisk:
      Math.round(totalRisk),

    riskLevel,

    isUnknown,

    confidence,

    imageQualityScore,

    blurLevel

  };

}