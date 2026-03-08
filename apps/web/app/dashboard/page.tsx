"use client";

import DeploymentsTable from "@/components/deployments-table";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { getAllDeployments } from "@/lib/api";
import { Deployment } from "@shipyard/types";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function DashboardContent() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAllDeployments()
      .then((data) => {
        const sorted = data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setDeployments(sorted);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <TableSkeleton />
      </div>
    );
  }
  if (error) return <p className="p-8 text-red-500">Error: {error}</p>;

  if (deployments.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">No deployments yet</h2>
            <p className="text-muted-foreground">
              Deploy your first project to get started. Shipyard will build and
              host your repository automatically.
            </p>
          </div>

          <Link href="/new">
            <Button size="lg" className="rounded-full gap-2">
              <Plus className="w-4 h-4" />
              Create your first deployment
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <DashboardHeader />

      {loading && <TableSkeleton />}

      {error && (
        <p className="p-8 text-red-500 text-center">
          Error loading deployments
        </p>
      )}

      {!loading && !error && deployments.length === 0 && <EmptyDeployments />}

      {!loading && deployments.length > 0 && (
        <DeploymentsTable deployments={deployments} />
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="px-8 py-8">
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-5 border-b"
            >
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-4 w-64 bg-muted rounded"></div>
              <div className="h-4 w-20 bg-muted rounded"></div>
              <div className="h-4 w-32 bg-muted rounded"></div>
              <div className="h-8 w-8 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardHeader() {
  return (
    <div className="border-b border-border bg-linear-to-br from-slate-50 via-blue-50/30 to-background px-8 py-10">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-12 bg-linear-to-b from-primary via-secondary to-accent rounded-full"></div>
            <h1 className="text-4xl font-bold text-foreground">Deployments</h1>
          </div>
          <p className="text-muted-foreground ml-6">
            Manage your deployed sites
          </p>
        </div>

        <Link href="/new">
          <Button
            size="lg"
            className="rounded-full gap-2 bg-primary hover:bg-primary/90 shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Deployment
          </Button>
        </Link>
      </div>
    </div>
  );
}

function EmptyDeployments() {
  return (
    <div className="px-8 py-20 flex justify-center">
      <div className="text-center max-w-lg space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Plus className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">
            Create your first deployment
          </h2>
          <p className="text-muted-foreground">
            Connect a Git repository and Shipyard will build and deploy it
            automatically.
          </p>
        </div>

        <Link href="/new">
          <Button size="lg" className="rounded-full gap-2">
            <Plus className="w-4 h-4" />
            New Deployment
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
