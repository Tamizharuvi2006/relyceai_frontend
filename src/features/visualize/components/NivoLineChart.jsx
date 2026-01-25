import React, { memo, useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";
import { commonChartProps, formatValue } from "./chartTheme";
import ChartTooltip from "./ChartTooltip";

const NivoLineChart = memo(({ data, rawData, xAxisKey, yAxisKey, tooltipKey, showAllOnHover, enableArea = false }) => {
    // Create lookup map for raw data to get tooltip values
    const dataLookup = useMemo(() => {
        if (!rawData) return {};
        const lookup = {};
        rawData.forEach(item => {
            const key = String(item[xAxisKey]);
            if (!lookup[key]) lookup[key] = item;
        });
        return lookup;
    }, [rawData, xAxisKey]);

    const lineData = useMemo(() => [{
        id: yAxisKey,
        color: '#10b981',
        data: data.map(item => ({
            x: String(item[xAxisKey]).slice(0, 15),
            y: item[yAxisKey],
            _fullLabel: String(item[xAxisKey])
        }))
    }], [data, xAxisKey, yAxisKey]);

    return (
        <ResponsiveLine
            data={lineData}
            margin={{ top: 20, right: 20, bottom: 70, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
            curve="catmullRom"
            colors={['#10b981']}
            lineWidth={enableArea ? 2 : 3}
            pointSize={enableArea ? 0 : 8}
            pointColor="#10b981"
            pointBorderWidth={2}
            pointBorderColor="#000"
            enableArea={enableArea}
            areaOpacity={0.15}
            areaBaselineValue={0}
            defs={enableArea ? [
                {
                    id: 'areaGradient',
                    type: 'linearGradient',
                    colors: [
                        { offset: 0, color: '#10b981', opacity: 0.4 },
                        { offset: 100, color: '#10b981', opacity: 0 }
                    ]
                }
            ] : []}
            fill={enableArea ? [{ match: '*', id: 'areaGradient' }] : []}
            useMesh={true}
            crosshairType={enableArea ? "x" : "cross"}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 0,
                tickPadding: 8,
                tickRotation: -35,
                truncateTickAt: 12
            }}
            axisLeft={{
                tickSize: 0,
                tickPadding: 8,
                format: formatValue
            }}
            enableGridY={true}
            enableGridX={false}
            tooltip={({ point }) => {
                const fullLabel = point.data._fullLabel || point.data.x;
                const rawItem = dataLookup[fullLabel] || dataLookup[point.data.x];

                return (
                    <ChartTooltip
                        label={fullLabel}
                        value={point.data.y}
                        color={point.color}
                        tooltipKey={tooltipKey}
                        tooltipValue={rawItem?.[tooltipKey]}
                        allData={rawItem}
                        showAllOnHover={showAllOnHover}
                    />
                );
            }}
            {...commonChartProps}
        />
    );
});

NivoLineChart.displayName = 'NivoLineChart';
export default NivoLineChart;
