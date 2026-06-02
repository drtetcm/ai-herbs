export function rootSliceCorrection(result) {

  if (!result) return result;

  console.log(
    "ROOT CORRECTION DEBUG:",
    result
  );

  const herbName =
    result.herb_name || "";

  const herbForm =
    result.herb_form || "";

  const features =
    result.observed_features || [];

  const featureText =
    features.join(" ");

  /*
  ====================================
  党参饮片纠偏
  ====================================
  */

  if (
    herbForm === "slice" &&
    herbName === "黄芪"
  ) {

    let dangshenScore = 0;

    // 中心较小
    if (
      featureText.includes("中心较小") ||
      featureText.includes("圆心较小") ||
      featureText.includes("木部较小") ||
      featureText.includes("中心白色圆心较小")
    ) {
      dangshenScore++;
    }

    // 皮部较宽
    if (
      featureText.includes("皮部较宽") ||
      featureText.includes("外围皮部较宽") ||
      featureText.includes("皮部宽厚")
    ) {
      dangshenScore++;
    }

    // 边缘皱缩
    if (
      featureText.includes("边缘皱缩") ||
      featureText.includes("波浪边缘") ||
      featureText.includes("边缘不规则")
    ) {
      dangshenScore++;
    }

    // 花盘状中心
    if (
      featureText.includes("花盘状中心") ||
      featureText.includes("绒球状中心")
    ) {
      dangshenScore++;
    }

    // 狮子盘头
    if (
      featureText.includes("狮子盘头")
    ) {
      dangshenScore += 2;
    }

    console.log(
      "DANGSHEN SCORE:",
      dangshenScore
    );

    if (
  dangshenScore >= 4
) {

  console.log(
    "ROOT SLICE CORRECTION: 黄芪 -> 党参"
  );

  result.herb_name =
    "党参";

  result.confidence =
    Math.max(
      result.confidence,
      78
    );

}

  }

  /*
  ====================================
  防风饮片纠偏
  ====================================
  */

  if (
    herbForm === "slice" &&
    herbName === "黄芪"
  ) {

    let fangfengScore = 0;

    if (
      featureText.includes("菊花心")
    ) {
      fangfengScore++;
    }

    if (
      featureText.includes("中心白色")
    ) {
      fangfengScore++;
    }

    if (
      featureText.includes("皮厚芯小")
    ) {
      fangfengScore++;
    }

    if (
      featureText.includes("形成层环")
    ) {
      fangfengScore++;
    }

    console.log(
      "FANGFENG SCORE:",
      fangfengScore
    );

    if (
      fangfengScore >= 3
    ) {

      console.log(
        "ROOT SLICE CORRECTION: 黄芪 -> 防风"
      );

      result.herb_name =
        "防风";

      result.confidence =
        Math.max(
          result.confidence,
          78
        );

    }

  }

  return result;

}