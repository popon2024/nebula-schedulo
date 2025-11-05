export const API_BASE = "http://localhost:4000/api";

export async function apiRequest<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  data?: any
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API ${method} ${path} failed: ${errText}`);
  }

  return res.json() as Promise<T>;
}