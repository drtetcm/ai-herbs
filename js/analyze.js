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
        <div style="
          background:#fff5f5;
          color:#dc2626;
          padding:16px;
          border-radius:12px;
          margin-top:20px;
        ">
          ❌ 验药失败：${data.message}
        </div>
      `;

    }

    // 获取结果
    const herb = data.result;

    // 外观特征
    const featuresHTML = herb["外观特征"]
      .map(item => `
        <div style="
          background:#f5f5f5;
          padding:10px 14px;
          border-radius:10px;
          margin-bottom:10px;
          font-size:15px;
        ">
          • ${item}
        </div>
      `)
      .join("");

    // 风险颜色
    let riskColor = "#16a34a";

    if (herb["真假风险"] === "中风险") {
      riskColor = "#ca8a04";
    }

    if (herb["真假风险"] === "高风险") {
      riskColor = "#dc2626";
    }

    // 返回HTML
    return `

      <div style="
        max-width:720px;
        margin:30px auto;
        background:#ffffff;
        padding:32px;
        border-radius:24px;
        box-shadow:0 8px 30px rgba(0,0,0,0.08);
        font-family:
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          sans-serif;
        color:#111827;
      ">

        <div style="
          text-align:center;
          margin-bottom:32px;
        ">

          <div style="
            font-size:42px;
            margin-bottom:10px;
          ">
            🌿
          </div>

          <h1 style="
            font-size:32px;
            margin:0;
          ">
            AI验药报告
          </h1>

        </div>

        <!-- 基础信息 -->

        <div style="
          display:grid;
          gap:18px;
        ">

          <div>
            <div style="
              font-size:13px;
              color:#6b7280;
              margin-bottom:4px;
            ">
              药材名称
            </div>

            <div style="
              font-size:28px;
              font-weight:700;
            ">
              ${herb["药材名称"]}
            </div>
          </div>

          <div>
            <div style="
              font-size:13px;
              color:#6b7280;
              margin-bottom:4px;
            ">
              学名
            </div>

            <div style="
              font-size:18px;
            ">
              ${herb["学名"]}
            </div>
          </div>

        </div>

        <!-- 数据卡片 -->

        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
          gap:16px;
          margin-top:30px;
        ">

          <div style="
            background:#f9fafb;
            padding:18px;
            border-radius:16px;
          ">
            <div style="
              color:#6b7280;
              font-size:13px;
              margin-bottom:8px;
            ">
              可信度
            </div>

            <div style="
              font-size:28px;
              font-weight:700;
            ">
              ${herb["可信度"]}
            </div>
          </div>

          <div style="
            background:#f9fafb;
            padding:18px;
            border-radius:16px;
          ">
            <div style="
              color:#6b7280;
              font-size:13px;
              margin-bottom:8px;
            ">
              真伪风险
            </div>

            <div>
              <span style="
                background:${riskColor};
                color:white;
                padding:6px 12px;
                border-radius:999px;
                font-size:14px;
                font-weight:600;
              ">
                ${herb["真假风险"]}
              </span>
            </div>
          </div>

          <div style="
            background:#f9fafb;
            padding:18px;
            border-radius:16px;
          ">
            <div style="
              color:#6b7280;
              font-size:13px;
              margin-bottom:8px;
            ">
              质量等级
            </div>

            <div style="
              font-size:24px;
              font-weight:700;
            ">
              ${herb["质量等级"]}
            </div>
          </div>

        </div>

        <!-- 规格 -->

        <div style="
          margin-top:30px;
        ">

          <h2 style="
            font-size:20px;
            margin-bottom:14px;
          ">
            规格信息
          </h2>

          <div style="
            background:#f9fafb;
            padding:18px;
            border-radius:16px;
            line-height:1.7;
          ">
            ${herb["规格"]}
          </div>

        </div>

        <!-- 外观特征 -->

        <div style="
          margin-top:30px;
        ">

          <h2 style="
            font-size:20px;
            margin-bottom:14px;
          ">
            外观特征
          </h2>

          ${featuresHTML}

        </div>

        <!-- 分析说明 -->

        <div style="
          margin-top:30px;
        ">

          <h2 style="
            font-size:20px;
            margin-bottom:14px;
          ">
            AI分析说明
          </h2>

          <div style="
            background:#f9fafb;
            padding:20px;
            border-radius:16px;
            line-height:1.8;
            font-size:15px;
          ">
            ${herb["分析说明"]}
          </div>

        </div>

      </div>
    `;

  } catch (error) {

    console.error("上传失败:", error);

    return `
      <div style="
        background:#fff5f5;
        color:#dc2626;
        padding:16px;
        border-radius:12px;
        margin-top:20px;
      ">
        ❌ 系统错误：${error.message}
      </div>
    `;

  }

}