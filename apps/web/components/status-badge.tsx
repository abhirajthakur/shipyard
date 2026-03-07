import { DeploymentStatus } from "@shipyard/types";

interface StatusBadgeProps {
  status: DeploymentStatus;
}

const STATUS_CONFIG: Record<
  DeploymentStatus,
  { label: string; dotColor: string; bgColor: string; textColor: string }
> = {
  CREATED: {
    label: "Created",
    dotColor: "bg-gray-500",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
  },
  QUEUED: {
    label: "Queued",
    dotColor: "bg-gray-600",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
  },
  BUILDING: {
    label: "Building",
    dotColor: "bg-yellow-600",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
  UPLOADING: {
    label: "Uploading",
    dotColor: "bg-blue-600",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
  },
  SUCCESS: {
    label: "Success",
    dotColor: "bg-green-600",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
  },
  FAILED: {
    label: "Failed",
    dotColor: "bg-red-600",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, dotColor, bgColor, textColor } = STATUS_CONFIG[status];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-sm ${bgColor} ${textColor}`}
    >
      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </div>
  );
}
