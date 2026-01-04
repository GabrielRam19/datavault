import * as duckdb from "@duckdb/duckdb-wasm";

// No importamos 'worker' de la libreria directamente para evitar problemas con Vite,
// lo manejamos como un script independiente.

const selfWorker = self as unknown as Worker;

let db: duckdb.AsyncDuckDB | null = null;
let conn: duckdb.AsyncDuckDBConnection | null = null;

// --- 1. Inicializador (IGUAL QUE EL TUYO) ---
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

// --- 2. FUNCIÓN NUEVA: FORMATEADOR DE FECHAS ---
// Esta funcion no toca los archivos, solo arregla lo que sale de la base de datos
const formatDateValue = (
  value: number | Date,
  typeId: number
): string | number | Date => {
  if (value === null || value === undefined) return value;

  // Si DuckDB devuelve un numero (milisegundos), lo hacemos Fecha
  const date = typeof value === "number" ? new Date(value) : value;

  // Validación extra
  if (date instanceof Date && isNaN(date.getTime())) return value;

  // TypeId 8 = DATE (Ej: 2025-01-01)
  if (typeId === 8) {
    // Usamos UTC para que no te reste un día por la zona horaria
    return (date as Date).toISOString().split("T")[0];
  }
  // TypeId 10 = TIMESTAMP (Ej: 2025-01-01 14:30:00)
  else if (typeId === 10) {
    return (date as Date).toISOString().replace("T", " ").split(".")[0];
  }

  return value;
};

// --- 3. MANEJADOR DE MENSAJES ---
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
      // --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE ---
      case "QUERY": {
        // 1. Ejecutamos la consulta
        const result = await conn.query(payload);

        // 2. Detectamos qué columnas son fechas mirando el esquema real
        const dateFields = result.schema.fields
          .map((field) => {
            // TypeId 8 es Date, TypeId 10 es Timestamp
            if (field.typeId === 8 || field.typeId === 10) {
              return { name: field.name, typeId: field.typeId };
            }
            return null;
          })
          .filter((f) => f !== null);

        // 3. Convertimos a JSON y aplicamos formato SOLO a esas columnas
        const rows = result.toArray().map((row) => {
          const jsonRow = row.toJSON();

          // Si detectamos fechas, las formateamos bonito
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

      // --- ESTO LO DEJAMOS EXACTAMENTE COMO TÚ LO TENÍAS (PORQUE FUNCIONA) ---
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
