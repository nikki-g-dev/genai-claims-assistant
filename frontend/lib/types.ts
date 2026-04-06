export type ClaimStatus = "New" | "In Review" | "Needs Documents" | "Approved" | "Escalated";

export type ClaimType =
  | "Medical"
  | "Auto"
  | "Travel"
  | "Property"
  | "Prescription"
  | "Dental";

export interface ClaimInput {
  claimantName: string;
  policyNumber: string;
  claimType: ClaimType;
  amount: number;
  incidentDate: string;
  submittedDate: string;
  description: string;
  documents: string[];
  priorClaims: number;
  urgent: boolean;
}

export interface ClaimRecord extends ClaimInput {
  id: string;
  status: ClaimStatus;
}

export interface AnalysisResult {
  score: number;
  recommendation: "Approve Fast-Track" | "Manual Review" | "Escalate";
  summary: string;
  riskFlags: string[];
  missingDocuments: string[];
  nextActions: string[];
  estimatedResolution: string;
}

export interface ParsedDocument {
  filename: string;
  mimeType: string;
  summary: string;
  keyFacts: string[];
  missingInfo: string[];
}

export interface ClaimEnrichment {
  aiSummary: string;
  claimantStory: string;
  coverageSnapshot: string;
  extractedFacts: string[];
  followUps: string[];
  parsedDocuments: ParsedDocument[];
  aiEnabled: boolean;
  model?: string;
  note?: string;
}
