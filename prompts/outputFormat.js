export const outputFormat = `
请严格输出以下JSON格式：

{
  "herb_name": "",
  "confidence": 0,

  "risk_level": "",

  "possible_candidates": [],

  "visibility": 0,
  "clarity": "",
  "lighting": "",
  "occlusion_level": "",

  "subject_completeness": 0,
  "morphology_integrity": 0,
  "texture_visibility": 0,

  "object_type": "",
  "unknown_probability": 0,
  "force_unknown": false,

  "authenticity_score": 0,

  "scene_interference": "",

  "abnormal_issues": "",
  "reasoning": "",

  "visual_analysis": {

    "color": "",
    "texture": "",
    "shape": "",
    "surface": "",
    "edges": "",
    "structure": "",

    "lighting_impact": "",
    "occlusion_impact": "",
    "scene_impact": "",

    "ocr_text_density": 0,
    "contains_chinese_text": false,
    "contains_packaging": false,
    "contains_logo": false,
    "contains_product_layout": false,
    "contains_price_tag": false
  }
}

规则：

object_type 只能输出：

"herb"
"food"
"unknown"

risk_level 只能输出：

"LOW"
"MEDIUM"
"HIGH"

clarity 只能输出：

"GOOD"
"MEDIUM"
"POOR"

force_unknown：

true 或 false

unknown_probability：

0-100

authenticity_score：

0-100

ocr_text_density：

0-100

contains_chinese_text：

true 或 false

contains_packaging：

true 或 false

contains_logo：

true 或 false

contains_product_layout：

true 或 false

contains_price_tag：

true 或 false

禁止：

- Markdown
- \`\`\`json
- 解释文字
- JSON外内容

输出必须可直接 JSON.parse()。
`;