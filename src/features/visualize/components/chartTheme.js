// Shared Nivo theme and utilities for all chart components
export const CHART_COLORS = [
    '#10b981', '#34d399', '#6ee7b7', '#059669', '#047857',
    '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#ef4444'
];

export const nivoTheme = {
    background: 'transparent',
    text: {
        fontSize: 11,
        fill: '#9ca3af',
    },
    axis: {
        domain: {
            line: { stroke: '#374151', strokeWidth: 1 }
        },
        ticks: {
            line: { stroke: '#374151', strokeWidth: 1 },
            text: { fill: '#9ca3af', fontSize: 11 }
        },
        legend: {
            text: { fill: '#9ca3af', fontSize: 12, fontWeight: 500 }
        }
    },
    grid: {
        line: { stroke: '#374151', strokeWidth: 1, strokeDasharray: '3 3' }
    },
    legends: {
        text: { fill: '#9ca3af', fontSize: 11 }
    },
    tooltip: {
        container: {
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid #374151',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#fff',
            fontSize: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }
    },
    crosshair: {
        line: {
            stroke: '#10b981',
            strokeWidth: 1,
            strokeOpacity: 0.5,
        }
    }
};

export const commonChartProps = {
    theme: nivoTheme,
    animate: true,
    motionConfig: "gentle"
};

// Format large numbers
export const formatValue = (v) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
    return Math.round(v);
};
