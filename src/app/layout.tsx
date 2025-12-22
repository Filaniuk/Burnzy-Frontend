
// src/app/layout.tsx
import "../styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fontAnton, fontBebas, fontInter, fontMontserrat, fontOswald, fontRoboto } from "./fonts";

export const metadata = {
  title: "Burnzy",
  description: "Smart YouTube analysis and strategy generator",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={[
        fontInter.variable,
        fontMontserrat.variable,
        fontRoboto.variable,
        fontOswald.variable,
        fontAnton.variable,
        fontBebas.variable,
      ].join(" ")}
    >
      <body className="bg-[#0F0E17] text-white">
        <AuthProvider>
          <Header />
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-10">
            <main>{children}</main>
            <div id="drag-portal" />
          </div>

          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
