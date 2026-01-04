import * as duckdb from "@duckdb/duckdb-wasm";


const selfWorker = self as unknown as Worker;

let db: duckdb.AsyncDuckDB | null = null;
let conn: duckdb.AsyncDuckDBConnection | null = null;

/**
 * Inicializa DuckDB en el worker.
 */
const init = async () => {
  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
  const logger = new duckdb.ConsoleLogger();

  if (!bundle.mainWorker) {
    throw new Error("No se pudo cargar el bundle principal de DuckDB.");
  }

  const worker = await duckdb.createWorker(bundle.mainWorker);
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  conn = await db.connect();

  console.log("🦆 DuckDB Initialized in Worker!");
};

/**
 * Función para formatear valores de fecha según el tipo.
 * @param value Valor de fecha (timestamp en número o Date).
 * @param typeId ID del tipo de dato.
 * @returns Valor formateado (string, number o Date).
 */
const formatDateValue = (
  value: number | Date,
  typeId: number
): string | number | Date => {
  if (value === null || value === undefined) return value;

  const date = typeof value === "number" ? new Date(value) : value;

  if (date instanceof Date && isNaN(date.getTime())) return value;

  if (typeId === 8) {
    return (date as Date).toISOString().split("T")[0];
  }
  else if (typeId === 10) {
    return (date as Date).toISOString().replace("T", " ").split(".")[0];
  }

  return value;
};

/**
 * Manejador de mensajes del worker.
 * @param e Evento de mensaje.
 * @returns void
 */
self.onmessage = async (e: MessageEvent) => {
  const { type, payload, id } = e.data;

  if (!db || !conn) {
    if (type === "INIT") {
      await init();
      selfWorker.postMessage({ type: "INIT_DONE", id });
      return;
    }
    return;
  }

  try {
    switch (type) {
      case "QUERY": {
        const result = await conn.query(payload);

        const dateFields = result.schema.fields
          .map((field) => {
            if (field.typeId === 8 || field.typeId === 10) {
              return { name: field.name, typeId: field.typeId };
            }
            return null;
          })
          .filter((f) => f !== null);

        const rows = result.toArray().map((row) => {
          const jsonRow = row.toJSON();
          dateFields.forEach((field) => {
            if (field) {
              jsonRow[field.name] = formatDateValue(
                jsonRow[field.name],
                field.typeId
              );
            }
          });

          return jsonRow;
        });

        selfWorker.postMessage({ type: "QUERY_DONE", payload: rows, id });
        break;
      }
      case "INSERT_FILE": {
        await db.registerFileHandle(
          payload.name,
          payload,
          duckdb.DuckDBDataProtocol.BROWSER_FILEREADER,
          true
        );

        const connLocal = await db.connect();
        const query = `DESCRIBE SELECT * FROM '${payload.name}'`;

        const result = await connLocal.query(query);
        const schema = result.toArray().map((row) => row.toJSON());

        await connLocal.close();

        selfWorker.postMessage({
          type: "INSERT_FILE_DONE",
          payload: schema,
          id,
        });
        break;
      }
    }
  } catch (err: any) {
    console.error("DuckDB Error:", err);
    selfWorker.postMessage({ type: "ERROR", payload: err.message, id });
  }
};
