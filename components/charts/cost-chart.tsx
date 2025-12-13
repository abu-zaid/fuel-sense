import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMonthlyCosts } from '@/lib/services';
import type { MonthlyCost } from '@/lib/types';

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

  if (loading || data.length === 0) {
    return (
      <Card className="p-6 border-0 shadow-sm">
        <p className="text-stone-600">No cost data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-0 shadow-sm">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Monthly Cost</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="month" stroke="#78716c" />
          <YAxis stroke="#78716c" />
          <Tooltip contentStyle={{ backgroundColor: '#fafaf8', border: '1px solid #d6d3d1' }} />
          <Bar dataKey="cost" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
