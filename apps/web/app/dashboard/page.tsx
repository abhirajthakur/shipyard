"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { getAllDeployments } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Deployment } from "@shipyard/types";
import { ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function DashboardContent() {
  const router = useRouter();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAllDeployments()
      .then((data) => setDeployments(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8">Loading deployments...</p>;
  if (error) return <p className="p-8 text-red-500">Error: {error}</p>;
  if (deployments.length === 0)
    return <p className="p-8">No deployments found</p>;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-linear-to-br from-slate-50 via-blue-50/30 to-background px-8 py-10">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-12 bg-linear-to-b from-primary via-secondary to-accent rounded-full"></div>
              <h1 className="text-4xl font-bold text-foreground">
                Deployments
              </h1>
            </div>
            <p className="text-muted-foreground ml-6">
              Manage your deployed sites
            </p>
          </div>
          <Link href="/new">
            <Button
              size="lg"
              className="rounded-full gap-2 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              New Deployment
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-linear-to-r from-blue-50/40 to-indigo-50/40">
                  <th className="px-6 py-5 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                    Repository
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-foreground uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deployments.map((deployment) => (
                  <tr
                    key={deployment.id}
                    className="hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group relative border-l-2 border-transparent hover:border-primary"
                    onClick={() => router.push(`/deployments/${deployment.id}`)}
                  >
                    <td className="px-6 py-5 text-sm font-bold text-primary group-hover:underline">
                      {deployment.id}
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground font-mono group-hover:text-foreground transition-colors">
                      {deployment.repoUrl}
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={deployment.status} />
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {formatDate(deployment.createdAt)}
                    </td>
                    <td
                      className="px-6 py-5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-accent hover:bg-orange-200 transition-all duration-200"
                        title="Visit deployed site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
