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
        // INDUSTRIAL PROMPT
        // =========================

        const prompt = `
You are an industrial herbal material inspection AI.

Your task is NOT only to identify herbs.

You must FIRST determine whether the uploaded image is actually a herbal material.

Return STRICT JSON ONLY.

NO markdown.
NO explanation.
NO code block.

Rules:

1. Determine if the object is herbal-like.

2. Detect object type.

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

3. If image is not clearly herbal:
- set is_herb_like = false
- increase unknown_probability

4. If image quality is poor:
- reduce confidence
- increase unknown_probability

5. unknown_probability:
0-20 = likely herb
20-50 = suspicious
50-100 = likely NOT herb

6. confidence:
0-100

7. risk_level:
ONLY:
LOW
MEDIUM
HIGH
UNKNOWN

8. herb_name:
If uncertain:
return:
"未知"

Return JSON:

{
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
`;

        // =========================
        // CLAUDE REQUEST
        // =========================

        const response =
          await anthropic.messages.create({

            model: "claude-sonnet-4-6",

            max_tokens: 2000,

            temperature: 0,

            system: `
你是工业级AI中药材风控系统。

你的第一任务：
判断图片是不是药材。

不是药材时：
必须提高 unknown_probability。

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