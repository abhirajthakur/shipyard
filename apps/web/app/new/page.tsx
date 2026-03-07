"use client";

import { NewDeploymentForm } from "@/components/new-deployment-form";
import { ProtectedRoute } from "@/components/protected-route";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function NewDeploymentContent() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-8 py-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="border border-border rounded-2xl bg-card/50 p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                New Deployment
              </h1>
              <p className="text-muted-foreground">
                Deploy a static site from a GitHub repository.
              </p>
            </div>

            <NewDeploymentForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewDeploymentPage() {
  return (
    <ProtectedRoute>
      <NewDeploymentContent />
    </ProtectedRoute>
  );
}
