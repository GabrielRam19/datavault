import { Button, useToast } from '@chakra-ui/react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface CSVDownloadButtonProps {
    data: any[];
    fileName?: string;
    isDisabled?: boolean;
}

/**
 * Función que renderiza un botón para descargar datos en formato CSV cuando se ejecuta una consulta sql manualmente.
 * @param param0 Props que incluyen los datos, el nombre del archivo y si el botón está deshabilitado.
 * @returns Componente de botón para descargar CSV.
 */
export const CSVDownloadButton = ({ data, fileName = 'consulta_sql', isDisabled }: CSVDownloadButtonProps) => {
    const toast = useToast();

    const handleDownload = () => {
        try {
            if (!data || data.length === 0) {
                toast({ title: "No hay datos para exportar", status: "warning" });
                return;
            }

            // 1. Convertir JSON a Hoja de Cálculo
            const worksheet = XLSX.utils.json_to_sheet(data);

            // 2. Crear un Libro de Trabajo (Workbook)
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");

            // 3. Generar archivo y descargar
            XLSX.writeFile(workbook, `${fileName}_${Date.now()}.csv`);

            toast({ title: "Descarga iniciada", status: "success", duration: 2000 });

        } catch (error) {
            console.error(error);
            toast({ title: "Error al exportar", status: "error" });
        }
    };

    return (
        <Button 
            leftIcon={<Download size={16} />} 
            colorScheme="green" 
            variant="outline"
            size="sm"
            onClick={handleDownload}
            isDisabled={isDisabled || !data || data.length === 0}
        >
            Descargar CSV
        </Button>
    );
};