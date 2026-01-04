import { 
  Table, Thead, Tbody, Tr, Th, Td, 
  TableContainer, Box, Text, useColorModeValue 
} from '@chakra-ui/react';

interface ResultsTableProps {
    data: any[];
}

/**
 * Función que renderiza una tabla de resultados usando Chakra UI.
 * @param param0 Props que incluyen los datos a mostrar.
 * @returns Componente de tabla de resultados.
 */
export const ResultsTable = ({ data }: ResultsTableProps) => {
    const headerBg = useColorModeValue('gray.50', 'gray.700');
    
    if (!data || data.length === 0) {
        return (
            <Box p={10} textAlign="center" borderWidth="1px" borderRadius="xl" borderStyle="dashed">
                <Text color="gray.500">Los resultados de tu consulta aparecerán aquí</Text>
            </Box>
        );
    }

    const columns = Object.keys(data[0]);

    return (
        <Box borderWidth="1px" borderRadius="xl" overflow="hidden" boxShadow="md">
            <TableContainer maxH="500px" overflowY="auto">
                <Table variant="simple" size="sm">
                    <Thead bg={headerBg} position="sticky" top={0} zIndex={1}>
                        <Tr>
                            {columns.map((col) => (
                                <Th key={col} color="teal.400">{col}</Th>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.map((row, rowIndex) => (
                            <Tr key={rowIndex} _hover={{ bg: 'whiteAlpha.100' }}>
                                {columns.map((col) => (
                                    <Td key={`${rowIndex}-${col}`}>
                                        {typeof row[col] === 'object' 
                                            ? JSON.stringify(row[col]) 
                                            : row[col]?.toString()}
                                    </Td>
                                ))}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
            
            {/* Footer con conteo de filas */}
            <Box p={2} bg={headerBg} borderTopWidth="1px">
                <Text fontSize="xs" textAlign="right" color="gray.500">
                    {data.length} filas encontradas
                </Text>
            </Box>
        </Box>
    );
};