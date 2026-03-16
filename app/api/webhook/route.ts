import { NextRequest, NextResponse } from "next/server";
import { constructEvent } from "../../../app/lib/stripe";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    let event;
    try {
      event = await constructEvent(payload, signature);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as { metadata?: { analysisId?: string } };
        const analysisId = session.metadata?.analysisId;

        if (analysisId) {
          // TODO: Mark analysis as paid and trigger full report generation
          console.log(`Payment completed for analysis: ${analysisId}`);
        }
        break;
      }

      case "payment_intent.succeeded": {
        console.log("PaymentIntent succeeded");
        break;
      }

      case "payment_intent.payment_failed": {
        console.log("PaymentIntent failed");
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
