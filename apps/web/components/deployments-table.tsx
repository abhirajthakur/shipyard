"use client";

import { StatusBadge } from "@/components/status-badge";
import getDeploymentUrl from "@/lib/deploymentUrl";
import { formatDate } from "@/lib/utils";
import { Deployment } from "@shipyard/types";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeploymentsTableProps {
  deployments: Deployment[];
}

export default function DeploymentsTable({
  deployments,
}: DeploymentsTableProps) {
  const router = useRouter();

  return (
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
                    <a
                      href={getDeploymentUrl(deployment.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-accent hover:bg-orange-200 transition-all duration-200"
                      title="Visit deployment"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
