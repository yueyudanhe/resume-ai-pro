"use client";

import { ResumeScore, ResumeIssue } from "../types";
import { Translations } from "../lib/i18n";

interface ScoreCardProps {
  t: Translations;
  score: ResumeScore;
  top3Issues: ResumeIssue[];
  summary: string;
}

export default function ScoreCard({ t, score, top3Issues, summary }: ScoreCardProps): React.JSX.Element {
  const getScoreColor = (value: number): string => {
    if (value >= 80) return "text-green-500";
    if (value >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (value: number): string => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case "low":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const scoreCategories = [
    { key: "overall" as const, label: t.overall, value: score.overall },
    { key: "relevance" as const, label: t.relevance, value: score.relevance },
    { key: "completeness" as const, label: t.completeness, value: score.completeness },
    { key: "formatting" as const, label: t.formatting, value: score.formatting },
    { key: "keywords" as const, label: t.keywords, value: score.keywords },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6">
      {/* Overall Score */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t.resumeScore}
        </h3>
        <div className="inline-flex items-center justify-center">
          <div className="relative">
            <svg className="w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(score.overall / 100) * 351.86} 351.86`}
                transform="rotate(-90 64 64)"
                className={getScoreColor(score.overall)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
                {score.overall}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{summary}</p>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-2 gap-4">
        {scoreCategories.slice(1).map((category) => (
          <div key={category.key} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {category.label}
            </p>
            <p className={`text-2xl font-bold ${getScoreColor(category.value)}`}>
              {category.value}
            </p>
          </div>
        ))}
      </div>

      {/* Top 3 Issues */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {t.top3Issues}
        </h4>
        <div className="space-y-2">
          {top3Issues.map((issue, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg ${getSeverityColor(issue.severity)}`}
            >
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 font-semibold text-xs">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}
                </p>
                <p className="text-sm opacity-80">{issue.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
