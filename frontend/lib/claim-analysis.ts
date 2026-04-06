import { AnalysisResult, ClaimInput, ClaimType } from "@/lib/types";

const requiredDocuments: Record<ClaimType, string[]> = {
  Medical: ["ID Proof", "Hospital Bill", "Physician Note"],
  Auto: ["ID Proof", "Repair Estimate", "Police Report", "Photos"],
  Travel: ["ID Proof", "Booking Receipt", "Airline Notice"],
  Property: ["ID Proof", "Damage Photos", "Repair Estimate", "Ownership Proof"],
  Prescription: ["ID Proof", "Pharmacy Bill", "Prescription"],
  Dental: ["ID Proof", "Dental Invoice", "Treatment Note"]
};

export function analyzeClaim(input: ClaimInput): AnalysisResult {
  const riskFlags: string[] = [];
  const nextActions: string[] = [];
  let score = 92;

  const missingDocuments = requiredDocuments[input.claimType].filter(
    (document) => !input.documents.includes(document)
  );

  if (missingDocuments.length > 0) {
    score -= missingDocuments.length * 12;
    riskFlags.push("Required supporting documents are missing.");
    nextActions.push(`Collect: ${missingDocuments.join(", ")}.`);
  }

  if (input.amount > 10000) {
    score -= 18;
    riskFlags.push("High claim amount exceeds rapid-processing threshold.");
    nextActions.push("Route to senior adjuster for high-value approval.");
  } else if (input.amount > 5000) {
    score -= 8;
    riskFlags.push("Mid-sized claim amount needs estimate validation.");
    nextActions.push("Confirm estimate or invoice totals before payout.");
  }

  if (input.priorClaims >= 3) {
    score -= 20;
    riskFlags.push("Claimant has a high recent claims frequency.");
    nextActions.push("Review policy history for repeated loss patterns.");
  } else if (input.priorClaims > 0) {
    score -= input.priorClaims * 4;
  }

  const daysBetweenIncidentAndSubmission = calculateDays(input.incidentDate, input.submittedDate);
  if (daysBetweenIncidentAndSubmission > 30) {
    score -= 14;
    riskFlags.push("Late submission may require exception approval.");
    nextActions.push("Request explanation for delayed filing.");
  } else if (daysBetweenIncidentAndSubmission < 0) {
    score -= 35;
    riskFlags.push("Submission date precedes incident date.");
    nextActions.push("Correct invalid timeline before processing.");
  }

  if (input.description.trim().length < 50) {
    score -= 10;
    riskFlags.push("Incident description is too brief for confident assessment.");
    nextActions.push("Ask claimant for a clearer narrative of the incident.");
  }

  if (input.urgent) {
    nextActions.push("Prioritize same-day communication because this claim is marked urgent.");
  }

  score = Math.max(8, Math.min(99, score));

  let recommendation: AnalysisResult["recommendation"] = "Approve Fast-Track";
  if (score < 80) {
    recommendation = "Manual Review";
  }
  if (score < 60 || missingDocuments.length >= 2) {
    recommendation = "Escalate";
  }

  const estimatedResolution =
    recommendation === "Approve Fast-Track"
      ? "24-48 hours"
      : recommendation === "Manual Review"
        ? "2-4 business days"
        : "5-7 business days";

  if (riskFlags.length === 0) {
    riskFlags.push("No critical issues detected from the submitted data.");
  }

  if (nextActions.length === 0) {
    nextActions.push("Generate payment authorization and notify claimant.");
  }

  return {
    score,
    recommendation,
    summary: buildSummary(input, score, recommendation, missingDocuments),
    riskFlags,
    missingDocuments,
    nextActions,
    estimatedResolution
  };
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}

function buildSummary(
  input: ClaimInput,
  score: number,
  recommendation: AnalysisResult["recommendation"],
  missingDocuments: string[]
): string {
  const documentNote =
    missingDocuments.length === 0
      ? "All expected documents are present."
      : `Missing ${missingDocuments.length} required document(s).`;

  return `${input.claimType} claim for ${formatCurrency(input.amount)} scored ${score}/100. ${documentNote} Recommended path: ${recommendation}.`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}
