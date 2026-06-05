"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getToken } from "./auth";

interface Options<T> {
  /** valor inicial enquanto carrega */
  initial: T;
  /** chamado com os dados após fetch bem-sucedido (ex.: popular estados derivados) */
  onSuccess?: (data: T) => void;
  /** chamado em falha de rede/HTTP (ex.: redirecionar em 404) */
  onError?: () => void;
}

interface Result<T> {
  data:    T;
  loading: boolean;
  error:   boolean;
  refetch: () => Promise<void>;
  setData: (value: T) => void;
}

/**
 * Encapsula o padrão getToken → fetch autenticado → loading/error usado em todo o app.
 *
 * - `url = null` desativa o fetch (útil para abas lazy: passe a URL só quando a aba abre).
 * - Refaz o fetch automaticamente quando a URL muda.
 * - `refetch()` para recarregar manualmente (ex.: após excluir/vincular).
 * - `onSuccess`/`onError` ficam em ref — não precisam ser memoizados pelo chamador.
 */
export function useAuthedFetch<T>(url: string | null, opts: Options<T>): Result<T> {
  const [data, setData]       = useState<T>(opts.initial);
  const [loading, setLoading] = useState<boolean>(url !== null);
  const [error, setError]     = useState(false);

  // mantém os callbacks mais recentes sem forçar o refetch a depender deles
  const optsRef = useRef(opts);
  useEffect(() => { optsRef.current = opts; });

  const refetch = useCallback(async () => {
    if (url === null) return;
    setLoading(true);
    setError(false);
    try {
      const token = await getToken();
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as T;
      setData(json);
      optsRef.current.onSuccess?.(json);
    } catch {
      setError(true);
      optsRef.current.onError?.();
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (url === null) { setLoading(false); return; }
    refetch();
  }, [refetch, url]);

  return { data, loading, error, refetch, setData };
}
