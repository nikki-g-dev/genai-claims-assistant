import { NextResponse } from "next/server";

import { sampleClaims } from "@/lib/sample-data";

export async function GET() {
  return NextResponse.json({
    claims: sampleClaims,
    total: sampleClaims.length
  });
}
