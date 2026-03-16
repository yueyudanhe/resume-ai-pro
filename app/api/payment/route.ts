import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "../../../app/lib/stripe";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { analysisId, customerEmail } = body;

    if (!analysisId) {
      return NextResponse.json(
        { error: "Analysis ID is required" },
        { status: 400 }
      );
    }

    const checkoutUrl = await createCheckoutSession({
      analysisId,
      customerEmail,
    });

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Failed to create payment session. Please try again." },
      { status: 500 }
    );
  }
}
