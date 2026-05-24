import { analyzeHerb } from "./analyze.js";

export function setupUpload() {

  const imageInput = document.getElementById("imageInput");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const result = document.getElementById("result");

  analyzeBtn.addEventListener("click", async () => {

    const file = imageInput.files[0];

    if (!file) {
      result.innerText = "请上传图片";
      return;
    }

    result.innerText = "开始分析...";

    try {

      const data = await analyzeHerb(file);

      result.innerText = JSON.stringify(data, null, 2);

    } catch (error) {

      console.error(error);

      result.innerText = "分析失败";

    }

  });

}