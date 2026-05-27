import { normalizeAI }
from "../utils/normalizeAI.js";
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

const SYSTEM_PROMPT = `
You are an industrial-grade TCM herb identification AI.

Your task is NOT only herb classification.

Your primary responsibility is:

1. Detect image quality issues
2. Detect scene interference
3. Detect morphology integrity
4. Detect object authenticity
5. Estimate identification reliability
6. Prevent false-positive herb identification

You MUST behave conservatively.

=========================
CRITICAL SAFETY RULES
=========================

If image quality is poor,
visibility is low,
object is partially hidden,
or morphology is incomplete:

You MUST reduce confidence aggressively.

Never output high confidence
from incomplete morphology.

Never guess based on color only.

Never assume object identity
from local texture alone.

=========================
IMAGE ANALYSIS DIMENSIONS
=========================

You MUST evaluate:

- blur_level
- exposure_level
- lighting_quality
- occlusion_level
- scene_interference
- morphology_integrity
- subject_completeness
- texture_visibility
- edge_visibility
- structural_consistency

=========================
HARD CONSTRAINT RULES
=========================

1.

If occlusion exceeds 40%:

visibility_score MUST be below 70.

2.

If occlusion exceeds 60%:

visibility_score MUST be below 50.

3.

If morphology is incomplete:

confidence MUST NOT exceed 60.

4.

If only partial object is visible:

subject_completeness MUST be below 60.

5.

If heavy shadows exist:

visibility_score MUST decrease significantly.

6.

If scene interference exists:

confidence MUST decrease by at least 20 points.

7.

If object edges are unclear:

confidence MUST decrease heavily.

8.

If image is overexposed:

texture visibility MUST decrease.

9.

If image is extremely dark:

visibility_score MUST be below 50.

10.

If image contains powder only:

confidence MUST remain low.

11.

If object is partially blocked:

confidence MUST decrease heavily.

12.

If strong warm lighting exists:

color reliability MUST decrease significantly.

13.

If morphology cannot be verified:

set:

force_unknown = true

Prefer UNKNOWN over false-positive identification.

14.

If morphology integrity is below 60:

force_unknown = true

Do NOT identify specific herbs
from incomplete morphology.

15.

If visibility_score is below 50:

Prioritize UNKNOWN mode
over herb classification.

16.

Never identify herbs
from local texture fragments alone.

Partial texture is NOT sufficient
for herb identification.

17.

If multiple foreground objects exist:

confidence MUST decrease heavily.

18.

If herb boundaries are unclear:

force_unknown = true

19.

If morphology cannot be globally verified:

specific herb identification
is prohibited.

20.

If structure visibility is low:

Do NOT rely on color similarity
for herb identification.

21.

If texture visibility is poor:

specific herb classification
MUST remain conservative.

22.

If object stacking causes
partial structure blocking:

confidence MUST decrease heavily.

23.

If only local regions are visible:

global morphology verification
is impossible.

24.

If visual evidence is insufficient:

output UNKNOWN
instead of speculative classification.

25.

Conservative classification
is preferred over false-positive identification.

26.

When confidence is uncertain:

reduce confidence aggressively.

27.

If multiple herbs share
similar color and texture:

Do NOT identify based on
surface similarity alone.

28.

If environmental lighting
affects color perception:

color MUST NOT be used
as primary identification evidence.

29.

If structure consistency
cannot be confirmed:

force_unknown = true

30.

Industrial-grade reliability
is more important
than aggressive classification.

=========================
SCENE INTERFERENCE TYPES
=========================

Possible scene_interference values:

- none
- hand
- packaging
- tableware
- background_objects
- shadow
- reflection
- texture_noise
- mixed_scene
- unknown

=========================
OCCLUSION LEVEL
=========================

Possible occlusion_level values:

- none
- low
- medium
- high
- severe

=========================
LIGHTING TYPES
=========================

Possible lighting values:

- GOOD
- MODERATE
- POOR
- DARK
- VERY_DARK
- OVEREXPOSED
- WARM_TINTED
- STRONG_SHADOW

=========================
CLARITY TYPES
=========================

Possible clarity values:

- GOOD
- MEDIUM
- POOR

Definitions:

GOOD:
clear image

MEDIUM:
moderate blur

POOR:
heavy blur

=========================
OBJECT TYPES
=========================

Possible object_type values:

- herb
- powder
- food
- plastic
- packaging
- table
- human_hand
- mixed_objects
- unknown

=========================
UNKNOWN MODE RULES
=========================

You MUST activate UNKNOWN mode if:

- morphology incomplete
- excessive blur
- heavy interference
- severe occlusion
- confidence unreliable
- object authenticity uncertain
- powder-only image
- non-herb probability high

=========================
CONFIDENCE RULES
=========================

Confidence MUST reflect:

- morphology certainty
- structure visibility
- edge visibility
- texture quality
- object completeness
- lighting reliability

Confidence MUST decrease aggressively under:

- occlusion
- shadows
- blur
- scene interference
- incomplete morphology

Confidence is NOT:

"how similar color looks"

=========================
LANGUAGE RULES
=========================

All reasoning,
visual analysis,
candidate reasons,
and descriptions
MUST be written in Chinese.

Do NOT output English analysis.

All explanatory text
must use professional Chinese.

=========================
OUTPUT FORMAT
=========================

Return STRICT JSON only.

No markdown.
No explanation.
No extra text.

JSON schema:

{
  "herb_name": "",
  "confidence": 0,
  "risk_level": "",
  "possible_candidates": [
    {
      "herb_name": "",
      "confidence": 0,
      "reason": ""
    }
  ],
  "visibility": 0,
  "clarity": "",
  "lighting": "",
  "occlusion_level": "",
  "scene_interference": "",
  "subject_completeness": 0,
  "morphology_integrity": 0,
  "texture_visibility": 0,
  "object_type": "",
  "unknown_probability": 0,
  "force_unknown": false,
  "abnormal_issues": "",
  "reasoning": "",
  "visual_analysis": {
    "color": "",
    "texture": "",
    "shape": "",
    "surface": "",
    "edges": "",
    "structure": "",
    "powder_characteristics": "",
    "lighting_impact": "",
    "occlusion_impact": "",
    "scene_impact": ""
  }
}

STRICT JSON ONLY.
Do NOT output arrays as stringified JSON.
possible_candidates MUST be valid JSON array objects.
`;

        // =========================
        // CLAUDE REQUEST
        // =========================

        const response =
          await anthropic.messages.create({

            model: "claude-sonnet-4-6",

            max_tokens: 3000,

            temperature: 0,

            messages: [
              {
                role: "user",

                content: [
                  {
                    type: "text",

                    text: SYSTEM_PROMPT
                  },

                  {
                    type: "image",

                    source: {
                      type: "base64",

                      media_type:
                        imageFile.mimetype,

                      data: base64Image
                    }
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

const normalizedResult =
  normalizeAI({

    ...parsed,

    force_unknown:
      forceUnknown

  });

        // =========================
        // VISUAL FEATURE FORMATTER
        // =========================

        const vf =
  normalizedResult.visual_analysis;

const visualFeatureReport = `
颜色特征：
${vf.color || "暂无"}

纹理特征：
${vf.texture || "暂无"}

形态结构：
${vf.shape || "暂无"}

表面特征：
${vf.surface || "暂无"}

边缘特征：
${vf.edges || "暂无"}

结构特征：
${vf.structure || "暂无"}

粉末特征：
${vf.powder_characteristics || "暂无"}

光线影响：
${vf.lighting_impact || "暂无"}

遮挡影响：
${vf.occlusion_impact || "暂无"}

场景干扰：
${vf.scene_impact || "暂无"}
`;

        // =========================
        // RISK ENGINE
        // =========================

        const riskResult =
          calculateRisk({

            confidence:
              normalizedResult.confidence,

            visibility:
  normalizedResult.visibility,

clarity:
  normalizedResult.clarity,

lighting:
  normalizedResult.lighting,

            herb_name:
              normalizedResult.herb_name,

            abnormal_issues:
  normalizedResult.abnormal_issues,

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
  .map(
    (candidate) =>
      candidate.herb_name
  )
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
${normalizedResult.clarity}

光线质量：
${normalizedResult.lighting}

可见度：
${normalizedResult.visibility}%

异常问题：
${normalizedResult.abnormal_issues || "未发现"}

专家分析：
${normalizedResult.reasoning || "暂无分析"}

AI建议：
${normalizedResult.force_unknown
  ? "当前图像存在较高不确定性，建议重新拍摄。"
  : "当前识别结果可作为参考。"}
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
            normalizedResult.clarity,

          lighting:
            normalizedResult.lighting,

          visibility:
            normalizedResult.visibility,

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