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
        // PROMPT
        // =========================

        const prompt = `
请分析用户上传的中药材图片。

你必须返回JSON。

禁止Markdown。

JSON结构：

{
  "herb_name": "",
  "confidence": 0,
  "image_quality_score": 0,
  "image_blur_level": "",
  "lighting_quality": "",
  "visibility_score": 0,
  "quality_grade": "",
  "risk_level": "",
  "fake_probability": 0,
  "mold_risk": 0,
  "sulfur_fumigation_risk": 0,
  "issues_detected": [],
  "expert_summary": "",
  "recommendation": ""
}

规则：

1. herb_name无法确认：
返回：
"未知"

2. confidence:
0-100

3. risk_level:
只能：
LOW
MEDIUM
HIGH
UNKNOWN

4. expert_summary:
必须专业。

5. recommendation:
必须明确。

6. 不允许输出解释文字。

只能输出JSON。
`;

        // =========================
        // CLAUDE REQUEST
        // =========================

        const response =
          await anthropic.messages.create({

            model: "claude-sonnet-4-6",

            max_tokens: 1800,

            temperature: 0,

            system: `
你是工业级AI中药材鉴定系统。
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
        // NORMALIZE
        // =========================

        const normalizedResult = {

          herb_name:
            parsed.herb_name || "未知",

          confidence:
            Number(parsed.confidence || 0),

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
            "暂无建议"

        };

        // =========================
        // RISK ENGINE
        // =========================

        const riskResult =
          calculateRisk(normalizedResult);

        normalizedResult.risk_level =
          riskResult.riskLevel;

        normalizedResult.total_risk_score =
          riskResult.totalRisk;

        // =========================
        // UNKNOWN MODE
        // =========================

        if (riskResult.isUnknown) {

          normalizedResult.herb_name =
            "未知";

          normalizedResult.quality_grade =
            "无法评级";

          normalizedResult.risk_level =
            "UNKNOWN";

        }

        // =========================
        // REPORT
        // =========================

        const report = `
药材名称：
${normalizedResult.herb_name}

风险等级：
${normalizedResult.risk_level}

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

          result:
            normalizedResult

        });

      } catch (visionError) {

        console.error("VISION ERROR:", visionError);

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