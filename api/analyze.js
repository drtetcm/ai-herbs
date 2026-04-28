import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  // ✅ 只允许 POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed",
    });
  }

  try {
    const { imageBase64, mediaType } = req.body;

    // ✅ 基础校验
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: "缺少图片数据",
      });
    }

    // ✅ 支持多格式（默认 jpeg）
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/tiff",
    ];

    const safeMediaType = allowedTypes.includes(mediaType)
      ? mediaType
      : "image/jpeg";

    // ✅ 初始化 Claude
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // ✅ Prompt（工业级：强制JSON输出）
    const prompt = `
你是中药材鉴定专家，请分析图片中的中药饮片。

⚠️ 必须严格返回 JSON：
- 不要解释
- 不要 markdown
- 不要 ```json
- 只能返回 JSON

格式如下：

{
  "name": "药材名称",
  "confidence": 0.0-1.0,
  "features": {
    "shape": "",
    "color": "",
    "texture": "",
    "size": ""
  },
  "quality": {
    "is_normal": true,
    "score": 0-100,
    "problems": [],
    "reason": ""
  }
}
`;

    // ✅ 调用模型
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: safeMediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    // ✅ 原始文本
    let text = response.content?.[0]?.text || "";

    // =========================
    // 🔥 工业级清洗（关键）
    // =========================

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 有些模型会多说一句 → 截取 JSON
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      // ❗兜底（绝不崩）
      return res.status(200).json({
        success: true,
        data: {
          name: "解析失败",
          confidence: 0,
          features: {},
          quality: {
            is_normal: false,
            score: 0,
            problems: ["AI返回格式异常"],
            reason: text,
          },
        },
        raw: text,
      });
    }

    // =========================
    // ✅ 最终输出（稳定结构）
    // =========================

    return res.status(200).json({
      success: true,
      data: {
        name: parsed.name || "未知",
        confidence: parsed.confidence || 0,
        features: parsed.features || {},
        quality: {
          is_normal: parsed.quality?.is_normal ?? false,
          score: parsed.quality?.score ?? 0,
          problems: parsed.quality?.problems || [],
          reason: parsed.quality?.reason || "",
        },
      },
    });
  } catch (err) {
    console.error("❌ analyze error:", err);

    // ❗绝对不崩（核心设计）
    return res.status(200).json({
      success: false,
      error: "服务异常",
      detail: err.message,
    });
  }
}