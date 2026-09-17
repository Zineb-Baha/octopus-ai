"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "../components/TopNav";

const API_URL = "http://localhost:8000";

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