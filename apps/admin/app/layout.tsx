import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super Admin Portal | Student Management Platform",
  description: "Executive Management Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
