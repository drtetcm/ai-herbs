export function herbRuleEngine(result) {
  if (!result) return result;

  /*
  ====================================
  特征标准化层
  ====================================
  */

  const normalizeFeatures = (features = []) => {
    return features.map((f) => {

      // 长条根状
      if (
        f.includes("细长条状根茎") ||
        f.includes("长条状根茎") ||
        f.includes("长条根状")
      ) {
        return "长条根状";
      }

      // 类圆柱形
      if (
        f.includes("类圆柱") ||
        f.includes("圆柱形")
      ) {
        return "类圆柱形";
      }

      // 纵向纹理
      if (
        f.includes("纵向皱纹") ||
        f.includes("纵向沟纹") ||
        f.includes("纵纹") ||
        f.includes("纵向纹理")
      ) {
        return "纵向纹理";
      }

      // 节状突起
      if (
        f.includes("节状突起")
      ) {
        return "节状突起";
      }

      // 狮子盘头
      if (
        f.includes("狮子盘头")
      ) {
        return "狮子盘头";
      }

      // 环状横纹
      if (
        f.includes("环状横纹")
      ) {
        return "环状横纹";
      }

      // 放射状纹理
      if (
        f.includes("放射状纹理") ||
        f.includes("放射纹")
      ) {
        return "放射状纹理";
      }

      // 形成层环
      if (
        f.includes("形成层环")
      ) {
        return "形成层环";
      }

      // 油点
      if (
        f.includes("油点")
      ) {
        return "油点";
      }

      // 油室
      if (
        f.includes("油室")
      ) {
        return "油室";
      }

      // 菊花心
      if (
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
  herb_form 标准化
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
    herbForm.includes("厚片")
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

  console.log(
    "HERB FORM NORMALIZED:",
    herbForm
  );

  let herbName =
    result.herb_name;

  let confidence =
    result.confidence || 0;

  const has = (...keywords) =>
    features.some((feature) =>
      keywords.some((keyword) =>
        feature.includes(keyword)
      )
    );

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
  党参增强
  ====================================
  */

  if (
    has("狮子盘头") ||
    has("环状横纹")
  ) {
    herbName = "党参";
    confidence = Math.max(
      confidence,
      80
    );
  }

  /*
  ====================================
  知母排除
  ====================================
  */

  if (
    herbName === "知母" &&
    has("油室")
  ) {
    herbName = "unknown";
    confidence = Math.min(
      confidence,
      20
    );
  }

  /*
  ====================================
  白术增强
  ====================================
  */

  if (
    has("油室") &&
    has("放射状纹理")
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
    has("油点")
  ) {
    herbName = "当归";
    confidence = Math.max(
      confidence,
      80
    );
  }

  /*
  ====================================
  甘草增强
  ====================================
  */

  if (
    has("形成层环") &&
    has("放射状纹理")
  ) {
    if (
      herbName === "黄芪" ||
      herbName === "unknown"
    ) {
      herbName = "甘草";
      confidence = Math.max(
        confidence,
        75
      );
    }
  }

  return {
    ...result,
    herb_form: herbForm,
    observed_features: features,
    herb_name: herbName,
    confidence,
  };
}