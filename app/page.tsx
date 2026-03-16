"use client";

import { useState } from "react";
import ResumeUploader from "./components/ResumeUploader";
import AnalysisResult from "./components/AnalysisResult";
import I18nProvider, { LanguageSwitcher, useI18n } from "./components/I18nProvider";
import { UploadedFile, ResumeAnalysis } from "./types";

// Inner component that uses hooks at the top level
function HomeContent(): React.JSX.Element {
  const { t, locale, setLocale } = useI18n();
  const [step, setStep] = useState<"upload" | "position" | "analyzing" | "result">("upload");
  const [targetPosition, setTargetPosition] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null);
  const [analysisId, setAnalysisId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = (file: UploadedFile): void => {
    setUploadedFile(file);
    setStep("position");
    setError(null);
  };

  const handleError = (message: string): void => {
    setError(message);
  };

  const handleAnalyze = async (): Promise<void> => {
    if (!uploadedFile || !targetPosition.trim()) {
      setError(t.errorNoPosition);
      return;
    }

    setStep("analyzing");
    setError(null);

    try {
      const formData = new FormData();
      const byteCharacters = atob(uploadedFile.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: uploadedFile.type });

      formData.append("file", blob, uploadedFile.name);
      formData.append("targetPosition", targetPosition);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.errorAnalysisFailed);
      }

      setAnalysisResult(data.analysis);
      setAnalysisId(data.analysisId);
      setStep("result");
    } catch (err) {
      const message = err instanceof Error ? err.message : t.errorAnalysisFailed;
      setError(message);
      setStep("position");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {t.appName}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
              <a href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                {t.features}
              </a>
              <a href="#pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                {t.pricing}
              </a>
            </nav>
            <LanguageSwitcher locale={locale} setLocale={setLocale} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Text */}
        {step === "upload" && (
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t.heroTitle}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t.heroSubtitle}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Step: Upload */}
        {step === "upload" && (
          <ResumeUploader
            t={t}
            locale={locale}
            onUploadComplete={handleUploadComplete}
            onError={handleError}
          />
        )}

        {/* Step: Position Input */}
        {step === "position" && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t.positionTitle}
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="position"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t.positionLabel}
                </label>
                <input
                  type="text"
                  id="position"
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                  placeholder={t.positionPlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("upload")}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {t.back}
                </button>
                <button
                  onClick={() => void handleAnalyze()}
                  disabled={!targetPosition.trim()}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {t.analyzeResume}
                </button>
              </div>
            </div>
            {uploadedFile && (
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {t.processing}: {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
              </p>
            )}
          </div>
        )}

        {/* Step: Analyzing */}
        {step === "analyzing" && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t.analyzingTitle}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t.analyzingSubtitle} {targetPosition}...
            </p>
          </div>
        )}

        {/* Step: Result */}
        {step === "result" && analysisResult && (
          <AnalysisResult
            t={t}
            analysis={analysisResult}
            analysisId={analysisId}
            targetPosition={targetPosition}
          />
        )}

        {/* Features Section */}
        {step === "upload" && (
          <section id="features" className="mt-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
              {t.howItWorks}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: t.step1Title, desc: t.step1Desc, icon: "📄" },
                { title: t.step2Title, desc: t.step2Desc, icon: "🤖" },
                { title: t.step3Title, desc: t.step3Desc, icon: "✨" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pricing Section */}
        {step === "upload" && (
          <section id="pricing" className="mt-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
              {t.simplePricing}
            </h2>
            <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t.fullReport}
                </h3>
                <p className="text-4xl font-bold text-blue-600 mb-6">
                  {t.payButtonPrice}
                  <span className="text-base font-normal text-gray-500">{t.priceUnit}</span>
                </p>
                <ul className="space-y-3 mb-8">
                  {t.reportFeatures.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-gray-600 dark:text-gray-400"
                    >
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 text-center">
                  {t.priceNote}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2026 {t.appName}. {t.footer}
          </p>
        </div>
      </footer>
    </div>
  );
}

// Main page component wraps content with I18nProvider
export default function Home(): React.JSX.Element {
  return (
    <I18nProvider>
      <HomeContent />
    </I18nProvider>
  );
}
