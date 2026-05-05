import Stripe from "stripe"

export default async function handler(req, res) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    // ✅ 如果没有登录，用匿名邮箱（避免报错）
    const email =
      req.headers?.authorization
        ? "user@example.com"
        : `guest_${Date.now()}@example.com`

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      customer_email: email,

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
            unit_amount: 999
          },
          quantity: 1
        }
      ],

      success_url: "https://ai-herbs.vercel.app/success.html",
      cancel_url: "https://ai-herbs.vercel.app/?cancel=1"
    })

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