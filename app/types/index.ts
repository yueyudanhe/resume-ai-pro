// Resume Analysis Types

export interface ResumeAnalysisRequest {
  targetPosition: string;
  resumeText: string;
  fileName: string;
}

export interface ResumeScore {
  overall: number;
  relevance: number;
  completeness: number;
  formatting: number;
  keywords: number;
}

export interface ResumeIssue {
  category: 'content' | 'formatting' | 'keywords' | 'structure';
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export interface ResumeAnalysis {
  score: ResumeScore;
  issues: ResumeIssue[];
  summary: string;
  top3Issues: ResumeIssue[];
}

export interface FullResumeReport extends ResumeAnalysis {
  detailedSuggestions: Suggestion[];
  keywordAnalysis: KeywordMatch[];
  competitiveAnalysis: CompetitiveInsight;
}

export interface Suggestion {
  section: string;
  issue: string;
  suggestion: string;
  example: string;
  priority: 'high' | 'medium' | 'low';
}

export interface KeywordMatch {
  keyword: string;
  found: boolean;
  importance: 'critical' | 'important' | 'nice-to-have';
}

export interface CompetitiveInsight {
  percentile: number;
  strengths: string[];
  weaknesses: string[];
  marketPosition: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
}
