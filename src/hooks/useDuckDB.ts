import { useEffect, useState, useRef } from "react";

type PendingQuery = {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
};

/**
 * Custom hook para interactuar con DuckDB en un Web Worker.
 * @returns { isReady: boolean, isLoading: boolean, error: string | null, runQuery: (sql: string) => Promise<any[]>, uploadFile: (file: File) => Promise<any[]> }
 */
export const useDuckDB = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const queriesRef = useRef<Map<string, PendingQuery>>(new Map());

  useEffect(() => {
    const worker = new Worker(
      new URL("../core/duckdb/db.worker.ts", import.meta.url),
      { type: "module" }
    );

    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, payload, id } = e.data;

      if (type === "INIT_DONE") {
        setIsReady(true);
        setIsLoading(false);
      } else if (type === "ERROR") {
        if (id === "init") {
          setError(payload);
          setIsLoading(false);
        } else {
          const promise = queriesRef.current.get(id);
          if (promise) {
            promise.reject(new Error(payload));
            queriesRef.current.delete(id);
          }
        }
      } else if (type === "QUERY_DONE" || type === "INSERT_FILE_DONE") {
        const promise = queriesRef.current.get(id);
        if (promise) {
          promise.resolve(payload);
          queriesRef.current.delete(id);
        }
      }
    };

    worker.postMessage({ type: "INIT", id: "init" });

    return () => {
      worker.terminate();
    };
  }, []);

  /**
   * Función para ejecutar una consulta SQL.
   * @param sql Consulta SQL a ejecutar.
   * @returns Resultados de la consulta.
   */
  const runQuery = (sql: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) return reject("DB not ready");

      const id = crypto.randomUUID();
      queriesRef.current.set(id, { resolve, reject });

      workerRef.current.postMessage({ type: "QUERY", payload: sql, id });
    });
  };

  /**
   * Función para subir un archivo CSV a DuckDB.
   * @param file Archivo CSV a subir.
   * @returns Metadatos de las columnas del archivo subido.
   */
  const uploadFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) return reject("DB not ready");

      const id = crypto.randomUUID();
      queriesRef.current.set(id, { resolve, reject });

      workerRef.current.postMessage({ type: "INSERT_FILE", payload: file, id });
    });
  };

  return { isReady, isLoading, error, runQuery, uploadFile };
};
