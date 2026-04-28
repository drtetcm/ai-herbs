{result && result.success && result.data && (
  <div style={{
    marginTop: 30,
    padding: 20,
    borderRadius: 12,
    background: "#f9fafb",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  }}>

    {/* 标题 */}
    <h2>📋 识别报告</h2>

    {/* 基本信息 */}
    <div style={{ marginBottom: 20 }}>
      <h3>📌 药材名称：{result.data.name}</h3>
      <p>置信度：{(result.data.confidence * 100).toFixed(1)}%</p>
      <p>质量评分：{result.data.quality.score}</p>
    </div>

    {/* 特征分析 */}
    <div style={{ marginBottom: 20 }}>
      <h3>🔍 特征分析</h3>
      <ul>
        <li>形状：{result.data.features.shape}</li>
        <li>颜色：{result.data.features.color}</li>
        <li>质地：{result.data.features.texture}</li>
        <li>大小：{result.data.features.size}</li>
      </ul>
    </div>

    {/* 质量评估 */}
    <div style={{
      padding: 15,
      borderRadius: 8,
      background: result.data.quality.is_normal ? "#e6ffed" : "#ffe6e6"
    }}>
      <h3>⚖️ 质量评估</h3>

      <p>
        是否正常：
        <b style={{
          color: result.data.quality.is_normal ? "green" : "red"
        }}>
          {result.data.quality.is_normal ? " 正常" : " 异常"}
        </b>
      </p>

      <p>
        风险等级：
        <b style={{
          color: result.data.quality.score > 80 ? "green" :
                 result.data.quality.score > 60 ? "orange" : "red"
        }}>
          {result.data.quality.score > 80 ? " low" :
           result.data.quality.score > 60 ? " medium" : " high"}
        </b>
      </p>

      {/* 问题列表 */}
      {result.data.quality.problems.length > 0 && (
        <>
          <p>问题：</p>
          <ul>
            {result.data.quality.problems.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </>
      )}
    </div>

    {/* 说明（可折叠） */}
    <details style={{ marginTop: 15 }}>
      <summary style={{ cursor: "pointer" }}>📄 查看详细说明</summary>
      <p style={{ marginTop: 10 }}>
        {result.data.quality.reason}
      </p>
    </details>

  </div>
)}