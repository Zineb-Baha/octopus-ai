"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "../components/TopNav";

const API_URL = "http://localhost:8000";

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCases() {
      try {
        const response = await fetch(`${API_URL}/cases`);
        const data = await response.json();
        setCases(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Failed to load cases", error);
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, []);

  return (
    <main className="dashboard">
      <div className="dashboard-shell">
        <TopNav />

        <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>Cases</h1>
            <p>Review customer service cases.</p>
          </div>
        </header>

        {loading ? (
          <div className="case-preview">
            <div>
              <strong>Loading cases...</strong>
            </div>
          </div>
        ) : (
          cases.map((singleCase) => (
            <section className="case-customer-group" key={singleCase.case_id}>
              <div className="case-group-heading">
                <div>
                  <span className="case-group-label">CASE</span>
                  <strong>{singleCase.case_id}</strong>
                </div>
                <small>{singleCase.messages?.length || 0} customer questions</small>
              </div>

              {singleCase.customers?.map((customer) => {
                const customerMessages = singleCase.messages?.filter(
                  (message) => message.customer_id === customer.id
                ) || [];

                return (
                  <div className="case-preview customer-case-row" key={customer.id}>
                    <div>
                      <strong>{customer.id}</strong>
                      <p>{customer.preferred_language} · {customer.contact_permission}</p>
                      <small>{customerMessages.length} questions in this case</small>
                    </div>

                    <button onClick={() => router.push(`/cases/${singleCase.case_id}?customerId=${customer.id}`)}>
                      View questions
                    </button>
                  </div>
                );
              })}
            </section>
          ))
        )}
        </section>
      </div>
    </main>
  );
}