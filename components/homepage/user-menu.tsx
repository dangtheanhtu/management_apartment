"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Session } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings, LayoutDashboard } from "lucide-react";

interface UserMenuProps {
  session: Session;
}

export default function UserMenu({ session }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-10 w-10 rounded-full ring-2 ring-slate-200 hover:ring-blue-500 transition-all focus:outline-none focus:ring-blue-500"
      >
        <Avatar className="h-10 w-10">
          {session.user?.avatarUrl && (
            <AvatarImage src={session.user.avatarUrl} alt={session.user?.name || ""} />
          )}
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
            {getInitials(session.user?.name)}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-[9999]">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-sm font-medium text-slate-900">{session.user?.name || "User"}</p>
            <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <LayoutDashboard className="mr-3 h-4 w-4" />
              Dashboard
            </Link>

            <Link
              href={session.user?.role === "ADMIN" ? "/admin/profile" : "/resident/profile"}
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <User className="mr-3 h-4 w-4" />
              Tài khoản
            </Link>

            <Link
              href={session.user?.role === "ADMIN" ? "/admin/settings" : "/resident/settings"}
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Settings className="mr-3 h-4 w-4" />
              Cài đặt
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-200 py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
