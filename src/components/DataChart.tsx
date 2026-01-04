import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';

export type ChartType = 'bar' | 'line' | 'area' | 'pie';

interface DataChartProps {
    data: any[];
    type: ChartType;
}

/**
 * Función que renderiza un gráfico de datos usando Recharts y Chakra UI.
 * @param param0 Props que incluyen los datos a graficar y el tipo de gráfico.
 * @returns Componente de gráfico de datos.
 */
export const DataChart = ({ data, type }: DataChartProps) => {
    const bg = useColorModeValue('gray.50', 'gray.800');
    const colors = ['#319795', '#805AD5', '#D69E2E', '#3182CE', '#E53E3E'];

    if (!data || data.length === 0) return null;

    const CommonAxis = () => (
        <>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="name" tick={{fontSize: 11}} interval={0} height={60} />
            <YAxis tick={{fontSize: 12}} />
            <Tooltip contentStyle={{ backgroundColor: '#1A202C', borderRadius: '8px', border: 'none', color: '#fff' }} />
            <Legend verticalAlign="top" height={36}/>
        </>
    );

    const renderChart = () => {
        switch (type) {
            case 'line':
                return (
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CommonAxis />
                        <Line type="monotone" dataKey="value" stroke="#319795" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
                    </LineChart>
                );
            case 'area':
                return (
                    <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CommonAxis />
                        <Area type="monotone" dataKey="value" stroke="#805AD5" fill="#805AD5" fillOpacity={0.3} />
                    </AreaChart>
                );
            case 'pie':
                return (
                    <PieChart margin={{ top: 20, right: 80, bottom: 40, left: 80 }}> 
                         <Tooltip />
                         <Legend verticalAlign="bottom" height={36}/>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60} 
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                            
                            isAnimationActive={false} 
                            
                            labelLine={true}
                            label={({ name, percent }) => {
                                if (!percent) return null;
                                return `${name} (${(percent * 100).toFixed(0)}%)`;
                            }} 
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                );
            case 'bar':
            default:
                return (
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CommonAxis />
                        <Bar dataKey="value" fill="#319795" radius={[4, 4, 0, 0]}>
                             {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#319795' : '#2C7A7B'} />
                            ))}
                        </Bar>
                    </BarChart>
                );
        }
    };

    return (
        <Box h="400px" w="100%" mt={6} p={4} bg={bg} borderRadius="xl" borderWidth="1px" minW="0">
            <Text fontSize="sm" mb={4} fontWeight="bold" color="gray.500">
                Visualización ({type.toUpperCase()})
            </Text>
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </Box>
    );
};