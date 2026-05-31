/**
 * Herb Authenticity Engine V1.6
 * 去除关键词污染
 * 仅使用 observed_features
 */

export function evaluateAuthenticity(aiResult = {}) {

  try {

    const features =
      aiResult.observed_features || [];

    let score = 50;

    const positiveHits = [];
    const negativeHits = [];

    // ========================
    // 正向证据
    // ========================

    const positiveRules = [

      {
        keywords: ["放射纹", "菊花心"],
        signal: "放射纹"
      },

      {
        keywords: ["纤维纹理", "纤维束"],
        signal: "纤维"
      },

      {
        keywords: ["粉性"],
        signal: "粉性"
      },

      {
        keywords: ["干燥"],
        signal: "干燥"
      },

      {
        keywords: ["木质"],
        signal: "木质"
      },

      {
        keywords: ["断面结构"],
        signal: "断面"
      },

      {
        keywords: ["饮片"],
        signal: "饮片"
      },

      {
        keywords: ["纵向纹理"],
        signal: "药材纹理"
      }

    ];

    // ========================
    // 负向证据
    // ========================

    const negativeRules = [

      {
        keywords: ["湿润"],
        signal: "湿润"
      },

      {
        keywords: ["新鲜"],
        signal: "新鲜"
      },

      {
        keywords: ["水分"],
        signal: "水分"
      },

      {
        keywords: ["汁液"],
        signal: "汁液"
      },

      {
        keywords: ["光滑"],
        signal: "光滑"
      },

      {
        keywords: ["蔬菜"],
        signal: "蔬菜"
      },

      {
        keywords: ["食品"],
        signal: "食品"
      },

      {
        keywords: ["食材"],
        signal: "食材"
      },

      {
        keywords: ["马铃薯", "土豆"],
        signal: "土豆"
      },

      {
        keywords: ["白萝卜"],
        signal: "白萝卜"
      }

    ];

    // ========================
    // 特征扫描
    // ========================

    for (const feature of features) {

      for (const rule of positiveRules) {

        if (
          rule.keywords.some(
            k => feature.includes(k)
          )
        ) {

          if (
            !positiveHits.includes(
              rule.signal
            )
          ) {

            positiveHits.push(
              rule.signal
            );

            score += 8;
          }
        }
      }

      for (const rule of negativeRules) {

        if (
          rule.keywords.some(
            k => feature.includes(k)
          )
        ) {

          if (
            !negativeHits.includes(
              rule.signal
            )
          ) {

            negativeHits.push(
              rule.signal
            );

            score -= 15;
          }
        }
      }
    }

    // ========================
    // object_type
    // ========================

    const objectType =
      (
        aiResult.object_type || ""
      ).toLowerCase();

    if (
      objectType === "food"
    ) {

      score -= 40;

      if (
        !negativeHits.includes(
          "food"
        )
      ) {

        negativeHits.push(
          "food"
        );
      }
    }

    // ========================
    // UNKNOWN
    // ========================

    if (
      aiResult.herb_name ===
      "UNKNOWN"
    ) {

      score -= 15;
    }

    // ========================
    // 场景干扰
    // ========================

    const interference =
      aiResult.scene_interference ||
      "none";

    if (
      [
        "background_objects",
        "mixed_scene",
        "packaging"
      ].includes(interference)
    ) {

      score -= 10;
    }

    // ========================
    // confidence
    // ========================

    const confidence =
      Number(
        aiResult.confidence || 0
      );

    if (confidence >= 80) {

      score += 5;

    } else if (
      confidence <= 40
    ) {

      score -= 5;
    }

    // ========================
    // 限制
    // ========================

    score =
      Math.max(
        0,
        Math.min(
          100,
          score
        )
      );

    // ========================
    // level
    // ========================

    let authenticity_level =
      "LOW";

    if (score >= 75) {

      authenticity_level =
        "HIGH";

    } else if (
      score >= 45
    ) {

      authenticity_level =
        "MEDIUM";
    }

    // ========================
    // force unknown
    // ========================

    const force_unknown =
      objectType === "food" ||
      (
        score < 20 &&
        negativeHits.length >= 2
      );

    return {

      authenticity_score:
        score,

      authenticity_level,

      force_unknown,

      authenticity_reasoning: {

        positive_signals:
          positiveHits,

        negative_signals:
          negativeHits,

        scene_interference:
          interference,

        confidence

      }

    };

  } catch (error) {

    console.error(
      "Authenticity engine error:",
      error
    );

    return {

      authenticity_score: 0,

      authenticity_level:
        "LOW",

      force_unknown: true,

      authenticity_reasoning: {

        error:
          error.message

      }

    };
  }

}