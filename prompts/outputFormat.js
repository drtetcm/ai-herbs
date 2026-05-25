export const outputFormat = `
请严格输出以下JSON格式：

{
  "herb_name": "",
  "confidence": 0,

  "image_quality_score": 0,
  "image_blur_level": "",
  "lighting_quality": "",
  "visibility_score": 0,

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

字段规则：

confidence:
0-100
代表AI对药材识别结果的可信度。

image_quality_score:
0-100
代表图片整体质量评分。

评分标准：

80-100:
高清、清晰、主体完整。

50-79:
轻微模糊、轻微阴影、细节部分缺失。

0-49:
严重模糊、强阴影、过暗、像素化、主体不完整。

image_blur_level:
只能输出：

"LOW"
"MEDIUM"
"HIGH"

规则：

LOW:
清晰。

MEDIUM:
部分模糊。

HIGH:
严重模糊，细节无法辨认。

lighting_quality:
只能输出：

"GOOD"
"FAIR"
"POOR"

规则：

GOOD:
光线正常。

FAIR:
轻度阴影或偏暗。

POOR:
严重偏暗、强反光、强阴影。

visibility_score:
0-100

代表药材主体可见程度。

80-100:
主体完整。

50-79:
主体部分遮挡。

0-49:
主体严重缺失或无法识别。

quality_grade:
只能输出：

"优质"
"中等偏上"
"中等"
"较差"
"无法评级"

risk_level:
只能输出：

"LOW"
"MEDIUM"
"HIGH"

issues_detected:
必须是数组。

如果没有发现异常：
返回 []

禁止输出Markdown。
禁止输出解释。
禁止输出代码块。
只能输出合法JSON。
`;