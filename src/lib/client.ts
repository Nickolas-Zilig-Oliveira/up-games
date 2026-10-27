/** Chamada JSON para as rotas da API, usada pelos componentes do painel e da conta. */
export async function api<T = Record<string, unknown>>(url: string, method = "GET", body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  return { ok: res.ok, data, error: data.error ?? (res.ok ? "" : "Algo deu errado. Tente de novo.") };
}
