export function applyAuthenticityRules(
  normalizedResult
) {

  let score =
    normalizedResult.authenticity_score || 50;

  let forceUnknown = false;

  const reasoning = [

  ...new Set(

    (
      normalizedResult
        ?.authenticity_reasoning
        ?.positive_signals || []
    )

      .map(signal => {

        const signalMap = {

          "纤维":
            "检测到纤维结构特征",

          "纤维束":
            "检测到纤维结构特征",

          "干燥":
            "检测到干燥药材特征",

          "木质":
            "检测到木质化结构",

          "粗糙":
            "检测到粗糙表面纹理",

          "纵向纹理":
            "检测到纵向纹理结构",

          "横切纹理":
            "检测到横切纹理特征",

          "放射纹":
            "检测到放射纹特征",

          "环纹":
            "检测到环状纹理",

          "断面":
            "检测到药材断面结构",

          "粉性":
            "检测到粉性质地",

          "角质":
            "检测到角质样结构",

          "根茎":
            "检测到根茎类药材特征",

          "饮片":
            "检测到饮片加工痕迹",

          "切制":
            "检测到切制加工特征",

          "药材纹理":
            "检测到药材纹理结构",

          "药材结构":
            "检测到药材结构特征",

          "油点":
            "检测到药材油点特征",

          "菊花心":
            "检测到菊花心结构",

          "孔隙":
            "检测到孔隙特征"

        };

        return (
          signalMap[signal] ||
          `检测到${signal}特征`
        );

      })

  )

];

  // =========================
  // 基础字段
  // =========================

  const text = JSON.stringify(
    normalizedResult
  ).toLowerCase();

  const herbName =
    (
      normalizedResult.herb_name || ""
    ).toLowerCase();

  // =========================
  // 食品强特征（严重扣分）
  // =========================

  const foodFeatures = [

    "湿润",
    "水分",
    "鲜品",
    "半透明",
    "规则切片",
    "机械切割",
    "均匀切片",
    "蔬菜",
    "食品",
    "果蔬",
    "新鲜食材",
    "无纤维",
    "无粉性",
    "无放射纹理",
    "边缘规整",
    "表面光滑",
    "光滑湿润"

  ];

  let foodHit = 0;

  for (const feature of foodFeatures) {

    if (text.includes(feature)) {

      foodHit++;

    }

  }

  // =========================
  // 药材真实性特征（加分）
  // =========================

  const herbFeatures = [

    "纤维",
    "粉性",
    "断面",
    "放射纹理",
    "自然裂纹",
    "粗糙",
    "药材纹理",
    "切制",
    "饮片",
    "粉质",
    "结构复杂",
    "自然边缘",
    "内部结构"

  ];

  let herbHit = 0;

  for (const feature of herbFeatures) {

    if (text.includes(feature)) {

      herbHit++;

    }

  }

  // =========================
  // 食品特征扣分
  // =========================

  if (foodHit >= 2) {

    score -= 25;

    reasoning.push(
      "检测到明显食品结构特征"
    );

  }

  if (foodHit >= 4) {

    score -= 35;

    reasoning.push(
      "食品特征密集出现"
    );

  }

  // =========================
  // 药材特征加分
  // =========================

  if (herbHit >= 3) {

    score += 20;

    reasoning.push(
      "检测到药材纹理结构"
    );

  }

  if (herbHit >= 5) {

    score += 15;

    reasoning.push(
      "药材真实性较强"
    );

  }

  // =========================
  // 特殊食品关键词
  // =========================

  const fakeHerbs = [

    "土豆",
    "马铃薯",
    "白萝卜",
    "莲藕",
    "黄瓜",
    "苹果",
    "红薯"

  ];

  for (const item of fakeHerbs) {

    if (
      herbName.includes(item) ||
      text.includes(item)
    ) {

      score = 0;

      forceUnknown = true;

      reasoning.push(
        `检测到食品对象: ${item}`
      );

    }

  }

  // =========================
  // herb / food 类型纠偏
  // =========================

  if (
    normalizedResult.object_type === "food"
  ) {

    score -= 40;

    reasoning.push(
      "对象类型属于 food"
    );

  }

  if (
    normalizedResult.object_type === "herb"
    &&
    foodHit >= 3
  ) {

    score -= 30;

    reasoning.push(
      "herb类型与食品特征冲突"
    );

  }

  // =========================
  // UNKNOWN强化
  // =========================

  if (score <= 20) {

    forceUnknown = true;

  }

  // =========================
  // 分数修正
  // =========================

  score = Math.max(
    0,
    Math.min(score, 100)
  );

  // =========================
  // 等级
  // =========================

  let level = "LOW";

  if (score >= 75) {

    level = "HIGH";

  } else if (score >= 45) {

    level = "MEDIUM";

  }

  return {

    authenticity_score: score,

    authenticity_level: level,

    force_unknown: forceUnknown,

    reasoning

  };

}