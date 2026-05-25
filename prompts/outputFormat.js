export const outputFormat = `
请严格输出以下JSON格式：

{
  "herb_name": "",
  "confidence": 0,
  "possible_alias": [],
  "quality_grade": "",
  "risk_level": "",
  "fake_probability": 0,
  "mold_risk": 0,
  "sulfur_fumigation_risk": 0,
  "color_analysis": "",
  "texture_analysis": "",
  "slice_pattern_analysis": "",
  "issues_detected": [],
  "expert_summary": "",
  "recommendation": ""
}

禁止输出Markdown。
禁止输出解释。
禁止输出代码块。
`;