import { NextRequest, NextResponse } from "next/server";

import { analyzeClaim } from "@/lib/claim-analysis";
import { ClaimInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  const input = (await request.json()) as ClaimInput;

  const missingCoreFields = [
    input.claimantName,
    input.policyNumber,
    input.claimType,
    input.description,
    input.incidentDate,
    input.submittedDate
  ].some((value) => !value);

  if (missingCoreFields || Number.isNaN(input.amount)) {
    return NextResponse.json(
      {
        error: "Please provide all required claim fields before analysis."
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    result: analyzeClaim(input)
  });
}
