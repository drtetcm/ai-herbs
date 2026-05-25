import { analyzeHerb } from "./analyze.js";

// DOM

const imageInput = document.getElementById("imageInput");

const analyzeBtn = document.getElementById("analyzeBtn");

const result = document.getElementById("result");

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

  // 上传后立即显示图片

  const imageUrl = URL.createObjectURL(file);

  // Preview + Timeline

  result.innerHTML = `

    <div class="preview-loading">

      <!-- 图片 -->

      <div class="preview-card">

        <img
          src="${imageUrl}"
          alt="药材图片"
          class="preview-image"
        />

      </div>

      <!-- AI Timeline -->

      <div id="loading">

      </div>

    </div>

  `;

  // 获取 loading DOM

  const loading =
    document.getElementById("loading");

  // AI步骤

  const loadingSteps = [

    "📸 药材图片已上传",

    "🧠 AI验药分析完成",

    "🔍 AI视觉特征识别完成",

    "📑 AI正在形成报告..."

  ];

  // 当前步骤

  let currentStep = 0;

  // 添加步骤

  const appendStep = (
    text,
    isActive = false
  ) => {

    const step =
      document.createElement("div");

    step.className = "loading-step";

    step.innerHTML = `

      <span class="loading-icon ${isActive ? "active" : "done"}">

        ${isActive ? "⏳" : "✅"}

      </span>

      <span>

        ${text}

      </span>

    `;

    loading.appendChild(step);
  };

  // 第一条

  appendStep(
    loadingSteps[0]
  );

  // Timeline推进

  const loadingInterval =
    setInterval(() => {

      currentStep++;

      // 上一个 active → done

      const previousActive =
        document.querySelector(
          ".loading-icon.active"
        );

      if (previousActive) {

        previousActive.classList.remove(
          "active"
        );

        previousActive.classList.add(
          "done"
        );

        previousActive.innerHTML = "✅";
      }

      // 添加下一条

      if (
        currentStep <
        loadingSteps.length
      ) {

        const isLast =
          currentStep ===
          loadingSteps.length - 1;

        appendStep(
          loadingSteps[currentStep],
          isLast
        );
      }

    }, 1600);

  // 滚动

  result.scrollIntoView({
    behavior: "smooth"
  });

  try {

    // AI分析

    const reportHTML =
      await analyzeHerb(file);

    // 停止 Timeline

    clearInterval(
      loadingInterval
    );

    // 最后 active → done

    const finalActive =
      document.querySelector(
        ".loading-icon.active"
      );

    if (finalActive) {

      finalActive.classList.remove(
        "active"
      );

      finalActive.classList.add(
        "done"
      );

      finalActive.innerHTML = "✅";
    }

    // 延迟增强完成感

    setTimeout(() => {

      // 最终报告

      result.innerHTML =
        reportHTML;

      result.scrollIntoView({
        behavior: "smooth"
      });

    }, 900);

  } catch (error) {

    clearInterval(
      loadingInterval
    );

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