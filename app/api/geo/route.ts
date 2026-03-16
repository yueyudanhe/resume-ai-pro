import { NextRequest, NextResponse } from "next/server";
import { getLocaleFromCountry, Locale } from "../../lib/i18n";

interface GeoResponse {
  country: string;
  locale: Locale;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get client IP from request headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || realIp || "";

    // If running locally or can't detect IP, try to get from Cloudflare/Vercel headers
    const cfCountry = request.headers.get("cf-ipcountry"); // Cloudflare
    const vercelCountry = request.headers.get("x-vercel-ip-country"); // Vercel

    let countryCode: string;

    if (cfCountry) {
      countryCode = cfCountry;
    } else if (vercelCountry) {
      countryCode = vercelCountry;
    } else if (clientIp && clientIp !== "127.0.0.1" && clientIp !== "::1") {
      // Try ipapi.co for IP geolocation (free tier)
      try {
        const response = await fetch(`https://ipapi.co/${clientIp}/country/`, {
          headers: { "User-Agent": "ResumeAI-Pro/1.0" },
          next: { revalidate: 0 },
        });
        if (response.ok) {
          countryCode = await response.text();
        } else {
          countryCode = "US"; // Default fallback
        }
      } catch {
        countryCode = "US"; // Default fallback on error
      }
    } else {
      // Local development - check accept-language header as fallback
      const acceptLang = request.headers.get("accept-language");
      if (acceptLang) {
        const lang = acceptLang.split(",")[0]?.split("-")[0]?.toLowerCase();
        const langToLocale: Record<string, Locale> = {
          zh: "zh",
          ja: "ja",
          ko: "ko",
          es: "es",
          fr: "fr",
          de: "de",
          ar: "ar",
          pt: "pt",
          ru: "ru",
          it: "it",
          nl: "nl",
          pl: "pl",
          tr: "tr",
          vi: "vi",
          en: "en",
        };
        const detectedLocale = lang && langToLocale[lang];
        if (detectedLocale) {
          const response: GeoResponse = {
            country: lang.toUpperCase(),
            locale: detectedLocale,
          };
          return NextResponse.json(response);
        }
      }
      countryCode = "US"; // Default fallback
    }

    const locale = getLocaleFromCountry(countryCode);

    const response: GeoResponse = {
      country: countryCode,
      locale,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Geo detection error:", error);
    // Return default on error
    const response: GeoResponse = {
      country: "US",
      locale: "en",
    };
    return NextResponse.json(response);
  }
}
