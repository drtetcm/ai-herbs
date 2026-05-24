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

  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed"
    });
  }

  try {

    const form = formidable({});

    form.parse(req, async (err, fields, files) => {

      if (err) {

        console.error(err);

        return res.status(500).json({
          status: "error",
          message: "File upload failed"
        });

      }

      try {

        const imageFile = files.image[0];

        const imageBuffer = fs.readFileSync(imageFile.filepath);

        const base64Image = imageBuffer.toString("base64");

        const response = await anthropic.messages.create({

          model: "claude-sonnet-4-6",

          max_tokens: 1000,

          messages: [
            {
              role: "user",
              content: [

                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: imageFile.mimetype,
                    data: base64Image
                  }
                },

                {
                  type: "text",
                  text: `
请分析这张中药材图片。

请输出：

1. 药材名称
2. 可信度
3. 外观特征
4. 真伪风险
5. 质量等级
6. 分析原因

请尽量专业。
`
                }

              ]
            }
          ]

        });

        return res.status(200).json({

          status: "success",

          result: response.content[0].text

        });

      } catch (visionError) {

        console.error(visionError);

        return res.status(500).json({
          status: "error",
          message: visionError.message
        });

      }

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: error.message
    });

  }

}