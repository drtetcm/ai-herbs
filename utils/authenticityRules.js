/**
 * authenticityRules.js
 *
 * 工业级真实性硬规则系统
 * 用于：
 * - 食品伪装拦截
 * - 鲜品拦截
 * - 结构真实性验证
 * - 中药饮片真实性增强
 */

export function applyAuthenticityRules(
  normalizedResult
) {

  let score =
    normalizedResult.authenticity_score || 50;

  let forceUnknown = false;

  const reasoning = [];

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