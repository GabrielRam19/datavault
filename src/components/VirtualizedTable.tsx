import { Virtuoso } from 'react-virtuoso';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';

interface VirtualizedTableProps {
    data: any[];
}

export const VirtualizedTable = ({ data }: VirtualizedTableProps) => {
    // Colores
    const headerBg = useColorModeValue('gray.100', 'gray.700');
    const rowBg = useColorModeValue('white', 'gray.800');
    const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const textColor = useColorModeValue('gray.700', 'gray.200');

    // 1. Validación de datos
    if (!data || data.length === 0) {
        return (
            <Box p={10} textAlign="center" borderWidth="1px" borderRadius="xl" borderStyle="dashed">
                <Text color="gray.500">Sin datos para mostrar</Text>
            </Box>
        );
    }

    // 2. Configuración de columnas
    // Filtramos claves vacías por seguridad
    const columns = Object.keys(data[0]).filter(k => k !== "");
    const COLUMN_WIDTH = 150; 
    const totalWidth = columns.length * COLUMN_WIDTH;

    // 3. Renderizador de Fila (Row)
    // Virtuoso nos pasa el índice directamente
    const rowContent = (index: number) => {
        const row = data[index];
        if (!row) return null;

        return (
            <Box
                display="flex"
                alignItems="center"
                bg={rowBg}
                borderBottom="1px solid"
                borderColor={borderColor}
                _hover={{ bg: hoverBg }}
                h="40px" // Altura fija de la fila
                minWidth={`${totalWidth}px`} 
            >
                {columns.map((col) => (
                    <Box
                        key={`${index}-${col}`}
                        w={`${COLUMN_WIDTH}px`}
                        minW={`${COLUMN_WIDTH}px`}
                        p={2}
                        overflow="hidden"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                        borderRight="1px solid"
                        borderColor="transparent" 
                    >
                        <Text fontSize="sm" color={textColor}>
                            {typeof row[col] === 'object' 
                                ? JSON.stringify(row[col]) 
                                : String(row[col] ?? '')}
                        </Text>
                    </Box>
                ))}
            </Box>
        );
    };

    return (
        <Box 
            h="500px" // Altura total de la tabla
            w="100%" 
            borderWidth="1px" 
            borderRadius="xl" 
            overflow="hidden" 
            boxShadow="md"
            bg={rowBg}
            display="flex"
            flexDirection="column"
        >
            {/* --- HEADER (Fijo arriba) --- */}
            <Box 
                display="flex" 
                bg={headerBg} 
                borderBottom="2px solid" 
                borderColor={borderColor}
                overflowX="auto"
                overflowY="hidden"
                width="100%"
                flexShrink={0} // Evita que el header se aplaste
                css={{
                    '&::-webkit-scrollbar': { display: 'none' } 
                }}
            >
                <Box display="flex" minWidth={`${totalWidth}px`}> 
                    {columns.map((col) => (
                        <Box
                            key={col}
                            w={`${COLUMN_WIDTH}px`}
                            minW={`${COLUMN_WIDTH}px`}
                            p={3}
                            fontWeight="bold"
                            fontSize="xs"
                            textTransform="uppercase"
                            color="gray.500"
                            borderRight="1px solid"
                            borderColor={borderColor}
                        >
                            {col}
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* --- BODY (Virtualizado con react-virtuoso) --- */}
            <Box flex="1" w="100%">
                <Virtuoso
                    style={{ height: '100%', width: '100%' }}
                    totalCount={data.length}
                    itemContent={rowContent} // Función que dibuja cada fila
                    overscan={20} // Renderiza 20 filas extra para que el scroll sea suave
                />
            </Box>
            
            {/* Footer */}
            <Box p={1} bg={headerBg} borderTopWidth="1px" textAlign="right" flexShrink={0}>
                <Text fontSize="xs" color="gray.500" mr={2}>
                    {data.length.toLocaleString()} filas (Motor: Virtuoso)
                </Text>
            </Box>
        </Box>
    );
};