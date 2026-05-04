import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // ✅ 初始化内存（临时方案）
  global.users = global.users || {};

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

  // ✅ 2. 处理支付成功事件（唯一一处）
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const email =
      session.customer_details?.email ||
      session.customer_email ||
      "unknown";

    console.log("📦 session:", session);
    console.log("✅ 支付成功:", email);

    // 🔥 写入会员
    global.users[email] = {
      plan: "pro",
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    console.log("🔥 已写入用户:", global.users[email]);
  }

  // ✅ 3. 必须始终返回 200
  return res.status(200).json({ received: true });
}

// ✅ buffer函数（必须保留）
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}