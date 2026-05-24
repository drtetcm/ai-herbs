import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {

  try {

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({

      model: "claude-sonnet-4-6",

      max_tokens: 300,

      messages: [
        {
          role: "user",
          content: "请回复：API连接成功"
        }
      ]

    });

    res.status(200).json({
      status: "success",
      result: response.content[0].text
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      status: "error",
      message: error.message
    });

  }

}