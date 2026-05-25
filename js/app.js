import { analyzeHerb } from "./analyze.js";

// DOM

const imageInput = document.getElementById("imageInput");

const analyzeBtn = document.getElementById("analyzeBtn");

const result = document.getElementById("result");

const loading = document.getElementById("loading");

// 点击开始AI验药

analyzeBtn.addEventListener("click", async () => {

  // 获取文件

  const file = imageInput.files[0];

  // 未上传

  if (!file) {

    alert("请先上传药材图片");

    return;
  }

  // 清空旧结果

  result.innerHTML = "";

  // 显示 Loading

  loading.style.display = "flex";

  // AI动态步骤

  const loadingSteps = [

    "📸 上载药材图片给AI...",
    "🧠 AI正在验药分析...",
    "🔍 AI在视觉特征识别...",
    "📑 AI在形成报告..."

  ];

  let stepIndex = 0;

  loading.innerHTML = loadingSteps[0];

  // 动态切换

  const loadingInterval = setInterval(() => {

    stepIndex++;

    if (stepIndex < loadingSteps.length) {

      loading.innerHTML = loadingSteps[stepIndex];
    }

  }, 1500);

  try {

    // 上传后立即显示图片

    const imageUrl = URL.createObjectURL(file);

    result.innerHTML = `

      <div class="preview-loading">

        <div class="preview-card">

          <img
            src="${imageUrl}"
            alt="药材图片"
            class="preview-image"
          />

        </div>

      </div>

    `;

    // 平滑滚动

    result.scrollIntoView({
      behavior: "smooth"
    });

    // AI分析

    const reportHTML = await analyzeHerb(file);

    // 停止Loading

    clearInterval(loadingInterval);

    loading.style.display = "none";

    // 显示最终报告

    result.innerHTML = reportHTML;

  } catch (error) {

    clearInterval(loadingInterval);

    loading.style.display = "none";

    result.innerHTML = `

      <div class="section">

        <div style="color:#dc2626;font-weight:700;">

          ❌ AI验药失败：
          ${error.message}

        </div>

      </div>

    `;
  }

});