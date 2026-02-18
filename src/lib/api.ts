const API_BASE = "";

export async function fetchContent<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api/${endpoint}.json`);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return res.json();
}
