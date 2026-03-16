"use client";

import { ResumeAnalysis } from "../types";
import ScoreCard from "./ScoreCard";
import PaymentButton from "./PaymentButton";
import { Translations } from "../lib/i18n";

interface AnalysisResultProps {
  t: Translations;
  analysis: ResumeAnalysis;
  analysisId: string;
  targetPosition: string;
}

export default function AnalysisResult({
  t,
  analysis,
  analysisId,
  targetPosition,
}: AnalysisResultProps): React.JSX.Element {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t.resultTitle}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t.targetPosition}: <span className="font-medium">{targetPosition}</span>
        </p>
      </div>

      {/* Score Card - Free Version */}
      <ScoreCard t={t} score={analysis.score} top3Issues={analysis.top3Issues} summary={analysis.summary} />

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {t.unlockFullReport}
        </h3>
        <ul className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
          {t.reportFeatures.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
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
        <PaymentButton t={t} analysisId={analysisId} />
      </div>
    </div>
  );
}
