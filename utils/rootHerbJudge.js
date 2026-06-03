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
    let fangfengScore = 0;

    const notDangshenCore =

  featureText.includes("木部占比明显大于皮部")
  ||

  featureText.includes("木部占比较大")
  ||

  featureText.includes("木部发达")
  ||

  featureText.includes("中心木部巨大")
  ||

  featureText.includes("木部明显发达")

  ||

  featureText.includes("皮部较薄")

  ||

  featureText.includes("皮木比例不符合党参")

  ||

  featureText.includes("木部占主导");

  
    // =========================
    // 黄芪A级证据
    // =========================

    const verifiedJingjing =

  featureText.includes("金井玉栏")

  && !featureText.includes("未见金井玉栏")
  && !featureText.includes("未见典型金井玉栏")
  && !featureText.includes("未观察到金井玉栏")
  && !featureText.includes("未能观察到金井玉栏")
  && !featureText.includes("未发现金井玉栏")

  && !featureText.includes("不具备金井玉栏")
  && !featureText.includes("不符合金井玉栏")
  && !featureText.includes("缺乏金井玉栏")

  && !featureText.includes("无法观察")
  && !featureText.includes("无法清晰观察")

  && !featureText.includes("无法验证")
  && !featureText.includes("无法充分验证")
  && !featureText.includes("无法完整验证")

  && !featureText.includes("无法确认")
  && !featureText.includes("无法完整确认")
  && !featureText.includes("无法清晰确认")

  && !featureText.includes("未能清晰观察到金井玉栏")

  && !featureText.includes("金井玉栏结构无法完整确认")
  && !featureText.includes("金井玉栏无法确认")
  && !featureText.includes("金井玉栏无法完整确认");

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
    featureText.includes("木部占比明显大于皮部")
    ||
    featureText.includes("多个切面均清晰可见金井玉栏")
  );

if (

  strongHuangqi &&

  !featureText.includes("党参核心")

) {

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
  &&
  !notDangshenCore
) {
  dangshenScore += 4;
}

    if (
  featureText.includes("中心较小")
  &&
  !notDangshenCore
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
  &&
  !notDangshenCore
) {
  dangshenScore += 4;
}

// =========================
// 党参反证（木部过大）
// =========================

if (
  featureText.includes("木部占比明显大于皮部")
  ||
  featureText.includes("木部占比大")
  ||
  featureText.includes("中心木部巨大")
  ||
  featureText.includes("木部发达")
) {
  dangshenScore -= 8;
}

// =========================
// DS-ANTI-LARGE-XYLEM
// 木部过大反党参
// =========================

if (

  featureText.includes("木部占比明显大于皮部")
  ||

  featureText.includes("木部占比较大")
  ||

  featureText.includes("木部占主导")
  ||

  featureText.includes("皮部较薄")

) {

  console.log(
    "[DS_ANTI_LARGE_XYLEM]"
  );

  dangshenScore -= 12;

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
// HQ-TYPE-E
// 黄芪斜切片补偿
// =========================

if (
  featureText.includes("长椭圆形")
  ||
  featureText.includes("椭圆形")
  ||
  featureText.includes("斜切片")
) {
  huangqiScore += 3;
}

if (
  featureText.includes("粗直纤维束")
  ||
  featureText.includes("纤维外露")
  ||
  featureText.includes("放射纹粗长")
  ||
  featureText.includes("粗长放射纹")
  ||
  featureText.includes("纤维束明显")
) {
  huangqiScore += 6;
}

    // =========================
// 防风特征
// =========================

if (
  featureText.includes("形成层环")
) {
  fangfengScore += 4;
}

if (
  featureText.includes("灰黄色")
  ||
  featureText.includes("灰褐色")
  ||
  featureText.includes("棕黄色皮部")
) {
  fangfengScore += 3;
}

if (
  featureText.includes("大量小切片")
  ||
  featureText.includes("小圆片")
  ||
  featureText.includes("横切片")
) {
  fangfengScore += 3;
}

if (
  featureText.includes("纤维性")
) {
  fangfengScore += 2;
}

if (
  featureText.includes("菊花心")
) {
  fangfengScore += 3;
}

// FF-TYPE-C
// 深色短段型防风

if (
  featureText.includes("棕褐色")
  ||
  featureText.includes("灰棕色")
  ||
  featureText.includes("灰褐色")
) {
  fangfengScore += 4;
}

if (
  featureText.includes("环状横纹")
) {
  fangfengScore += 4;
}

if (
  featureText.includes("外皮棕褐色")
  ||
  featureText.includes("外皮粗糙")
) {
  fangfengScore += 3;
}

if (
  featureText.includes("圆柱形段片")
  ||
  featureText.includes("切段长度")
  ||
  featureText.includes("切段")
) {
  fangfengScore += 3;
}

// =========================
// FF-TYPE-D
// 深色段片型防风
// =========================

if (

  (
    featureText.includes("棕褐色")
    ||
    featureText.includes("灰棕色")
    ||
    featureText.includes("灰褐色")
  )

  &&

  featureText.includes("类圆柱形")

  &&

  (
    featureText.includes("环状中心")
    ||
    featureText.includes("环状结构")
  )

) {

  console.log(
    "[FF_TYPE_D]"
  );

  fangfengScore += 3;

}

// =========================
// FF-TYPE-C
// 防风反向压制党参
// =========================

if (
  featureText.includes("棕褐色")
  ||
  featureText.includes("灰棕色")
  ||
  featureText.includes("灰褐色")
) {
  dangshenScore -= 4;
}

if (
  featureText.includes("环状横纹")
) {
  dangshenScore -= 6;
}

if (
  fangfengScore >= 8
  &&
  featureText.includes("菊花心")
  &&
  featureText.includes("形成层环")
) {

  console.log(
    "[FANGFENG_ANTI_DANGSHEN_V2]"
  );

  dangshenScore -= 8;

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

  featureText.includes("金井玉栏无法确认") ||
  featureText.includes("金井玉栏无法完整确认") ||
  featureText.includes("金井玉栏结构无法完整确认") ||

  featureText.includes("未能清晰观察到金井玉栏");

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

      dangshenScore += 10;
    }

    // =========================
// HQ VS FF
// 黄芪斜切片压制防风
// =========================

const huangqiSlicePattern =

(
  featureText.includes("椭圆形")
  ||
  featureText.includes("长椭圆形")
)

&&

(
  featureText.includes("放射纹")
  ||
  featureText.includes("放射状纹理")
)

&&

(
  featureText.includes("纤维")
  ||
  featureText.includes("纤维束")
);

if (huangqiSlicePattern) {

  console.log(
    "[HQ_SLICE_PATTERN]"
  );

  huangqiScore += 8;

  fangfengScore -= 4;

}

    console.log(
  "[ROOT_HERB_SCORES]",
  {
    herbName,
    dangshenScore,
    huangqiScore,
    fangfengScore
  }
);

    let finalHerbName =
      herbName;

// =========================
// DANGSHEN HARD REJECTION
// =========================

if (

  herbName === "党参"

  &&

  (
    featureText.includes("木部占比明显大于皮部")
    ||
    featureText.includes("木部占比较大")
    ||
    featureText.includes("木部占主导")
  )

) {

  console.log(
    "[DANGSHEN_HARD_REJECT]"
  );

  finalHerbName = "防风";

}

const strongFangfeng =

fangfengScore >= 12

&&

featureText.includes("形成层环")

&&

featureText.includes("菊花心");

if (
  herbName === "党参" &&
  confidence <= 75 &&
  strongFangfeng
) {

  console.log(
    "[ROOT_JUDGE] 党参 -> 防风"
  );

  finalHerbName = "防风";
}

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

  original_herb_name: herbName,

  rule_corrected:
    herbName !== finalHerbName,

  root_scores: {
    dangshenScore,
    huangqiScore,
    fangfengScore
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