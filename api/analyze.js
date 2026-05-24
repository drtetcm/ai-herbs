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

        // Claude Vision 分析
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
你是专业中药材鉴定AI。

请分析这张中药材图片。

严格按照以下JSON格式输出。

不要输出任何解释文字。
不要输出Markdown。
不要输出 \`\`\`json
只能输出纯JSON。

JSON格式：

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

要求：

1. 外观特征必须是数组
2. 可信度使用百分比，例如：
   "92%"
3. 真假风险只能填写：
   "低"
   "中"
   "高"
4. 质量等级只能填写：
   "优质"
   "良好"
   "一般"
   "较差"
5. 如果无法判断，请填写：
   "未知"

只输出JSON。
`
                }

              ]
            }
          ]

        });

        // Claude返回文字
        const rawText = response.content[0].text;

        // 转JSON
        const parsedResult = JSON.parse(rawText);

        // 返回结果
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