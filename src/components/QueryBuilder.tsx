import { useState } from 'react';
import { Box, Select, HStack, Button, FormControl, FormLabel, VStack } from '@chakra-ui/react';
import type { ChartType } from './DataChart';

interface Column {
    name: string;
    type: string;
}

interface QueryBuilderProps {
    fileName: string;
    columns: Column[];
    onRunQuery: (sql: string) => void;
    onChartTypeChange: (type: ChartType) => void;
    isLoading?: boolean;
}

/**
 * Función que renderiza un constructor de queries para análisis de datos.
 * @param param0 Props que incluyen el nombre del archivo, columnas, funciones para ejecutar la query y cambiar el tipo de gráfico, y estado de carga.
 * @returns Componente del constructor de queries.
 */
export const QueryBuilder = ({ fileName, columns, onRunQuery, onChartTypeChange, isLoading }: QueryBuilderProps) => {
    const [dimension, setDimension] = useState('');
    const [metric, setMetric] = useState('');
    const [agg, setAgg] = useState('SUM');
    const [limit] = useState('20');
    const [chartType, setChartType] = useState<ChartType>('bar');

    const numericCols = columns.filter(c => 
        ['BIGINT', 'DOUBLE', 'INTEGER', 'DECIMAL', 'HUGEINT'].some(t => c.type.includes(t))
    );
    const dimCols = columns; 

    /**
     * Función para generar y ejecutar la query SQL basada en las selecciones del usuario.
     * @returns void
     */
    const handleGenerate = () => {
        if (!dimension || !metric) return;
        
        onChartTypeChange(chartType);

        // --- LÓGICA DE SQL AVANZADA ---
        let expression = '';

        switch (agg) {
            case 'COUNT_DISTINCT':
                expression = `COUNT(DISTINCT "${metric}")`;
                break;
            case 'MEDIAN':
                // DuckDB tiene función nativa MEDIAN
                expression = `MEDIAN("${metric}")`;
                break;
            case 'STDDEV':
                // Desviación estándar poblacional
                expression = `STDDEV("${metric}")`;
                break;
            case 'VARIANCE':
                expression = `VARIANCE("${metric}")`;
                break;
            default:
                // SUM, AVG, MIN, MAX, COUNT normal
                expression = `${agg}("${metric}")`;
        }

        const sql = `
            SELECT 
                "${dimension}" as name, 
                CAST(${expression} AS DOUBLE) as value 
            FROM '${fileName}' 
            GROUP BY "${dimension}" 
            ORDER BY value DESC 
            LIMIT ${limit}
        `;
        
        onRunQuery(sql);
    };

    return (
        <Box borderWidth="1px" borderRadius="xl" p={5} boxShadow="sm" bg="whiteAlpha.50">
            <VStack spacing={4} align="stretch">
                <HStack spacing={4} align="end" wrap="wrap">
                    
                    <FormControl w="160px">
                        <FormLabel fontSize="xs" color="gray.400">Tipo de Gráfico</FormLabel>
                        <Select value={chartType} onChange={(e) => setChartType(e.target.value as ChartType)}>
                            <option value="bar">📊 Barras</option>
                            <option value="line">📈 Líneas</option>
                            <option value="area">🗻 Área</option>
                            <option value="pie">🍰 Pastel</option>
                        </Select>
                    </FormControl>

                    <FormControl w="200px">
                        <FormLabel fontSize="xs" color="gray.400">Agrupar por (X)</FormLabel>
                        <Select placeholder="Categoría..." value={dimension} onChange={(e) => setDimension(e.target.value)}>
                            {dimCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </Select>
                    </FormControl>

                    <FormControl w="180px">
                        <FormLabel fontSize="xs" color="gray.400">Métrica / Operación</FormLabel>
                        <Select value={agg} onChange={(e) => setAgg(e.target.value)}>
                            <option value="SUM">Suma Total</option>
                            <option value="AVG">Promedio</option>
                            <option value="COUNT">Conteo (Filas)</option>
                            <option value="COUNT_DISTINCT">Conteo Único (Distinct)</option>
                            <option value="MIN">Mínimo</option>
                            <option value="MAX">Máximo</option>
                            <option value="MEDIAN">Mediana (Estadística)</option>
                            <option value="STDDEV">Desviación Estándar</option>
                            <option value="VARIANCE">Varianza</option>
                        </Select>
                    </FormControl>

                    <FormControl w="200px">
                        <FormLabel fontSize="xs" color="gray.400">Columna de Valor (Y)</FormLabel>
                        <Select placeholder="Numérico..." value={metric} onChange={(e) => setMetric(e.target.value)}>
                            {numericCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </Select>
                    </FormControl>

                    <Button colorScheme="teal" onClick={handleGenerate} isLoading={isLoading} isDisabled={!dimension || !metric}>
                        Calcular
                    </Button>
                </HStack>
            </VStack>
        </Box>
    );
};