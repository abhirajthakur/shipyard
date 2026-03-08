"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (user && !isLoading) {
      redirect("/dashboard");
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-[calc(100vh-4rem)] flex flex-col">
      <section className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Simple <span className="text-primary">Deployment</span> Management
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 text-balance">
              Build and deploy static sites from GitHub repositories with
              real-time logs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>

              <Link href="/signin">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Shipyard • Built by Abhiraj Thakur •
            <Link
              href="https://github.com/abhirajthakur/shipyard"
              target="_blank"
              rel="noopener noreferrer"
              className="underline ml-1"
            >
              GitHub
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
