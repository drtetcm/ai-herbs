/**
 * Food Rejection Layer V1
 * 非药材食品硬拦截
 */

export function applyFoodRejection(result = {}) {
  try {
    const herbName = (result.herb_name || "").toLowerCase();
    const candidates = JSON.stringify(
      result.candidate_herbs || []
    ).toLowerCase();

    const reasoning = (result.reasoning || "").toLowerCase();

    const objectType = (result.object_type || "").toLowerCase();

    const sceneInterference = (
      result.scene_interference || ""
    ).toLowerCase();

    // =========================
    // 食品关键词
    // =========================

    const foodKeywords = [
      "potato",
      "土豆",
      "马铃薯",

      "radish",
      "萝卜",
      "白萝卜",

      "lotus",
      "藕",
      "藕片",

      "ginger",
      "姜",
      "姜片",

      "banana",
      "香蕉",
      "香蕉片",

      "apple",
      "苹果",
      "苹果干",

      "fresh food",
      "food slice",
      "vegetable",
      "snack",
      "fresh texture",
      "non-herb",
      "fresh produce",

      "食物",
      "食品",
      "鲜品",
      "蔬菜",
      "零食",
      "水果",
      "食材",
      "非药材"
    ];

    // =========================
    // 风险分数
    // =========================

    let rejectionScore = 0;

    const fullText = `
      ${herbName}
      ${candidates}
      ${reasoning}
      ${objectType}
      ${sceneInterference}
    `.toLowerCase();

    // =========================
    // 食品关键词命中
    // =========================

    for (const keyword of foodKeywords) {
      if (fullText.includes(keyword)) {
        rejectionScore += 18;
      }
    }

    // =========================
    // object_type
    // =========================

    if (objectType === "food") {
      rejectionScore += 45;
    }

    // =========================
    // scene interference
    // =========================

    const highRiskScenes = [
      "packaging",
      "mixed_scene",
      "background_objects",
      "tableware"
    ];

    if (highRiskScenes.includes(sceneInterference)) {
      rejectionScore += 15;
    }

    // =========================
    // 新鲜食品纹理
    // =========================

    const freshFoodPatterns = [
      "fresh texture",
      "smooth surface",
      "watery",
      "fresh slice",
      "vegetable texture",

      "新鲜",
      "鲜切",
      "含水",
      "光滑",
      "食材纹理",
      "蔬菜纹理"
    ];

    for (const pattern of freshFoodPatterns) {
      if (fullText.includes(pattern)) {
        rejectionScore += 12;
      }
    }

    // =========================
    // 强制 UNKNOWN
    // =========================

    const shouldReject = rejectionScore >= 45;

    if (shouldReject) {
      return {
        ...result,

        herb_name: "UNKNOWN",

        is_herb: false,

        object_type: "food",

        force_unknown: true,

        unknown_confidence: Math.min(
          98,
          rejectionScore
        ),

        rejection_reason:
          "Detected probable food/non-herbal material",

        candidate_herbs: [
          "非中药材食物"
        ]
      };
    }

    return {
      ...result,
      food_rejection_score: rejectionScore
    };
  } catch (error) {
    console.error(
      "Food rejection error:",
      error
    );

    return result;
  }
}