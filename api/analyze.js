const Anthropic = require("@anthropic-ai/sdk");

module.exports = async function (req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { imageBase64, mediaType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "Missing API Key" });
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "请识别这张中药饮片，并返回JSON格式：{name, confidence, features, quality}",
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: response.content[0].text,
    });

  } catch (err) {
    console.error("🔥 ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};