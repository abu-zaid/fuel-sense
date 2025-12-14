'use client';

import { useEffect, useState, memo } from 'react';
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
  Target,
  Clock,
  Bell,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus
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

interface PredictiveAnalytics {
  estimatedDaysToRefuel: number;
  estimatedDate: Date | null;
  confidence: 'high' | 'medium' | 'low';
  avgDaysBetweenRefuels: number;
  avgDistancePerDay: number;
}

interface SpendingAlert {
  type: 'warning' | 'danger' | 'info';
  message: string;
  percentage: number;
}

function Analytics({ vehicleId }: AnalyticsProps) {
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
  const [predictive, setPredictive] = useState<PredictiveAnalytics | null>(null);
  const [spendingAlerts, setSpendingAlerts] = useState<SpendingAlert[]>([]);

  useEffect(() => {
    if (vehicleId) {
      loadAnalytics();
    }
  }, [vehicleId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const { entries } = await getFuelEntries(vehicleId, 200);
      setEntries(entries);
      
      // Process monthly analytics
      const monthlyMap = new Map<string, FuelEntry[]>();
      entries.forEach(entry => {
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
      const prices: PriceAnalysis[] = entries
        .map((entry, index) => {
          const windowSize = 5;
          const start = Math.max(0, index - windowSize + 1);
          const window = entries.slice(start, index + 1);
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
      if (entries.length > 0) {
        const efficiencies = entries.map(e => e.efficiency).filter(e => e > 0);
        const bestEff = Math.max(...efficiencies);
        const worstEff = Math.min(...efficiencies);
        
        // Calculate average cost per km correctly: total cost / total distance
        const totalCost = entries.reduce((sum, e) => sum + e.amount, 0);
        const totalDistance = entries.reduce((sum, e) => sum + e.distance, 0);
        const avgCostKm = totalDistance > 0 ? totalCost / totalDistance : 0;
        
        // Recent trend analysis
        const recentEntries = entries.slice(0, 10);
        const olderEntries = entries.slice(10, 20);
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
        const last30Days = entries.filter(e => new Date(e.created_at) > thirtyDaysAgo);
        const projMonthlyCost = last30Days.reduce((sum, e) => sum + e.amount, 0);
        const projMonthlyDistance = last30Days.reduce((sum, e) => sum + e.distance, 0);

        // Fuel savings opportunity (if you reach best efficiency)
        const currentAvgEff = entries.reduce((sum, e) => sum + e.efficiency, 0) / entries.length;
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

        // Predictive Analytics - Estimate next refuel
        if (entries.length >= 3) {
          const sortedEntries = [...entries].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          // Calculate average days between refuels
          const daysBetween: number[] = [];
          for (let i = 1; i < sortedEntries.length; i++) {
            const days = (new Date(sortedEntries[i].created_at).getTime() - 
                         new Date(sortedEntries[i - 1].created_at).getTime()) / (1000 * 60 * 60 * 24);
            daysBetween.push(days);
          }
          
          const avgDays = daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length;
          const lastRefuelDate = new Date(sortedEntries[sortedEntries.length - 1].created_at);
          const daysSinceLastRefuel = (Date.now() - lastRefuelDate.getTime()) / (1000 * 60 * 60 * 24);
          const estimatedDays = Math.max(0, avgDays - daysSinceLastRefuel);
          
          // Calculate average distance per day
          const totalDays = (new Date(sortedEntries[sortedEntries.length - 1].created_at).getTime() - 
                            new Date(sortedEntries[0].created_at).getTime()) / (1000 * 60 * 60 * 24);
          const avgDistancePerDay = totalDistance / totalDays;
          
          // Determine confidence based on consistency of refuel intervals
          const variance = daysBetween.reduce((sum, days) => sum + Math.pow(days - avgDays, 2), 0) / daysBetween.length;
          const stdDev = Math.sqrt(variance);
          const coefficientOfVariation = stdDev / avgDays;
          
          let confidence: 'high' | 'medium' | 'low';
          if (coefficientOfVariation < 0.3 && daysBetween.length >= 5) confidence = 'high';
          else if (coefficientOfVariation < 0.5 && daysBetween.length >= 3) confidence = 'medium';
          else confidence = 'low';
          
          const estimatedDate = new Date();
          estimatedDate.setDate(estimatedDate.getDate() + Math.round(estimatedDays));
          
          setPredictive({
            estimatedDaysToRefuel: Math.round(estimatedDays),
            estimatedDate,
            confidence,
            avgDaysBetweenRefuels: avgDays,
            avgDistancePerDay,
          });
        }

        // Spending Alerts - Compare current month with average
        const alerts: SpendingAlert[] = [];
        
        if (monthly.length >= 2) {
          const currentMonth = monthly[monthly.length - 1];
          const previousMonths = monthly.slice(0, -1);
          const avgMonthlyCost = previousMonths.reduce((sum, m) => sum + m.totalCost, 0) / previousMonths.length;
          
          if (currentMonth.totalCost > avgMonthlyCost) {
            const percentAbove = ((currentMonth.totalCost - avgMonthlyCost) / avgMonthlyCost) * 100;
            
            if (percentAbove > 50) {
              alerts.push({
                type: 'danger',
                message: 'Current month spending is significantly higher than average',
                percentage: percentAbove,
              });
            } else if (percentAbove > 20) {
              alerts.push({
                type: 'warning',
                message: 'Current month spending exceeds monthly average',
                percentage: percentAbove,
              });
            }
          } else if (currentMonth.totalCost < avgMonthlyCost * 0.7) {
            const percentBelow = ((avgMonthlyCost - currentMonth.totalCost) / avgMonthlyCost) * 100;
            alerts.push({
              type: 'info',
              message: 'Great! Spending is below average this month',
              percentage: percentBelow,
            });
          }
          
          // Check efficiency trend
          const avgMonthlyEfficiency = previousMonths.reduce((sum, m) => sum + m.avgEfficiency, 0) / previousMonths.length;
          if (currentMonth.avgEfficiency < avgMonthlyEfficiency * 0.9) {
            const percentBelow = ((avgMonthlyEfficiency - currentMonth.avgEfficiency) / avgMonthlyEfficiency) * 100;
            alerts.push({
              type: 'warning',
              message: 'Fuel efficiency has decreased this month',
              percentage: percentBelow,
            });
          }
        }
        
        setSpendingAlerts(alerts);
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
      {/* Spending Alerts */}
      {spendingAlerts.length > 0 && (
        <div className="space-y-3">
          {spendingAlerts.map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 border-0 ${
                alert.type === 'danger' 
                  ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900'
                  : alert.type === 'warning'
                  ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900'
                  : 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900'
              }`}>
                <div className="flex items-center gap-3">
                  <Bell className={`w-5 h-5 ${
                    alert.type === 'danger' 
                      ? 'text-red-600' 
                      : alert.type === 'warning' 
                      ? 'text-amber-600' 
                      : 'text-green-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-900 dark:text-white">
                      {alert.message}
                    </p>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      {alert.type === 'info' ? 'Saving' : 'Exceeding by'} {alert.percentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className={`text-2xl font-bold ${
                    alert.type === 'danger' 
                      ? 'text-red-600' 
                      : alert.type === 'warning' 
                      ? 'text-amber-600' 
                      : 'text-green-600'
                  }`}>
                    {alert.type === 'info' ? '↓' : '↑'}{alert.percentage.toFixed(0)}%
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Predictive Analytics */}
      {predictive && (
        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-stone-900 dark:text-white">Predictive Analytics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-stone-50 dark:bg-indigo-900/50 rounded-xl p-4">
              <p className="text-sm text-stone-600 dark:text-stone-300 mb-2">Next Refuel Estimate</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {predictive.estimatedDaysToRefuel === 0 ? 'Soon' : `${predictive.estimatedDaysToRefuel}d`}
              </p>
              {predictive.estimatedDate && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  {predictive.estimatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${
                  predictive.confidence === 'high' 
                    ? 'bg-green-500' 
                    : predictive.confidence === 'medium' 
                    ? 'bg-amber-500' 
                    : 'bg-red-500'
                }`} />
                <span className="text-xs text-stone-600 dark:text-stone-400 capitalize">
                  {predictive.confidence} confidence
                </span>
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-indigo-900/50 rounded-xl p-4">
              <p className="text-sm text-stone-600 dark:text-stone-300 mb-2">Avg Days Between Refuels</p>
              <p className="text-3xl font-bold text-stone-900 dark:text-white">
                {predictive.avgDaysBetweenRefuels.toFixed(1)}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">days</p>
            </div>
            <div className="bg-stone-50 dark:bg-indigo-900/50 rounded-xl p-4">
              <p className="text-sm text-stone-600 dark:text-stone-300 mb-2">Avg Distance Per Day</p>
              <p className="text-3xl font-bold text-stone-900 dark:text-white">
                {predictive.avgDistancePerDay.toFixed(1)}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">km/day</p>
            </div>
          </div>
        </Card>
      )}

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
            <Activity className="w-6 h-6 text-purple-600" />
            <h4 className="font-semibold text-stone-900 dark:text-white">Efficiency Trend</h4>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {Math.abs(insights.efficiencyTrend).toFixed(1)}%
            </p>
            {insights.efficiencyTrend > 2 ? (
              <div className="flex items-center gap-1">
                <ArrowUpRight className="w-6 h-6 text-green-500" />
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">Improving</span>
              </div>
            ) : insights.efficiencyTrend < -2 ? (
              <div className="flex items-center gap-1">
                <ArrowDownRight className="w-6 h-6 text-red-500" />
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">Declining</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Minus className="w-6 h-6 text-stone-400" />
                <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">Stable</span>
              </div>
            )}
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-2">
            vs previous 10 entries
          </p>
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
      <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl">
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

      {/* Cost Comparison Month-over-Month */}
      <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-blue-50/30 to-stone-50 dark:from-blue-950/30 dark:to-slate-900 rounded-3xl">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
          <IndianRupee className="w-6 h-6 text-blue-600" />
          Cost Comparison - Month over Month
        </h3>
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {monthlyData.slice(-4).map((month, idx) => {
            const prevMonth = monthlyData[monthlyData.length - 5 + idx];
            const change = prevMonth 
              ? ((month.totalCost - prevMonth.totalCost) / prevMonth.totalCost) * 100 
              : 0;
            return (
              <div key={month.month} className="bg-stone-50 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-xs text-stone-500 dark:text-stone-400">{month.month}</p>
                <p className="text-lg font-bold text-stone-900 dark:text-white">
                  ₹{month.totalCost.toFixed(0)}
                </p>
                {prevMonth && (
                  <div className="flex items-center gap-1 mt-1">
                    {change > 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-red-500" />
                    ) : change < 0 ? (
                      <ArrowDownRight className="w-3 h-3 text-green-500" />
                    ) : (
                      <Minus className="w-3 h-3 text-stone-400" />
                    )}
                    <span className={`text-xs font-semibold ${
                      change > 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : change < 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-stone-500'
                    }`}>
                      {Math.abs(change).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} strokeWidth={1} />
            <XAxis dataKey="month" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Legend />
            <Bar yAxisId="left" dataKey="totalCost" fill="#3b82f6" name="Total Cost (₹)" radius={[12, 12, 0, 0]} animationDuration={1000} animationEasing="ease-out" />
            <Line yAxisId="right" type="monotone" dataKey="totalDistance" stroke="#10b981" strokeWidth={3} name="Distance (km)" dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} animationDuration={1000} animationEasing="ease-out" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Cost per KM Trend */}
      <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-purple-50/30 to-stone-50 dark:from-purple-950/30 dark:to-slate-900 rounded-3xl">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
          Cost per Kilometer Trend
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="costPerKmGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} strokeWidth={1} />
            <XAxis dataKey="month" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area 
              type="monotone" 
              dataKey="costPerKm" 
              stroke="#8b5cf6" 
              strokeWidth={3} 
              fill="url(#costPerKmGradient)" 
              name="Cost per KM (₹)"
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }}
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Fuel Price Analysis */}
      <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-amber-50/30 to-stone-50 dark:from-amber-950/30 dark:to-slate-900 rounded-3xl">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
          Fuel Price Trend & Moving Average
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={priceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} strokeWidth={1} />
            <XAxis dataKey="date" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#f97316" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#f97316' }}
              name="Price (₹/L)"
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Line 
              type="monotone" 
              dataKey="movingAvg" 
              stroke="#06b6d4" 
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
              name="Moving Avg"
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Monthly Efficiency */}
      <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-green-50/30 to-stone-50 dark:from-green-950/30 dark:to-slate-900 rounded-3xl">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
          Monthly Fuel Efficiency
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} strokeWidth={1} />
            <XAxis dataKey="month" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="avgEfficiency" fill="#10b981" name="Avg Efficiency (km/l)" radius={[12, 12, 0, 0]} animationDuration={1000} animationEasing="ease-out">
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
      <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-teal-50/30 to-stone-50 dark:from-teal-950/30 dark:to-slate-900 rounded-3xl">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
          Efficiency vs Fuel Consumption Pattern
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} strokeWidth={1} />
            <XAxis 
              type="number" 
              dataKey="fuel_used" 
              name="Fuel Used" 
              unit="L" 
              stroke="rgba(148, 163, 184, 0.4)" 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="number" 
              dataKey="efficiency" 
              name="Efficiency" 
              unit="km/l" 
              stroke="rgba(148, 163, 184, 0.4)" 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3">
                      <p className="text-sm font-semibold text-stone-900 dark:text-white">
                        Fuel: {Number(payload[0].value).toFixed(2)} L
                      </p>
                      <p className="text-sm font-semibold text-stone-900 dark:text-white">
                        Efficiency: {Number(payload[1].value).toFixed(2)} km/l
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

export default memo(Analytics);
