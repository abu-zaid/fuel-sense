'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area,
  ScatterChart,
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  IndianRupee,
  Gauge,
  Navigation,
  Droplet,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Target
} from 'lucide-react';
import { getFuelEntries } from '@/lib/services';
import type { FuelEntry } from '@/lib/types';

interface AnalyticsProps {
  vehicleId?: string;
}

interface MonthlyAnalytics {
  month: string;
  totalCost: number;
  totalDistance: number;
  totalFuel: number;
  avgEfficiency: number;
  avgPricePerLiter: number;
  costPerKm: number;
  entries: number;
}

interface PriceAnalysis {
  date: string;
  price: number;
  movingAvg: number;
}

interface EfficiencyInsight {
  category: string;
  value: number;
  color: string;
}

export default function Analytics({ vehicleId }: AnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalytics[]>([]);
  const [priceData, setPriceData] = useState<PriceAnalysis[]>([]);
  const [insights, setInsights] = useState({
    bestEfficiency: 0,
    worstEfficiency: 0,
    avgCostPerKm: 0,
    projectedMonthlyCost: 0,
    projectedMonthlyDistance: 0,
    efficiencyTrend: 0,
    costTrend: 0,
    fuelSavingsOpportunity: 0,
  });

  useEffect(() => {
    if (vehicleId) {
      loadAnalytics();
    }
  }, [vehicleId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getFuelEntries(vehicleId, 200);
      setEntries(data);
      
      // Process monthly analytics
      const monthlyMap = new Map<string, FuelEntry[]>();
      data.forEach(entry => {
        const date = new Date(entry.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, []);
        }
        monthlyMap.get(monthKey)?.push(entry);
      });

      const monthly: MonthlyAnalytics[] = Array.from(monthlyMap.entries())
        .map(([month, monthEntries]) => {
          const totalCost = monthEntries.reduce((sum, e) => sum + e.amount, 0);
          const totalDistance = monthEntries.reduce((sum, e) => sum + e.distance, 0);
          const totalFuel = monthEntries.reduce((sum, e) => sum + e.fuel_used, 0);
          const avgEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;
          const avgPricePerLiter = monthEntries.reduce((sum, e) => sum + e.petrol_price, 0) / monthEntries.length;
          const costPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;
          
          return {
            month,
            totalCost,
            totalDistance,
            totalFuel,
            avgEfficiency,
            avgPricePerLiter,
            costPerKm,
            entries: monthEntries.length,
          };
        })
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12);

      setMonthlyData(monthly);

      // Process price analysis with moving average
      const prices: PriceAnalysis[] = data
        .map((entry, index) => {
          const windowSize = 5;
          const start = Math.max(0, index - windowSize + 1);
          const window = data.slice(start, index + 1);
          const movingAvg = window.reduce((sum, e) => sum + e.petrol_price, 0) / window.length;
          
          return {
            date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: entry.petrol_price,
            movingAvg,
          };
        })
        .reverse()
        .slice(-30);

      setPriceData(prices);

      // Calculate insights
      if (data.length > 0) {
        const efficiencies = data.map(e => e.efficiency).filter(e => e > 0);
        const bestEff = Math.max(...efficiencies);
        const worstEff = Math.min(...efficiencies);
        const avgCostKm = data.reduce((sum, e) => sum + (e.amount / (e.distance || 1)), 0) / data.length;
        
        // Recent trend analysis
        const recentEntries = data.slice(0, 10);
        const olderEntries = data.slice(10, 20);
        const recentAvgEff = recentEntries.reduce((sum, e) => sum + e.efficiency, 0) / recentEntries.length;
        const olderAvgEff = olderEntries.length > 0 
          ? olderEntries.reduce((sum, e) => sum + e.efficiency, 0) / olderEntries.length 
          : recentAvgEff;
        const effTrend = olderAvgEff > 0 ? ((recentAvgEff - olderAvgEff) / olderAvgEff) * 100 : 0;

        const recentAvgCost = recentEntries.reduce((sum, e) => sum + e.amount, 0) / recentEntries.length;
        const olderAvgCost = olderEntries.length > 0
          ? olderEntries.reduce((sum, e) => sum + e.amount, 0) / olderEntries.length
          : recentAvgCost;
        const costTrend = olderAvgCost > 0 ? ((recentAvgCost - olderAvgCost) / olderAvgCost) * 100 : 0;

        // Projection based on last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const last30Days = data.filter(e => new Date(e.created_at) > thirtyDaysAgo);
        const projMonthlyCost = last30Days.reduce((sum, e) => sum + e.amount, 0);
        const projMonthlyDistance = last30Days.reduce((sum, e) => sum + e.distance, 0);

        // Fuel savings opportunity (if you reach best efficiency)
        const currentAvgEff = data.reduce((sum, e) => sum + e.efficiency, 0) / data.length;
        const savingsPercent = bestEff > 0 ? ((bestEff - currentAvgEff) / bestEff) * 100 : 0;

        setInsights({
          bestEfficiency: bestEff,
          worstEfficiency: worstEff,
          avgCostPerKm: avgCostKm,
          projectedMonthlyCost: projMonthlyCost,
          projectedMonthlyDistance: projMonthlyDistance,
          efficiencyTrend: effTrend,
          costTrend: costTrend,
          fuelSavingsOpportunity: savingsPercent,
        });
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">{String(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-64 bg-stone-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="p-12 text-center">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-stone-400" />
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">No Analytics Available</h3>
        <p className="text-stone-600 dark:text-stone-400">Add fuel entries to see detailed analytics</p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-0">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <h4 className="font-semibold text-stone-900 dark:text-white">Best Efficiency</h4>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {insights.bestEfficiency.toFixed(2)} km/l
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0">
          <div className="flex items-center gap-3 mb-2">
            <IndianRupee className="w-6 h-6 text-blue-600" />
            <h4 className="font-semibold text-stone-900 dark:text-white">Avg Cost/km</h4>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            ₹{insights.avgCostPerKm.toFixed(2)}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-0">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-purple-600" />
            <h4 className="font-semibold text-stone-900 dark:text-white">Efficiency Trend</h4>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {Math.abs(insights.efficiencyTrend).toFixed(2)}%
            </p>
            {insights.efficiencyTrend > 0 ? (
              <TrendingUp className="w-6 h-6 text-green-500" />
            ) : insights.efficiencyTrend < 0 ? (
              <TrendingDown className="w-6 h-6 text-red-500" />
            ) : null}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-0">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h4 className="font-semibold text-stone-900 dark:text-white">Savings Potential</h4>
          </div>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {insights.fuelSavingsOpportunity.toFixed(2)}%
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            by reaching best efficiency
          </p>
        </Card>
      </div>

      {/* Monthly Projections */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Monthly Projections (Based on Last 30 Days)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-stone-50 dark:bg-slate-800 rounded-xl">
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">Projected Cost</p>
            <p className="text-3xl font-bold text-stone-900 dark:text-white">
              ₹{insights.projectedMonthlyCost.toFixed(0)}
            </p>
          </div>
          <div className="text-center p-4 bg-stone-50 dark:bg-slate-800 rounded-xl">
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">Projected Distance</p>
            <p className="text-3xl font-bold text-stone-900 dark:text-white">
              {insights.projectedMonthlyDistance.toFixed(0)} km
            </p>
          </div>
          <div className="text-center p-4 bg-stone-50 dark:bg-slate-800 rounded-xl">
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">Cost Trend</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-bold text-stone-900 dark:text-white">
                {Math.abs(insights.costTrend).toFixed(2)}%
              </p>
              {insights.costTrend > 0 ? (
                <TrendingUp className="w-6 h-6 text-red-500" />
              ) : insights.costTrend < 0 ? (
                <TrendingDown className="w-6 h-6 text-green-500" />
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      {/* Monthly Cost vs Distance */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
          Monthly Cost & Distance Analysis
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="totalCost" fill="#3b82f6" name="Total Cost (₹)" radius={[8, 8, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="totalDistance" stroke="#10b981" strokeWidth={3} name="Distance (km)" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Cost per KM Trend */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
          Cost per Kilometer Trend
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="costPerKmGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="costPerKm" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              fill="url(#costPerKmGradient)" 
              name="Cost/km (₹)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Fuel Price Analysis */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
          Fuel Price Trend & Moving Average
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#f97316" 
              strokeWidth={2}
              dot={{ fill: '#f97316', r: 3 }}
              name="Price (₹/L)"
            />
            <Line 
              type="monotone" 
              dataKey="movingAvg" 
              stroke="#06b6d4" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Moving Avg"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Monthly Efficiency */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
          Monthly Fuel Efficiency
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgEfficiency" fill="#10b981" name="Avg Efficiency (km/l)" radius={[8, 8, 0, 0]}>
              {monthlyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.avgEfficiency >= insights.bestEfficiency * 0.9 ? '#10b981' : '#f59e0b'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Efficiency vs Fuel Used Scatter */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
          Efficiency vs Fuel Consumption Pattern
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number" 
              dataKey="fuel_used" 
              name="Fuel Used" 
              unit="L" 
              stroke="#94a3b8" 
              fontSize={12}
            />
            <YAxis 
              type="number" 
              dataKey="efficiency" 
              name="Efficiency" 
              unit="km/l" 
              stroke="#94a3b8" 
              fontSize={12}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3">
                      <p className="text-sm font-semibold text-stone-900 dark:text-white">
                        Fuel: {payload[0].value}L
                      </p>
                      <p className="text-sm font-semibold text-stone-900 dark:text-white">
                        Efficiency: {payload[1].value} km/l
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter 
              data={entries.slice(0, 50)} 
              fill="#8b5cf6"
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}
