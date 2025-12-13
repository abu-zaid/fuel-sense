import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getEfficiencyData } from '@/lib/services';
import type { EfficiencyData } from '@/lib/types';
import { TrendingUp } from 'lucide-react';

interface EfficiencyChartProps {
  vehicleId?: string;
  compact?: boolean;
}

export default function EfficiencyChart({ vehicleId, compact = false }: EfficiencyChartProps) {
  const [data, setData] = useState<EfficiencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgEfficiency, setAvgEfficiency] = useState(0);

  useEffect(() => {
    loadData();
  }, [vehicleId]);

  const loadData = async () => {
    if (!vehicleId) return;
    try {
      const result = await getEfficiencyData(vehicleId);
      setData(result);
      if (result.length > 0) {
        const avg = result.reduce((sum, item) => sum + item.efficiency, 0) / result.length;
        setAvgEfficiency(parseFloat(avg.toFixed(2)));
      }
    } catch (error) {
      console.error('Failed to load efficiency data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl overflow-hidden">
        <div className="h-[300px] rounded-xl bg-gradient-to-br from-stone-200/30 to-stone-300/30"></div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-12 border-0 shadow-sm bg-gradient-to-br from-amber-50 to-stone-50 rounded-2xl text-center">
        <TrendingUp className="w-12 h-12 mx-auto text-amber-500 mb-3 opacity-50" />
        <p className="text-stone-600 font-medium">No efficiency data available yet</p>
        <p className="text-stone-500 text-sm mt-1">Add fuel entries to see trends</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-stone-50 overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Efficiency Trend
          </h3>
          <p className="text-sm text-stone-600 mt-1">Average: <span className="font-semibold text-blue-600">{avgEfficiency} km/l</span></p>
        </div>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={compact ? 200 : 320}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#a8a29e"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#a8a29e' }}
            />
            <YAxis 
              stroke="#a8a29e"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#a8a29e' }}
              label={{ value: 'km/l', angle: -90, position: 'insideLeft', style: { fill: '#a8a29e' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fafaf8', 
                border: '1px solid #d6d3d1',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [`${value.toFixed(2)} km/l`, 'Efficiency']}
              labelStyle={{ color: '#78716c' }}
            />
            <Area
              type="monotone"
              dataKey="efficiency"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorEfficiency)"
              dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
