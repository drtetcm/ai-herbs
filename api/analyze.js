import Anthropic from "@anthropic-ai/sdk";
import formidable from "formidable";
import fs from "fs";

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
  // Method Check
  // =========================

  if (req.method !== "POST") {

    return res.status(405).json({
      status: "error",
      message: "Method not allowed"
    });

  }

  try {

    // =========================
    // Parse FormData
    // =========================

    const form = formidable({});

    form.parse(req, async (err, fields, files) => {

      if (err) {

        console.error("Form Parse Error:", err);

        return res.status(500).json({
          status: "error",
          message: "File upload failed"
        });

      }

      try {

        // =========================
        // Get Image
        // =========================

        const imageFile = files.image[0];

        if (!imageFile) {

          return res.status(400).json({
            status: "error",
            message: "No image uploaded"
          });

        }

        // =========================
        // Get Prompt
        // =========================

        const prompt = fields.prompt?.[0] || `
请分析用户上传的中药材图片。
`;

        console.log("收到Prompt:", prompt);

        // =========================
        // Read Image
        // =========================

        const imageBuffer = fs.readFileSync(imageFile.filepath);

        const base64Image = imageBuffer.toString("base64");

        // =========================
        // Claude Vision Request
        // =========================

        const response = await anthropic.messages.create({

          model: "claude-sonnet-4-6",

          max_tokens: 1500,

          temperature: 0,

          system: `
你是企业级 AI中药材鉴定引擎。

你的唯一任务：

分析药材图片，
并严格输出JSON。

禁止：

- Markdown
- 标题
- 代码块
- 解释文字
- \`\`\`

只能输出合法JSON。

如果无法确定：

必须明确写：

"未知"

禁止编造。
`,

          messages: [
            {
              role: "user",
              content: [

                // =========================
                // Image
                // =========================

                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: imageFile.mimetype,
                    data: base64Image
                  }
                },

                // =========================
                // Prompt Engine
                // =========================

                {
                  type: "text",
                  text: prompt
                }

              ]
            }
          ]

        });

        // =========================
        // Claude Raw Response
        // =========================

        const rawText = response.content[0].text;

        console.log("Claude原始返回:", rawText);

        // =========================
        // Extract JSON
        // =========================

        const jsonMatch = rawText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {

          console.error("AI未返回JSON");

          return res.status(500).json({
            status: "error",
            message: "AI没有返回JSON",
            raw: rawText
          });

        }

        // =========================
        // Parse JSON
        // =========================

        let parsedResult;

        try {

          parsedResult = JSON.parse(jsonMatch[0]);

        } catch (jsonError) {

          console.error("JSON解析失败:", jsonError);

          return res.status(500).json({
            status: "error",
            message: "AI JSON格式错误",
            raw: rawText
          });

        }

        // =========================
        // Normalize Fields
        // =========================

        const normalizedResult = {

          herb_name:
            parsedResult.herb_name || "未知",

          confidence:
            parsedResult.confidence || 0,

          quality_grade:
            parsedResult.quality_grade || "UNKNOWN",

          risk_level:
            parsedResult.risk_level || "LOW",

          fake_probability:
            parsedResult.fake_probability || 0,

          mold_risk:
            parsedResult.mold_risk || 0,

          sulfur_fumigation_risk:
            parsedResult.sulfur_fumigation_risk || 0,

          color_analysis:
            parsedResult.color_analysis || "暂无",

          texture_analysis:
            parsedResult.texture_analysis || "暂无",

          slice_pattern_analysis:
            parsedResult.slice_pattern_analysis || "暂无",

          issues_detected:
            parsedResult.issues_detected || [],

          expert_summary:
            parsedResult.expert_summary || "暂无分析",

          recommendation:
            parsedResult.recommendation || "暂无建议"

        };

        console.log("标准化结果:", normalizedResult);

        // =========================
        // Success Response
        // =========================

        return res.status(200).json({

          status: "success",

          result: normalizedResult

        });

      } catch (visionError) {

        console.error("Claude Vision Error:", visionError);

        return res.status(500).json({
          status: "error",
          message: visionError.message
        });

      }

    });

  } catch (error) {

    console.error("Server Error:", error);

    return res.status(500).json({
      status: "error",
      message: error.message
    });

  }

}