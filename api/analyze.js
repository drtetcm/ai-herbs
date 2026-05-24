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

        // 获取上传图片
        const imageFile = files.image[0];

        // 读取图片
        const imageBuffer = fs.readFileSync(imageFile.filepath);

        // 转Base64
        const base64Image = imageBuffer.toString("base64");

        // Claude Vision
        const response = await anthropic.messages.create({

          model: "claude-3-5-sonnet-latest",

          max_tokens: 1000,

          temperature: 0,

          system: `
你是专业中药材鉴定AI引擎。

你的唯一任务：

分析中药材图片，
并返回标准JSON。

禁止输出：

- Markdown
- 标题
- 解释
- 分析报告
- 代码块
- \`\`\`

只能输出合法JSON。

如果无法判断：

填写 "未知"
`,

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

返回格式：

{
  "药材名称": "",
  "学名": "",
  "可信度": "",
  "规格": "",
  "真假风险": "",
  "质量等级": "",
  "外观特征": [],
  "分析说明": ""
}
`
                }

              ]
            }
          ]

        });

        // Claude原始返回
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

        // JSON解析
        const parsedResult = JSON.parse(jsonMatch[0]);

        // 返回成功结果
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