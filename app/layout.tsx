import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Investment Analyzer - AI-Powered Investment Analysis",
  description: "Analyze companies with Claude AI integration for informed investment decisions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
