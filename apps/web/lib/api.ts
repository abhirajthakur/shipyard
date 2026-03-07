import {
  CreateDeploymentRequest,
  CreateDeploymentResponse,
  Deployment,
  SigninRequest,
  SignupRequest,
  User,
} from "@shipyard/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "http://localhost:8000/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function signup(input: SignupRequest): Promise<User> {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function signin(input: SigninRequest) {
  return request("/auth/signin", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logout() {
  return request("/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser(): Promise<User> {
  return request("/auth/me");
}

export async function createDeployment(
  input: CreateDeploymentRequest,
): Promise<CreateDeploymentResponse> {
  return request("/deployments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getAllDeployments(): Promise<Deployment[]> {
  return request("/deployments");
}

export async function getDeploymentById(
  id: string,
): Promise<Deployment | null> {
  return request(`/deployments/${id}`);
}

export function streamDeploymentLogs(
  deploymentId: string,
  callbacks: {
    onLog: (log: string) => void;
    onComplete?: () => void;
    onFailed?: () => void;
    onError?: (err: any) => void;
  },
) {
  const eventSource = new EventSource(
    `${API_BASE}/deployments/${deploymentId}/logs`,
    {
      withCredentials: true,
    },
  );

  eventSource.onmessage = (event) => {
    const data = event.data;

    if (data === "__BUILD_COMPLETE__") {
      callbacks.onComplete?.();
      eventSource.close();
    } else if (data === "__BUILD_FAILED__") {
      callbacks.onFailed?.();
      eventSource.close();
    } else {
      // **Make sure to call onLog for every normal log line**
      callbacks.onLog(data);
    }
  };

  eventSource.onerror = (err) => {
    callbacks.onError?.(err);
    eventSource.close();
  };

  return () => eventSource.close();
}
