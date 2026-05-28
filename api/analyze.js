import { normalizeAI }
from "../utils/normalizeAI.js";
import Anthropic from "@anthropic-ai/sdk";

import formidable from "formidable";

import fs from "fs";
import sharp from "sharp";

import { calculateRisk }
from "../utils/riskEngine.js";

import { evaluateAuthenticity }
from "../utils/authenticityEngine.js";

import { applyAuthenticityRules }
from "../utils/authenticityRules.js";

import { isolateObject }
from "../utils/objectIsolation.js";

import { finalDecisionEngine }
from "../utils/finalDecisionEngine.js";

export const config = {
  api: {
    bodyParser: false,
  },

  maxDuration: 60,
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

    const form = formidable({

  multiples: false,

  maxFileSize:
    20 * 1024 * 1024,

  keepExtensions: true

});

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

        const originalImageBuffer =
  fs.readFileSync(imageFile.filepath);

// =========================
// IMAGE COMPRESSION
// =========================

const compressedBuffer =
  await sharp(originalImageBuffer)
    .resize(1600, 1600, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 80,
    })
    .toBuffer();

// =========================
// OBJECT ISOLATION
// =========================

const isolationResult =
  await isolateObject(
    compressedBuffer
  );

// 使用主体裁切图
const imageBuffer =
  isolationResult.success
    ? isolationResult.croppedBuffer
    : compressedBuffer;

// DEBUG
console.log(
  "OBJECT ISOLATION:",
  isolationResult.cropInfo
);

// BASE64
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

31.

If texture analysis fails
AND morphology is incomplete:

force_unknown = true

32.

If clarity is POOR
AND visibility_score is below 60:

confidence MUST NOT exceed 35.

33.

If texture cannot be identified:

candidate ranking confidence
MUST collapse significantly.

34.

If strong shadow overlaps
main herb body:

subject_completeness
MUST decrease significantly.

35.

If more than 30%
of the object is covered
by non-herb objects:

force_unknown = true

36.

If texture details are lost
due to blur:

specific herb identification
is prohibited.

37.

If morphology depends only
on estimated contours:

confidence MUST remain low.

38.

If image blur prevents
fiber/texture verification:

force_unknown = true

39.

If local visible regions
cannot represent
global herb structure:

UNKNOWN classification
is preferred.

40.

If visual ambiguity exists
between multiple herb candidates:

Do NOT output
high-confidence classification.

41.

If both morphology
and texture reliability decrease:

confidence MUST collapse aggressively.

42.

If lighting destroys
surface structure visibility:

texture evidence
MUST be considered unreliable.

43.

If severe blur exists:

morphology evidence
MUST NOT be trusted.

44.

If image quality defects overlap
(shadow + blur + occlusion):

force_unknown = true

45.

If identification relies mainly
on approximate color blocks:

classification is prohibited.

46.

If image contains
large uncertain regions:

global structure verification
fails.

47.

If morphology continuity
cannot be observed:

specific herb identification
MUST stop.

48.

If herb body integrity
cannot be visually confirmed:

UNKNOWN mode
is preferred.

49.

If visual confidence
depends on speculation
rather than observable evidence:

force_unknown = true

50.

Safety-first conservative logic
has highest priority
over recognition completeness.

=========================
SIMILAR HERB DIFFERENTIATION RULES
=========================

Herb identification MUST rely on:

- global morphology
- internal structure
- cut-surface organization
- fiber distribution
- pore structure
- fracture characteristics
- powderiness
- starch texture
- structural consistency
- edge morphology

Color similarity alone
is NOT sufficient
for herb identification.

Do NOT identify herbs
using only:

- local texture
- local color
- partial fragments
- isolated surface patterns

=========================
SHAN YAO vs BAI ZHU
=========================

For ShanYao (山药):

Typical characteristics:

- elongated slices or segments
- dense white starch texture
- smooth cut surface
- compact internal structure
- low pore visibility
- mild powderiness
- relatively uniform thickness
- less fibrous appearance

For BaiZhu (白术):

Typical characteristics:

- irregular slices
- porous sponge-like structure
- visible holes or pores
- rough fractured texture
- obvious fibrous structures
- irregular radial morphology
- stronger structural roughness
- more complex surface variation

If porous fibrous morphology exists,
do NOT classify as ShanYao.

If dense starch morphology is absent,
confidence for ShanYao MUST decrease.

=========================
FU LING vs SHAN YAO
=========================

FuLing (茯苓):

- cube-like cut blocks
- waxy or powdery texture
- cloudy white appearance
- brittle cut structure
- low fiber visibility
- smooth internal fracture
- compact block morphology

ShanYao:

- elongated morphology
- starch-rich texture
- sliced root structure
- mild radial organization
- denser internal texture

If cube morphology is absent,
confidence for FuLing MUST decrease.

=========================
BAI ZHU vs CANG ZHU
=========================

BaiZhu:

- lighter color
- porous structure
- softer fractured texture
- sponge-like morphology

CangZhu:

- darker yellow-brown color
- oil spots may exist
- denser fibrous texture
- rougher internal structure
- stronger radial fiber appearance

=========================
ANTI-FALSE-POSITIVE POLICY
=========================

When two herbs share
similar color and texture:

prioritize:

- morphology
- structure
- cut-surface anatomy

over color similarity.

If differentiation is uncertain:

output UNKNOWN
instead of speculative identification.

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
- herbal_environment
- medicine_cabinet
- tcm_shop
- herb_packaging
- unknown

=========================
SCENE DEBIASING RULES
=========================

Background environment MUST NOT determine herb identity.

Do NOT classify an object as Chinese medicine ONLY because:

- Chinese medicine cabinets exist
- herbal shop environments exist
- herb packaging exists
- traditional Chinese medicine props exist
- warm wooden environments exist
- herb labels exist

Primary identification MUST rely on:

1. object surface texture
2. internal structure
3. fiber structure
4. powder residue
5. drying characteristics
6. medicinal processing traces

If object morphology resembles fresh food slices more than dried herbs,
force_unknown should be TRUE.

Scene context is secondary evidence only.

If scene strongly suggests herbs but object morphology does not,
classify as:

UNKNOWN
or
food

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

IMPORTANT:

You must return ONLY valid JSON.

Do not include markdown.
Do not include explanation.
Do not include code block.
Do not include any text outside JSON.

Return pure JSON only.

`;

// =========================
// CLAUDE REQUEST
// =========================

let response;

try {

  response =
    await anthropic.messages.create({

      model:
        "claude-sonnet-4-6",

      max_tokens: 2500,

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
                  "image/jpeg",

                data: base64Image
              }
            }

          ]
        }

      ]

    });

} catch (claudeError) {

  console.error(
    "CLAUDE ERROR:",
    claudeError
  );

  return res.status(500).json({

    status: "error",

    message:
      "Claude API failed",

    error:
      claudeError.message

  });

}

// =========================
// RAW TEXT
// =========================

const rawText =
  response?.content?.[0]?.text || "";

console.log(
  "RAW RESPONSE:",
  rawText
);

// =========================
// EMPTY RESPONSE CHECK
// =========================

if (!rawText) {

  return res.status(500).json({

    status: "error",

    message:
      "Claude returned empty response"

  });

}

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

  console.error(
    "INVALID JSON RESPONSE:",
    cleanedText
  );

  return res.status(500).json({

    status: "error",

    message:
      "AI did not return valid JSON",

    raw:
      cleanedText

  });

}

const jsonString =
  cleanedText.slice(
    firstBrace,
    lastBrace + 1
  );

console.log("CLEAN JSON:", jsonString);

if (
  !jsonString.trim().endsWith("}")
) {

  return res.status(500).json({

    status: "error",

    message: "AI JSON truncated",

    raw: rawText

  });

}

        let parsed;

        let finalDecision;

        try {

          parsed =
            JSON.parse(jsonString);
            
            finalDecision =
  finalDecisionEngine({

    object_type:
      parsed.object_type || "unknown",

    is_herb:
      parsed.object_type === "herb",

    ai_confidence:
      parsed.confidence || 0,

    unknown_probability:
      parsed.unknown_probability || 0,

    authenticity_score:
      parsed.authenticity_score || 50,

    scene_interference:
      parsed.scene_interference || "unknown",

    possible_candidates:
      parsed.possible_candidates || []

  });

console.log(
  "FINAL DECISION:",
  finalDecision
);

        } catch (jsonError) {

          console.error(jsonError);

          return res.status(500).json({

            status: "error",

            message: "Invalid AI JSON",

            raw: rawText

          });

        }

        // =========================
// INDUSTRIAL HARD GATE
// =========================

const candidateCount =
  parsed.possible_candidates?.length || 0;

let forceUnknown = false;

// =========================
// BASIC UNKNOWN
// =========================

if (
  Number(parsed.unknown_probability) >= 85
) {

  forceUnknown = true;

}

// =========================
// NON HERBAL OBJECTS
// =========================

const nonHerbalObjects = [

  "plastic",
  "food",
  "table",
  "human_hand",
  "animal",
  "packaging",
  "mixed_objects"

];

if (
  nonHerbalObjects.includes(
    parsed.object_type
  )
) {

  forceUnknown = true;

}

// =========================
// LOW VISIBILITY
// =========================

if (
  Number(parsed.visibility) < 50
) {

  forceUnknown = true;

  parsed.confidence =
    Math.min(
      parsed.confidence,
      35
    );

}

// =========================
// POOR CLARITY
// =========================

if (
  parsed.clarity === "POOR"
) {

  parsed.confidence =
    Math.min(
      parsed.confidence,
      35
    );

}

// =========================
// STRONG SHADOW
// =========================

if (
  parsed.lighting === "STRONG_SHADOW"
) {

  parsed.confidence =
    Math.min(
      parsed.confidence,
      30
    );

}

// =========================
// VERY DARK
// =========================

if (
  parsed.lighting === "VERY_DARK"
) {

  forceUnknown = true;

  parsed.confidence =
    Math.min(
      parsed.confidence,
      20
    );

}

// =========================
// OVEREXPOSED
// =========================

if (
  parsed.lighting === "OVEREXPOSED"
) {

  forceUnknown = true;

  parsed.confidence =
    Math.min(
      parsed.confidence,
      25
    );

}

// =========================
// WARM LIGHTING
// =========================

if (
  parsed.lighting === "WARM_TINTED"
) {

  parsed.confidence =
    Math.min(
      parsed.confidence,
      42
    );

}

// =========================
// OCCLUSION
// =========================

if (
  parsed.occlusion_level === "medium" ||
  parsed.occlusion_level === "high" ||
  parsed.occlusion_level === "severe"
) {

  parsed.confidence =
    Math.min(
      parsed.confidence,
      38
    );

}

// =========================
// SCENE INTERFERENCE
// =========================

const interferenceScenes = [

  "hand",
  "packaging",
  "background_objects",
  "shadow",
  "reflection",
  "texture_noise",
  "mixed_scene",
  "unknown"

];

if (
  interferenceScenes.includes(
    parsed.scene_interference
  )
) {

  parsed.confidence =
    Math.min(
      parsed.confidence,
      35
    );

}

// =========================
// MORPHOLOGY FAILURE
// =========================

if (
  Number(parsed.morphology_integrity) < 60
) {

  forceUnknown = true;

}

// =========================
// SUBJECT INCOMPLETE
// =========================

if (
  Number(parsed.subject_completeness) < 60
) {

  forceUnknown = true;

}

// =========================
// TEXTURE FAILURE
// =========================

if (
  Number(parsed.texture_visibility) < 50
) {

  parsed.confidence =
    Math.min(
      parsed.confidence,
      35
    );

}

// =========================
// MULTI CANDIDATES
// =========================

if (
  candidateCount >= 3
) {

  parsed.confidence =
    Math.min(
      parsed.confidence,
      55
    );

}

// =========================
// FORCE UNKNOWN
// =========================

if (
  parsed.force_unknown === true
) {

  forceUnknown = true;

}

// =========================
// FINAL HARD UNKNOWN
// =========================

if (forceUnknown) {

  parsed.herb_name =
    "UNKNOWN";

  parsed.confidence =
    Math.min(
      parsed.confidence,
      35
    );

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
// AUTHENTICITY ENGINE
// =========================

const authenticityResult =
  evaluateAuthenticity(
    normalizedResult
  );

// 写入结果
normalizedResult.authenticity_score =
  authenticityResult.authenticity_score;

normalizedResult.authenticity_level =
  authenticityResult.authenticity_level;

normalizedResult.authenticity_reasoning =
  authenticityResult.authenticity_reasoning;

// 工业级真实性硬拦截
if (
  authenticityResult.force_unknown
) {

  forceUnknown = true;

  normalizedResult.herb_name =
    "UNKNOWN";

  normalizedResult.confidence =
    Math.min(
      normalizedResult.confidence,
      35
    );
}
  
// =========================
// AUTHENTICITY HARD RULES
// =========================

const authenticityRulesResult =
  applyAuthenticityRules(
    normalizedResult
  );

// 覆盖真实性结果
normalizedResult.authenticity_score =
  authenticityRulesResult.authenticity_score;

normalizedResult.authenticity_level =
  authenticityRulesResult.authenticity_level;

// 保存规则分析
normalizedResult.authenticity_rules =
  authenticityRulesResult.reasoning || [];

// 强制 UNKNOWN
if (
  authenticityRulesResult.force_unknown
) {

  forceUnknown = true;

  normalizedResult.herb_name =
    "UNKNOWN";

  normalizedResult.confidence =
    Math.min(
      normalizedResult.confidence,
      25
    );
}

        // =========================
        // VISUAL FEATURE FORMATTER
        // =========================

        const vf =
  normalizedResult.visual_analysis || {};

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
  riskResult?.riskLevel || "UNKNOWN";

normalizedResult.total_risk_score =
  riskResult?.totalRisk || 100;

        // =========================
        // REPORT
        // =========================

let report = `
药材名称：
${normalizedResult.herb_name}

候选药材：
${
  (
    normalizedResult.possible_candidates || []
  )
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

真实性评分：
${normalizedResult.authenticity_score}%

真实性等级：
${normalizedResult.authenticity_level}

真实性规则：
${JSON.stringify(
  normalizedResult.authenticity_rules,
  null,
  2
)}

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
${
  normalizedResult.force_unknown
    ? "当前图像存在较高不确定性，建议重新拍摄。"
    : "当前识别结果可作为参考。"
}
`;

report = report.trim();

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
            normalizedResult,

            final_decision:
  finalDecision?.final_label || "UNKNOWN",

final_confidence:
  finalDecision?.final_confidence || 0,

decision_reasons:
  finalDecision?.reasons || []

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

  console.error("========== SERVER ERROR ==========");

  console.error(error);

  console.error(error.stack);

  console.error("==================================");

  return res.status(500).json({

    status: "error",

    message: error.message,

    stack: error.stack

  });

}

}