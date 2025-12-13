'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMonthlyCosts } from '@/lib/services';
import type { MonthlyCost } from '@/lib/types';
import { DollarSign } from 'lucide-react';

interface CostChartProps {
  vehicleId?: string;
}

export default function CostChart({ vehicleId }: CostChartProps) {
  const [data, setData] = useState<MonthlyCost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [vehicleId]);

  const loadData = async () => {
    if (!vehicleId) return;
    try {
      const result = await getMonthlyCosts(vehicleId);
      setData(result);
    } catch (error) {
      console.error('Failed to load cost data:', error);
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
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-green-500/10 border-0 p-4 min-w-[140px]">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2">{String(label)}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              ₹{value.toFixed(2)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-stone-50 via-green-50/30 to-stone-100 dark:from-slate-800 dark:via-green-900/10 dark:to-slate-900 rounded-3xl overflow-hidden">
        <div className="h-[300px] rounded-2xl bg-gradient-to-br from-stone-200/20 to-stone-300/20 dark:from-slate-700/30 dark:to-slate-600/30 animate-pulse" />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-12 border-0 shadow-lg bg-gradient-to-br from-green-50/50 via-stone-50 to-stone-100 dark:from-green-900/10 dark:via-slate-800 dark:to-slate-900 rounded-3xl text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-stone-900 dark:text-stone-100 font-semibold text-lg">
          No cost data available
        </p>
        <p className="text-stone-600 dark:text-stone-400 text-sm mt-2">
          Add fuel entries to see monthly costs
        </p>
      </Card>
    );
  }

  // Calculate total cost for display
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);

  return (
    <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-stone-50 via-green-50/30 to-stone-100 dark:from-slate-800 dark:via-green-900/10 dark:to-slate-900 rounded-3xl overflow-hidden backdrop-blur-sm outline-none focus:outline-none active:outline-none touch-manipulation">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/25">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            Monthly Cost
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
            Total:{' '}
            <span className="font-bold text-lg text-green-600 dark:text-green-400">
              ₹{totalCost.toFixed(2)}
            </span>
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart 
          data={data} 
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0.4} />
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(148, 163, 184, 0.2)" 
            vertical={false}
            strokeWidth={1}
          />

          <XAxis 
            dataKey="month" 
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
          />

          <Tooltip content={<CustomTooltip />} cursor={false} />

          <Bar 
            dataKey="cost" 
            fill="url(#colorCost)"
            radius={[12, 12, 0, 0]}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
