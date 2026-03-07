"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { Anchor, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Render a consistent placeholder on server and during hydration
  if (!mounted || isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-white shadow-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <Anchor className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-xl font-bold text-primary">Shipyard</span>
          </Link>
          <div className="w-20 h-9"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-white shadow-sm">
      <div className="flex items-center justify-between px-8 py-4">
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <Anchor className="w-6 h-6 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-xl font-bold text-primary">Shipyard</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/signin">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
