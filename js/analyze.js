import { systemPrompt } from "../prompts/systemPrompt.js";
import { herbRules } from "../prompts/herbRules.js";
import { outputFormat } from "../prompts/outputFormat.js";

export async function analyzeHerb(file) {

  console.log("上传文件:", file);

  try {

    // =========================
    // Prompt Engine
    // =========================

    const finalPrompt = `
${systemPrompt}

${herbRules}

${outputFormat}

现在请分析用户上传的药材图片。
`;

    console.log("最终Prompt:", finalPrompt);

    // =========================
    // FormData
    // =========================

    const formData = new FormData();

    formData.append("image", file);

    // 新增Prompt
    formData.append("prompt", finalPrompt);

    // =========================
    // API Request
    // =========================

    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    console.log("API返回:", data);

    // =========================
    // API错误
    // =========================

    if (data.status === "error") {

      return `
        <div class="report-container">

          <div class="section">

            <div style="color:#dc2626;font-weight:700;">
              ❌ 验药失败：${data.message}
            </div>

          </div>

        </div>
      `;
    }

    // =========================
    // AI结果
    // =========================

    let herb = data.result;

    // 如果后端返回字符串JSON
    if (typeof herb === "string") {

      try {
        herb = JSON.parse(herb);
      } catch (err) {

        console.error("JSON解析失败:", err);

        return `
          <div class="report-container">

            <div class="section">

              <div style="color:#dc2626;font-weight:700;">
                ❌ AI返回JSON格式错误
              </div>

            </div>

          </div>
        `;
      }
    }

    console.log("解析后JSON:", herb);

    // =========================
    // 图片URL
    // =========================

    const imageUrl = URL.createObjectURL(file);

    // =========================
    // 风险等级
    // =========================

    let riskClass = "risk-low";

    const riskLevel = herb.risk_level || "LOW";

    if (riskLevel === "MEDIUM") {
      riskClass = "risk-medium";
    }

    if (riskLevel === "HIGH") {
      riskClass = "risk-high";
    }

    // =========================
    // 外观特征
    // =========================

    const issuesHTML = herb.issues_detected
      ?.map(item => `
        <div class="feature-item">
          ${item}
        </div>
      `)
      .join("") || "";

    // =========================
    // 返回HTML
    // =========================

    return `

      <div class="report-container">

        <!-- Header -->

        <div class="report-header">

          <div class="header-left">

            <div class="header-logo">
              🌿
            </div>

            <div class="header-title">

              <h1>
                AI验药系统
              </h1>

              <p>
                AI Traditional Medicine Verification Platform
              </p>

            </div>

          </div>

        </div>

        <!-- Hero -->

        <div class="hero-layout">

          <!-- 图片 -->

          <div class="hero-image-card">

            <img
              src="${imageUrl}"
              alt="药材图片"
              class="herb-image"
            />

          </div>

          <!-- AI结果 -->

          <div class="hero-summary">

            <div class="hero-badge">
              AI VISION ANALYSIS
            </div>

            <h1 class="hero-name">
              ${herb.herb_name || "未知药材"}
            </h1>

            <div class="hero-latin">
              AI Confidence: ${herb.confidence || 0}%
            </div>

            <!-- Stats -->

            <div class="hero-stats">

              <!-- 可信度 -->

              <div class="hero-stat">

                <div class="hero-stat-label">
                  AI可信度
                </div>

                <div class="hero-stat-value">
                  ${herb.confidence || 0}%
                </div>

              </div>

              <!-- 风险 -->

              <div class="hero-stat">

                <div class="hero-stat-label">
                  风险等级
                </div>

                <div style="margin-top:12px;">

                  <span class="${riskClass}">
                    ${riskLevel}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        <!-- Dashboard -->

        <div class="dashboard-layout">

          <!-- LEFT -->

          <div class="dashboard-main">

            <!-- AI分析 -->

            <div class="section">

              <div class="ai-tag">
                AI VISION REPORT
              </div>

              <h2 class="section-title">
                AI分析说明
              </h2>

              <div class="analysis-box">

                ${herb.expert_summary || "暂无分析"}

              </div>

            </div>

            <!-- 风险 -->

            <div class="section">

              <h2 class="section-title">
                风险分析
              </h2>

              <div class="feature-list">

                <div class="feature-item">
                  假药概率：${herb.fake_probability || 0}%
                </div>

                <div class="feature-item">
                  发霉风险：${herb.mold_risk || 0}%
                </div>

                <div class="feature-item">
                  硫磺熏蒸风险：${herb.sulfur_fumigation_risk || 0}%
                </div>

              </div>

            </div>

            <!-- 异常 -->

            <div class="section">

              <h2 class="section-title">
                AI异常检测
              </h2>

              <div class="feature-list">

                ${issuesHTML}

              </div>

            </div>

          </div>

          <!-- RIGHT -->

          <div class="dashboard-side">

            <!-- 风险 -->

            <div class="side-card risk-side">

              <div class="side-label">
                真伪风险
              </div>

              <div style="margin-top:18px;">

                <span class="${riskClass}">
                  ${riskLevel}
                </span>

              </div>

            </div>

            <!-- 质量 -->

            <div class="side-card">

              <div class="side-label">
                质量等级
              </div>

              <div class="side-value">
                ${herb.quality_grade || "N/A"}
              </div>

            </div>

            <!-- 颜色 -->

            <div class="side-card">

              <div class="side-label">
                色泽分析
              </div>

              <div class="spec-box">
                ${herb.color_analysis || "暂无"}
              </div>

            </div>

            <!-- 纹理 -->

            <div class="side-card">

              <div class="side-label">
                纹理分析
              </div>

              <div class="spec-box">
                ${herb.texture_analysis || "暂无"}
              </div>

            </div>

          </div>

        </div>

      </div>

    `;

  } catch (error) {

    console.error("上传失败:", error);

    return `

      <div class="report-container">

        <div class="section">

          <div style="color:#dc2626;font-weight:700;">
            ❌ 系统错误：${error.message}
          </div>

        </div>

      </div>

    `;
  }
}