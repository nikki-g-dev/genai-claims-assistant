import { NextRequest, NextResponse } from "next/server";

import { analyzeClaim } from "@/lib/claim-analysis";
import { enrichClaimWithOpenAI } from "@/lib/openai-claim-assistant";
import { ClaimInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const claimPayload = formData.get("claim");

    if (typeof claimPayload !== "string") {
      return NextResponse.json({ error: "Missing claim payload." }, { status: 400 });
    }

    const claim = JSON.parse(claimPayload) as ClaimInput;
    const files = formData
      .getAll("documents")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const analysis = analyzeClaim(claim);
    const enrichment = await enrichClaimWithOpenAI(claim, analysis, files);

    return NextResponse.json({
      analysis,
      enrichment
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : "We could not analyze this claim right now.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
