import { ClaimForm } from "@/components/claim-form";
import { sampleClaims } from "@/lib/sample-data";

export default function HomePage() {
  return <ClaimForm claims={sampleClaims} />;
}
