// utils/rootHerbJudge.js

console.log(
  "[ROOT_HERB_JUDGE] V5 Loaded"
);

function rootHerbJudge(result) {
  try {

    if (!result) return result;

    const herbName =
      result.herb_name || "";

    const confidence =
      result.confidence || 0;

    const featureText = [

      ...(result.observed_features || []),

      result.reasoning || "",

      result.visual_analysis?.color || "",
      result.visual_analysis?.texture || "",
      result.visual_analysis?.shape || "",
      result.visual_analysis?.surface || "",
      result.visual_analysis?.edges || "",
      result.visual_analysis?.structure || "",

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
    // 黄芪A级证据
    // =========================

    const verifiedJingjing =

      featureText.includes("金井玉栏")

      && !featureText.includes("无法观察")
      && !featureText.includes("无法清晰观察")
      && !featureText.includes("无法验证")
      && !featureText.includes("无法充分验证")
      && !featureText.includes("无法完整验证")
      && !featureText.includes("无法确认")
      && !featureText.includes("无法完整确认")
      && !featureText.includes("未能清晰观察到金井玉栏");

    console.log(
      "[JINGJING_DEBUG]",
      {
        hasJingjing:
          featureText.includes("金井玉栏"),
        verifiedJingjing
      }
    );

    // =========================
    // 黄芪硬锁定
    // =========================

    const strongHuangqi =

      verifiedJingjing &&

      (
        featureText.includes("木部占比明显大于皮部") ||
        featureText.includes("木部占比较大") ||
        featureText.includes("木部占比大")
      );

    if (strongHuangqi) {

      console.log(
        "[ROOT_HARD_LOCK]",
        "黄芪硬锁定"
      );

      return {
        ...result,
        herb_name: "黄芪",
        root_scores: {
          dangshenScore: 0,
          huangqiScore: 999
        },
        decision_trace: {
          original: herbName,
          final: "黄芪",
          reason: "strong_huangqi_lock"
        }
      };
    }

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
      dangshenScore += 4;
    }

    if (
      featureText.includes("木部较小")
    ) {
      dangshenScore += 4;
    }

    if (
      featureText.includes("中心较小")
    ) {
      dangshenScore += 4;
    }

    if (
      featureText.includes("边缘皱缩")
    ) {
      dangshenScore += 4;
    }

    if (
      featureText.includes("质地疏松")
    ) {
      dangshenScore += 2;
    }

    if (
      featureText.includes("皮宽芯小")
    ) {
      dangshenScore += 4;
    }

    // =========================
    // 黄芪加分
    // =========================

    if (verifiedJingjing) {
      huangqiScore += 10;
    }

    if (
      featureText.includes("木部占比大") ||
      featureText.includes("木部占比较大") ||
      featureText.includes("木部占比明显大于皮部")
    ) {
      huangqiScore += 8;
    }

    if (
      featureText.includes("皮部较薄")
    ) {
      huangqiScore += 5;
    }

    // =========================
    // DS-TYPE-A
    // =========================

    const candidateDangshen =
      result.possible_candidates?.some(
        c => c.herb_name === "党参"
      );

    const candidateHuangqi =
      result.possible_candidates?.some(
        c => c.herb_name === "黄芪"
      );

    const thinRootCase =

      featureText.includes("细长") ||
      featureText.includes("长条状") ||
      featureText.includes("根段形态偏细") ||
      featureText.includes("细长圆柱形") ||
      featureText.includes("木部较小") ||
      featureText.includes("中心较小") ||
      featureText.includes("皮部较宽") ||
      featureText.includes("皮宽芯小");

    const weakHuangqiEvidence =

      featureText.includes("无法观察") ||
      featureText.includes("无法清晰观察") ||
      featureText.includes("无法验证") ||
      featureText.includes("无法充分验证") ||
      featureText.includes("无法完整验证") ||
      featureText.includes("无法确认") ||
      featureText.includes("无法完整确认") ||
      featureText.includes("未能清晰观察到金井玉栏") ||
      featureText.includes("金井玉栏结构无法完整确认");

    if (
      herbName === "黄芪" &&
      confidence <= 70 &&
      candidateDangshen &&
      candidateHuangqi &&
      thinRootCase &&
      weakHuangqiEvidence
    ) {

      console.log(
        "[DS_TYPE_A]",
        "细条型党参补偿"
      );

      dangshenScore += 5;
    }

    console.log(
      "[ROOT_HERB_SCORES]",
      {
        herbName,
        dangshenScore,
        huangqiScore
      }
    );

    let finalHerbName =
      herbName;

    if (
      herbName === "黄芪" &&
      confidence <= 70 &&
      dangshenScore - huangqiScore >= 10
    ) {

      console.log(
        "[ROOT_JUDGE] 黄芪 -> 党参"
      );

      finalHerbName = "党参";
    }

    return {
      ...result,
      herb_name: finalHerbName,
      root_scores: {
        dangshenScore,
        huangqiScore
      }
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