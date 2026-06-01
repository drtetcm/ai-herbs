export function herbRuleEngine(result) {

  if (!result) return result;

  /*
  ====================================
  特征标准化层
  ====================================
  */

  const normalizeFeatures = (
    features = []
  ) => {

    return features.map((f) => {

      /*
      ============================
      否定特征优先
      ============================
      */

      if (
        f.includes("无油点") ||
        f.includes("无明显油点")
      ) {
        return "无油点";
      }

      if (
        f.includes("无油室") ||
        f.includes("无明显油室")
      ) {
        return "无油室";
      }

      if (
        f.includes("无狮子盘头")
      ) {
        return "无狮子盘头";
      }

      if (
        f.includes("无形成层环") ||
        f.includes("无棕褐色形成层环")
      ) {
        return "无形成层环";
      }

      if (
        f.includes("无菊花心")
      ) {
        return "无菊花心";
      }

      /*
      ============================
      根类特征
      ============================
      */

      if (
        f.includes("细长条状根茎") ||
        f.includes("长条状根茎") ||
        f.includes("长条根状")
      ) {
        return "长条根状";
      }

      if (
        f.includes("类圆柱") ||
        f.includes("圆柱形")
      ) {
        return "类圆柱形";
      }

      if (
        f.includes("纵向皱纹") ||
        f.includes("纵向沟纹") ||
        f.includes("纵纹") ||
        f.includes("纵向纹理")
      ) {
        return "纵向纹理";
      }

      if (
        f.includes("节状突起")
      ) {
        return "节状突起";
      }

      /*
      ============================
      党参 Dangshen
      ============================
      */

      if (
        !f.includes("无") &&
        f.includes("狮子盘头")
      ) {
        return "狮子盘头";
      }

      if (
        f.includes("环状横纹")
      ) {
        return "环状横纹";
      }

if (
  f.includes("木部较小") ||
  f.includes("中心较小") ||
  f.includes("圆心较小") ||
  f.includes("中心白色圆心较小")
) {
  return "党参核心";
}

if (
  f.includes("皮部较宽") ||
  f.includes("外围皮部较宽") ||
  f.includes("皮部宽厚")
) {
  return "党参核心";
}

if (
  f.includes("边缘皱缩") ||
  f.includes("波浪边缘")
) {
  return "党参核心";
}

      /*
      ============================
      黄芪 / 防风
      ============================
      */

      if (
        !f.includes("无") &&
        (
          f.includes("放射状纹理") ||
          f.includes("放射纹")
        )
      ) {
        return "放射状纹理";
      }

      if (
        !f.includes("无") &&
        f.includes("形成层环")
      ) {
        return "形成层环";
      }

      if (
        !f.includes("无") &&
        f.includes("油点")
      ) {
        return "油点";
      }

      if (
        !f.includes("无") &&
        f.includes("油室")
      ) {
        return "油室";
      }

      if (
        !f.includes("无") &&
        f.includes("菊花心")
      ) {
        return "菊花心";
      }

      return f;

    });

  };

  const features =
    normalizeFeatures(
      result.observed_features || []
    );

  /*
  ====================================
  herb form
  ====================================
  */

  let herbForm =
    result.herb_form || "unknown";

  if (
    herbForm.includes("根条") ||
    herbForm.includes("整根") ||
    herbForm.includes("根茎") ||
    herbForm.includes("长条")
  ) {
    herbForm = "whole_root";
  }

  if (
    herbForm.includes("饮片") ||
    herbForm.includes("切片") ||
    herbForm.includes("厚片") ||
    herbForm.includes("段片")
  ) {
    herbForm = "slice";
  }

  if (
    herbForm.includes("块状")
  ) {
    herbForm = "block";
  }

  if (
    herbForm.includes("粉末") ||
    herbForm.includes("颗粒")
  ) {
    herbForm = "powder";
  }

  let herbName =
    result.herb_name;

  let confidence =
    result.confidence || 0;

  const has = (...keywords) =>
  features.some((feature) =>
    keywords.some(
      (keyword) => feature === keyword
    )
  );

/*
====================================
党参核心计分
====================================
*/

const dangshenScore =
  features.filter(
    (f) => f === "党参核心"
  ).length;

  /*
  ====================================
  麦冬排除
  ====================================
  */

  if (
    herbName === "麦冬" &&
    herbForm === "whole_root"
  ) {
    herbName = "unknown";
    confidence = Math.min(
      confidence,
      20
    );
  }

  /*
  
====================================
党参饮片增强
====================================
*/

if (
  herbForm === "slice" &&
  dangshenScore >= 2 &&
  herbName === "黄芪"
) {

  herbName = "党参";

  confidence = Math.max(
    confidence,
    78
  );

}

  /*
  ====================================
  白术增强
  ====================================
  */

  if (
  has("油室") &&
  has("放射状纹理") &&
  !has("无油室")
) {
  herbName = "白术";

  confidence = Math.max(
    confidence,
    80
  );
}

  /*
  ====================================
  当归增强
  ====================================
  */

  if (
    has("形成层环") &&
    has("油点") &&
    !has("无形成层环") &&
    !has("无油点")
  ) {

    herbName = "当归";

    confidence = Math.max(
      confidence,
      80
    );

  }

  return {

    ...result,

    herb_form: herbForm,

    observed_features: features,

    herb_name: herbName,

    confidence,

  };

}