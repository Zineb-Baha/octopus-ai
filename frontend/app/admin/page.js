"use client";

import { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { API_URL } from "../../lib/api";

export default function AdminPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCases() {
      try {
        const response = await fetch(`${API_URL}/cases`);
        const data = await response.json();
        setCases(Array.isArray(data) ? data : [data]);
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, []);

  const customers = cases.flatMap((singleCase) => singleCase.customers || []);
  const messages = cases.flatMap((singleCase) => singleCase.messages || []);
  const jobs = cases.flatMap((singleCase) => singleCase.jobs || []);

  return (
    <main className="dashboard">
      <div className="dashboard-shell">
        <TopNav />
        <section className="dashboard-content">
          <header className="dashboard-header">
            <div>
              <h1>Admin control room</h1>
              <p>Full access to customers, messages, jobs, rules, and cases.</p>
            </div>
          </header>

          <div className="stats-grid">
            <div className="stat-card"><span>Cases</span><strong>{loading ? "..." : cases.length}</strong></div>
            <div className="stat-card"><span>Customers</span><strong>{loading ? "..." : customers.length}</strong></div>
            <div className="stat-card"><span>Messages</span><strong>{loading ? "..." : messages.length}</strong></div>
          </div>

          <div className="admin-grid">
            <section className="panel admin-panel">
              <h2>Customer accounts</h2>
              {customers.map((customer) => (
                <div className="admin-row" key={customer.id}>
                  <strong>{customer.id}</strong>
                  <span>{customer.preferred_language} · {customer.contact_permission}</span>
                </div>
              ))}
            </section>

            <section className="panel admin-panel">
              <h2>Jobs and system state</h2>
              {jobs.map((job) => (
                <div className="admin-row" key={job.id}>
                  <strong>{job.id}</strong>
                  <span>{job.crm_state} · {job.updated_at}</span>
                </div>
              ))}
            </section>
          </div>

          <section className="panel admin-panel admin-messages">
            <h2>All incoming messages</h2>
            {messages.map((message) => (
              <div className="admin-row" key={message.id}>
                <strong>{message.id} · {message.customer_id}</strong>
                <span>{message.channel}: {message.text}</span>
              </div>
            ))}
          </section>
        </section>
      </div>
    </main>
  );
}
