import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  List,
  ListItem,
  ListIcon,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge
} from '@chakra-ui/react';
import { XCircle, FileText } from 'lucide-react';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Función que renderiza el Manual de Usuario en un Drawer lateral.
 * @param param0 Props que controlan la visibilidad del Drawer.
 * @returns Componente del Manual de Usuario.
 */
export const UserManual = ({ isOpen, onClose }: UserManualProps) => {
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" bgGradient="linear(to-r, teal.400, purple.500)">
            📘 Manual de Usuario: DataVault Pro
            <Text fontSize="sm" fontWeight="normal" mt={1}>
                Guía completa de uso, formatos y capacidades.
            </Text>
        </DrawerHeader>

        <DrawerBody>
            <Accordion defaultIndex={[0]} allowMultiple>

                {/* SECCIÓN 1: INTRODUCCIÓN */}
                <AccordionItem>
                    <h2>
                    <AccordionButton _expanded={{ bg: 'teal.50', color: 'teal.600' }}>
                        <Box flex="1" textAlign="left" fontWeight="bold">
                             🚀 ¿Qué es DataVault Pro?
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4} color="whiteAlpha.900">
                        DataVault Pro es una herramienta de análisis de datos <b>Local-First</b>. 
                        Esto significa que tus datos <b>nunca salen de tu navegador</b>. 
                        Utiliza tecnología WebAssembly (DuckDB) para procesar millones de filas directamente en tu computadora 
                        sin necesidad de enviar archivos a un servidor externo.
                    </AccordionPanel>
                </AccordionItem>

                {/* SECCIÓN 2: FORMATOS ACEPTADOS */}
                <AccordionItem>
                    <h2>
                    <AccordionButton _expanded={{ bg: 'blue.50', color: 'blue.600' }}>
                        <Box flex="1" textAlign="left" fontWeight="bold">
                            📂 Formatos de Archivo Aceptados
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        <Text mb={2}>La herramienta soporta la ingesta automática de:</Text>
                        <List spacing={3}>
                            <ListItem display="flex" alignItems="center">
                                <ListIcon as={FileText} color="green.500" />
                                <b>CSV (.csv):</b> Separado por comas o punto y coma. Detecta cabeceras automáticamente.
                            </ListItem>
                            <ListItem display="flex" alignItems="center">
                                <ListIcon as={FileText} color="green.500" />
                                <b>Excel (.xlsx, .xls):</b> Lee automáticamente la &nbsp;<b>primera hoja</b>&nbsp; del libro.
                            </ListItem>
                            <ListItem display="flex" alignItems="center">
                                <ListIcon as={FileText} color="green.500" />
                                <b>JSON (.json):</b> Archivos planos o arrays de objetos. Se aplanan automáticamente.
                            </ListItem>
                        </List>

                        <Alert status="warning" mt={4} borderRadius="md">
                            <AlertIcon />
                            <Box>
                                <Text fontWeight="bold" fontSize="sm">Reglas para Excel:</Text>
                                <Text fontSize="xs">
                                    1. La Fila 1 deben ser los títulos.<br/>
                                    2. Sin celdas combinadas.<br/>
                                    3. Sin totales al final de la tabla.
                                </Text>
                            </Box>
                        </Alert>
                    </AccordionPanel>
                </AccordionItem>

                {/* SECCIÓN 3: GUÍA VISUAL */}
                <AccordionItem>
                    <h2>
                    <AccordionButton _expanded={{ bg: 'purple.50', color: 'purple.600' }}>
                        <Box flex="1" textAlign="left" fontWeight="bold">
                             📊 Constructor Visual y Gráficas
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        Puedes generar visualizaciones sin escribir código:
                        <Table size="sm" mt={3} variant="simple">
                            <Thead><Tr><Th>Gráfico</Th><Th>Mejor uso</Th></Tr></Thead>
                            <Tbody>
                                <Tr><Td><Badge colorScheme="teal">Barras</Badge></Td><Td>Comparar categorías (ej. Ventas por Vendedor).</Td></Tr>
                                <Tr><Td><Badge colorScheme="purple">Líneas</Badge></Td><Td>Ver tendencias en el tiempo (ej. Ventas por Fecha).</Td></Tr>
                                <Tr><Td><Badge colorScheme="pink">Pastel</Badge></Td><Td>Ver distribución o porcentajes (ej. % por Región).</Td></Tr>
                                <Tr><Td><Badge colorScheme="orange">Área</Badge></Td><Td>Volumen acumulado en el tiempo.</Td></Tr>
                            </Tbody>
                        </Table>
                    </AccordionPanel>
                </AccordionItem>

                {/* SECCIÓN 4: SQL AVANZADO */}
                <AccordionItem>
                    <h2>
                    <AccordionButton _expanded={{ bg: 'gray.100', color: 'gray.800' }}>
                        <Box flex="1" textAlign="left" fontWeight="bold">
                             🛠️ Capacidades SQL
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        <Text mb={2}>Cuentas con un motor <b>DuckDB</b> completo. Puedes usar consultas en lenguaje SQL como por ejemplo:</Text>
                        <Box bg="gray.900" color="green.300" p={3} borderRadius="md" fontSize="xs" fontFamily="monospace" mb={2}>
                            SELECT servicio, AVG(latencia_ms)<br/>
                            FROM 'system_logs.csv'<br/>
                            WHERE severidad != 'ERROR'<br/>
                            GROUP BY servicio
                        </Box>
                        <Text fontSize="sm">
                            ✅ <b>Soportado:</b> Joins entre archivos, Funciones de ventana (LAG, LEAD), Regex, CTEs.<br/>
                            ❌ <b>Limitación:</b> La memoria RAM de tu navegador (aprox 2GB-4GB). Evita hacer CROSS JOINs de millones de filas.
                        </Text>
                    </AccordionPanel>
                </AccordionItem>

                 {/* SECCIÓN 5: LIMITACIONES */}
                 <AccordionItem>
                    <h2>
                    <AccordionButton _expanded={{ bg: 'red.50', color: 'red.600' }}>
                        <Box flex="1" textAlign="left" fontWeight="bold">
                             ⚠️ Limitaciones Conocidas
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        <List spacing={2}>
                            <ListItem display="flex">
                                <ListIcon as={XCircle} color="red.500" />
                                No guardes datos sensibles sin encriptar (aunque es local, es buena práctica).
                            </ListItem>
                            <ListItem display="flex">
                                <ListIcon as={XCircle} color="red.500" />
                                Si recargas la página (F5), los datos se pierden (es memoria volátil).
                            </ListItem>
                            <ListItem display="flex">
                                <ListIcon as={XCircle} color="red.500" />
                                Archivos mayores a 1GB pueden alentar el navegador.
                            </ListItem>
                        </List>
                    </AccordionPanel>
                </AccordionItem>

            </Accordion>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <Button variant="outline" mr={3} onClick={onClose}>
            Cerrar Manual
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};