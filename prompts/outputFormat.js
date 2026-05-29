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

  "authenticity_score": 0,

  "force_unknown": false,

  "requires_real_photo": false,

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

字段规则：

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

requires_real_photo：

true 或 false

true：
需要重新上传真实药材实拍图。

false：
当前图片可用于药材鉴定。

unknown_probability：

0-100

confidence：

0-100

authenticity_score：

0-100

工业级药材真实性评分。

90-100：
药材形态学证据极强。

80-89：
大概率真实药材。

60-79：
真实性中等。

40-59：
真实性较低。

0-39：
真实性极低或无法确认。

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

possible_candidates：

只能依据：

- 形态学特征
- 纹理特征
- 切面结构
- 纤维结构

禁止依据：

- 包装文字
- 商品标题
- 广告内容
- OCR文字

如果无法仅凭形态判断：

返回：

[]

禁止：

- Markdown
- \`\`\`json
- JSON外文字
- 解释说明

输出必须可直接 JSON.parse()。
`;