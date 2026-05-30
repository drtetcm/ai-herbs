export function herbRuleEngine(result) {
  if (!result) return result;

  const features = result.observed_features || [];

  let herbName = result.herb_name;
  let confidence = result.confidence || 0;

  const has = (keyword) =>
    features.some((f) => f.includes(keyword));

  /*
   ====================================
   麦冬排除
   ====================================
   */

  if (
    herbName === "麦冬" &&
    (
      has("类圆柱形") ||
      has("长条根状") ||
      has("狮子盘头") ||
      has("环状横纹")
    )
  ) {
    herbName = "unknown";
    confidence = Math.min(confidence, 20);
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
    confidence = Math.max(confidence, 80);
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
    confidence = Math.min(confidence, 20);
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
    confidence = Math.max(confidence, 80);
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
    confidence = Math.max(confidence, 80);
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
      confidence = Math.max(confidence, 75);
    }
  }

  return {
    ...result,
    herb_name: herbName,
    confidence,
  };
}