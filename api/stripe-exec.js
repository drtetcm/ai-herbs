import { verifyToken } from "../lib/auth"
import Stripe from "stripe"

function getUserEmail(req) {
  const auth = req.headers.authorization

  if (!auth || !auth.startsWith("Bearer ")) {
    return null
  }

  try {
    const token = auth.slice(7)
    const payload = verifyToken(token)
    return payload?.email || null
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  try {
    // ✅ 1. 获取用户 email（关键）
    const email = getUserEmail(req)

    if (!email) {
      return res.status(401).json({ error: "Not logged in" })
    }

    // ✅ 2. 初始化 Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    // ✅ 3. 创建 Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      mode: "payment",

      // ⭐⭐⭐ 核心：绑定用户
      customer_email: email,

      // ⭐⭐⭐ 兜底（双保险）
      metadata: {
        email: email
      },

      line_items: [
        {
          price_data: {
            currency: "myr",
            product_data: {
              name: "Executive 7天（无限识别）"
            },
            unit_amount: 999 // RM 9.99
          },
          quantity: 1
        }
      ],

      success_url: "https://ai-herbs.vercel.app/success.html",
      cancel_url: "https://ai-herbs.vercel.app/?cancel=1"
    })

    // ✅ 4. 返回支付链接
    res.status(200).json({
      url: session.url
    })

  } catch (err) {
    console.error("❌ Stripe error:", err)

    res.status(500).json({
      error: "Stripe 创建失败"
    })
  }
}