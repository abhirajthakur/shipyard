"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { getDeploymentById } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { Deployment, DeploymentStatus } from "@shipyard/types";
import { AlertCircle, ArrowLeft, CheckCircle, Eye } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function DeploymentDetailsContent() {
  const params = useParams<{ id: string }>();

  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    setLoading(true);
    getDeploymentById(params.id)
      .then((data) => setDeployment(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!deployment) return <p>Deployment not found</p>;

  if (!deployment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-8 py-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Deployment not found</p>
          </div>
        </div>
      </div>
    );
  }

  const getHeaderGradient = (status: string) => {
    switch (status) {
      case "success":
        return "bg-gradient-to-r from-green-50 to-green-100/50";
      case "failed":
        return "bg-gradient-to-r from-red-50 to-red-100/50";
      case "building":
        return "bg-gradient-to-r from-yellow-50 to-yellow-100/50";
      case "queued":
        return "bg-gradient-to-r from-gray-50 to-gray-100/50";
      default:
        return "bg-gradient-to-r from-blue-50 to-blue-100/50";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div
        className={cn(
          getHeaderGradient(deployment.status),
          "border-b border-border px-8 py-8",
        )}
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-4xl font-bold text-foreground">
                {deployment.id}
              </h1>
              <StatusBadge status={deployment.status} />
            </div>
            <p className="text-muted-foreground">
              Created {formatDate(deployment.createdAt)}
            </p>
          </div>
          <Button
            size="lg"
            className="gap-2 bg-primary hover:bg-primary/90 text-white"
          >
            <Eye className="w-4 h-4" />
            Visit Deployment
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="border-2 border-blue-200 rounded-2xl p-6 bg-blue-50/50 hover:shadow-md transition-shadow">
            <p className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide">
              Repository
            </p>
            <p className="text-foreground font-mono text-sm break-all leading-relaxed">
              {deployment.repoUrl}
            </p>
          </div>

          <div className="border-2 border-orange-200 rounded-2xl p-6 bg-orange-50/50 hover:shadow-md transition-shadow">
            <p className="text-sm font-semibold text-orange-700 mb-3 uppercase tracking-wide">
              Build Command
            </p>
            <p className="text-foreground font-mono text-sm">npm run build</p>
          </div>

          <div className="border-2 border-purple-200 rounded-2xl p-6 bg-purple-50/50 hover:shadow-md transition-shadow">
            <p className="text-sm font-semibold text-purple-700 mb-3 uppercase tracking-wide">
              Output Directory
            </p>
            <p className="text-foreground font-mono text-sm">dist</p>
          </div>
        </div>

        {/* Build Logs - Only shown for building/queued deployments */}
        {(deployment.status === DeploymentStatus.BUILDING ||
          deployment.status === DeploymentStatus.QUEUED) && (
          <div className="border-2 border-slate-300 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-foreground">Build Logs</h2>
              <span className="text-xs font-medium text-yellow-700 flex items-center gap-2 bg-yellow-100 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></span>
                Auto-refreshing
              </span>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm text-green-400 overflow-x-auto max-h-96 overflow-y-auto space-y-1">
              <div>{"[00:00] Cloning repository..."}</div>
              <div>{"[00:02] Installing dependencies..."}</div>
              <div>{"[00:15] Running build command: npm run build"}</div>
              <div className="text-blue-400">
                {"[00:18] > project@1.0.0 build"}
              </div>
              <div className="text-blue-400">{"[00:18] > vite build"}</div>
              <div>{"[00:20] vite v5.4.0 building for production..."}</div>
              <div className="text-green-300 font-bold">
                {"[00:22] ✓ 143 modules transformed."}
              </div>
              <div>
                {
                  "[00:23] dist/index.html                 0.46 kB | gzip:  0.30 kB"
                }
              </div>
              <div>
                {
                  "[00:23] dist/assets/index.css         4.12 kB | gzip:  1.38 kB"
                }
              </div>
              <div>
                {
                  "[00:23] dist/assets/index.js        187.23 kB | gzip: 60.12 kB"
                }
              </div>
              <div className="text-green-300 font-bold">
                {"[00:24] ✓ built in 4.2s"}
              </div>
              <div className="text-purple-300">
                {"[00:25] Uploading to CDN..."}
              </div>
            </div>
          </div>
        )}

        {deployment.status === DeploymentStatus.SUCCESS && (
          <div className="border-2 border-green-300 rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center justify-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Deployment Successful
                </h2>
                <p className="text-muted-foreground">
                  Your application has been built and deployed successfully to
                  production
                </p>
              </div>
              <div className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Deployed</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatDate(deployment.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Deployment Failed */}
        {deployment.status === DeploymentStatus.FAILED && (
          <div className="border-2 border-red-300 rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="w-16 h-16 text-red-500" />
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Deployment Failed
                </h2>
                <p className="text-muted-foreground">
                  The build process encountered an error
                </p>
              </div>
              <Link href="/new" className="mt-6">
                <Button className="gap-2">Try Again</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DeploymentDetailsPage() {
  return (
    <ProtectedRoute>
      <DeploymentDetailsContent />
    </ProtectedRoute>
  );
}
