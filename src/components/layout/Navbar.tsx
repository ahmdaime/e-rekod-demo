"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Menu,
  X,
  Home,
  FileText,
  Image,
  Coins,
  Users,
  ChevronLeft,
  LogOut,
  LogIn,
  ClipboardCheck,
} from "lucide-react";

const teacherNavLinks = [
  { name: "Utama", path: "/", icon: Home },
  { name: "Rekod PBD", path: "/pbd", icon: FileText },
  { name: "Semakan Buku", path: "/semakan-buku", icon: ClipboardCheck },
  { name: "Bukti PSV", path: "/psv", icon: Image },
  { name: "Rekod Token", path: "/sahsiah", icon: Coins },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, signOut, loading } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const isParentPortal = pathname.startsWith("/parent");

  const handleLogout = async () => {
    await signOut();
    router.push("/landing");
  };

  // Parent Portal Navbar
  if (isParentPortal) {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {pathname !== "/parent" && (
                <Link
                  href="/parent"
                  className="mr-3 p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              )}
              <span className="text-lg font-bold text-indigo-700">
                Portal Ibu Bapa
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                title="Kembali ke Dashboard Guru"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              {pathname.includes("/parent/anak/") && (
                <Link
                  href="/parent"
                  className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" /> Keluar
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Teacher Navbar
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-blue-600 flex items-center gap-2"
            >
              <FileText className="w-6 h-6" />
              <span>e-Rekod Kelas</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {teacherNavLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <Link
              href="/parent"
              className="px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4" />
              Portal Ibu Bapa
            </Link>
            <div className="w-px h-6 bg-gray-200 mx-2" />
            {!loading && (
              isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Keluar
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 flex items-center gap-2 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Log Masuk
                </Link>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none transition-colors"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {teacherNavLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-3 rounded-lg text-base font-medium flex items-center gap-3 transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
            <div className="border-t border-gray-100 my-2" />
            <Link
              href="/parent"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-medium text-indigo-600 bg-indigo-50 flex items-center gap-3"
            >
              <Users className="w-5 h-5" />
              Portal Ibu Bapa
            </Link>
            <div className="border-t border-gray-100 my-2" />
            {!loading && (
              isAuthenticated ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full px-3 py-3 rounded-lg text-base font-medium text-red-600 bg-red-50 flex items-center gap-3"
                >
                  <LogOut className="w-5 h-5" />
                  Log Keluar
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 rounded-lg text-base font-medium text-green-600 bg-green-50 flex items-center gap-3"
                >
                  <LogIn className="w-5 h-5" />
                  Log Masuk
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
