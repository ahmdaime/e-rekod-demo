import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "e-Rekod — Sistem Rekod PBD & Sahsiah Digital",
  description: "Sistem pengurusan rekod PBD, token sahsiah, dan bukti PSV untuk guru sekolah rendah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
