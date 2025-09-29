// Charts
'use client';
import React from 'react';
import { useTheme } from '@/theme';

export const AdvancedBarChart: React.FC<{ data: any; title: string }> = ({ data, title }) => {
  const { theme } = useTheme();
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
      <h3 className="text-lg font-semibold" style={{ color: theme.colors.semantic.text.primary }}>{title}</h3>
      <div className="h-64 flex items-center justify-center" style={{ color: theme.colors.semantic.text.secondary }}>
        Advanced Bar Chart Placeholder
      </div>
    </div>
  );
};

export const PieChart: React.FC<{ data: any; title: string }> = ({ data, title }) => {
  const { theme } = useTheme();
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
      <h3 className="text-lg font-semibold" style={{ color: theme.colors.semantic.text.primary }}>{title}</h3>
      <div className="h-64 flex items-center justify-center" style={{ color: theme.colors.semantic.text.secondary }}>
        Pie Chart Placeholder
      </div>
    </div>
  );
};

export const LineChart: React.FC<{ title: string; timeRange: string }> = ({ title, timeRange }) => {
  const { theme } = useTheme();
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
      <h3 className="text-lg font-semibold" style={{ color: theme.colors.semantic.text.primary }}>{title}</h3>
      <div className="h-64 flex items-center justify-center" style={{ color: theme.colors.semantic.text.secondary }}>
        Line Chart for {timeRange}
      </div>
    </div>
  );
};

export const HeatmapChart: React.FC<{ title: string; timeRange: string }> = ({ title, timeRange }) => {
  const { theme } = useTheme();
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
      <h3 className="text-lg font-semibold" style={{ color: theme.colors.semantic.text.primary }}>{title}</h3>
      <div className="h-64 flex items-center justify-center" style={{ color: theme.colors.semantic.text.secondary }}>
        Heatmap for {timeRange}
      </div>
    </div>
  );
};