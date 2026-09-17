"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getSession } from "../../lib/auth";

export default function TopNav() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const account = getSession();

  function logout() {
    clearSession();
    router.push("/");
  }

  const homePath = account?.role === "admin" ? "/admin" : account?.role === "customer" ? "/customer" : "/dashboard";

  return (
    <header className="top-nav">
      <button className="brand" onClick={() => router.push(homePath)}>
        <span className="brand-mark">SF</span>
        <span>ServiceFlow AI</span>
      </button>

      <nav className="top-nav-links" aria-label="Main navigation">
        {account?.role === "admin" && <button onClick={() => router.push("/admin")}>Admin</button>}
        {account?.role !== "customer" && <button onClick={() => router.push("/dashboard")}>Dashboard</button>}
        <button onClick={() => router.push(account?.role === "customer" ? "/customer" : "/cases")}>Cases</button>
      </nav>

      <div className="profile-menu">
        <button
          className="profile-button"
          onClick={() => setProfileOpen((open) => !open)}
          aria-expanded={profileOpen}
          aria-haspopup="menu"
        >
          <span className="profile-avatar">{account?.initials || "GU"}</span>
          <span className="profile-info">
            <strong>{account?.name || "Guest"}</strong>
            <small>{account?.role || "guest"}</small>
          </span>
          <span className="profile-chevron">⌄</span>
        </button>

        {profileOpen && (
          <div className="profile-dropdown" role="menu">
            <button onClick={logout} role="menuitem">Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
