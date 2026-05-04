import { verifyToken } from "../lib/auth"

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

  // ===== 1. 验证 webhook =====
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

  // ===== 2. 支付完成 =====
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const rawEmail =
      session.metadata?.email ||
      session.customer_details?.email ||
      session.customer_email ||
      "unknown";

    const email = rawEmail.trim().toLowerCase();
    const key = `user:${email}`;

    console.log("📧 email:", email);

    if (!email || email === "unknown") {
      console.warn("⚠️ 无效 email");
      return res.status(200).json({ received: true });
    }

    try {
      // ===== 🔥 读取现有数据（安全版）=====
      let existingUser = null;

      const existingRes = await fetch(
        `${process.env.KV_REST_API_URL}/get/${key}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          },
        }
      );

      if (existingRes.ok) {
        const json = await existingRes.json();

        if (json.result) {
          try {
            existingUser = JSON.parse(json.result);
          } catch {
            existingUser = null;
          }
        }
      } else {
        console.warn("⚠️ KV读取失败:", key);
      }

      // ===== 🔥 计算新过期时间（支持续费）=====
      const now = Date.now();

      const baseExpire =
        existingUser &&
        typeof existingUser.expires === "number" &&
        existingUser.expires > now
          ? existingUser.expires   // 🔥 在原基础上续
          : now;

      const newExpire = baseExpire + 30 * 24 * 60 * 60 * 1000;

      const userData = {
        plan: "pro",
        expires: newExpire,
      };

      // ===== 🔥 写入 KV =====
      const writeRes = await fetch(
        `${process.env.KV_REST_API_URL}/set/${key}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value: JSON.stringify(userData),
          }),
        }
      );

      if (!writeRes.ok) {
        throw new Error("KV写入失败");
      }

      console.log("🔥 写入成功:", key);
      console.log("🧾 expires:", newExpire);

    } catch (err) {
      console.error("❌ webhook处理失败:", err);
    }
  }

  return res.status(200).json({ received: true });
}

// ===== buffer =====
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}