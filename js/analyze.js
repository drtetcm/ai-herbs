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
          max-width:900px;
          margin:40px auto;
          background:#fff5f5;
          color:#dc2626;
          padding:20px;
          border-radius:16px;
          font-family:sans-serif;
        ">
          ❌ 验药失败：${data.message}
        </div>
      `;

    }

    const herb = data.result;

    // 风险颜色
    let riskColor = "#16a34a";

    if (herb["真假风险"] === "中风险") {
      riskColor = "#ca8a04";
    }

    if (herb["真假风险"] === "高风险") {
      riskColor = "#dc2626";
    }

    // 外观特征
    const featuresHTML = herb["外观特征"]
      .map(item => `
        <div style="
          background:#f9fafb;
          padding:14px 16px;
          border-radius:14px;
          font-size:15px;
          line-height:1.6;
          border:1px solid #ececec;
        ">
          ${item}
        </div>
      `)
      .join("");

    // 返回HTML
    return `

      <div style="
        max-width:1100px;
        margin:30px auto;
        padding:20px;
        font-family:
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          sans-serif;
        color:#111827;
      ">

        <!-- 顶部标题 -->

        <div style="
          background:#ffffff;
          border-radius:24px;
          padding:28px;
          box-shadow:0 6px 24px rgba(0,0,0,0.06);
          margin-bottom:20px;
        ">

          <div style="
            display:flex;
            align-items:center;
            gap:14px;
            margin-bottom:10px;
          ">

            <div style="
              font-size:42px;
            ">
              🌿
            </div>

            <div>

              <div style="
                font-size:30px;
                font-weight:700;
              ">
                AI验药报告
              </div>

              <div style="
                color:#6b7280;
                margin-top:4px;
                font-size:14px;
              ">
                AI Traditional Medicine Verification System
              </div>

            </div>

          </div>

        </div>

        <!-- 第一行 -->

        <div style="
          display:grid;
          grid-template-columns:
            repeat(auto-fit,minmax(320px,1fr));
          gap:20px;
          margin-bottom:20px;
        ">

          <!-- 药材信息 -->

          <div style="
            background:#ffffff;
            border-radius:24px;
            padding:24px;
            box-shadow:0 6px 24px rgba(0,0,0,0.06);
          ">

            <div style="
              color:#6b7280;
              font-size:13px;
              margin-bottom:8px;
            ">
              药材名称
            </div>

            <div style="
              font-size:34px;
              font-weight:700;
              margin-bottom:24px;
            ">
              ${herb["药材名称"]}
            </div>

            <div style="
              color:#6b7280;
              font-size:13px;
              margin-bottom:8px;
            ">
              学名
            </div>

            <div style="
              font-size:22px;
              line-height:1.5;
              word-break:break-word;
            ">
              ${herb["学名"]}
            </div>

          </div>

          <!-- 指标 -->

          <div style="
            display:grid;
            grid-template-columns:
              repeat(auto-fit,minmax(160px,1fr));
            gap:16px;
          ">

            <!-- 可信度 -->

            <div style="
              background:#ffffff;
              border-radius:24px;
              padding:24px;
              box-shadow:0 6px 24px rgba(0,0,0,0.06);
            ">

              <div style="
                color:#6b7280;
                font-size:13px;
                margin-bottom:10px;
              ">
                可信度
              </div>

              <div style="
                font-size:42px;
                font-weight:700;
              ">
                ${herb["可信度"]}
              </div>

            </div>

            <!-- 风险 -->

            <div style="
              background:#ffffff;
              border-radius:24px;
              padding:24px;
              box-shadow:0 6px 24px rgba(0,0,0,0.06);
            ">

              <div style="
                color:#6b7280;
                font-size:13px;
                margin-bottom:10px;
              ">
                真伪风险
              </div>

              <div>

                <span style="
                  display:inline-block;
                  background:${riskColor};
                  color:white;
                  padding:8px 16px;
                  border-radius:999px;
                  font-size:15px;
                  font-weight:700;
                ">
                  ${herb["真假风险"]}
                </span>

              </div>

            </div>

            <!-- 质量 -->

            <div style="
              background:#ffffff;
              border-radius:24px;
              padding:24px;
              box-shadow:0 6px 24px rgba(0,0,0,0.06);
            ">

              <div style="
                color:#6b7280;
                font-size:13px;
                margin-bottom:10px;
              ">
                质量等级
              </div>

              <div style="
                font-size:34px;
                font-weight:700;
              ">
                ${herb["质量等级"]}
              </div>

            </div>

          </div>

        </div>

        <!-- 规格 -->

        <div style="
          background:#ffffff;
          border-radius:24px;
          padding:24px;
          box-shadow:0 6px 24px rgba(0,0,0,0.06);
          margin-bottom:20px;
        ">

          <div style="
            font-size:22px;
            font-weight:700;
            margin-bottom:16px;
          ">
            规格信息
          </div>

          <div style="
            background:#f9fafb;
            border-radius:16px;
            padding:18px;
            line-height:1.8;
            font-size:16px;
          ">
            ${herb["规格"]}
          </div>

        </div>

        <!-- 外观特征 -->

        <div style="
          background:#ffffff;
          border-radius:24px;
          padding:24px;
          box-shadow:0 6px 24px rgba(0,0,0,0.06);
          margin-bottom:20px;
        ">

          <div style="
            font-size:22px;
            font-weight:700;
            margin-bottom:20px;
          ">
            外观特征
          </div>

          <div style="
            display:grid;
            gap:14px;
          ">
            ${featuresHTML}
          </div>

        </div>

        <!-- AI分析 -->

        <div style="
          background:#ffffff;
          border-radius:24px;
          padding:24px;
          box-shadow:0 6px 24px rgba(0,0,0,0.06);
        ">

          <div style="
            font-size:22px;
            font-weight:700;
            margin-bottom:20px;
          ">
            AI分析说明
          </div>

          <div style="
            background:#f9fafb;
            border-radius:16px;
            padding:20px;
            line-height:1.9;
            font-size:16px;
            word-break:break-word;
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
        max-width:900px;
        margin:40px auto;
        background:#fff5f5;
        color:#dc2626;
        padding:20px;
        border-radius:16px;
        font-family:sans-serif;
      ">
        ❌ 系统错误：${error.message}
      </div>
    `;

  }

}