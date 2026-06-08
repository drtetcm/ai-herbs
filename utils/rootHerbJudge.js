// utils/rootHerbJudge.js

console.log(
  "[ROOT_HERB_JUDGE] V5 Loaded"
);

function buildCorrectionReason(
  originalHerb,
  finalHerb,
  featureText
) {

  const reasons = [];

  // 黄芪 -> 党参

  if (
    originalHerb === "黄芪" &&
    finalHerb === "党参"
  ) {

    if (
      featureText.includes("皮部较宽")
    ) {
      reasons.push(
        "发现皮部较宽特征"
      );
    }

    if (
      featureText.includes("木部较小")
      ||
      featureText.includes("中心较小")
    ) {
      reasons.push(
        "发现木部较小特征"
      );
    }

    if (
      featureText.includes("皮宽芯小")
    ) {
      reasons.push(
        "发现皮宽芯小结构"
      );
    }

    reasons.push(
      "皮宽芯小结构更符合党参"
    );
  }

  // 黄芪 -> 甘草

  if (
    originalHerb === "黄芪" &&
    finalHerb === "甘草"
  ) {

    reasons.push(
      "发现红棕色外皮"
    );

    reasons.push(
      "发现典型甘草斜切片"
    );

    reasons.push(
  "皮木分层及断面结构符合甘草特征"
);
  }

  // 党参 -> 防风

  if (
    originalHerb === "党参" &&
    finalHerb === "防风"
  ) {

    reasons.push(
      "发现形成层环"
    );

    reasons.push(
      "发现菊花心结构"
    );

    reasons.push(
      "形成层环与菊花心更符合防风"
    );
  }

  // 黄芪 -> 桔梗

  if (
    originalHerb === "黄芪" &&
    finalHerb === "桔梗"
  ) {

    reasons.push(
      "发现纵切片特征"
    );

    reasons.push(
      "发现空洞或裂隙结构"
    );

    reasons.push(
      "裂隙与髓部结构更符合桔梗"
    );
  }

  return reasons;
}

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
    let gancaoScore = 0;

// =========================
// 甘草特征
// =========================

// 红棕色外皮（最强特征）

if (
  featureText.includes("红棕色")
  ||
  featureText.includes("棕红色")
  ||
  featureText.includes("红棕色外皮")
  ||
  featureText.includes("棕红色外皮")
) {
  gancaoScore += 6;
}

// 皮木分层

if (
  featureText.includes("皮层清晰可见")
  ||
  featureText.includes("皮木分层")
  ||
  featureText.includes("皮层与木部界限清晰")
  ||
  featureText.includes("外皮与断面颜色对比明显")
) {
  gancaoScore += 4;
}

// 甘草典型斜切片

if (

  (
    featureText.includes("红棕色")
    ||
    featureText.includes("棕红色")
  )

  &&

  (
    featureText.includes("长椭圆形")
    ||
    featureText.includes("斜切片")
    ||
    featureText.includes("斜切薄片")
    ||
    featureText.includes("斜切厚片")
  )

) {

  gancaoScore += 3;

}

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
  (
    featureText.includes("木部较小")
    ||
    featureText.includes("中心较小")
  )

  &&

  featureText.includes("皮部较宽")

  &&

  !featureText.includes("形成层环")

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
  dangshenScore += 1;
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

  !featureText.includes("形成层环")

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

  dangshenScore -= 3;

}

// =========================
// FF SMALL ROUND SLICE
// 防止防风小圆片误判党参
// =========================

if (

  dangshenScore > 0

  &&

  (
    featureText.includes("放射纹")
    ||
    featureText.includes("放射状纹理")
    ||
    featureText.includes("菊花心")
  )

  &&

  (
    featureText.includes("小圆形")
    ||
    featureText.includes("大量小切片")
    ||
    featureText.includes("横切片")
  )

) {

  console.log(
    "[ANTI_DANGSHEN_SMALL_CENTER]"
  );

  dangshenScore -= 4;

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
// JIEGENG LONG SLICE V1
// 桔梗纵切片识别
// =========================

let jiegengLongSliceScore = 0;

// 长条纵切

if (
  featureText.includes("纵切")
  ||
  featureText.includes("纵切片")
  ||
  featureText.includes("长条形")
  ||
  featureText.includes("长条状")
) {
  jiegengLongSliceScore += 2;
}

// 空洞

if (
  featureText.includes("空洞")
  ||
  featureText.includes("中空")
  ||
  featureText.includes("髓部")
  ||
  featureText.includes("疏松结构")
) {
  jiegengLongSliceScore += 4;
}

// 裂隙

if (
  featureText.includes("裂隙")
  ||
  featureText.includes("放射裂隙")
  ||
  featureText.includes("裂纹")
) {
  jiegengLongSliceScore += 3;
}

// 卷曲

if (
  featureText.includes("边缘卷曲")
  ||
  featureText.includes("卷曲")
) {
  jiegengLongSliceScore += 2;
}

// 纵切桔梗常见关键词

if (
  featureText.includes("桔梗纵切片")
  ||
  featureText.includes("桔梗纵切")
) {
  jiegengLongSliceScore += 8;
}

// 黄芪幻觉特征压制

const fakeHuangqiLongSlice =

(
  featureText.includes("木部连续致密")
  ||
  featureText.includes("整体结构紧实")
  ||
  featureText.includes("纤维束粗直连续")
)

&&

(
  featureText.includes("无法完整验证")
  ||
  featureText.includes("无法直接观察")
  ||
  featureText.includes("横截面内部结构不可见")
  ||
  featureText.includes("纵切片形态")
);

if (fakeHuangqiLongSlice) {

  console.log(
    "[FAKE_HUANGQI_LONG_SLICE]"
  );

  huangqiScore -= 8;

}

  console.log(
  "[ROOT_HERB_SCORES]",
  {
    herbName,
    dangshenScore,
    huangqiScore,
    fangfengScore,
    gancaoScore,
    jiegengLongSliceScore
  }
);

let finalHerbName =
  herbName;

// =========================
// JIEGENG STRONG EVIDENCE
// =========================

const jiegengStrongEvidence =

featureText.includes("桔梗")
||
featureText.includes("花瓣状波浪边缘")
||
featureText.includes("花朵状切面")
||
featureText.includes("花瓣状")
||
featureText.includes("波浪边缘")
||
featureText.includes("断面致密")
||
featureText.includes("断面致密紧实")
||
featureText.includes("边缘呈花瓣状")
||
featureText.includes("浅棕黄色形成层环");

if (jiegengStrongEvidence) {

  jiegengLongSliceScore += 4;

}

// =========================
// JIEGENG LONG SLICE FIX
// =========================

if (

  herbName === "黄芪"

  &&

  confidence <= 70

  &&

  jiegengLongSliceScore >= 6

) {

  console.log(
    "[JIEGENG_LONG_SLICE_FIX]"
  );

  finalHerbName = "桔梗";

}

// =========================
// FANGFENG -> JIEGENG FIX
// =========================

if (

  herbName === "防风"

  &&

  confidence <= 70

  &&

  jiegengLongSliceScore >= 5

) {

  console.log(
    "[JIEGENG_ANTI_FANGFENG]"
  );

  finalHerbName = "桔梗";

}

const isJiegengCase =

featureText.includes("桔梗")
||
featureText.includes("花瓣状波浪边缘")
||
featureText.includes("花朵状切面");

if (isJiegengCase) {

  return {
  ...result,

  herb_name: finalHerbName,

  original_herb_name: herbName,

  rule_corrected:
    herbName !== finalHerbName,

  correction_reason:
    buildCorrectionReason(
      herbName,
      finalHerbName,
      featureText
    ),

  root_scores: {
    dangshenScore,
    huangqiScore,
    fangfengScore,
    gancaoScore
  }
};

}
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

// =========================
// HQ-OBLIQUE-SLICE
// 黄芪斜片反制防风
// =========================

const huangqiObliqueSlice =

(
  featureText.includes("椭圆形")
  ||
  featureText.includes("长椭圆形")
)

&&

(
  featureText.includes("黄白色")
  ||
  featureText.includes("淡黄白")
)

&&

(
  featureText.includes("放射纹")
  ||
  featureText.includes("放射状纹理")
)

&&

(
  featureText.includes("形成层环")
  ||
  featureText.includes("木部偏小")
  ||
  featureText.includes("中心偏白")
  ||
  featureText.includes("中心偏白色")
);

const strongFangfeng =

fangfengScore >= 7

&&

featureText.includes("形成层环")

&&

featureText.includes("菊花心");

// =========================
// HQ013 TYPE
// 防风误判黄芪斜片
// =========================

if (

  herbName === "防风"

  &&

  confidence <= 80

  &&

  huangqiObliqueSlice

  &&

  fangfengScore <= 18

) {

  console.log(
    "[HQ_OBLIQUE_SLICE_FIX]"
  );

  finalHerbName = "黄芪";

}

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

// =========================
// 甘草纠偏
// =========================
if (

  herbName === "黄芪"

  &&

  confidence <= 85

  &&

  gancaoScore >= 12

  &&

  gancaoScore >= huangqiScore - 5

) {

  console.log(
    "[ROOT_JUDGE] 黄芪 -> 甘草"
  );

  finalHerbName = "甘草";

} 

    if (
      herbName === "黄芪" &&
      confidence <= 70 &&
      dangshenScore - huangqiScore >= 10
      &&
      gancaoScore < dangshenScore
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

  correction_reason:
    buildCorrectionReason(
      herbName,
      finalHerbName,
      featureText
    ),

  root_scores: {
    dangshenScore,
    huangqiScore,
    fangfengScore,
    gancaoScore
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