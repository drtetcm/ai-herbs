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

  // ✅ 1. 校验 webhook
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

    const rawEmail =
      session.customer_details?.email ||
      session.customer_email ||
      session.metadata?.email ||
      "unknown";

    const email = rawEmail.trim().toLowerCase();
    const key = `user:${email}`;

    console.log("📧 email来源:", rawEmail);
    console.log("✅ 标准化email:", email);

    if (!email || email === "unknown") {
      console.warn("⚠️ 无法获取 email");
      return res.status(200).json({ received: true });
    }

    try {
      const userData = {
        plan: "pro",
        expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      // ✅ 正确写入（无嵌套）
      await fetch(`${process.env.KV_REST_API_URL}/set/${key}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      console.log("🔥 已写入 KV:", key);
      console.log("🧾 数据:", userData);

    } catch (err) {
      console.error("❌ KV写入失败:", err);
    }
  }

  return res.status(200).json({ received: true });
}

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}