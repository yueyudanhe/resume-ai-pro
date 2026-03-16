"use client";

import { useState } from "react";
import { Translations } from "../lib/i18n";

interface PaymentButtonProps {
  t: Translations;
  analysisId: string;
  customerEmail?: string;
}

// Stripe Payment Link URL - 从环境变量获取
const PAYMENT_LINK_URL = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL || "";

export default function PaymentButton({
  t,
  analysisId,
  customerEmail,
}: PaymentButtonProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!PAYMENT_LINK_URL) {
        throw new Error("Payment link not configured");
      }

      // 构建 Payment Link URL，附加分析ID作为参考
      const url = new URL(PAYMENT_LINK_URL);
      url.searchParams.append("client_reference_id", analysisId);
      if (customerEmail) {
        url.searchParams.append("prefilled_email", customerEmail);
      }

      // 直接跳转到 Stripe Payment Link
      window.location.href = url.toString();
    } catch (err) {
      const message = err instanceof Error ? err.message : t.errorPaymentFailed;
      setError(message);
      console.error("Payment error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => void handlePayment()}
        disabled={isLoading}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-white
          transition-all duration-200
          ${isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t.processing}...
          </span>
        ) : (
          <span>{t.payButton} - {t.payButtonPrice}</span>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          {t.securePayment}
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {t.satisfaction}
        </div>
      </div>
    </div>
  );
}
