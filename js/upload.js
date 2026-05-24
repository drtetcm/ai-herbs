import { analyzeHerb } from "./analyze.js";

export function setupUpload() {

  const imageInput = document.getElementById("imageInput");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const result = document.getElementById("result");

  analyzeBtn.addEventListener("click", async () => {

    const file = imageInput.files[0];

    // 未上传图片
    if (!file) {

      result.innerHTML = `
        <div style="color:red;">
          请上传药材图片
        </div>
      `;

      return;

    }

    // 分析中提示
    result.innerHTML = `
      <div style="
        padding:20px;
        font-size:18px;
      ">
        ⏳ AI正在验药分析，请稍候...
      </div>
    `;

    try {

      // 调用AI分析
      const html = await analyzeHerb(file);

      // 渲染HTML
      result.innerHTML = html;

    } catch (error) {

      console.error(error);

      result.innerHTML = `
        <div style="color:red;">
          ❌ 分析失败
        </div>
      `;

    }

  });

}