import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;

  // ✅ 1. 验证 webhook
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    return res.status(400).send("Webhook Error");
  }

  // ✅ 2. 处理支付成功
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const email =
      session.customer_details?.email ||
      session.customer_email ||
      "unknown";

    console.log("✅ 支付成功:", email);

    // ❗防止无效 email
    if (!email || email === "unknown") {
      console.warn("⚠️ 无法获取 email");
      return res.status(200).json({ received: true });
    }

    try {
      // ✅ 写入 KV（永久存储）
      await fetch(`${process.env.KV_REST_API_URL}/set/user:${email}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: "pro",
          expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
        }),
      });

      console.log("🔥 已写入 KV:", email);

    } catch (err) {
      console.error("❌ KV写入失败:", err);
    }
  }

  // ✅ 必须返回 200（Stripe 要求）
  return res.status(200).json({ received: true });
}

// ✅ buffer函数
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}