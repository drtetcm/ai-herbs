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
  // 综合风险评分
  // =========================

  let totalRisk =

    moldRisk * 0.35 +
    fakeRisk * 0.4 +
    sulfurRisk * 0.25;

  // =========================
  // 低置信度惩罚
  // =========================

  if (confidence < 40) {

    totalRisk += 30;

  }

  // =========================
  // 限制最大值
  // =========================

  totalRisk = Math.min(totalRisk, 100);

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
  // Unknown Mode
  // =========================

  let isUnknown = false;

  if (confidence < 40) {

    isUnknown = true;

  }

  return {

    totalRisk:
      Math.round(totalRisk),

    riskLevel,

    isUnknown

  };

}