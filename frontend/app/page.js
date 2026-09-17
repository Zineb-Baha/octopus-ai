"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAccount, saveSession } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(event) {
    event.preventDefault();
    setError("");

    const account = getAccount(email, password);

    if (!account) {
      setError("Invalid account. Use one of the demo profiles below.");
      return;
    }

    saveSession(account);
    router.push(account.role === "admin" ? "/admin" : account.role === "customer" ? "/customer" : "/dashboard");
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="logo">SF</div>

        <h1>ServiceFlow AI</h1>

        <p className="subtitle">
          Customer service assistant
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
          >
            Sign in
          </button>
        </form>

        <div className="demo-accounts">
          <strong>Demo accounts</strong>
          <span>Admin: admin@serviceflow.ai / admin123</span>
          <span>Team: team@serviceflow.ai / team123</span>
          <span>Customer CUS-A: customer@serviceflow.ai / customer123</span>
          <span>Customer CUS-B: customer-b@serviceflow.ai / customerb123</span>
        </div>
      </div>
    </main>
  );
}