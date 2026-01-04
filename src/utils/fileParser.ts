import * as XLSX from "xlsx";

/**
 * Función para normalizar archivos Excel (.xlsx, .xls) y JSON (.json) a formato CSV.
 * @param file Archivo de entrada (Excel o JSON).
 * @returns Archivo en formato CSV.
 */
export const normalizeFileToCSV = async (file: File): Promise<File> => {
  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "_")
    .replace(/\.(xlsx|xls|json)$/, ".csv");

  let csvOutput = "";

  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    csvOutput = XLSX.utils.sheet_to_csv(worksheet, { FS: "," });
  } else if (fileName.endsWith(".json")) {
    const text = await file.text();
    let jsonData = JSON.parse(text);
    if (!Array.isArray(jsonData)) jsonData = [jsonData];
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    csvOutput = XLSX.utils.sheet_to_csv(worksheet, { FS: "," });
  } else if (fileName.endsWith(".csv")) {
    return new File([file], safeName, { type: "text/csv" });
  } else {
    throw new Error("Formato no soportado.");
  }

  console.log("CSV Preview (Primeras lineas):", csvOutput.substring(0, 100));

  return new File([csvOutput], safeName, { type: "text/csv" });
};
