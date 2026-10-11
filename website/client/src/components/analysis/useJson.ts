import { useEffect, useState } from "react";
export function useJson<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let off = false;
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`); return r.json(); })
      .then((d) => { if (!off) setData(d as T); })
      .catch((e) => { if (!off) setError(String(e)); });
    return () => { off = true; };
  }, [url]);
  return { data, error };
}
