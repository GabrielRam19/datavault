import React from 'react';
import { HStack, Button, useToast } from '@chakra-ui/react';
import { Download, Image as ImageIcon } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface ExportBarProps {
    data: any[];
    chartRef: React.RefObject<HTMLDivElement | null>;
    fileName: string;
}

/**
 * Función que renderiza una barra de exportación para descargar datos como CSV o imagen de gráfico.
 * @param param0 Props que incluyen los datos, referencia al contenedor del gráfico y el nombre del archivo.
 * @returns Componente de la barra de exportación.
 */
export const ExportBar = ({ data, chartRef, fileName }: ExportBarProps) => {
    const toast = useToast();

    // 1. Lógica para descargar CSV
    const downloadCSV = () => {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]);

        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(fieldName => 
                JSON.stringify(row[fieldName] ?? '')
            ).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reporte_${fileName}_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({ title: "CSV Descargado", status: "success", duration: 2000 });
    };

    // 2. Lógica para descargar Imagen (PNG)
    const downloadImage = async () => {
        if (!chartRef.current) return;

        try {
            const dataUrl = await htmlToImage.toPng(chartRef.current, { 
                backgroundColor: '#1A202C',
                skipFonts: true,
                pixelRatio: 2
            });
            
            const link = document.createElement('a');
            link.download = `grafica_${fileName}_${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            toast({ title: "Imagen Guardada", status: "success", duration: 2000 });
        } catch (err) {
            console.error("Error al exportar imagen:", err);
            toast({ title: "Error al generar imagen", status: "error" });
        }
    };

    return (
        <HStack spacing={4} justifyContent="flex-end" mt={4}>
            <Button 
                leftIcon={<Download size={16}/>} 
                size="sm" 
                onClick={downloadCSV}
                isDisabled={!data.length}
            >
                Exportar CSV
            </Button>
            <Button 
                leftIcon={<ImageIcon size={16}/>} 
                size="sm" 
                colorScheme="teal" 
                variant="outline"
                onClick={downloadImage}
                isDisabled={!data.length}
            >
                Guardar Gráfica
            </Button>
        </HStack>
    );
};