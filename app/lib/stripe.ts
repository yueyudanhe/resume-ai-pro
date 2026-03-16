import Stripe from "stripe";

function getStripeInstance(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-02-25.clover",
  });
}

export function getStripe(): Stripe {
  return getStripeInstance();
}

export const PRICE_ID = process.env.STRIPE_PRICE_ID || "";

export interface CreateCheckoutSessionParams {
  analysisId: string;
  customerEmail?: string;
}

export async function createCheckoutSession({
  analysisId,
  customerEmail,
}: CreateCheckoutSessionParams): Promise<string> {
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!priceId) {
    throw new Error("STRIPE_PRICE_ID is not set");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/report/${analysisId}?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/analysis/${analysisId}?payment=cancelled`,
    metadata: {
      analysisId,
    },
    customer_email: customerEmail,
  });

  return session.url || "";
}

export async function constructEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // 本地测试模式：如果没有配置 Webhook Secret，跳过验证
  if (!webhookSecret) {
    console.warn("[STRIPE] Webhook secret not set, skipping signature verification (dev mode only)");
    // 解析但不验证（仅用于本地开发测试）
    const event = JSON.parse(payload as string) as Stripe.Event;
    return event;
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
