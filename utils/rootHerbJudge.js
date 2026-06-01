// utils/rootHerbJudge.js

console.log(
  "[ROOT_HERB_JUDGE] V1 Loaded"
);

function rootHerbJudge(result) {
  try {

    if (!result) return result;

    const herbName =
      result.herb_name || "";

    const featureText = [

      // Claude主特征
      ...(result.observed_features || []),

      // Claude推理
      result.reasoning || "",

      // 视觉分析
      result.visual_analysis?.color || "",
      result.visual_analysis?.texture || "",
      result.visual_analysis?.shape || "",
      result.visual_analysis?.surface || "",
      result.visual_analysis?.edges || "",
      result.visual_analysis?.structure || "",

      // 候选药材理由
      ...(result.possible_candidates || []).map(
        item => item.reason || ""
      )

    ]
      .join(" ")
      .toLowerCase();

    console.log(
      "[ROOT_HERB_FEATURE_TEXT]",
      featureText
    );

    let dangshenScore = 0;
    let huangqiScore = 0;

    // =========================
    // 党参特征
    // =========================

    if (
      featureText.includes("菊花心")
    ) {
      dangshenScore += 4;
    }

    if (
      featureText.includes("放射裂隙") ||
      featureText.includes("裂隙明显")
    ) {
      dangshenScore += 3;
    }

    if (
      featureText.includes("皮部较宽")
    ) {
      dangshenScore += 2;
    }

    // =========================
    // 黄芪特征
    // =========================

    if (
      featureText.includes("金井玉栏")
    ) {
      huangqiScore += 4;
    }

    if (
      featureText.includes("木部占比大")
    ) {
      huangqiScore += 3;
    }

    if (
      featureText.includes("皮部较薄")
    ) {
      huangqiScore += 2;
    }

    console.log(
      "[ROOT_HERB_SCORES]",
      {
        herbName,
        dangshenScore,
        huangqiScore
      }
    );

    // =========================
    // 默认轨迹
    // =========================

    let finalHerbName =
      herbName;

    let decisionTrace = {
      original: herbName,
      final: herbName,
      dangshenScore,
      huangqiScore
    };

    // =========================
    // 黄芪 → 党参
    // =========================

    if (
      herbName === "黄芪" &&
      dangshenScore - huangqiScore >= 4
    ) {

      console.log(
        "[ROOT_JUDGE] 黄芪 -> 党参",
        {
          dangshenScore,
          huangqiScore
        }
      );

      finalHerbName = "党参";

      decisionTrace = {
        original: "黄芪",
        final: "党参",
        dangshenScore,
        huangqiScore
      };
    }

    // =========================
    // RETURN
    // =========================

    return {
      ...result,

      herb_name:
        finalHerbName,

      root_scores: {
        dangshenScore,
        huangqiScore
      },

      decision_trace:
        decisionTrace
    };

  } catch (err) {

    console.error(
      "[ROOT_JUDGE_ERROR]",
      err
    );

    return result;
  }
}

export {
  rootHerbJudge
};