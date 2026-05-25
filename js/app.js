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

  // 初始化 Loading 内容

  loading.innerHTML = "";

  // AI步骤

  const loadingSteps = [

    "📸 药材图片已上传",
    "🧠 AI验药分析完成",
    "🔍 AI视觉特征识别完成",
    "📑 AI正在形成报告..."

  ];

  // 当前步骤索引

  let currentStep = 0;

  // 添加步骤函数

  const appendStep = (text, isLast = false) => {

    const step = document.createElement("div");

    step.className = "loading-step";

    if (isLast) {

      step.innerHTML = `
        <span class="loading-icon active">
          ⏳
        </span>

        <span>
          ${text}
        </span>
      `;

    } else {

      step.innerHTML = `
        <span class="loading-icon done">
          ✅
        </span>

        <span>
          ${text}
        </span>
      `;
    }

    loading.appendChild(step);
  };

  // 第一步

  appendStep(loadingSteps[0]);

  // 动态增加步骤

  const loadingInterval = setInterval(() => {

    currentStep++;

    // 清除上一个 active

    const previousActive = document.querySelector(
      ".loading-icon.active"
    );

    if (previousActive) {

      previousActive.classList.remove("active");

      previousActive.classList.add("done");

      previousActive.innerHTML = "✅";
    }

    // 添加新步骤

    if (currentStep < loadingSteps.length) {

      const isLast =
        currentStep === loadingSteps.length - 1;

      appendStep(
        loadingSteps[currentStep],
        isLast
      );
    }

  }, 1600);

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

    // 停止 Loading

    clearInterval(loadingInterval);

    // 最后步骤完成

    const finalActive = document.querySelector(
      ".loading-icon.active"
    );

    if (finalActive) {

      finalActive.classList.remove("active");

      finalActive.classList.add("done");

      finalActive.innerHTML = "✅";
    }

    // 稍微停顿，增强完成感

    setTimeout(() => {

      loading.style.display = "none";

      // 显示最终报告

      result.innerHTML = reportHTML;

      // 自动滚动到报告

      result.scrollIntoView({
        behavior: "smooth"
      });

    }, 800);

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