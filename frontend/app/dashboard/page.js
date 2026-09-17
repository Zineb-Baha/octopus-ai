"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "../components/TopNav";
import { API_URL } from "../../lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCases() {
      try {
        const response = await fetch(`${API_URL}/cases`);
        const data = await response.json();
        const list = Array.isArray(data) ? data : [data];
        setCases(list);
      } catch (error) {
        console.error("Failed to load cases", error);
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, []);

  const openCases = cases.length;
  const needsReview = cases.filter((item) => item?.messages?.length > 1).length;
  const waiting = cases.filter((item) => item?.jobs?.some((job) => job?.quality_check === "pending")).length;
  const customers = cases.flatMap((singleCase) =>
    (singleCase.customers || []).map((customer) => {
      const messages = (singleCase.messages || []).filter(
        (message) => message.customer_id === customer.id
      );

      return {
        ...customer,
        caseId: singleCase.case_id,
        messages,
        latestMessage: messages[messages.length - 1]
      };
    })
  );

  return (
    <main className="dashboard">
      <div className="dashboard-shell">
        <TopNav />

        <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>
              Customer service workflow overview.
            </p>
          </div>

          <div className="user-email">
            demo@serviceflow.ai
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Open cases</span>
            <strong>{loading ? "..." : openCases}</strong>
          </div>

          <div className="stat-card">
            <span>Needs review</span>
            <strong>{loading ? "..." : needsReview}</strong>
          </div>

          <div className="stat-card">
            <span>Waiting</span>
            <strong>{loading ? "..." : waiting}</strong>
          </div>

          <div className="stat-card">
            <span>Customers</span>
            <strong>{loading ? "..." : customers.length}</strong>
          </div>
        </div>

        <div className="recent-section">
          <h2>Customers to analyse</h2>

          {loading ? (
            <div className="case-preview">
              <div>
                <strong>Loading customers...</strong>
              </div>
            </div>
          ) : customers.length === 0 ? (
            <div className="case-preview">
              <div>
                <strong>No customers assigned</strong>
              </div>
            </div>
          ) : (
            customers.map((customer) => (
              <div className="case-preview" key={`${customer.caseId}-${customer.id}`}>
                <div>
                  <strong>{customer.id}</strong>
                  <p>
                    Case {customer.caseId} · {customer.preferred_language} · {customer.contact_permission}
                  </p>
                  <small>
                    {customer.messages.length} question{customer.messages.length === 1 ? "" : "s"}
                    {customer.latestMessage ? ` · ${customer.latestMessage.text}` : ""}
                  </small>
                </div>

                <button
                  onClick={() => router.push(`/cases/${customer.caseId}?customerId=${customer.id}`)}
                >
                  Analyse customer
                </button>
              </div>
            ))
          )}
        </div>

        <div className="recent-section">
          <h2>Recent cases</h2>

          {loading ? (
            <div className="case-preview">
              <div>
                <strong>Loading...</strong>
              </div>
            </div>
          ) : (
            cases.map((singleCase) => (
              <div className="case-preview" key={singleCase.case_id}>
                <div>
                  <strong>{singleCase.case_id}</strong>
                  <p>
                    {singleCase.messages?.[0]?.text || "No customer message available"}
                  </p>
                  <small>
                    {singleCase.jobs?.[0]?.updated_at
                      ? `Updated ${singleCase.jobs[0].updated_at}`
                      : "Date unavailable"}
                  </small>
                </div>

                <button onClick={() => router.push(`/cases/${singleCase.case_id}`)}>
                  Open
                </button>
              </div>
            ))
          )}
        </div>
        </section>
      </div>
    </main>
  );
}