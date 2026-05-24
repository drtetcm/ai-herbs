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
        <div style="color:red;">
          ❌ 验药失败：${data.message}
        </div>
      `;

    }

    // 获取结果
    const herb = data.result;

    // 外观特征HTML
    const featuresHTML = herb["外观特征"]
      .map(item => `<li>${item}</li>`)
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
        background:#ffffff;
        padding:24px;
        border-radius:16px;
        box-shadow:0 4px 12px rgba(0,0,0,0.08);
        margin-top:20px;
        line-height:1.8;
        font-family:sans-serif;
      ">

        <h2 style="margin-bottom:20px;">
          🌿 AI验药报告
        </h2>

        <p><strong>药材名称：</strong>${herb["药材名称"]}</p>

        <p><strong>学名：</strong>${herb["学名"]}</p>

        <p><strong>可信度：</strong>${herb["可信度"]}</p>

        <p>
          <strong>真假风险：</strong>
          <span style="
            color:white;
            background:${riskColor};
            padding:4px 10px;
            border-radius:8px;
          ">
            ${herb["真假风险"]}
          </span>
        </p>

        <p><strong>质量等级：</strong>${herb["质量等级"]}</p>

        <p><strong>规格：</strong>${herb["规格"]}</p>

        <h3>外观特征</h3>

        <ul>
          ${featuresHTML}
        </ul>

        <h3>分析说明</h3>

        <p>
          ${herb["分析说明"]}
        </p>

      </div>
    `;

  } catch (error) {

    console.error("上传失败:", error);

    return `
      <div style="color:red;">
        ❌ 系统错误：${error.message}
      </div>
    `;

  }

}