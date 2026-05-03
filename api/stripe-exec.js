import Stripe from "stripe";

export default async function handler(req, res) {
  try {

    // ✅ 初始化 Stripe（从环境变量拿）
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // ✅ 创建 Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      mode: "payment",

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
    });

    // ✅ 返回支付链接
    res.status(200).json({
      url: session.url
    });

  } catch (err) {
    console.error("Stripe error:", err);

    res.status(500).json({
      error: "Stripe 创建失败"
    });
  }
}