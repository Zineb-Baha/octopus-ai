"use client";

import { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { getSession } from "../../lib/auth";

const API_URL = "http://localhost:8000";

export default function CustomerPage() {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");
  const account = getSession();

  useEffect(() => {
    async function loadCases() {
      try {
        const response = await fetch(`${API_URL}/cases`);
        const data = await response.json();
        const cases = Array.isArray(data) ? data : [data];
        const customerCase = cases.find((item) =>
          item.customers?.some((customer) => customer.id === account?.customerId)
        );
        setCaseData(customerCase || null);
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, [account?.customerId]);

  const messages = caseData?.messages?.filter(
    (message) => message.customer_id === account?.customerId
  ) || [];

  async function sendMessage(event) {
    event.preventDefault();
    setSendStatus("");

    if (!messageText.trim() || !caseData || !account?.customerId) {
      return;
    }

    setSending(true);

    try {
      const response = await fetch(`${API_URL}/cases/${caseData.case_id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: account.customerId,
          text: messageText
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not send message.");
      }

      setCaseData((current) => ({
        ...current,
        messages: [...(current.messages || []), data]
      }));
      setMessageText("");
      setSendStatus("Message sent to the service team.");
    } catch (error) {
      setSendStatus(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="dashboard">
      <div className="dashboard-shell">
        <TopNav />
        <section className="dashboard-content">
          <header className="dashboard-header">
            <div>
              <h1>My service case</h1>
              <p>Private view for {account?.customerId || "your customer account"}.</p>
            </div>
          </header>

          {loading ? (
            <div className="case-preview"><strong>Loading your case...</strong></div>
          ) : caseData ? (
            <>
              <div className="case-preview customer-case-banner">
                <div>
                  <strong>{caseData.case_id}</strong>
                  <p>Your service request and adviser updates.</p>
                </div>
                <span className="customer-status">Private</span>
              </div>

              <section className="panel customer-panel">
                <h2>My messages</h2>
                {messages.map((message) => (
                  <div className="message-history" key={message.id}>
                    <div><strong>{message.channel}</strong><span>{message.id}</span></div>
                    <p>{message.text}</p>
                  </div>
                ))}
              </section>

              <section className="panel customer-panel">
                <h2>Latest service update</h2>
                <p>{caseData.jobs?.[0]?.crm_state || "Your adviser will update you soon."}</p>
              </section>

              <section className="panel customer-panel ask-team-panel">
                <h2>Ask the service team</h2>
                <form onSubmit={sendMessage}>
                  <textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    placeholder="Write a question or update for your adviser..."
                    aria-label="Message for the service team"
                    required
                  />
                  <button type="submit" disabled={sending || !messageText.trim()}>
                    {sending ? "Sending..." : "Send message"}
                  </button>
                </form>
                {sendStatus && <p className="message-status" role="status">{sendStatus}</p>}
              </section>
            </>
          ) : (
            <div className="case-preview"><strong>No case found for this customer.</strong></div>
          )}
        </section>
      </div>
    </main>
  );
}
