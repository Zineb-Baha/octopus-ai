"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function SignupPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSignup(event) {

    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    if (!supabase) {
      setError("Supabase is not configured. Add the public Supabase variables to .env.local.");
      setLoading(false);
      return;
    }

    const { error } =
      await supabase.auth.signUp({
        email,
        password
      });

    if (error) {

      setError(error.message);
      setLoading(false);

      return;
    }

    setMessage(
      "Account created. Please check your email if confirmation is required."
    );

    setLoading(false);
  }

  return (
    <main className="auth-page">

      <div className="auth-card">

        <div className="logo">
          SF
        </div>

        <h1>
          Create your account
        </h1>

        <p className="subtitle">
          Start using ServiceFlow AI
        </p>

        <form onSubmit={handleSignup}>

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>

          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              minLength={6}
              required
            />

          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create account"}
          </button>

        </form>

        <p className="auth-footer">

          Already have an account?

          {" "}

          <button
            className="link-button"
            onClick={() =>
              router.push("/")
            }
          >
            Sign in
          </button>

        </p>

      </div>

    </main>
  );
}