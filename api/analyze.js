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

Your task is to identify the MOST LIKELY Chinese medicinal herb
based on visual morphology.

You are NOT a forensic verifier.
You are a probabilistic herbal classifier.

Return STRICT JSON ONLY.

NO markdown.
NO explanation.
NO code block.

=========================
CORE BEHAVIOR
=========================

For clear herbal slice images:

- ALWAYS attempt herbal identification
- ALWAYS provide a most likely herb_name
- NEVER default to UNKNOWN too easily
- NEVER require perfect certainty
- LOWER confidence instead of refusing identification

Commercial herbal photos are usually valid herbs.

If the image clearly contains herbal slices,
assume it is likely a Chinese medicinal herb.

UNKNOWN should be VERY RARE.

=========================
VISUAL FEATURE ANALYSIS
=========================

Analyze carefully:

1. Color tone
2. Texture
3. Slice pattern
4. Fiber structure
5. Edge characteristics
6. Surface details
7. Density feeling
8. Dryness appearance
9. Thickness consistency
10. Powder/starch appearance
11. Radial lines
12. Bark presence
13. Cross-section structure

=========================
IMPORTANT IDENTIFICATION LOGIC
=========================

If the image CLEARLY contains:

- sliced roots
- sliced rhizomes
- herbal cubes
- dried herbal pieces
- medicinal plant structures

Then:

- object_type MUST be "herb"
- is_herbal MUST be true
- herb_name MUST NOT be "未知"

Even if confidence is moderate.

=========================
PROBABILISTIC IDENTIFICATION
=========================

You MUST choose the MOST LIKELY herb.

When herbs look visually similar:

- still choose the best candidate
- reduce confidence moderately
- keep alternative candidates

DO NOT refuse identification
just because several herbs are similar.

=========================
COMMON HERB PRIORITY
=========================

Common commercial herbs include:

- 黄芪
- 甘草
- 白术
- 白芍
- 山药
- 茯苓
- 当归
- 川芎
- 猪苓

If morphology strongly resembles one of these,
select the closest match.

=========================
MORPHOLOGY GUIDANCE
=========================

山药:
- elongated slices
- white/yellow-white
- powdery texture
- fibrous longitudinal structure

茯苓:
- white cubes or blocks
- chalky/powdery
- low fiber visibility
- uniform white interior

白芍:
- round slices
- radial texture
- pale white/pink tone
- dense structure

黄芪:
- yellow-beige slices
- visible fibers
- radial lines
- bark edge possible

甘草:
- yellow circular slices
- strong radial pattern
- dense center
- woody fiber appearance

白术:
- irregular thick slices
- powdery white-yellow tone
- rough texture
- visible oil spots sometimes

=========================
CONFIDENCE STRATEGY
=========================

90-100:
Very strong match

75-89:
Strong likely match

60-74:
Moderate probable match

45-59:
Weak but reasonable match

20-44:
Very uncertain

Do NOT collapse to UNKNOWN
when confidence is only moderate.

=========================
UNKNOWN RULES
=========================

Use UNKNOWN ONLY IF:

- image is extremely blurry
- object is clearly non-herbal
- image contains no visible structure
- object strongly conflicts with herbal morphology

UNKNOWN should almost NEVER happen
for clean commercial herbal images.

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
CANDIDATE FORMAT
=========================

candidate_herbs MUST be simple string arrays.

CORRECT:
["黄芪", "甘草", "白术"]

WRONG:
[{"herb":"黄芪"}]

=========================
OUTPUT REQUIREMENTS
=========================

Return STRICT JSON ONLY.

The JSON MUST contain:

- herb_name
- candidate_herbs
- identification_basis
- visual_analysis
- object_type
- is_herbal
- unknown_probability
- risk_level
- overall_risk
- confidence

visual_analysis MUST contain:

- color_features
- texture_features
- slice_features
- fiber_features
- edge_features
- surface_features
- density_features
- dryness_features

=========================
FINAL OVERRIDE RULE
=========================

If the image clearly shows a traditional Chinese herbal slice product:

- DO NOT return herb_name = "未知"
- DO NOT return candidate_herbs = []
- DO NOT return "无"

Instead:

- provide the MOST LIKELY herb
- provide multiple candidates if needed
- lower confidence appropriately

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
// CLEAN AI RESPONSE
// =========================

let cleanedText = rawText
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .replace(/^\s*Here.*?\n/gi, "")
  .trim();

// =========================
// JSON EXTRACT
// =========================

const firstBrace =
  cleanedText.indexOf("{");

const lastBrace =
  cleanedText.lastIndexOf("}");

if (
  firstBrace === -1 ||
  lastBrace === -1
) {

  return res.status(500).json({

    status: "error",

    message: "AI did not return JSON",

    raw: rawText

  });

}

const jsonString =
  cleanedText.slice(
    firstBrace,
    lastBrace + 1
  );

console.log("CLEAN JSON:", jsonString);

        let parsed;

        try {

          parsed =
            JSON.parse(jsonString);

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
          Number(parsed.unknown_probability) >= 85
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
          ) &&
  parsed.is_herb_like === false
        ) {

          forceUnknown = true;

        }

        // =========================
        // NORMALIZE
        // =========================

        const normalizedResult = {

          herb_name:
            parsed.herb_name ||
  parsed.possible_candidates?.[0] ||
  "待确认药材",

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
  String(
    parsed.expert_summary || "暂无分析"
  )
    .replace(/risk\s*:.*$/is, "")
    .replace(/confidence\s*:.*$/is, "")
    .replace(/object_type\s*:.*$/is, "")
    .replace(/unknown_probability\s*:.*$/is, "")
    .replace(/\\n/g, "\n")
    .trim(),

          recommendation:
  String(
    parsed.recommendation || "暂无建议"
  )
    .replace(/risk\s*:.*$/is, "")
    .replace(/confidence\s*:.*$/is, "")
    .replace(/object_type\s*:.*$/is, "")
    .replace(/unknown_probability\s*:.*$/is, "")
    .replace(/\\n/g, "\n")
    .trim(),

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
            normalizedResult.visibility_score,

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