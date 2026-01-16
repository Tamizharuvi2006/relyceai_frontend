import React, { memo, useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { CHART_COLORS, commonChartProps, formatValue } from "./chartTheme";
import ChartTooltip from "./ChartTooltip";

const NivoBarChart = memo(({ data, rawData, xAxisKey, yAxisKey, tooltipKey, showAllOnHover }) => {
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

    const barData = useMemo(() =>
        data.map((item, i) => ({
            [xAxisKey]: String(item[xAxisKey]).slice(0, 15),
            [yAxisKey]: item[yAxisKey],
            _fullLabel: String(item[xAxisKey]),
            color: CHART_COLORS[i % CHART_COLORS.length]
        })), [data, xAxisKey, yAxisKey]
    );

    return (
        <ResponsiveBar
            data={barData}
            keys={[yAxisKey]}
            indexBy={xAxisKey}
            margin={{ top: 20, right: 20, bottom: 70, left: 60 }}
            padding={0.35}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={({ index }) => CHART_COLORS[index % CHART_COLORS.length]}
            borderRadius={6}
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
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
            labelSkipWidth={12}
            labelSkipHeight={12}
            enableLabel={false}
            tooltip={({ indexValue, value, color, data: barItem }) => {
                const fullLabel = barItem._fullLabel || indexValue;
                const rawItem = dataLookup[fullLabel] || dataLookup[indexValue];

                return (
                    <ChartTooltip
                        label={fullLabel}
                        value={value}
                        color={color}
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

NivoBarChart.displayName = 'NivoBarChart';
export default NivoBarChart;
