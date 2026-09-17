import "./globals.css";

export const metadata = {
  title: "ServiceFlow AI",
  description: "AI-assisted dealership service workflow"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}