
// src/app/layout.tsx
import "../styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "YT Analyzer",
  description: "AI-driven YouTube analysis and strategy generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0F0E17] text-white">
        <AuthProvider>
          <Header/>
          <div className="max-w-6xl mx-auto px-6">
            <main>{children}</main>
            <div id="drag-portal" />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
