'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFuelEntries, getMonthlyCosts } from '@/lib/services';
import type { FuelEntry, MonthlyCost } from '@/lib/types';

interface StatCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'cost' | 'distance' | 'efficiency' | 'fuel' | 'costPerKm';
  value: string;
  vehicleId?: string;
}

interface TrendData {
  date: string;
  value: number;
}

export default function StatCardModal({ isOpen, onClose, type, value, vehicleId }: StatCardModalProps) {
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    min: 0,
    max: 0,
    trend: 0,
    lastMonth: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    if (isOpen && vehicleId) {
      loadData();
    }
  }, [isOpen, vehicleId, type]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getFuelEntries(vehicleId, 50);
      setEntries(data);
      
      // Process data based on type
      let processedData: TrendData[] = [];
      let values: number[] = [];

      switch (type) {
        case 'cost':
          processedData = data.map(entry => ({
            date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: entry.amount
          })).reverse();
          values = data.map(e => e.amount);
          break;
        case 'distance':
          processedData = data.map(entry => ({
            date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: entry.distance
          })).reverse();
          values = data.map(e => e.distance);
          break;
        case 'efficiency':
          processedData = data.map(entry => ({
            date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: entry.efficiency
          })).reverse();
          values = data.map(e => e.efficiency);
          break;
        case 'fuel':
          processedData = data.map(entry => ({
            date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: entry.fuel_used
          })).reverse();
          values = data.map(e => e.fuel_used);
          break;
        case 'costPerKm':
          processedData = data.map(entry => ({
            date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: entry.distance > 0 ? entry.amount / entry.distance : 0
          })).reverse();
          values = data.map(e => e.distance > 0 ? e.amount / e.distance : 0);
          break;
      }

      setTrendData(processedData);

      // Calculate stats
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        // Calculate trend (last 5 vs previous 5)
        const recent = values.slice(0, 5);
        const previous = values.slice(5, 10);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const prevAvg = previous.length > 0 ? previous.reduce((a, b) => a + b, 0) / previous.length : recentAvg;
        const trend = prevAvg > 0 ? ((recentAvg - prevAvg) / prevAvg) * 100 : 0;

        // Calculate this month vs last month
        const now = new Date();
        const thisMonthData = data.filter(e => {
          const entryDate = new Date(e.created_at);
          return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
        });
        const lastMonthData = data.filter(e => {
          const entryDate = new Date(e.created_at);
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return entryDate.getMonth() === lastMonth.getMonth() && entryDate.getFullYear() === lastMonth.getFullYear();
        });

        const thisMonthValue = thisMonthData.reduce((sum, e) => {
          switch (type) {
            case 'cost': return sum + e.amount;
            case 'distance': return sum + e.distance;
            case 'efficiency': return sum + e.efficiency;
            case 'fuel': return sum + e.fuel_used;
            case 'costPerKm': return sum + (e.distance > 0 ? e.amount / e.distance : 0);
            default: return sum;
          }
        }, 0) / (thisMonthData.length || 1);

        const lastMonthValue = lastMonthData.reduce((sum, e) => {
          switch (type) {
            case 'cost': return sum + e.amount;
            case 'distance': return sum + e.distance;
            case 'efficiency': return sum + e.efficiency;
            case 'fuel': return sum + e.fuel_used;
            case 'costPerKm': return sum + (e.distance > 0 ? e.amount / e.distance : 0);
            default: return sum;
          }
        }, 0) / (lastMonthData.length || 1);

        setStats({
          average: avg,
          min,
          max,
          trend,
          lastMonth: lastMonthValue,
          thisMonth: thisMonthValue,
        });
      }
    } catch (error) {
      console.error('Failed to load modal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'cost': return 'Fuel Cost Analysis';
      case 'distance': return 'Distance Traveled';
      case 'efficiency': return 'Fuel Efficiency';
      case 'fuel': return 'Fuel Consumption';
      case 'costPerKm': return 'Cost per Kilometer';
    }
  };

  const getUnit = () => {
    switch (type) {
      case 'cost': return '₹';
      case 'distance': return 'km';
      case 'efficiency': return 'km/l';
      case 'fuel': return 'L';
      case 'costPerKm': return '₹/km';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'cost': return '#3b82f6';
      case 'distance': return '#10b981';
      case 'efficiency': return '#8b5cf6';
      case 'fuel': return '#f97316';
    }
  };

  const CustomTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
          const value = payload[0].value as number;
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-sm font-bold" style={{ color: getColor() }}>
            {type === 'cost' ? getUnit() : ''}{value.toFixed(2)}{type !== 'cost' ? ' ' + getUnit() : ''}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">{payload[0].payload.date}</p>
        </div>
      );
    }
    return null;
  };

  const TrendIndicator = ({ value }: { value: number }) => {
    if (Math.abs(value) < 0.1) {
      return (
        <div className="flex items-center gap-1 text-stone-500">
          <Minus className="w-4 h-4" />
          <span className="text-sm font-medium">Stable</span>
        </div>
      );
    }
    return value > 0 ? (
      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
        <TrendingUp className="w-4 h-4" />
        <span className="text-sm font-medium">+{value.toFixed(1)}%</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
        <TrendingDown className="w-4 h-4" />
        <span className="text-sm font-medium">{value.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{getTitle()}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-stone-300 border-t-blue-500 rounded-full" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Current Value */}
            <div className="text-center py-6 bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl">
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">Current Total</p>
              <p className="text-4xl font-bold" style={{ color: getColor() }}>{value}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-stone-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs text-stone-600 dark:text-stone-400 mb-1">Average</p>
                <p className="text-lg font-bold text-stone-900 dark:text-white">
                  {type === 'cost' ? getUnit() : ''}{stats.average.toFixed(2)}{type !== 'cost' ? ' ' + getUnit() : ''}
                </p>
              </div>
              <div className="p-4 bg-stone-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs text-stone-600 dark:text-stone-400 mb-1">Minimum</p>
                <p className="text-lg font-bold text-stone-900 dark:text-white">
                  {type === 'cost' ? getUnit() : ''}{stats.min.toFixed(2)}{type !== 'cost' ? ' ' + getUnit() : ''}
                </p>
              </div>
              <div className="p-4 bg-stone-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs text-stone-600 dark:text-stone-400 mb-1">Maximum</p>
                <p className="text-lg font-bold text-stone-900 dark:text-white">
                  {type === 'cost' ? getUnit() : ''}{stats.max.toFixed(2)}{type !== 'cost' ? ' ' + getUnit() : ''}
                </p>
              </div>
              <div className="p-4 bg-stone-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs text-stone-600 dark:text-stone-400 mb-1">Trend</p>
                <TrendIndicator value={stats.trend} />
              </div>
            </div>

            {/* Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl">
                <p className="text-xs text-blue-800 dark:text-blue-300 mb-1">Last Month Avg</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {type === 'cost' ? getUnit() : ''}{stats.lastMonth.toFixed(2)}{type !== 'cost' ? ' ' + getUnit() : ''}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl">
                <p className="text-xs text-purple-800 dark:text-purple-300 mb-1">This Month Avg</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {type === 'cost' ? getUnit() : ''}{stats.thisMonth.toFixed(2)}{type !== 'cost' ? ' ' + getUnit() : ''}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="p-6 bg-stone-50 dark:bg-slate-800 rounded-2xl">
              <h4 className="text-sm font-semibold text-stone-900 dark:text-white mb-4">Trend Over Time</h4>
              <ResponsiveContainer width="100%" height={250}>
                {type === 'efficiency' ? (
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`color${type}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={getColor()} stopOpacity={0.4}/>
                        <stop offset="50%" stopColor={getColor()} stopOpacity={0.2}/>
                        <stop offset="100%" stopColor={getColor()} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} strokeWidth={1} />
                    <XAxis dataKey="date" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={getColor()} 
                      strokeWidth={3}
                      fill={`url(#color${type})`}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0, fill: getColor() }}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                ) : type === 'cost' ? (
                  <BarChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} strokeWidth={1} />
                    <XAxis dataKey="date" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar dataKey="value" fill={getColor()} radius={[12, 12, 0, 0]} animationDuration={1000} animationEasing="ease-out" />
                  </BarChart>
                ) : (
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} strokeWidth={1} />
                    <XAxis dataKey="date" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={getColor()} 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0, fill: getColor() }}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Recent Entries */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Recent Entries</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {entries.slice(0, 10).map((entry) => {
                  let displayValue = '';
                  switch (type) {
                    case 'cost': displayValue = `₹${entry.amount.toFixed(2)}`; break;
                    case 'distance': displayValue = `${entry.distance.toFixed(1)} km`; break;
                    case 'efficiency': displayValue = `${entry.efficiency.toFixed(1)} km/l`; break;
                    case 'fuel': displayValue = `${entry.fuel_used.toFixed(2)} L`; break;
                  }
                  
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-stone-900 dark:text-white">{displayValue}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {new Date(entry.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Odo: {entry.odo} km</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
