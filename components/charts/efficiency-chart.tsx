'use client';

import { useEffect, useState, memo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { getEfficiencyData } from '@/lib/services';
import type { EfficiencyData } from '@/lib/types';
import { TrendingUp } from 'lucide-react';

interface EfficiencyChartProps {
  vehicleId?: string;
  compact?: boolean;
}

function EfficiencyChart({
  vehicleId,
  compact = false,
}: EfficiencyChartProps) {
  const [data, setData] = useState<EfficiencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgEfficiency, setAvgEfficiency] = useState<number>(0);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const loadData = async () => {
    if (!vehicleId) return;

    try {
      const result = await getEfficiencyData(vehicleId);
      setData(result);

      if (result.length > 0) {
        // Calculate average efficiency properly: total distance / total fuel used
        // This matches the calculation in getDashboardStats
        const totalDistance = result.reduce((sum, item) => sum + Number(item.distance || 0), 0);
        const totalFuelUsed = result.reduce((sum, item) => sum + Number(item.fuel_used || 0), 0);
        
        const avg = totalFuelUsed > 0 ? totalDistance / totalFuelUsed : 0;
        setAvgEfficiency(Number(avg.toFixed(2)));
      }
    } catch (error) {
      console.error('Failed to load efficiency data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Custom Tooltip Component
  const CustomTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      const value = payload[0].value as number;
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-500/10 border-0 p-4 min-w-[140px]">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2">{String(label)}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {value.toFixed(2)} <span className="text-sm font-normal text-stone-600 dark:text-stone-400">km/l</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="p-6 border-0 shadow-2xl bg-gradient-to-br from-stone-50 via-blue-50/50 to-stone-100 dark:from-slate-800 dark:via-blue-900/20 dark:to-slate-900 rounded-3xl overflow-hidden">
        <div className="h-[300px] rounded-2xl bg-gradient-to-br from-stone-200/20 to-stone-300/20 dark:from-slate-700/30 dark:to-slate-600/30 animate-pulse" />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-12 border-0 shadow-lg bg-gradient-to-br from-amber-50/50 via-stone-50 to-stone-100 dark:from-amber-900/10 dark:via-slate-800 dark:to-slate-900 rounded-3xl text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <p className="text-stone-900 dark:text-stone-100 font-semibold text-lg">
          No efficiency data available yet
        </p>
        <p className="text-stone-600 dark:text-stone-400 text-sm mt-2">
          Add fuel entries to see trends
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-stone-50 via-blue-50/30 to-stone-100 dark:from-slate-800 dark:via-blue-900/10 dark:to-slate-900 rounded-3xl overflow-hidden backdrop-blur-sm outline-none focus:outline-none active:outline-none touch-manipulation">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            Efficiency Trend
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
            Average:{' '}
            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
              {avgEfficiency} km/l
            </span>
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={compact ? 200 : 320}>
        <AreaChart 
          data={data} 
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="strokeEfficiency" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(148, 163, 184, 0.2)" 
            vertical={false}
            strokeWidth={1}
          />

          <XAxis
            dataKey="date"
            stroke="rgba(148, 163, 184, 0.4)"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            stroke="rgba(148, 163, 184, 0.4)"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: 'km/l',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#94a3b8', fontSize: 11, fontWeight: 500 },
            }}
          />

          <Tooltip content={<CustomTooltip />} cursor={false} />

          <Area
            type="monotone"
            dataKey="efficiency"
            stroke="url(#strokeEfficiency)"
            strokeWidth={3}
            fill="url(#colorEfficiency)"
            dot={false}
            activeDot={{ 
              r: 6, 
              strokeWidth: 0, 
              fill: '#3b82f6',
              style: { filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4))' }
            }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default memo(EfficiencyChart);
