// utils/rootHerbJudge.js

console.log(
  "[ROOT_HERB_JUDGE] V1 Loaded"
);

function rootHerbJudge(result) {
  try {
    if (!result) return result;

    const herbName = result.herb_name || "";

    const featureText = [
      result.appearance || "",
      result.characteristics || "",
      result.description || "",
      ...(result.key_features || [])
    ]
      .join(" ")
      .toLowerCase();

    let dangshenScore = 0;
    let huangqiScore = 0;

    // =========================
    // 党参特征
    // =========================

    if (featureText.includes("菊花心")) {
      dangshenScore += 4;
    }

    if (
      featureText.includes("放射裂隙") ||
      featureText.includes("裂隙明显")
    ) {
      dangshenScore += 3;
    }

    if (featureText.includes("皮部较宽")) {
      dangshenScore += 2;
    }

    // =========================
    // 黄芪特征
    // =========================

    if (featureText.includes("金井玉栏")) {
      huangqiScore += 4;
    }

    if (featureText.includes("木部占比大")) {
      huangqiScore += 3;
    }

    if (featureText.includes("皮部较薄")) {
      huangqiScore += 2;
    }

    // =========================
    // LOG
    // =========================

    console.log(
      "[ROOT_HERB_SCORES]",
      {
        herbName,
        dangshenScore,
        huangqiScore
      }
    );

    // =========================
    // 裁决
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

      return {
        ...result,

        herb_name: "党参",

        decision_trace: {
          original: "黄芪",
          final: "党参",
          dangshenScore,
          huangqiScore
        }
      };
    }

    return result;

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