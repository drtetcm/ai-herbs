import { useEffect, useState } from "react"

export default function App() {
  const [user, setUser] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  // ✅ 获取用户信息
  async function loadUser() {
    const token = localStorage.getItem("token")

    if (!token) {
      console.log("❌ no token")
      return
    }

    try {
      const res = await fetch("/api/user", {
        headers: {
          Authorization: "Bearer " + token
        }
      })

      const data = await res.json()
      console.log("👤 user:", data)

      setUser(data)
    } catch (err) {
      console.error("❌ loadUser error", err)
    }
  }

  // ✅ 页面加载
  useEffect(() => {
    loadUser()

    // 🔥 自动刷新（支付后生效）
    const interval = setInterval(loadUser, 5000)
    return () => clearInterval(interval)
  }, [])

  // ✅ 上传识别（示例）
  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)

    const token = localStorage.getItem("token")

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token
        },
        body: formData
      })

      const data = await res.json()
      setResult(data)

      // 🔥 每次识别后刷新用户（扣次数）
      loadUser()

    } catch (err) {
      console.error(err)
    }

    setLoading(false)
  }

  // ✅ 升级会员
  async function activatePro() {
    const token = localStorage.getItem("token")

    const res = await fetch("/api/stripe-exec", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token
      }
    })

    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    }
  }

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1>DRTE HerbAI™</h1>
      <p>📸 AI 中药智能识别系统</p>

      {/* 上传 */}
      <input type="file" onChange={handleUpload} />

      {/* 🔥 会员状态 */}
      <div style={{
        marginTop: 20,
        padding: 10,
        borderRadius: 8,
        background: user?.isPro ? "#ecfdf5" : "#fef3c7"
      }}>
        {user?.isPro
          ? "👑 Pro会员：无限识别"
          : `🆓 剩余次数：${user?.remaining ?? 0}`}
      </div>

      {/* 加载 */}
      {loading && <p>分析中...</p>}

      {/* 结果 */}
      {result?.success && result?.data && (
        <div style={{
          marginTop: 30,
          padding: 25,
          borderRadius: 16,
          background: "#fff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          maxWidth: 800,
          marginLeft: "auto",
          marginRight: "auto"
        }}>

          {/* 状态条 */}
          <div style={{
            marginBottom: 20,
            padding: 10,
            borderRadius: 8,
            background: user?.isPro ? "#ecfdf5" : "#fef3c7"
          }}>
            {user?.isPro
              ? "👑 Pro会员：无限识别"
              : `🆓 免费次数剩余：${user?.remaining ?? 0} 次`}
          </div>

          <h2>📋 识别结果</h2>

          <p>名称：{result.data.name}</p>
          <p>置信度：{((result.data.confidence || 0) * 100).toFixed(1)}%</p>

          {/* 🔒 非会员 */}
          {!user?.isPro && (
            <div style={{
              marginTop: 20,
              padding: 15,
              background: "#fef2f2",
              borderRadius: 10
            }}>
              <p>🔒 高级分析已锁定</p>

              <button onClick={activatePro}>
                🚀 升级会员
              </button>
            </div>
          )}

          {/* 👑 Pro内容 */}
          {user?.isPro && (
            <div style={{ marginTop: 20 }}>
              <h3>🔍 特征</h3>
              <p>形状：{result.data.features?.shape}</p>
              <p>颜色：{result.data.features?.color}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}