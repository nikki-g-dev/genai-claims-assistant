"use client";

import { FormEvent, useRef, useState } from "react";

import { AnalysisResult, ClaimEnrichment, ClaimInput, ClaimRecord, ClaimType } from "@/lib/types";

const documentOptions = [
  "ID Proof",
  "Hospital Bill",
  "Physician Note",
  "Repair Estimate",
  "Police Report",
  "Photos",
  "Booking Receipt",
  "Airline Notice",
  "Damage Photos",
  "Ownership Proof",
  "Pharmacy Bill",
  "Prescription",
  "Dental Invoice",
  "Treatment Note"
];

const claimTypes: ClaimType[] = ["Medical", "Auto", "Travel", "Property", "Prescription", "Dental"];

const initialForm: ClaimInput = {
  claimantName: "Jordan Lee",
  policyNumber: "POL-550217",
  claimType: "Medical",
  amount: 3200,
  incidentDate: "2026-03-18",
  submittedDate: "2026-03-20",
  description:
    "Claimant visited urgent care after a workplace slip, including imaging, treatment, and prescribed medication for recovery over three days.",
  documents: ["ID Proof", "Hospital Bill", "Physician Note"],
  priorClaims: 1,
  urgent: true
};

interface ClaimFormProps {
  claims: ClaimRecord[];
}

export function ClaimForm({ claims }: ClaimFormProps) {
  const [form, setForm] = useState<ClaimInput>(initialForm);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [enrichment, setEnrichment] = useState<ClaimEnrichment | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const errorRef = useRef<HTMLParagraphElement | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatusMessage("Analyzing claim and uploaded documents...");

    try {
      const payload = new FormData();
      payload.append("claim", JSON.stringify(form));
      for (const file of files) {
        payload.append("documents", file);
      }

      const response = await fetch("/api/claim-assistant", {
        method: "POST",
        body: payload
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Analysis failed.");
      }

      const body = (await response.json()) as {
        analysis: AnalysisResult;
        enrichment: ClaimEnrichment;
      };
      setResult(body.analysis);
      setEnrichment(body.enrichment);
      setStatusMessage("Analysis complete. Review the recommendation and document parsing below.");
      window.requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (submissionError) {
      setResult(null);
      setEnrichment(null);
      const message =
        submissionError instanceof Error ? submissionError.message : "Something went wrong.";
      setError(message);
      setStatusMessage("");
      window.requestAnimationFrame(() => {
        errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } finally {
      setLoading(false);
    }
  }

  function toggleDocument(document: string) {
    setForm((current) => ({
      ...current,
      documents: current.documents.includes(document)
        ? current.documents.filter((item) => item !== document)
        : [...current.documents, document]
    }));
  }

  function updateFiles(selection: FileList | null) {
    setFiles(selection ? Array.from(selection) : []);
  }

  return (
    <div className="workspace">
      <section className="panel hero-panel">
        <p className="eyebrow">GenAI Claims Assistant</p>
        <h1>Review, triage, and explain claims in one focused workspace.</h1>
        <p className="hero-copy">
          This demo combines intake, risk scoring, missing-document detection, and next-step
          guidance for adjusters or support teams.
        </p>
        <div className="stats-grid">
          <div>
            <span>Processing engine</span>
            <strong>Realtime claim scoring</strong>
          </div>
          <div>
            <span>Average turnaround</span>
            <strong>24 to 48 hours</strong>
          </div>
          <div>
            <span>Claims in queue</span>
            <strong>{claims.length}</strong>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">New claim</p>
              <h2>Claim intake</h2>
            </div>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Claim"}
            </button>
          </div>

          <div className="field-grid">
            <label>
              Claimant name
              <input
                value={form.claimantName}
                onChange={(event) => setForm({ ...form, claimantName: event.target.value })}
                required
              />
            </label>
            <label>
              Policy number
              <input
                value={form.policyNumber}
                onChange={(event) => setForm({ ...form, policyNumber: event.target.value })}
                required
              />
            </label>
            <label>
              Claim type
              <select
                value={form.claimType}
                onChange={(event) =>
                  setForm({ ...form, claimType: event.target.value as ClaimType })
                }
              >
                {claimTypes.map((claimType) => (
                  <option key={claimType} value={claimType}>
                    {claimType}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Claim amount
              <input
                type="number"
                min="0"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })}
                required
              />
            </label>
            <label>
              Incident date
              <input
                type="date"
                value={form.incidentDate}
                onChange={(event) => setForm({ ...form, incidentDate: event.target.value })}
                required
              />
            </label>
            <label>
              Submitted date
              <input
                type="date"
                value={form.submittedDate}
                onChange={(event) => setForm({ ...form, submittedDate: event.target.value })}
                required
              />
            </label>
            <label>
              Prior claims
              <input
                type="number"
                min="0"
                value={form.priorClaims}
                onChange={(event) =>
                  setForm({ ...form, priorClaims: Number(event.target.value) })
                }
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.urgent}
                onChange={(event) => setForm({ ...form, urgent: event.target.checked })}
              />
              Mark as urgent
            </label>
          </div>

          <label className="full-width">
            Incident description
            <textarea
              rows={5}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              required
            />
          </label>

          <div className="document-block">
            <p>Available documents</p>
            <div className="chip-grid">
              {documentOptions.map((document) => (
                <button
                  className={form.documents.includes(document) ? "chip chip-active" : "chip"}
                  key={document}
                  onClick={() => toggleDocument(document)}
                  type="button"
                >
                  {document}
                </button>
              ))}
            </div>
          </div>

          <label className="full-width">
            Upload supporting documents
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,.png,.jpg,.jpeg,.webp"
              multiple
              onChange={(event) => updateFiles(event.target.files)}
            />
          </label>

          {files.length > 0 ? (
            <div className="upload-list">
              {files.map((file) => (
                <div className="upload-item" key={`${file.name}-${file.size}`}>
                  <strong>{file.name}</strong>
                  <span>{Math.max(1, Math.round(file.size / 1024))} KB</span>
                </div>
              ))}
            </div>
          ) : null}

          {statusMessage ? <p className="status-text">{statusMessage}</p> : null}
          {error ? (
            <p className="error-text" ref={errorRef}>
              {error}
            </p>
          ) : null}
        </form>

        <aside className="results-stack" ref={resultsRef}>
          <div className="panel result-panel">
            <div className="panel-heading compact">
              <div>
                <p className="eyebrow">Decision support</p>
                <h2>AI recommendation</h2>
              </div>
              {result ? <span className="score-pill">{result.score}/100</span> : null}
            </div>

            {result ? (
              <>
                <div className="recommendation-card">
                  <span>Recommended path</span>
                  <strong>{result.recommendation}</strong>
                  <p>{result.summary}</p>
                </div>

                <div className="list-block">
                  <h3>Risk flags</h3>
                  <ul>
                    {result.riskFlags.map((flag) => (
                      <li key={flag}>{flag}</li>
                    ))}
                  </ul>
                </div>

                <div className="list-block">
                  <h3>Next actions</h3>
                  <ul>
                    {result.nextActions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>

                <div className="resolution-box">
                  <span>Estimated resolution</span>
                  <strong>{result.estimatedResolution}</strong>
                </div>

                <div className="list-block">
                  <h3>AI claim summary</h3>
                  <div className="ai-summary-card">
                    <p>{enrichment?.aiSummary ?? "No AI summary generated yet."}</p>
                    {enrichment?.note ? <small>{enrichment.note}</small> : null}
                  </div>
                </div>

                {enrichment ? (
                  <>
                    <div className="list-block">
                      <h3>Claimant story</h3>
                      <p className="support-copy">{enrichment.claimantStory}</p>
                    </div>

                    <div className="list-block">
                      <h3>Coverage snapshot</h3>
                      <p className="support-copy">{enrichment.coverageSnapshot}</p>
                    </div>

                    <div className="list-block">
                      <h3>Extracted facts</h3>
                      <ul>
                        {enrichment.extractedFacts.map((fact) => (
                          <li key={fact}>{fact}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="list-block">
                      <h3>Document parsing</h3>
                      <div className="parsed-documents">
                        {enrichment.parsedDocuments.length > 0 ? (
                          enrichment.parsedDocuments.map((document) => (
                            <article className="parsed-document" key={document.filename}>
                              <div className="queue-topline">
                                <strong>{document.filename}</strong>
                                <span>{document.mimeType}</span>
                              </div>
                              <p className="support-copy">{document.summary}</p>
                              {document.keyFacts.length > 0 ? (
                                <ul>
                                  {document.keyFacts.map((fact) => (
                                    <li key={fact}>{fact}</li>
                                  ))}
                                </ul>
                              ) : null}
                              {document.missingInfo.length > 0 ? (
                                <p className="support-copy">
                                  Missing info: {document.missingInfo.join(", ")}
                                </p>
                              ) : null}
                            </article>
                          ))
                        ) : (
                          <p className="support-copy">
                            Upload files to generate document-level extraction and summarization.
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : null}
              </>
            ) : (
              <p className="empty-state">
                Submit the form to generate a recommendation, AI claim summary, document parsing,
                and adjuster action plan.
              </p>
            )}
          </div>

          <div className="panel queue-panel">
            <div className="panel-heading compact">
              <div>
                <p className="eyebrow">Live queue</p>
                <h2>Sample claims</h2>
              </div>
            </div>

            <div className="queue-list">
              {claims.map((claim) => (
                <article className="queue-item" key={claim.id}>
                  <div className="queue-topline">
                    <strong>{claim.id}</strong>
                    <span>{claim.status}</span>
                  </div>
                  <p>{claim.claimantName}</p>
                  <small>
                    {claim.claimType} · ${claim.amount.toLocaleString()} · {claim.policyNumber}
                  </small>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
