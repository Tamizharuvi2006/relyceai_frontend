import React, { memo, useMemo } from "react";
import { ResponsivePie } from "@nivo/pie";
import { CHART_COLORS, commonChartProps } from "./chartTheme";
import ChartTooltip from "./ChartTooltip";

const NivoPieChart = memo(({ data, rawData, xAxisKey, yAxisKey, tooltipKey, showAllOnHover }) => {
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

    const pieData = useMemo(() =>
        data.slice(0, 8).map((item, i) => ({
            id: String(item[xAxisKey]).slice(0, 15),
            label: String(item[xAxisKey]).slice(0, 15),
            _fullLabel: String(item[xAxisKey]),
            value: item[yAxisKey],
            color: CHART_COLORS[i % CHART_COLORS.length]
        })), [data, xAxisKey, yAxisKey]
    );

    const total = useMemo(() => pieData.reduce((a, b) => a + b.value, 0), [pieData]);

    return (
        <ResponsivePie
            data={pieData}
            margin={{ top: 30, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.55}
            padAngle={2}
            cornerRadius={6}
            activeOuterRadiusOffset={8}
            colors={{ datum: 'data.color' }}
            borderWidth={0}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#9ca3af"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="#ffffff"
            legends={[
                {
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 4,
                    itemWidth: 80,
                    itemHeight: 18,
                    itemTextColor: '#9ca3af',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 10,
                    symbolShape: 'circle'
                }
            ]}
            tooltip={({ datum }) => {
                const fullLabel = datum.data._fullLabel || datum.label;
                const rawItem = dataLookup[fullLabel] || dataLookup[datum.label];
                const percentage = ((datum.value / total) * 100).toFixed(1);

                return (
                    <ChartTooltip
                        label={`${fullLabel} (${percentage}%)`}
                        value={datum.value}
                        color={datum.color}
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

NivoPieChart.displayName = 'NivoPieChart';
export default NivoPieChart;
