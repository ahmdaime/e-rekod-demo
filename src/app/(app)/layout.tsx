import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import Link from "next/link";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 text-center text-base md:text-lg">
        <span className="mr-2 font-medium">Ini versi demo &mdash; data tidak disimpan.</span>
        <Link
          href="/landing"
          className="inline-flex items-center font-bold underline underline-offset-4 decoration-2 hover:text-purple-200 transition-colors"
        >
          Daftar Senarai Menunggu &rarr;
        </Link>
      </div>
      <Navbar />
      <main>{children}</main>
    </AuthProvider>
  );
}
