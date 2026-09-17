export const DEMO_ACCOUNTS = [
  {
    email: "admin@serviceflow.ai",
    password: "admin123",
    name: "Platform Admin",
    role: "admin",
    initials: "PA"
  },
  {
    email: "team@serviceflow.ai",
    password: "team123",
    name: "Service Team",
    role: "team",
    initials: "ST"
  },
  {
    email: "customer@serviceflow.ai",
    password: "customer123",
    name: "Customer CUS-A",
    role: "customer",
    customerId: "CUS-A",
    initials: "CA"
  },
  {
    email: "customer-b@serviceflow.ai",
    password: "customerb123",
    name: "Customer CUS-B",
    role: "customer",
    customerId: "CUS-B",
    initials: "CB"
  }
];

export function getAccount(email, password) {
  return DEMO_ACCOUNTS.find(
    (account) => account.email === email && account.password === password
  );
}

export function saveSession(account) {
  if (typeof window !== "undefined") {
    localStorage.setItem("serviceflow-session", JSON.stringify(account));
  }
}

export function getSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(localStorage.getItem("serviceflow-session"));
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("serviceflow-session");
  }
}
