"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Clock, User, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const path = usePathname();
  const { user } = useAuth();

  // Don't show navbar on auth page
  if (path === "/auth") return null;

  const links = [
    { href: "/",        label: "Map",     icon: Map   },
    { href: "/history", label: "History", icon: Clock },
    { href: user ? "/profile" : "/auth", label: user ? "Profile" : "Sign In", icon: user ? User : LogIn },
  ];

  return (
    <nav className="bg-white border-t border-gray-100 safe-bottom">
      <div className="flex">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors text-xs font-semibold",
                active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              {label}
              {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
