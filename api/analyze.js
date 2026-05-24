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

          temperature: 0,

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
你是专业中药材鉴定AI。

分析这张药材图片。

必须返回合法JSON。

禁止Markdown。
禁止解释。
禁止标题。
禁止 \`\`\`.

只能返回JSON对象。

格式如下：

{
  "药材名称": "string",
  "学名": "string",
  "可信度": "90%",
  "规格": "string",
  "真假风险": "低",
  "质量等级": "良好",
  "外观特征": [
    "特征1",
    "特征2"
  ],
  "分析说明": "string"
}

如果无法识别：

请填写：

"未知"

只输出JSON。
`
                }

              ]
            }
          ]

        });

        const rawText = response.content[0].text;

        console.log("Claude原始返回：", rawText);

        // 提取JSON
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {

          return res.status(500).json({
            status: "error",
            message: "AI没有返回JSON",
            raw: rawText
          });

        }

        const parsedResult = JSON.parse(jsonMatch[0]);

        return res.status(200).json({

          status: "success",

          result: parsedResult

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