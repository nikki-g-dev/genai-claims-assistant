import OpenAI from "openai";
import {
  ResponseInputFile,
  ResponseInputImage,
  ResponseInputMessageContentList,
  ResponseInputText
} from "openai/resources/responses/responses";

import { AnalysisResult, ClaimEnrichment, ClaimInput, ParsedDocument } from "@/lib/types";

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

interface SupportedUpload {
  file: File;
  transportType: "file" | "image";
}

export async function enrichClaimWithOpenAI(
  claim: ClaimInput,
  analysis: AnalysisResult,
  files: File[]
): Promise<ClaimEnrichment> {
  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackEnrichment(
      claim,
      analysis,
      files,
      "Add OPENAI_API_KEY to enable OpenAI summaries and document parsing."
    );
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const supportedUploads = files
      .map((file) => classifyUpload(file))
      .filter((upload): upload is SupportedUpload => upload !== null);

    const content: ResponseInputMessageContentList = [
      {
        type: "input_text",
        text:
          "You are an insurance claims assistant. Review the claim and uploaded documents, then return strict JSON with this shape: " +
          '{"aiSummary":"string","claimantStory":"string","coverageSnapshot":"string","extractedFacts":["string"],"followUps":["string"],"parsedDocuments":[{"filename":"string","mimeType":"string","summary":"string","keyFacts":["string"],"missingInfo":["string"]}]}. ' +
          "Keep each paragraph concise, mention likely supporting evidence, and only include facts grounded in the claim or documents."
      },
      {
        type: "input_text",
        text: `Claim payload:\n${JSON.stringify(claim, null, 2)}\n\nDeterministic analysis:\n${JSON.stringify(analysis, null, 2)}`
      }
    ];

    for (const upload of supportedUploads) {
      const base64 = await toBase64(upload.file);

      if (upload.transportType === "image") {
        const imagePart: ResponseInputImage = {
          type: "input_image",
          detail: "auto",
          image_url: `data:${upload.file.type};base64,${base64}`
        };
        const promptPart: ResponseInputText = {
          type: "input_text",
          text: `The previous image is named ${upload.file.name}. Extract claim-relevant details from it.`
        };
        content.push(imagePart, promptPart);
        continue;
      }

      const filePart: ResponseInputFile = {
        type: "input_file",
        filename: upload.file.name,
        file_data: `data:${upload.file.type || "application/octet-stream"};base64,${base64}`
      };
      content.push(filePart);
    }

    const response = await client.responses.create({
      model: DEFAULT_MODEL,
      input: [
        {
          role: "user",
          content
        }
      ]
    });

    const payload = parseJsonObject(response.output_text);

    return {
      aiSummary: coerceString(payload.aiSummary, analysis.summary),
      claimantStory: coerceString(payload.claimantStory, claim.description),
      coverageSnapshot: coerceString(
        payload.coverageSnapshot,
        `${analysis.recommendation} with estimated resolution in ${analysis.estimatedResolution}.`
      ),
      extractedFacts: coerceStringArray(payload.extractedFacts, analysis.riskFlags),
      followUps: coerceStringArray(payload.followUps, analysis.nextActions),
      parsedDocuments: coerceDocumentArray(payload.parsedDocuments, files),
      aiEnabled: true,
      model: DEFAULT_MODEL
    };
  } catch (error) {
    const reason =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : "The OpenAI request did not complete successfully.";

    return buildFallbackEnrichment(
      claim,
      analysis,
      files,
      `OpenAI parsing was unavailable for this upload, so fallback analysis was used instead. ${reason}`
    );
  }
}

function buildFallbackEnrichment(
  claim: ClaimInput,
  analysis: AnalysisResult,
  files: File[],
  note: string
): ClaimEnrichment {
  const parsedDocuments: ParsedDocument[] = files.map((file) => ({
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    summary: "Document uploaded successfully. OpenAI parsing is not enabled in this environment yet.",
    keyFacts: [
      `File size: ${Math.max(1, Math.round(file.size / 1024))} KB`,
      `Detected type: ${file.type || "unknown"}`
    ],
    missingInfo: ["No AI extraction was performed."]
  }));

  return {
    aiSummary: `${claim.claimType} claim for ${claim.claimantName}. ${analysis.summary}`,
    claimantStory: claim.description,
    coverageSnapshot: `${analysis.recommendation} with score ${analysis.score}/100 and ${analysis.missingDocuments.length} missing required documents.`,
    extractedFacts: analysis.riskFlags,
    followUps: analysis.nextActions,
    parsedDocuments,
    aiEnabled: false,
    note
  };
}

function classifyUpload(file: File): SupportedUpload | null {
  if (file.size > 10 * 1024 * 1024) {
    return null;
  }

  if (file.type.startsWith("image/")) {
    return {
      file,
      transportType: "image"
    };
  }

  return {
    file,
    transportType: "file"
  };
}

async function toBase64(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  return bytes.toString("base64");
}

function parseJsonObject(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  return JSON.parse(candidate) as Record<string, unknown>;
}

function coerceString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function coerceStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const cleaned = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return cleaned.length > 0 ? cleaned : fallback;
}

function coerceDocumentArray(value: unknown, files: File[]): ParsedDocument[] {
  if (!Array.isArray(value) || value.length === 0) {
    return files.map((file) => ({
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      summary: "The file was reviewed, but no detailed extraction was returned.",
      keyFacts: [],
      missingInfo: []
    }));
  }

  return value.map((item, index) => {
    const source = files[index];
    const record = typeof item === "object" && item !== null ? item : {};

    return {
      filename: coerceString((record as Record<string, unknown>).filename, source?.name ?? `Document ${index + 1}`),
      mimeType: coerceString((record as Record<string, unknown>).mimeType, source?.type ?? "application/octet-stream"),
      summary: coerceString((record as Record<string, unknown>).summary, "No summary returned."),
      keyFacts: coerceStringArray((record as Record<string, unknown>).keyFacts, []),
      missingInfo: coerceStringArray((record as Record<string, unknown>).missingInfo, [])
    };
  });
}
