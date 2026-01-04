import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Button, HStack, useColorModeValue, Text } from '@chakra-ui/react';
import { Play } from 'lucide-react';

interface SQLEditorProps {
    defaultValue?: string;
    onRunQuery: (query: string) => void;
    isLoading?: boolean;
}

/**
 * Función que renderiza un editor SQL usando Monaco Editor.
 * @param param0 Props que incluyen el valor por defecto, función para ejecutar la query y estado de carga.
 * @returns Componente del editor SQL.
 */
export const SQLEditor = ({ defaultValue, onRunQuery, isLoading }: SQLEditorProps) => {
    const [query, setQuery] = useState(defaultValue || "SELECT * FROM 'tu_archivo.csv' LIMIT 10;");
    const bgHeader = useColorModeValue('gray.100', 'gray.700');

    const handleEditorChange = (value: string | undefined) => {
        setQuery(value || "");
    };

    return (
        <Box borderWidth="1px" borderRadius="xl" overflow="hidden" boxShadow="md">
            {/* Barra de Herramientas del Editor */}
            <HStack bg={bgHeader} p={2} justifyContent="space-between" borderBottomWidth="1px">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" px={2}>
                    EDITOR SQL
                </Text>
                <Button 
                    size="sm" 
                    colorScheme="teal" 
                    leftIcon={<Play size={16}/>}
                    onClick={() => onRunQuery(query)}
                    isLoading={isLoading}
                    loadingText="Ejecutando..."
                >
                    Ejecutar Query
                </Button>
            </HStack>

            {/* El Editor de VS Code */}
            <Box h="300px">
                <Editor
                    height="100%"
                    defaultLanguage="sql"
                    defaultValue={query}
                    theme="vs-dark"
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                />
            </Box>
        </Box>
    );
};