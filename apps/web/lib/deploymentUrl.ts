export default function getDeploymentUrl(deploymentId: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_REQUEST_HANDLER_URL || "http://localhost:8001";

  if (baseUrl.includes("localhost")) {
    const url = new URL(baseUrl);
    url.hostname = `${deploymentId}.${url.hostname}`;
    return url.toString();
  }

  return `https://${deploymentId}.${baseUrl.replace(/^https?:\/\//, "")}`;
}
