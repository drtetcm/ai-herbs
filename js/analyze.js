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

          <div class="report-card">

            <div style="color:#dc2626;">
              ❌ 验药失败：${data.message}
            </div>

          </div>

        </div>
      `;

    }

    const herb = data.result;

    // 风险颜色class
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

        <!-- 顶部 -->

        <div class="report-card">

          <div class="report-header">

            <div class="report-logo">
              🌿
            </div>

            <div>

              <div class="report-title">
                AI验药报告
              </div>

              <div class="report-subtitle">
                AI Traditional Medicine Verification System
              </div>

            </div>

          </div>

        </div>

        <!-- 第一行 -->

        <div class="report-grid-top">

          <!-- 药材信息 -->

          <div class="report-card">

            <div class="info-label">
              药材名称
            </div>

            <div class="herb-name">
              ${herb["药材名称"]}
            </div>

            <div class="info-label">
              学名
            </div>

            <div class="herb-scientific">
              ${herb["学名"]}
            </div>

          </div>

          <!-- 指标 -->

          <div class="metrics-grid">

            <!-- 可信度 -->

            <div class="metric-card">

              <div class="info-label">
                可信度
              </div>

              <div class="metric-value">
                ${herb["可信度"]}
              </div>

            </div>

            <!-- 风险 -->

            <div class="metric-card">

              <div class="info-label">
                真伪风险
              </div>

              <div>
                <span class="risk-badge ${riskClass}">
                  ${herb["真假风险"]}
                </span>
              </div>

            </div>

            <!-- 质量 -->

            <div class="metric-card">

              <div class="info-label">
                质量等级
              </div>

              <div class="metric-value">
                ${herb["质量等级"]}
              </div>

            </div>

          </div>

        </div>

        <!-- 规格 -->

        <div class="report-card section-spacing">

          <div class="section-title">
            规格信息
          </div>

          <div class="section-content">
            ${herb["规格"]}
          </div>

        </div>

        <!-- 外观特征 -->

        <div class="report-card section-spacing">

          <div class="section-title">
            外观特征
          </div>

          <div class="features-grid">

            ${featuresHTML}

          </div>

        </div>

        <!-- AI分析 -->

        <div class="report-card section-spacing">

          <div class="section-title">
            AI分析说明
          </div>

          <div class="section-content analysis-text">
            ${herb["分析说明"]}
          </div>

        </div>

      </div>

    `;

  } catch (error) {

    console.error("上传失败:", error);

    return `
      <div class="report-container">

        <div class="report-card">

          <div style="color:#dc2626;">
            ❌ 系统错误：${error.message}
          </div>

        </div>

      </div>
    `;

  }

}