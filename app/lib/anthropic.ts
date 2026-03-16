import Anthropic from "@anthropic-ai/sdk";
import { ResumeAnalysis, FullResumeReport } from "../types";

// CCR 中转配置：如果设置了 ANTHROPIC_BASE_URL，则使用自定义端点
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

const ANALYSIS_SYSTEM_PROMPT = `You are an expert resume analyst and career coach with 15+ years of experience.
Your task is to analyze resumes and provide constructive feedback.

Analyze the resume for:
1. Overall quality and impact
2. Relevance to the target position
3. Completeness of sections
4. Formatting and readability
5. Keyword optimization

Provide scores (0-100) for each category and identify key issues.
Be specific, actionable, and professional in your feedback.`;

// 从环境变量读取模型名称，默认为 Claude 3.5 Sonnet
const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

// 提取文本内容的兼容函数
function extractTextContent(response: Anthropic.Messages.Message): string {
  console.log("[Anthropic Response] full:", JSON.stringify(response, null, 2).slice(0, 1000));

  // 遍历所有 content 项，查找文本内容
  for (const item of response.content) {
    // 标准 Anthropic 格式
    if (item.type === "text" && "text" in item) {
      return (item as Anthropic.TextBlock).text;
    }
    // 阿里云百炼可能返回的格式
    if ("text" in item && typeof (item as { text?: string }).text === "string") {
      return (item as { text: string }).text;
    }
  }

  // 如果都没找到，尝试把整个 content 转为字符串
  const contentStr = JSON.stringify(response.content);
  console.error("[Anthropic Response] Cannot find text content:", contentStr);
  throw new Error(`No text content found in response: ${contentStr.slice(0, 200)}`);
}

// 清理 AI 返回的 JSON（去除 markdown 代码块标记）
function cleanJsonResponse(text: string): string {
  // 去除 ```json 和 ``` 标记
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

export async function analyzeResume(
  resumeText: string,
  targetPosition: string
): Promise<ResumeAnalysis> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Please analyze this resume for a ${targetPosition} position:

RESUME TEXT:
${resumeText}

Provide your analysis in JSON format with:
- score: { overall, relevance, completeness, formatting, keywords } (all 0-100)
- issues: array of issues with category, severity, description
- summary: brief overall assessment
- top3Issues: the 3 most critical issues to address

Format: Only return the JSON, no markdown or explanation.`,
      },
    ],
  });

  const textContent = extractTextContent(response);
  const cleanedJson = cleanJsonResponse(textContent);

  try {
    return JSON.parse(cleanedJson) as ResumeAnalysis;
  } catch (err) {
    console.error("[Anthropic Response] Failed to parse JSON:", cleanedJson.slice(0, 500));
    throw new Error("Failed to parse Claude API response");
  }
}

export async function generateFullReport(
  resumeText: string,
  targetPosition: string,
  initialAnalysis: ResumeAnalysis
): Promise<FullResumeReport> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate a comprehensive resume optimization report.

RESUME TEXT:
${resumeText}

TARGET POSITION: ${targetPosition}

INITIAL ANALYSIS:
${JSON.stringify(initialAnalysis, null, 2)}

Provide a detailed report in JSON format with:
- score, issues, summary, top3Issues (from initial analysis)
- detailedSuggestions: array of specific improvements with section, issue, suggestion, example, priority
- keywordAnalysis: array of important keywords with found status and importance
- competitiveAnalysis: percentile ranking (0-100), strengths, weaknesses, marketPosition

Format: Only return the JSON, no markdown or explanation.`,
      },
    ],
  });

  const textContent = extractTextContent(response);
  const cleanedJson = cleanJsonResponse(textContent);

  try {
    return JSON.parse(cleanedJson) as FullResumeReport;
  } catch {
    throw new Error("Failed to parse Claude API response");
  }
}
