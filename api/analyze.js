import Anthropic from "@anthropic-ai/sdk";

import formidable from "formidable";

import fs from "fs";

import { calculateRisk }
from "../utils/riskEngine.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {

  // =========================
  // METHOD CHECK
  // =========================

  if (req.method !== "POST") {

    return res.status(405).json({
      status: "error",
      message: "Method not allowed"
    });

  }

  try {

    // =========================
    // PARSE FORM
    // =========================

    const form = formidable({});

    form.parse(req, async (err, fields, files) => {

      if (err) {

        console.error("FORM ERROR:", err);

        return res.status(500).json({
          status: "error",
          message: "File upload failed"
        });

      }

      try {

        // =========================
        // IMAGE
        // =========================

        const imageFile = files.image?.[0];

        if (!imageFile) {

          return res.status(400).json({
            status: "error",
            message: "No image uploaded"
          });

        }

        // =========================
        // IMAGE BASE64
        // =========================

        const imageBuffer =
          fs.readFileSync(imageFile.filepath);

        const base64Image =
          imageBuffer.toString("base64");

        // =========================
        // PROFESSIONAL HERBAL PROMPT
        // =========================

        const prompt = `
You are a professional traditional Chinese medicine herbal inspection AI.

Your task is NOT to immediately guess the herb.

You must FIRST analyze the visual herbal features carefully.

Return STRICT JSON ONLY.

NO markdown.
NO explanation.
NO code block.

=========================
VISUAL FEATURE ANALYSIS
=========================

You must analyze:

1. Color tone
2. Texture
3. Slice pattern
4. Fiber structure
5. Edge characteristics
6. Surface details
7. Density feeling
8. Dryness or moisture appearance

=========================
CONSERVATIVE IDENTIFICATION
=========================

If multiple herbs share highly similar structures:

- reduce confidence significantly
- maintain multiple candidates
- avoid aggressive final identification

Allowed uncertain herb_name values:

- 疑似黄芪
- 疑似白术
- 疑似甘草
- 疑似白芍
- 待确认药材
- 相似饮片待确认

Never force a high confidence answer
when visual structures are ambiguous.

=========================
HERBAL IDENTIFICATION
=========================

After visual analysis:

1. Determine whether the object is herbal-like

2. Identify possible herbal candidates

3. Determine final herb_name

4. Carefully distinguish similar sliced herbs:

- 黄芪
- 甘草
- 白术
- 白芍
- 山药
- 当归
- 川芎
- 茯苓
- 猪苓

Analyze structural details carefully before deciding.

=========================
OBJECT TYPE
=========================

Allowed object_type values:

- herb
- powder
- plastic
- food
- packaging
- table
- human_hand
- animal
- unknown

=========================
UNKNOWN RULES
=========================

If image quality is poor:
- lower confidence
- increase unknown_probability

If visual features are ambiguous:
- increase unknown_probability

unknown_probability:
0-20 = likely herb
20-50 = suspicious
50-100 = likely NOT herb

=========================
RETURN JSON
=========================

{
  "visual_features": {

    "color_tone": "",

    "texture": "",

    "slice_pattern": "",

    "fiber_structure": "",

    "edge_characteristics": "",

    "surface_details": "",

    "density_feeling": "",

    "dryness_moisture": ""

  },

  "possible_candidates": [],

  "identification_reason": "",

  "herb_name": "",

  "confidence": 0,

  "is_herb_like": true,

  "object_type": "herb",

  "unknown_probability": 0,

  "image_quality_score": 0,

  "image_blur_level": "LOW",

  "lighting_quality": "GOOD",

  "visibility_score": 0,

  "quality_grade": "A",

  "risk_level": "LOW",

  "fake_probability": 0,

  "mold_risk": 0,

  "sulfur_fumigation_risk": 0,

  "issues_detected": [],

  "expert_summary": "",

  "recommendation": ""

}

ONLY RETURN JSON.
`;

        // =========================
        // CLAUDE REQUEST
        // =========================

        const response =
          await anthropic.messages.create({

            model: "claude-sonnet-4-6",

            max_tokens: 2500,

            temperature: 0,

            system: `
你是工业级AI中药材风控系统。

你的第一任务：
判断是不是药材。

第二任务：
分析药材视觉结构。

禁止直接猜测药材。

必须先分析：
颜色
纹理
横切纹
纤维结构
边缘形态
粉性质感

对于相似饮片：

宁可不确定，
也不要高置信度乱猜。

严格输出JSON。

禁止Markdown。
禁止代码块。
禁止解释。
`,

            messages: [

              {
                role: "user",

                content: [

                  {
                    type: "image",

                    source: {
                      type: "base64",

                      media_type:
                        imageFile.mimetype,

                      data: base64Image
                    }
                  },

                  {
                    type: "text",

                    text: prompt
                  }

                ]
              }

            ]

          });

        // =========================
        // RAW TEXT
        // =========================

        const rawText =
          response.content?.[0]?.text || "";

        console.log("RAW:", rawText);

        // =========================
        // JSON EXTRACT
        // =========================

        const jsonMatch =
          rawText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {

          return res.status(500).json({

            status: "error",

            message: "AI did not return JSON",

            raw: rawText

          });

        }

        // =========================
        // PARSE JSON
        // =========================

        let parsed;

        try {

          parsed =
            JSON.parse(jsonMatch[0]);

        } catch (jsonError) {

          console.error(jsonError);

          return res.status(500).json({

            status: "error",

            message: "Invalid AI JSON",

            raw: rawText

          });

        }

        // =========================
        // SAFE DEFAULTS
        // =========================

        parsed.is_herb_like ??= true;

        parsed.object_type ??= "unknown";

        parsed.unknown_probability ??= 0;

        parsed.visual_features ??= {};

        parsed.possible_candidates ??= [];

        parsed.identification_reason ??= "";

        // =========================
        // CONSERVATIVE MODE
        // =========================

        const candidateCount =
          parsed.possible_candidates.length;

        if (
          candidateCount >= 3 &&
          parsed.confidence >= 80
        ) {

          parsed.confidence = 65;

        }

        if (
          candidateCount >= 4
        ) {

          parsed.herb_name =
            "相似饮片待确认";

          parsed.confidence = 55;

        }

        // =========================
        // HARD UNKNOWN DETECTION
        // =========================

        let forceUnknown = false;

        if (
          parsed.is_herb_like === false
        ) {

          forceUnknown = true;

        }

        if (
          Number(parsed.unknown_probability) >= 60
        ) {

          forceUnknown = true;

        }

        const nonHerbalObjects = [

          "plastic",
          "food",
          "table",
          "human_hand",
          "animal",
          "packaging"

        ];

        if (
          nonHerbalObjects.includes(
            parsed.object_type
          )
        ) {

          forceUnknown = true;

        }

        // =========================
        // NORMALIZE
        // =========================

        const normalizedResult = {

          herb_name:
            parsed.herb_name || "未知",

          confidence:
            Number(parsed.confidence || 0),

          visual_features:
            parsed.visual_features || {},

          possible_candidates:
            Array.isArray(
              parsed.possible_candidates
            )
              ? parsed.possible_candidates
              : [],

          identification_reason:
            parsed.identification_reason ||
            "",

          is_herb_like:
            Boolean(parsed.is_herb_like),

          object_type:
            parsed.object_type || "unknown",

          unknown_probability:
            Number(
              parsed.unknown_probability || 0
            ),

          image_quality_score:
            Number(parsed.image_quality_score || 0),

          image_blur_level:
            parsed.image_blur_level || "UNKNOWN",

          lighting_quality:
            parsed.lighting_quality || "UNKNOWN",

          visibility_score:
            Number(parsed.visibility_score || 0),

          quality_grade:
            parsed.quality_grade || "UNKNOWN",

          risk_level:
            parsed.risk_level || "LOW",

          fake_probability:
            Number(parsed.fake_probability || 0),

          mold_risk:
            Number(parsed.mold_risk || 0),

          sulfur_fumigation_risk:
            Number(parsed.sulfur_fumigation_risk || 0),

          issues_detected:
            Array.isArray(parsed.issues_detected)
              ? parsed.issues_detected
              : [],

          expert_summary:
            parsed.expert_summary ||
            "暂无分析",

          recommendation:
            parsed.recommendation ||
            "暂无建议",

          force_unknown:
            forceUnknown

        };

        // =========================
        // VISUAL FEATURE FORMATTER
        // =========================

        const vf =
          normalizedResult.visual_features;

        const visualFeatureReport = `
颜色特征：
${vf.color_tone || "暂无"}

纹理特征：
${vf.texture || "暂无"}

切片结构：
${vf.slice_pattern || "暂无"}

纤维结构：
${vf.fiber_structure || "暂无"}

边缘特征：
${vf.edge_characteristics || "暂无"}

表面特征：
${vf.surface_details || "暂无"}

密度质感：
${vf.density_feeling || "暂无"}

干湿状态：
${vf.dryness_moisture || "暂无"}
`;

        // =========================
        // RISK ENGINE
        // =========================

        const riskResult =
          calculateRisk({

            confidence:
              normalizedResult.confidence,

            visibility:
              normalizedResult.visibility_score,

            clarity:
              normalizedResult.image_blur_level,

            lighting:
              normalizedResult.lighting_quality,

            herb_name:
              normalizedResult.herb_name,

            abnormal:
              normalizedResult.issues_detected
                ?.join(" ") || "",

            unknown_probability:
              normalizedResult.unknown_probability,

            object_type:
              normalizedResult.object_type,

            force_unknown:
              normalizedResult.force_unknown

          });

        // =========================
        // APPLY RISK
        // =========================

        normalizedResult.risk_level =
          riskResult.riskLevel;

        normalizedResult.total_risk_score =
          riskResult.totalRisk;

        // =========================
        // UNKNOWN MODE
        // =========================

        if (
          riskResult.isUnknown ||
          normalizedResult.force_unknown
        ) {

          normalizedResult.herb_name =
            "未知对象";

          normalizedResult.risk_level =
            "HIGH";

          normalizedResult.quality_grade =
            "无法评级";

        }

        // =========================
        // REPORT
        // =========================

        const report = `
药材名称：
${normalizedResult.herb_name}

候选药材：
${
  normalizedResult.possible_candidates
    .map((candidate) => {

      if (typeof candidate === "string") {
        return candidate;
      }

      if (
        typeof candidate === "object" &&
        candidate !== null
      ) {

        return (
          candidate.name ||
          candidate.herb ||
          JSON.stringify(candidate)
        );

      }

      return String(candidate);

    })
    .join("、") || "无"
}

识别依据：
${normalizedResult.identification_reason || "暂无"}

视觉特征分析：
${visualFeatureReport}

对象类型：
${normalizedResult.object_type}

是否药材：
${normalizedResult.is_herb_like ? "是" : "否"}

未知对象概率：
${normalizedResult.unknown_probability}%

风险等级：
${normalizedResult.risk_level}

总风险：
${normalizedResult.total_risk_score}%

AI置信度：
${normalizedResult.confidence}%

图片质量：
${normalizedResult.quality_grade}

模糊等级：
${normalizedResult.image_blur_level}

光线质量：
${normalizedResult.lighting_quality}

可见度：
${normalizedResult.visibility_score}%

异常问题：
${normalizedResult.issues_detected.join("、") || "未发现"}

专家分析：
${normalizedResult.expert_summary}

AI建议：
${normalizedResult.recommendation}
`;

        // =========================
        // RESPONSE
        // =========================

        return res.status(200).json({

          status: "success",

          report,

          risk:
            normalizedResult.risk_level,

          confidence:
            normalizedResult.confidence,

          clarity:
            normalizedResult.image_blur_level,

          lighting:
            normalizedResult.lighting_quality,

          visibility:
            `${normalizedResult.visibility_score}%`,

          unknown_probability:
            normalizedResult.unknown_probability,

          object_type:
            normalizedResult.object_type,

          is_herb_like:
            normalizedResult.is_herb_like,

          result:
            normalizedResult

        });

      } catch (visionError) {

        console.error(
          "VISION ERROR:",
          visionError
        );

        return res.status(500).json({

          status: "error",

          message:
            visionError.message

        });

      }

    });

  } catch (error) {

    console.error("SERVER ERROR:", error);

    return res.status(500).json({

      status: "error",

      message:
        error.message

    });

  }

}