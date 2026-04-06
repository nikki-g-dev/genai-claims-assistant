import { ClaimRecord } from "@/lib/types";

export const sampleClaims: ClaimRecord[] = [
  {
    id: "CLM-1042",
    claimantName: "Ava Thompson",
    policyNumber: "POL-900184",
    claimType: "Medical",
    amount: 1840,
    incidentDate: "2026-03-12",
    submittedDate: "2026-03-14",
    description: "Emergency room visit after a fall with x-ray and follow-up medication.",
    documents: ["ID Proof", "Hospital Bill", "Physician Note"],
    priorClaims: 0,
    urgent: true,
    status: "In Review"
  },
  {
    id: "CLM-1043",
    claimantName: "Marcus Reed",
    policyNumber: "POL-771028",
    claimType: "Auto",
    amount: 9200,
    incidentDate: "2026-02-28",
    submittedDate: "2026-03-01",
    description: "Rear-end collision with bumper and trunk repair estimate plus towing receipt.",
    documents: ["ID Proof", "Repair Estimate", "Police Report", "Photos"],
    priorClaims: 2,
    urgent: false,
    status: "Needs Documents"
  },
  {
    id: "CLM-1044",
    claimantName: "Priya Sharma",
    policyNumber: "POL-661590",
    claimType: "Travel",
    amount: 1260,
    incidentDate: "2026-03-21",
    submittedDate: "2026-03-22",
    description: "Flight cancellation and hotel stay due to severe weather interruption.",
    documents: ["ID Proof", "Booking Receipt", "Airline Notice"],
    priorClaims: 1,
    urgent: false,
    status: "New"
  }
];
