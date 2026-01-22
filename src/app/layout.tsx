import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Toast } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Sistem Rekod PBD & Sahsiah",
  description: "Sistem pengurusan rekod PBD dan sahsiah murid untuk guru sekolah rendah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <main>{children}</main>
        <Toast />
      </body>
    </html>
  );
}
