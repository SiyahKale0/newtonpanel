import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
// position_log.json datasını burada data olarak kullanabilirsin

// Örnek veri:
const exampleData = [
    { x: 0, y: 1.2, z: 0.1 },
    { x: 1, y: 1.3, z: 0.2 },
    { x: 2, y: 1.5, z: 0.3 },
    // ... gerçek veriyi props ile geçir
];

const MovementChart: React.FC<{ data?: any[] }> = ({ data = exampleData }) => (
    <ResponsiveContainer width={400} height={250}>
        <LineChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 8 }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="y" stroke="#8884d8" name="Y Ekseni" />
            <Line type="monotone" dataKey="z" stroke="#82ca9d" name="Z Ekseni" />
        </LineChart>
    </ResponsiveContainer>
);

export default MovementChart;