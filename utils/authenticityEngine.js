/**
 * Herb Authenticity Engine V1
 * 工业级药材真实性评分系统
 */

export function evaluateAuthenticity(aiResult = {}) {
  try {
    const reasoning = `
${aiResult.reasoning || ""}
${aiResult.visual_analysis || ""}
${aiResult.color_features || ""}
${aiResult.texture_features || ""}
${aiResult.shape_features || ""}
${aiResult.surface_features || ""}
${aiResult.edge_features || ""}
${aiResult.structure_features || ""}
${aiResult.powder_features || ""}
${aiResult.lighting_impact || ""}
${aiResult.occlusion_impact || ""}
${aiResult.scene_interference_reasoning || ""}
`.toLowerCase();

    // =========================
    // 药材正向特征
    // =========================

    const herbSignals = [
      "放射纹",
      "放射纹理",
      "纤维",
      "纤维结构",
      "粉性",
      "粉质",
      "粉末感",
      "干燥",
      "干片",
      "药材纹理",
      "孔隙",
      "木质",
      "断面",
      "饮片",
      "中药切片",
      "药材边缘",
      "结构致密",
      "传统饮片",
      "药材结构",
      "切片结构",
      "粗糙",
      "不规则纹理",
    ];

    // =========================
    // 食品负向特征
    // =========================

    const foodSignals = [
      "湿润",
      "半透明",
      "新鲜",
      "鲜食品",
      "蔬菜",
      "水果",
      "食材",
      "食品",
      "光滑",
      "强反光",
      "水分",
      "汁液",
      "鲜切",
      "规则切片",
      "食品光泽",
      "均匀水分",
      "新鲜断面",
      "细腻光滑",
      "透明感",
      "蔬菜结构",
      "马铃薯",
      "土豆",
    ];

    // =========================
    // 初始化评分
    // =========================

    let score = 50;

    const positiveHits = [];
    const negativeHits = [];

    // =========================
    // 药材加分
    // =========================

    for (const signal of herbSignals) {
      if (reasoning.includes(signal.toLowerCase())) {
        score += 5;
        positiveHits.push(signal);
      }
    }

    // =========================
    // 食品减分
    // =========================

    for (const signal of foodSignals) {
      if (reasoning.includes(signal.toLowerCase())) {
        score -= 8;
        negativeHits.push(signal);
      }
    }

    // =========================
    // 场景干扰惩罚
    // =========================

    const interference =
      aiResult.scene_interference || "";

    const heavyInterference = [
      "mixed_scene",
      "background_objects",
      "packaging",
    ];

    if (
      heavyInterference.includes(interference)
    ) {
      score -= 15;
    }

    // =========================
    // UNKNOWN额外惩罚
    // =========================

    if (
      aiResult.herb_name === "UNKNOWN"
    ) {
      score -= 20;
    }

    // =========================
    // confidence联动
    // =========================

    const confidence =
      Number(aiResult.confidence || 0);

    if (confidence >= 80) {
      score += 10;
    } else if (confidence <= 40) {
      score -= 10;
    }

    // =========================
    // 边界限制
    // =========================

    if (score > 100) score = 100;
    if (score < 0) score = 0;

    // =========================
    // 等级
    // =========================

    let authenticity_level = "LOW";

    if (score >= 75) {
      authenticity_level = "HIGH";
    } else if (score >= 45) {
      authenticity_level = "MEDIUM";
    }

    // =========================
    // 是否强制UNKNOWN
    // =========================

    const force_unknown =
      score < 20 &&
      negativeHits.length >= 2;

    return {
      authenticity_score: score,
      authenticity_level,
      force_unknown,

      authenticity_reasoning: {
        positive_signals: positiveHits,
        negative_signals: negativeHits,
        scene_interference: interference,
        confidence,
      },
    };
  } catch (error) {
    console.error(
      "Authenticity engine error:",
      error
    );

    return {
      authenticity_score: 0,
      authenticity_level: "LOW",
      force_unknown: true,

      authenticity_reasoning: {
        error: error.message,
      },
    };
  }
}