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

    // 图片URL
    const imageUrl = URL.createObjectURL(file);

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

              <h1>AI验药系统</h1>

              <p>
                AI Traditional Medicine Verification Platform
              </p>

            </div>

          </div>

        </div>

        <!-- Hero Layout -->

        <div class="hero-layout">

          <!-- Left Image -->

          <div class="hero-image-card">

            <img
              src="${imageUrl}"
              alt="药材图片"
              class="herb-image"
            />

          </div>

          <!-- Right Summary -->

          <div class="hero-summary">

            <div class="hero-badge">
              AI VISION ANALYSIS
            </div>

            <h1 class="hero-name">
              ${herb["药材名称"]}
            </h1>

            <div class="hero-latin">
              ${herb["学名"]}
            </div>

            <div class="hero-stats">

              <!-- 可信度 -->

              <div class="hero-stat">

                <div class="hero-stat-label">
                  AI可信度
                </div>

                <div class="hero-stat-value">
                  ${herb["可信度"]}
                </div>

              </div>

              <!-- 风险等级 -->

              <div class="hero-stat">

                <div class="hero-stat-label">
                  风险等级
                </div>

                <div style="margin-top:12px;">

                  <span class="${riskClass}">
                    ${herb["真假风险"]}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        <!-- Main Dashboard -->

        <div class="dashboard-layout">

          <!-- Left Side -->

          <div class="dashboard-main">

            <!-- 外观特征 -->

            <div class="section">

              <h2 class="section-title">
                AI视觉特征识别
              </h2>

              <div class="feature-list">

                ${featuresHTML}

              </div>

            </div>

            <!-- 药材规格 -->

            <div class="section">

              <h2 class="section-title">
                药材规格
              </h2>

              <div class="spec-box">
                ${herb["规格"]}
              </div>

            </div>

          </div>

          <!-- Right Side -->

          <div class="dashboard-side">

            <!-- 风险 -->

            <div class="side-card risk-side">

              <div class="side-label">
                真伪风险
              </div>

              <div style="margin-top:18px;">

                <span class="${riskClass}">
                  ${herb["真假风险"]}
                </span>

              </div>

            </div>

            <!-- 可信度 -->

            <div class="side-card">

              <div class="side-label">
                AI可信度
              </div>

              <div class="side-value">
                ${herb["可信度"]}
              </div>

            </div>

            <!-- 质量等级 -->

            <div class="side-card">

              <div class="side-label">
                质量等级
              </div>

              <div class="side-value">
                ${herb["质量等级"]}
              </div>

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