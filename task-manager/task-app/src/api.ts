// src/api.ts
export type ApiError = { message: string; status?: number };

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    clearTimeout(id);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 400) throw { message: "400 bad request", status: 400 } as ApiError;
      if (res.status === 404) throw { message: "404 Not found", status: 404 } as ApiError;
      if (res.status === 500) throw { message: "500 Error", status: 500 } as ApiError;
      let json;
      try { json = JSON.parse(text); } catch { json = null; }
      throw { message: json?.message ?? res.statusText ?? "HTTP error", status: res.status } as ApiError;
    }

    // No Content
    if (res.status === 204) return null;

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return res.json();
    }
    // 非 JSON の場合は明示的にエラーにする（呼び出し元が JSON を期待している前提）
    const txt = await res.text();
    throw { message: `Expected JSON but got ${contentType || "unknown"}: ${txt.slice(0, 200)}` } as ApiError;
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === "AbortError") throw { message: "Request timed out" } as ApiError;
    if ((err as ApiError).message) throw err;
    throw { message: err?.message ?? String(err) } as ApiError;
  }
}

// 安定した baseUrl の決め方
function computeBaseUrl(): string {
  // 1) 明示的な環境変数を優先
  const env = (import.meta.env.VITE_API_BASE as string) || "";
  if (env) return env.replace(/\/+$/, ""); // 末尾スラッシュ除去

  // 2) origin ベースでポートだけ置換したい時の安全な方法
  try {
    const u = new URL(window.location.href);
    // 開発環境のデフォルト: フロントが :5173 でバックが :8000 の場合
    if (u.port === "5173") {
      u.port = "8000";
      return u.origin; // origin は protocol + host + :port
    }
    // それ以外は同じオリジンを使う
    return u.origin;
  } catch {
    // フォールバック: 現在の location host を使う
    return window.location.origin;
  }
}

const baseUrl = computeBaseUrl();

export const Api = {
  baseUrl,

  // GET: JSON を期待する（非 JSON はエラーになる）
  get<T = any>(path: string) {
    const p = path.startsWith("/") ? path : `/${path}`;
    const full = `${this.baseUrl}${p}`;
    // デバッグ用ログ（開発時のみ）
    if (import.meta.env.DEV) console.debug(`[Api.get] ${full}`);
    return fetchWithTimeout(full, {
      method: "GET",
      headers: { "Accept": "application/json" /* GET に Content-Type は不要 */ },
      // credentials: 'include' // 必要なら有効化
    }) as Promise<T>;
  },

  post<T = any>(path: string, body?: any) {
    const p = path.startsWith("/") ? path : `/${path}`;
    const full = `${this.baseUrl}${p}`;
    if (import.meta.env.DEV) console.debug(`[Api.post] ${full}`, body);
    return fetchWithTimeout(full, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      // credentials: 'include'
    }) as Promise<T>;
  },

  put<T = any>(path: string, body?: any) {
    const p = path.startsWith("/") ? path : `/${path}`;
    const full = `${this.baseUrl}${p}`;
    return fetchWithTimeout(full, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      // credentials: 'include'
    }) as Promise<T>;
  },

  del<T = any>(path: string) {
    const p = path.startsWith("/") ? path : `/${path}`;
    const full = `${this.baseUrl}${p}`;
    return fetchWithTimeout(full, {
      method: "DELETE",
      headers: { "Accept": "application/json" },
      // credentials: 'include'
    }) as Promise<T>;
  }
};
