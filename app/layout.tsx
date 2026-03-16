import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeAI Pro - AI-Powered Resume Optimization",
  description: "Optimize your resume with AI. Get instant feedback, personalized suggestions, and actionable improvement tips to land your dream job.",
  keywords: ["resume", "AI", "optimization", "career", "job search", "CV"],
  openGraph: {
    title: "ResumeAI Pro",
    description: "Optimize your resume with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
