import { buffer } from "micro"
import Stripe from "stripe"
import { kv } from "@vercel/kv"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"]

  let event

  try {
    const buf = await buffer(req)

    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error("❌ webhook verify failed:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log("📦 event:", event.type)

  // ⭐⭐⭐ 只处理支付成功
  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    // ✅ 优先 customer_email
    let email = session.customer_email

    // ✅ fallback：metadata（更稳）
    if (!email && session.metadata?.email) {
      email = session.metadata.email
    }

    console.log("💰 payment success, email:", email)

    if (!email) {
      console.error("❌ no email in session")
      return res.json({ received: true })
    }

    try {
      const key = `user:${email}`

      let user = await kv.get(key)

      console.log("👤 before:", user)

      if (!user) {
        user = {
          email,
          plan: "free",
          createdAt: Date.now()
        }
      }

      // ⭐⭐⭐ 升级
      user.plan = "pro"
      user.expires = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天

      await kv.set(key, user)

      console.log("✅ upgraded:", user)

    } catch (err) {
      console.error("❌ KV error:", err)
    }
  }

  res.json({ received: true })
}