{result?.success && result?.data && (
  <div style={{
    marginTop: 30,
    padding: isMobile ? 15 : 25,
    borderRadius: 16,
    background: "#ffffff",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    maxWidth: 800,
    marginLeft: "auto",
    marginRight: "auto"
  }}>

    {/* 标题 */}
    <h2 style={{ marginBottom: 20 }}>📋 中药饮片识别报告</h2>

    {/* ================= 基本信息 ================= */}
    <div style={{
      padding: 15,
      borderRadius: 10,
      background: "#f6f8fa",
      marginBottom: 20
    }}>
      <h3>📌 {result.data.name || "未知药材"}</h3>

      <p>置信度：{((result.data.confidence || 0) * 100).toFixed(1)}%</p>

      {/* 评分条 */}
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 14 }}>质量评分：{result.data.quality?.score || 0}</div>
        <div style={{
          height: 8,
          background: "#eee",
          borderRadius: 4,
          overflow: "hidden"
        }}>
          <div style={{
            width: `${result.data.quality?.score || 0}%`,
            height: "100%",
            background:
              (result.data.quality?.score || 0) > 80 ? "#22c55e" :
              (result.data.quality?.score || 0) > 60 ? "#f59e0b" : "#ef4444"
          }} />
        </div>
      </div>
    </div>

    {/* ================= 特征 ================= */}
    <div style={{ marginBottom: 20 }}>
      <h3>🔍 特征分析</h3>
      <ul style={{ lineHeight: 1.8 }}>
        <li>形状：{result.data.features?.shape || "-"}</li>
        <li>颜色：{result.data.features?.color || "-"}</li>
        <li>质地：{result.data.features?.texture || "-"}</li>
        <li>大小：{result.data.features?.size || "-"}</li>
      </ul>
    </div>

    {/* ================= 质量 ================= */}
    <div style={{
      padding: 15,
      borderRadius: 10,
      background: result.data.quality?.is_normal ? "#ecfdf5" : "#fef2f2"
    }}>
      <h3>⚖️ 质量评估</h3>

      <p>
        是否正常：
        <b style={{
          color: result.data.quality?.is_normal ? "#16a34a" : "#dc2626"
        }}>
          {result.data.quality?.is_normal ? " 正常" : " 异常"}
        </b>
      </p>

      <p>
        风险等级：
        <b style={{
          color:
            (result.data.quality?.score || 0) > 80 ? "#16a34a" :
            (result.data.quality?.score || 0) > 60 ? "#f59e0b" : "#dc2626"
        }}>
          {
            (result.data.quality?.score || 0) > 80 ? " 低风险" :
            (result.data.quality?.score || 0) > 60 ? " 中风险" : " 高风险"
          }
        </b>
      </p>

      {/* 问题 */}
      {(result.data.quality?.problems || []).length > 0 && (
        <>
          <p style={{ marginTop: 10 }}>问题：</p>
          <ul>
            {(result.data.quality?.problems || []).map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </>
      )}
    </div>

    {/* ================= 说明 ================= */}
    <details style={{ marginTop: 15 }}>
      <summary style={{ cursor: "pointer" }}>📄 查看详细说明</summary>
      <p style={{ marginTop: 10, lineHeight: 1.6 }}>
        {result.data.quality?.reason || "暂无说明"}
      </p>
    </details>

  </div>
)}