import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { analyzeResume } from "../../../app/lib/anthropic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const targetPosition = formData.get("targetPosition") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!targetPosition || targetPosition.trim() === "") {
      return NextResponse.json(
        { error: "Target position is required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload PDF or Word document." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Extract text from file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let resumeText = "";

    try {
      if (file.type === "application/pdf") {
        const pdfData = await pdfParse(buffer);
        resumeText = pdfData.text;
      } else {
        const result = await mammoth.extractRawText({ buffer });
        resumeText = result.value;
      }
    } catch {
      return NextResponse.json(
        { error: "Failed to parse file. Please ensure it's a valid document." },
        { status: 400 }
      );
    }

    if (resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract sufficient text from the file. Please try another file." },
        { status: 400 }
      );
    }

    // Analyze with Claude
    const analysis = await analyzeResume(resumeText, targetPosition);

    return NextResponse.json({
      success: true,
      analysis,
      analysisId: Math.random().toString(36).substring(2, 9),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
}
