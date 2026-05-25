export async function analyzeHerb(file) {

  console.log("上传文件:", file);

  try {

    const formData = new FormData();

    formData.append("image", file);

    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    console.log("API返回:", data);

    // 错误处理
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

    const herb = data.result;

    // 风险等级
    let riskClass = "risk-low";

    if (herb["真假风险"] === "中风险") {
      riskClass = "risk-medium";
    }

    if (herb["真假风险"] === "高风险") {
      riskClass = "risk-high";
    }

    // 外观特征
    const featuresHTML = herb["外观特征"]
      .map(item => `
        <div class="feature-item">
          ${item}
        </div>
      `)
      .join("");

    // 返回HTML
    return `

      <div class="report-container">

        <!-- Header -->

        <div class="report-header">

          <div class="header-left">

            <div class="header-logo">
              🌿
            </div>

            <div class="header-title">

              <h1>AI验药报告</h1>

              <p>
                AI Traditional Medicine Verification System
              </p>

            </div>

          </div>

        </div>

        <!-- 顶部Dashboard -->

        <div class="top-grid">

          <!-- 药材信息 -->

          <div class="card risk-card">

            <div class="card-label">
              药材名称
            </div>

            <div class="card-value">
              ${herb["药材名称"]}
            </div>

            <div class="card-sub">
              ${herb["学名"]}
            </div>

          </div>

          <!-- 可信度 -->

          <div class="card risk-card">

            <div class="card-label">
              可信度
            </div>

            <div class="card-value">
              ${herb["可信度"]}
            </div>

          </div>

          <!-- 风险 -->

          <div class="card risk-card">

            <div class="card-label">
              真伪风险
            </div>

            <div style="margin-top:22px;">

              <span class="${riskClass}">
                ${herb["真假风险"]}
              </span>

            </div>

          </div>

          <!-- 质量 -->

          <div class="card risk-card">

            <div class="card-label">
              质量等级
            </div>

            <div class="card-value">
              ${herb["质量等级"]}
            </div>

          </div>

        </div>

        <!-- 第二行 -->

        <div class="top-grid">

          <!-- 规格 -->

          <div class="section">

            <h2 class="section-title">
              规格信息
            </h2>

            <div class="spec-box">
              ${herb["规格"]}
            </div>

          </div>

          <!-- 外观特征 -->

          <div class="section" style="grid-column: span 3;">

            <h2 class="section-title">
              外观特征
            </h2>

            <div class="feature-list">

              ${featuresHTML}

            </div>

          </div>

        </div>

        <!-- AI分析 -->

        <div class="section">

          <h2 class="section-title">
            AI分析说明
          </h2>

          <div class="ai-tag">
            AI VISION ANALYSIS
          </div>
          
          <div class="analysis-box">

            ${herb["分析说明"]}

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