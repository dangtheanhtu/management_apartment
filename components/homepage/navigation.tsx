"use client";

import { useState } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import UserMenu from "./user-menu";
import { Building2, Menu, X } from "lucide-react";

interface NavigationProps {
  session: Session | null;
}

export default function Navigation({ session }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StayEase
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/#apartments"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Căn hộ
            </Link>
            <Link
              href="/#amenities"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Tiện ích
            </Link>
            <Link
              href="/#community"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Cộng đồng
            </Link>
            <Link
              href="/#about"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Về chúng tôi
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <UserMenu session={session} />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90"
                >
                  <Link href="/register">Đăng ký</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col gap-2">
              <Link
                href="/#apartments"
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Căn hộ
              </Link>
              <Link
                href="/#amenities"
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tiện ích
              </Link>
              <Link
                href="/#community"
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cộng đồng
              </Link>
              <Link
                href="/#about"
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Về chúng tôi
              </Link>

              {session ? (
                <div className="pt-2 border-t border-slate-200 mt-2 px-4">
                  <UserMenu session={session} />
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-4 pt-2 border-t border-slate-200 mt-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Đăng nhập
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      Đăng ký
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
