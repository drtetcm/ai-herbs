import { verifyToken } from "../lib/auth"

function getUserEmail(req) {
  const auth = req.headers.authorization

  if (!auth || !auth.startsWith("Bearer ")) {
    return null
  }

  try {
    const token = auth.slice(7)
    const payload = verifyToken(token)
    return payload?.email || null
  } catch {
    return null
  }
}

import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  // =========================
  // ✅ 只允许 POST
  // =========================
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed",
    });
  }

  try {
    const { imageBase64, mediaType } = req.body || {};

    // =========================
    // ✅ 参数校验
    // =========================
    if (!imageBase64) {
      return res.status(200).json({
        success: false,
        error: "缺少图片数据",
      });
    }

    // =========================
    // ✅ 图片格式支持
    // =========================
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

    // =========================
    // ✅ API Key 校验（防崩）
    // =========================
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(200).json({
        success: false,
        error: "未配置 ANTHROPIC_API_KEY",
      });
    }

    // =========================
    // ✅ 初始化 Claude
    // =========================
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // =========================
    // ✅ 工业级 Prompt（无语法风险）
    // =========================
    const prompt = `
你是一名专业中药材鉴定专家，请根据图片对中药饮片进行分析。

【重要要求】
你必须严格返回 JSON 格式：
- 不要任何解释
- 不要添加说明文字
- 不要使用 markdown
- 不要使用代码块符号
- 只返回 JSON

【返回格式如下】

{
  "name": "药材名称",
  "confidence": 0.0,
  "features": {
    "shape": "形状描述",
    "color": "颜色描述",
    "texture": "质地描述",
    "size": "大小描述"
  },
  "quality": {
    "is_normal": true,
    "score": 0,
    "problems": [],
    "reason": "质量判断说明"
  }
}

【要求】
- confidence 范围 0-1
- score 范围 0-100
- problems 必须是数组
- 所有字段必须存在

如果无法识别，请返回：

{
  "name": "未知",
  "confidence": 0,
  "features": {},
  "quality": {
    "is_normal": false,
    "score": 0,
    "problems": ["无法识别"],
    "reason": "图片信息不足或不清晰"
  }
}
`;

    // =========================
    // ✅ 调用模型
    // =========================
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

    // =========================
    // ✅ 获取返回文本
    // =========================
    let text = response.content?.[0]?.text || "";

    // =========================
    // 🔥 清洗 JSON（工业级关键）
    // =========================
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      // =========================
      // ❗解析失败兜底（绝不崩）
      // =========================
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
    // ✅ 标准化输出（防 undefined）
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

    // =========================
    // ❗最终兜底（永不崩）
    // =========================
    return res.status(200).json({
      success: false,
      error: "服务异常",
      detail: err.message,
    });
  }
}