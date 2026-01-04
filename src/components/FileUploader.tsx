import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Text, VStack, Icon, useColorModeValue } from '@chakra-ui/react';
import { UploadCloud, FileType } from 'lucide-react';

interface FileUploaderProps {
    onFileSelected: (file: File) => void;
    isDisabled?: boolean;
}

/**
 * Función que renderiza un componente de subida de archivos con soporte para arrastrar y soltar.
 * @param param0 Props que incluyen la función para manejar el archivo seleccionado y si el componente está deshabilitado.
 * @returns Componente de subida de archivos.
 */
export const FileUploader = ({ onFileSelected, isDisabled }: FileUploaderProps) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelected(acceptedFiles[0]);
        }
    }, [onFileSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        disabled: isDisabled,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.apache.parquet': ['.parquet'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/json': ['.json']
        },
        maxFiles: 1
    });

    const borderColor = useColorModeValue('gray.300', 'gray.600');
    const activeColor = 'teal.400';
    const bgHover = useColorModeValue('gray.50', 'whiteAlpha.50');

    return (
        <Box
            {...getRootProps()}
            p={10}
            border="2px dashed"
            borderColor={isDragActive ? activeColor : borderColor}
            borderRadius="xl"
            bg={isDragActive ? bgHover : 'transparent'}
            cursor={isDisabled ? 'not-allowed' : 'pointer'}
            transition="all 0.2s"
            _hover={{ borderColor: activeColor, bg: bgHover }}
            opacity={isDisabled ? 0.5 : 1}
        >
            <input {...getInputProps()} />
            <VStack spacing={3}>
                <Icon as={isDragActive ? FileType : UploadCloud} w={10} h={10} color={isDragActive ? activeColor : 'gray.400'} />
                <Text fontWeight="bold" color="gray.500">
                    {isDragActive ? "¡Suelta el archivo aquí!" : "Arrastra un CSV, Parquet, XLS, XLSX o JSON aquí"}
                </Text>
                <Text fontSize="xs" color="gray.400">
                    Procesamiento local (Zero-Privacy Risk)
                </Text>
            </VStack>
        </Box>
    );
};