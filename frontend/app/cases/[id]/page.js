"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import TopNav from "../../components/TopNav";

export default function CaseDetailPage() {

  const params = useParams();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [caseData, setCaseData] = useState(null);

  const [analysis, setAnalysis] = useState(null);

  const [selectedMessageId, setSelectedMessageId] = useState("");

  const [analysisError, setAnalysisError] = useState("");

  const [draftResponse, setDraftResponse] = useState("");

  const [editingResponse, setEditingResponse] = useState(false);

  const [approved, setApproved] = useState(false);

  const [loading, setLoading] = useState(true);

  const API_URL =
    "http://localhost:8000";

  useEffect(() => {

    async function loadCase() {

      try {

        const response = await fetch(
          `${API_URL}/cases/${params.id}`
        );

        const data = await response.json();

        setCaseData(data);
        const customerMessages = data.messages?.filter(
          (message) => !customerId || message.customer_id === customerId
        ) || [];
        setSelectedMessageId(customerMessages[0]?.id || "");

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }
    }

    loadCase();

  }, [params.id, customerId]);

  async function analyzeCase(messageId = selectedMessageId) {
    setAnalysisError("");
    setSelectedMessageId(messageId);

    try {
      const response = await fetch(
        `${API_URL}/cases/${params.id}/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message_id: messageId })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Gemini analysis failed.");
      }

      setAnalysis(data);
      setDraftResponse(data.proposed_response || "");
      setApproved(false);
      setEditingResponse(false);
    } catch (error) {
      setAnalysisError(error.message);
    }
  }

  function saveDraft() {
    setEditingResponse(false);
  }

  function approveResponse() {
    setEditingResponse(false);
    setApproved(true);
  }

  if (loading) {
    return (
      <div className="loading">
        Loading case...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="loading">
        Case not found.
      </div>
    );
  }

  const visibleMessages = caseData.messages?.filter(
    (message) => !customerId || message.customer_id === customerId
  ) || [];

  return (

    <main className="case-page">
      <TopNav />

      <header className="case-header">

        <div>
          <h1>ServiceFlow AI <span>— Adviser Hub</span></h1>

        </div>

        <div className="case-id">
          CASE ID: <strong>{caseData.case_id}</strong>
        </div>

      </header>

      <section className="case-grid">

        <div className="case-main">

          <div className="panel request-panel">

            <h2>
              ♙ Customer Requests
            </h2>

            {visibleMessages.length ? (
              visibleMessages.map((message) => (
                <div className={`message-box ${selectedMessageId === message.id ? "selected-message" : ""}`} key={message.id}>
                  <div className="message-box-header">
                    <strong>
                      {message.customer_id} · {message.channel}
                    </strong>
                    <button
                      className="message-analyze-button"
                      onClick={() => analyzeCase(message.id)}
                    >
                      {analysis?.analyzed_message?.id === message.id ? "Analyzed" : "Analyze"}
                    </button>
                  </div>
                  <p>{message.text}</p>
                </div>
              ))
            ) : (
              <div className="message-box">
                <p>No customer requests available.</p>
              </div>
            )}

          </div>

          <div className="panel evidence-panel">

            <div className="section-heading">
              <h2>Automated Evidence Retrieval</h2>
              <span>Cross-checked across systems</span>
            </div>

            {caseData.jobs?.map((job) => (
              <div className="evidence-card" key={job.id}>
                <span className="evidence-icon">{job.quality_check === "pending" ? "!" : "✓"}</span>
                <div>
                  <strong>{job.id}</strong>
                  <b className={job.quality_check === "pending" ? "warning" : "success-text"}>
                    {job.workshop_state || job.crm_state || job.quality_check || job.slot}
                  </b>
                  <small>{job.updated_at ? `Updated at ${job.updated_at}` : "No update time"}</small>
                </div>
              </div>
            ))}

          </div>

          <div className="panel">

            <h2>
              Customer messages
            </h2>

            {visibleMessages.map((message) => (

                <div
                  className="message-history"
                  key={message.id}
                >

                  <div>
                    <strong>
                      {message.customer_id} · {message.channel}
                    </strong>

                    <span>
                      {message.id}
                    </span>
                  </div>

                  <p>
                    {message.text}
                  </p>

                </div>

              ))}

          </div>

        </div>

        <aside className="case-sidebar">

          {!analysis && (

            <div className="panel">

              <h2>
                AI analysis
              </h2>

              <p>
                Select a question from {customerId || "a customer"} above to analyze it separately.
              </p>

              <button
                className="analyze-button full"
                onClick={() => analyzeCase(selectedMessageId || visibleMessages[0]?.id)}
                disabled={!visibleMessages.length}
              >
                Analyze with AI
              </button>

              {analysisError && (
                <div className="review-alert analysis-error" role="alert">
                  {analysisError}
                </div>
              )}

            </div>

          )}

          {analysis && (

            <>

              <div className="panel">

                <h2>
                  Decision
                </h2>

                {analysis.review_required ? (

                  <div className="review-alert">

                    <strong>
                      Review required
                    </strong>

                    <p>
                      The available information
                      contains a conflict.
                    </p>

                  </div>

                ) : (

                  <div className="safe-alert">

                    <strong>
                      No conflict detected
                    </strong>

                  </div>

                )}

              </div>

              <div className="panel">

                <h2>
                  AI findings
                </h2>

                {analysis.issues.map(
                  (issue, index) => (

                    <div
                      className="issue"
                      key={index}
                    >
                      ⚠ {issue}
                    </div>

                  )
                )}

              </div>

              <div className="panel">

                <h2>
                  Proposed response
                </h2>

                {editingResponse ? (
                  <textarea
                    className="proposal proposal-editor"
                    value={draftResponse}
                    onChange={(event) => setDraftResponse(event.target.value)}
                    aria-label="Proposed response"
                  />
                ) : (
                  <div className="proposal">
                    {draftResponse}
                  </div>
                )}

                <div className="actions">

                  <button onClick={() => editingResponse ? saveDraft() : setEditingResponse(true)}>
                    {editingResponse ? "Save" : "Edit"}
                  </button>

                  <button
                    className="approve-button"
                    onClick={approveResponse}
                    disabled={approved}
                  >
                    {approved ? "Approved & Sent" : "Approve"}
                  </button>

                </div>

                {approved && (
                  <div className="dispatch-success" role="status">
                    <strong>Action Successfully Completed</strong>
                    <p>
                      Response dispatched to {draftResponse ? "the customer" : "the case"}. Case {caseData.case_id} updated.
                    </p>
                  </div>
                )}

              </div>

            </>

          )}

        </aside>

      </section>

    </main>
  );
}