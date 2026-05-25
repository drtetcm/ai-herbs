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

        <!-- Step 1 -->

        <div class="loading-step">

          <span class="loading-icon done">
            ✅
          </span>

          <span>
            📸 药材图片已上传
          </span>

        </div>

        <!-- Step 2 -->

        <div class="loading-step">

          <span
            class="loading-icon active"
            id="step2"
          >
            ⏳
          </span>

          <span id="text2">
            🧠 AI正在验药分析...
          </span>

        </div>

        <!-- Step 3 -->

        <div class="loading-step">

          <span
            class="loading-icon"
            id="step3"
          >
          </span>

          <span id="text3">
          </span>

        </div>

        <!-- Step 4 -->

        <div class="loading-step">

          <span
            class="loading-icon"
            id="step4"
          >
          </span>

          <span id="text4">
          </span>

        </div>

      </div>

    </div>

  `;

  // 滚动

  result.scrollIntoView({
    behavior: "smooth"
  });

  // Timeline 动画

  setTimeout(() => {

    const step2 =
      document.getElementById("step2");

    const text2 =
      document.getElementById("text2");

    const step3 =
      document.getElementById("step3");

    const text3 =
      document.getElementById("text3");

    if (
      step2 &&
      text2 &&
      step3 &&
      text3
    ) {

      step2.innerHTML = "✅";

      step2.className =
        "loading-icon done";

      text2.innerHTML =
        "🧠 AI验药分析完成";

      step3.innerHTML = "⏳";

      step3.className =
        "loading-icon active";

      text3.innerHTML =
        "🔍 AI正在视觉特征识别...";
    }

  }, 1400);

  setTimeout(() => {

    const step3 =
      document.getElementById("step3");

    const text3 =
      document.getElementById("text3");

    const step4 =
      document.getElementById("step4");

    const text4 =
      document.getElementById("text4");

    if (
      step3 &&
      text3 &&
      step4 &&
      text4
    ) {

      step3.innerHTML = "✅";

      step3.className =
        "loading-icon done";

      text3.innerHTML =
        "🔍 AI视觉特征识别完成";

      step4.innerHTML = "⏳";

      step4.className =
        "loading-icon active";

      text4.innerHTML =
        "📑 AI正在形成报告...";
    }

  }, 3000);

  try {

    // AI分析

    const reportHTML =
      await analyzeHerb(file);

    // 最后一步完成

    const step4 =
      document.getElementById("step4");

    const text4 =
      document.getElementById("text4");

    if (
      step4 &&
      text4
    ) {

      step4.innerHTML = "✅";

      step4.className =
        "loading-icon done";

      text4.innerHTML =
        "📑 AI报告生成完成";
    }

    // 延迟增强完成感

    setTimeout(() => {

      // 显示最终报告

      result.innerHTML =
        reportHTML;

      result.scrollIntoView({
        behavior: "smooth"
      });

    }, 1000);

  } catch (error) {

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