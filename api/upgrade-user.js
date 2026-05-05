export default async function handler(req, res) {

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "no userId" });
    }

    // ❗ 当前是“最小版本”（无数据库）
    // 👉 直接返回成功，模拟升级

    return res.json({
      success: true,
      isPro: true
    });

  } catch (e) {
    return res.status(500).json({ error: "upgrade failed" });
  }
}