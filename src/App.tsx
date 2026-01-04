import { useState, useRef } from 'react';
import { 
  ChakraProvider, 
  Box, 
  Container, 
  Heading, 
  VStack, 
  Text, 
  useToast, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  IconButton, 
  useDisclosure
} from '@chakra-ui/react';
import { HelpCircle} from 'lucide-react'; 

import theme from './theme'; 
import { useDuckDB } from './hooks/useDuckDB';
import { FileUploader } from './components/FileUploader';
import { VirtualizedTable } from './components/VirtualizedTable';
import { QueryBuilder } from './components/QueryBuilder';
import { DataChart, type ChartType } from './components/DataChart'; 
import { SQLEditor } from './components/SQLEditor';
import { ExportBar } from './components/ExportBar';
import { normalizeFileToCSV } from './utils/fileParser';
import { CSVDownloadButton } from './components/CSVDownloadButton';
import { UserManual } from './components/UserManual'; 

function App() {
    const [schema, setSchema] = useState<any>(null);
    const [queryResults, setQueryResults] = useState<any[]>([]);
    const [currentChartType, setCurrentChartType] = useState<ChartType>('bar'); 

    // Estado para controlar el Manual de Usuario
    const { isOpen, onOpen, onClose } = useDisclosure(); 

    const { isReady, uploadFile, runQuery, isLoading } = useDuckDB();
    const toast = useToast();
    const chartContainerRef = useRef<HTMLDivElement>(null);

    /**
     * Función para manejar la selección y procesamiento del archivo subido.
     * @param file Archivo seleccionado por el usuario.
     */
    const handleFile = async (file: File) => {
        try {
            toast({ title: "Analizando archivo...", status: "info", duration: 1000 });

            const processedFile = await normalizeFileToCSV(file);
            const rawColumns = await uploadFile(processedFile);
            const normalizedColumns = rawColumns.map((col: any) => ({
                name: col.column_name || col.name,
                type: col.column_type || col.type
            }));

            setSchema({ fileName: processedFile.name, columns: normalizedColumns });
            
            toast({ title: "Ingesta Completada", description: `Procesado: ${file.name}`, status: "success" });

        } catch (err: any) {
            console.error(err);
            toast({ title: "Error de Ingesta", description: err.message, status: "error" });
        }
    };

    /**
     * Función para ejecutar una consulta SQL y actualizar los resultados.
     * @param sql Consulta SQL a ejecutar.
     */
    const handleRunQuery = async (sql: string) => {
        try {
            const results = await runQuery(sql);
            
            const formattedResults = results.map((row: any) => {
                const newRow = { ...row };
                Object.keys(newRow).forEach(key => {
                    const val = newRow[key];
                    if (typeof val === 'bigint') {
                        const num = Number(val);
                        newRow[key] = isNaN(num) ? 0 : num;
                    } 
                    else if (key === 'value') {
                         const num = Number(val);
                         newRow[key] = isNaN(num) ? 0 : num;
                    }
                });
                return newRow;
            });
            setQueryResults(formattedResults);
        } catch (err: any) {
            toast({ title: "Error SQL", description: err.message, status: "error" });
        }
    };

    return (
        <ChakraProvider theme={theme}>
            <Box minH="100vh" p={8} bg="gray.50" _dark={{ bg: 'gray.900' }}>
                <Container maxW="container.xl">
                    <VStack gap={6} align="stretch">
                        
                        {/* HEADER CON BOTÓN DE AYUDA */}
                        <Box textAlign="center" mb={4} position="relative">
                            <Heading size="2xl" bgGradient="linear(to-r, teal.400, purple.500)" bgClip="text">
                                DataVault Pro
                            </Heading>
                            <Text color="gray.500">Analítica Comercial Multiformato</Text>

                            {/* BOTÓN FLOTANTE PARA EL MANUAL */}
                            <Box position="absolute" top={0} right={0}>
                                <IconButton 
                                    aria-label="Abrir Manual"
                                    icon={<HelpCircle />} 
                                    colorScheme="teal" 
                                    variant="ghost" 
                                    size="lg"
                                    onClick={onOpen} 
                                />
                                <Text fontSize="xs" color="teal.500" fontWeight="bold">Ayuda</Text>
                            </Box>
                        </Box>

                        <FileUploader onFileSelected={handleFile} isDisabled={!isReady || isLoading} />

                        {schema && (
                            <Box>
                                <Tabs variant="soft-rounded" colorScheme="purple" mt={4} isLazy>
                                    <TabList mb={4} justifyContent="center">
                                        <Tab>📊 Constructor Visual</Tab>
                                        <Tab>🛠️ Editor SQL</Tab>
                                    </TabList>

                                    <TabPanels>
                                        <TabPanel px={0}>
                                            <QueryBuilder 
                                                fileName={schema.fileName}
                                                columns={schema.columns} 
                                                onRunQuery={handleRunQuery}
                                                onChartTypeChange={setCurrentChartType}
                                                isLoading={isLoading}
                                            />
                                            
                                            <Box ref={chartContainerRef}>
                                                 <DataChart data={queryResults} type={currentChartType} />
                                            </Box>

                                            <ExportBar 
                                                data={queryResults} 
                                                chartRef={chartContainerRef} 
                                                fileName={schema.fileName}
                                            />
                                        </TabPanel>

                                        <TabPanel px={0}>
                                            <VStack align="stretch" spacing={4}>
                                                
                                                <SQLEditor 
                                                    key={schema.fileName} 
                                                    onRunQuery={handleRunQuery}
                                                    isLoading={isLoading}
                                                    defaultValue={`SELECT * FROM '${schema.fileName}' LIMIT 20;`}
                                                />

                                                <Box display="flex" justifyContent="flex-end">
                                                    <CSVDownloadButton 
                                                        data={queryResults} 
                                                        fileName="resultado_sql" 
                                                        isDisabled={queryResults.length === 0}
                                                    />
                                                </Box>

                                            </VStack>
                                        </TabPanel>
                                    </TabPanels>
                                </Tabs>

                                <Text mt={8} mb={2} fontWeight="bold" fontSize="sm" color="gray.500">
                                    VISTA DE DATOS DETALLADA
                                </Text>
                                <Box bg="white" _dark={{ bg: 'gray.800' }} p={1} borderRadius="xl" boxShadow="sm">
                                    <VirtualizedTable data={queryResults} />
                                </Box>
                            </Box>
                        )}

                        {/* COMPONENTE DEL MANUAL (Invisible hasta que se abre) */}
                        <UserManual isOpen={isOpen} onClose={onClose} />

                        {/* --- COPYRIGHT FOOTER --- */}
                        <Box as="footer" textAlign="center" pt={10} pb={4} borderTopWidth="1px" borderColor="gray.200" mt={10}>
                            <Text fontSize="sm" color="gray.500">
                                © {new Date().getFullYear()} <b>Gabriel Ramirez</b>. All rights reserved.
                            </Text>
                            <Text fontSize="xs" color="gray.400" mt={1}>
                                Built with React, DuckDB & Chakra UI.
                            </Text>
                        </Box>

                    </VStack>
                </Container>
            </Box>
        </ChakraProvider>
    );
}

export default App;