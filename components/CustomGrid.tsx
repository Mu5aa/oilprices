import React from 'react';
import { G, Line } from 'react-native-svg';

interface GridProps {
    x?: (value: any) => number;
    y?: (value: any) => number;
    data?: any[];
    ticks?: number;
    svg?: object;
    gridMin?: number;
    gridMax?: number;
    horizontal?: boolean;
}

const CustomGrid: React.FC<GridProps> = ({
    x = () => 0,
    y = () => 0,
    data = [],
    ticks = 10,
    svg = {},
    gridMin = 0,
    gridMax = 100,
    horizontal = true,
}) => {
    const tickValues = Array.from({ length: ticks }, (_, i) => i / (ticks - 1) * (gridMax - gridMin) + gridMin);

    return (
        <G>
            {tickValues.map((value, index) => (
                <Line
                    key={index}
                    x1={horizontal ? 0 : x(value)}
                    x2={horizontal ? '100%' : x(value)}
                    y1={horizontal ? y(value) : 0}
                    y2={horizontal ? y(value) : '100%'}
                    {...svg}
                />
            ))}
        </G>
    );
};

export default CustomGrid;
