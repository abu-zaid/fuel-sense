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
  Cell,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
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
  Minus,
  PieChart as PieChartIcon,
  MapPin,
  Zap,
  Award,
  TrendingUpIcon
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

interface DayOfWeekAnalytics {
  day: string;
  count: number;
  avgCost: number;
  avgFuel: number;
}

interface DistanceDistribution {
  range: string;
  count: number;
  percentage: number;
}

interface SeasonalPattern {
  month: string;
  avgEfficiency: number;
  avgCost: number;
  count: number;
}

interface YearlyComparison {
  year: string;
  totalCost: number;
  totalDistance: number;
  avgEfficiency: number;
  totalFuel: number;
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
  const [dayOfWeekData, setDayOfWeekData] = useState<DayOfWeekAnalytics[]>([]);
  const [distanceDistribution, setDistanceDistribution] = useState<DistanceDistribution[]>([]);
  const [seasonalPatterns, setSeasonalPatterns] = useState<SeasonalPattern[]>([]);
  const [yearlyComparison, setYearlyComparison] = useState<YearlyComparison[]>([]);

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

        // Day of Week Analysis
        const dayMap = new Map<string, FuelEntry[]>();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        entries.forEach(entry => {
          const day = dayNames[new Date(entry.created_at).getDay()];
          if (!dayMap.has(day)) {
            dayMap.set(day, []);
          }
          dayMap.get(day)?.push(entry);
        });

        const dayAnalytics: DayOfWeekAnalytics[] = dayNames.map(day => {
          const dayEntries = dayMap.get(day) || [];
          return {
            day,
            count: dayEntries.length,
            avgCost: dayEntries.length > 0 
              ? dayEntries.reduce((sum, e) => sum + e.amount, 0) / dayEntries.length 
              : 0,
            avgFuel: dayEntries.length > 0
              ? dayEntries.reduce((sum, e) => sum + e.fuel_used, 0) / dayEntries.length
              : 0
          };
        });
        setDayOfWeekData(dayAnalytics);

        // Distance Distribution (Histogram)
        const distances = entries.map(e => e.distance).filter(d => d > 0);
        const ranges = [
          { min: 0, max: 100, label: '0-100 km' },
          { min: 100, max: 200, label: '100-200 km' },
          { min: 200, max: 300, label: '200-300 km' },
          { min: 300, max: 400, label: '300-400 km' },
          { min: 400, max: 500, label: '400-500 km' },
          { min: 500, max: Infinity, label: '500+ km' }
        ];

        const distribution: DistanceDistribution[] = ranges.map(range => {
          const count = distances.filter(d => d >= range.min && d < range.max).length;
          return {
            range: range.label,
            count,
            percentage: distances.length > 0 ? (count / distances.length) * 100 : 0
          };
        }).filter(d => d.count > 0);
        setDistanceDistribution(distribution);

        // Seasonal Patterns (aggregate by month name across all years)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const seasonalMap = new Map<string, FuelEntry[]>();
        
        entries.forEach(entry => {
          const monthName = monthNames[new Date(entry.created_at).getMonth()];
          if (!seasonalMap.has(monthName)) {
            seasonalMap.set(monthName, []);
          }
          seasonalMap.get(monthName)?.push(entry);
        });

        const seasonal: SeasonalPattern[] = monthNames.map(month => {
          const monthEntries = seasonalMap.get(month) || [];
          const totalDistance = monthEntries.reduce((sum, e) => sum + e.distance, 0);
          const totalFuel = monthEntries.reduce((sum, e) => sum + e.fuel_used, 0);
          
          return {
            month,
            avgEfficiency: totalFuel > 0 ? totalDistance / totalFuel : 0,
            avgCost: monthEntries.length > 0 
              ? monthEntries.reduce((sum, e) => sum + e.amount, 0) / monthEntries.length 
              : 0,
            count: monthEntries.length
          };
        }).filter(s => s.count > 0);
        setSeasonalPatterns(seasonal);

        // Yearly Comparison
        const yearMap = new Map<string, FuelEntry[]>();
        entries.forEach(entry => {
          const year = new Date(entry.created_at).getFullYear().toString();
          if (!yearMap.has(year)) {
            yearMap.set(year, []);
          }
          yearMap.get(year)?.push(entry);
        });

        const yearly: YearlyComparison[] = Array.from(yearMap.entries())
          .map(([year, yearEntries]) => {
            const totalCost = yearEntries.reduce((sum, e) => sum + e.amount, 0);
            const totalDistance = yearEntries.reduce((sum, e) => sum + e.distance, 0);
            const totalFuel = yearEntries.reduce((sum, e) => sum + e.fuel_used, 0);
            
            return {
              year,
              totalCost,
              totalDistance,
              avgEfficiency: totalFuel > 0 ? totalDistance / totalFuel : 0,
              totalFuel
            };
          })
          .sort((a, b) => a.year.localeCompare(b.year));
        setYearlyComparison(yearly);
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

      {/* Distance Distribution Histogram */}
      {distanceDistribution.length > 0 && (
        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-cyan-50/30 to-stone-50 dark:from-cyan-950/30 dark:to-slate-900 rounded-3xl">
          <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-cyan-600" />
            Distance Between Refuels Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distanceDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} strokeWidth={1} />
              <XAxis dataKey="range" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3">
                        <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">{String(payload[0].payload.range)}</p>
                        <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                          {payload[0].value} trips ({Number(payload[0].payload.percentage).toFixed(1)}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={false}
              />
              <Bar dataKey="count" fill="#06b6d4" name="Number of Trips" radius={[12, 12, 0, 0]} animationDuration={1000} animationEasing="ease-out">
                {distanceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`rgba(6, 182, 212, ${0.5 + (index * 0.1)})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Day of Week Pattern */}
      {dayOfWeekData.some(d => d.count > 0) && (
        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-rose-50/30 to-stone-50 dark:from-rose-950/30 dark:to-slate-900 rounded-3xl">
          <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-rose-600" />
            Refueling Pattern by Day of Week
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={dayOfWeekData.filter(d => d.count > 0)} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
              <PolarAngleAxis 
                dataKey="day" 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 'auto']}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Radar 
                name="Refuel Count" 
                dataKey="count" 
                stroke="#f43f5e" 
                fill="#f43f5e" 
                fillOpacity={0.5}
                animationDuration={1000}
                animationEasing="ease-out"
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3">
                        <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">{data.day}</p>
                        <p className="text-sm font-semibold text-stone-900 dark:text-white">
                          Refuels: {data.count}
                        </p>
                        <p className="text-sm font-semibold text-stone-900 dark:text-white">
                          Avg Cost: ₹{data.avgCost.toFixed(2)}
                        </p>
                        <p className="text-sm font-semibold text-stone-900 dark:text-white">
                          Avg Fuel: {data.avgFuel.toFixed(2)}L
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Seasonal Patterns */}
      {seasonalPatterns.length > 0 && (
        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-orange-50/30 to-stone-50 dark:from-orange-950/30 dark:to-slate-900 rounded-3xl">
          <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-600" />
            Seasonal Efficiency Patterns
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
            Average efficiency and costs across all years by month
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={seasonalPatterns} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} strokeWidth={1} />
              <XAxis dataKey="month" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="avgEfficiency" 
                fill="rgba(249, 115, 22, 0.2)" 
                stroke="#f97316" 
                strokeWidth={3}
                name="Avg Efficiency (km/l)"
                animationDuration={1000}
                animationEasing="ease-out"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgCost" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                name="Avg Cost (₹)"
                dot={{ fill: '#0ea5e9', strokeWidth: 0, r: 4 }}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Year-over-Year Comparison */}
      {yearlyComparison.length > 1 && (
        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-violet-50/30 to-stone-50 dark:from-violet-950/30 dark:to-slate-900 rounded-3xl">
          <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-violet-600" />
            Year-over-Year Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {yearlyComparison.map((year, index) => {
              const prevYear = index > 0 ? yearlyComparison[index - 1] : null;
              const costChange = prevYear ? ((year.totalCost - prevYear.totalCost) / prevYear.totalCost) * 100 : 0;
              const efficiencyChange = prevYear ? ((year.avgEfficiency - prevYear.avgEfficiency) / prevYear.avgEfficiency) * 100 : 0;
              
              return (
                <div key={year.year} className="bg-stone-50 dark:bg-slate-800 rounded-xl p-4">
                  <h4 className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-3">{year.year}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-stone-600 dark:text-stone-400">Total Cost</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 dark:text-white">₹{year.totalCost.toFixed(0)}</span>
                        {prevYear && (
                          <span className={`text-xs font-semibold ${costChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {costChange > 0 ? '↑' : '↓'}{Math.abs(costChange).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-stone-600 dark:text-stone-400">Distance</span>
                      <span className="font-bold text-stone-900 dark:text-white">{year.totalDistance.toFixed(0)} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-stone-600 dark:text-stone-400">Avg Efficiency</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 dark:text-white">{year.avgEfficiency.toFixed(2)} km/l</span>
                        {prevYear && (
                          <span className={`text-xs font-semibold ${efficiencyChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {efficiencyChange > 0 ? '↑' : '↓'}{Math.abs(efficiencyChange).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-stone-600 dark:text-stone-400">Total Fuel</span>
                      <span className="font-bold text-stone-900 dark:text-white">{year.totalFuel.toFixed(0)} L</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={yearlyComparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} strokeWidth={1} />
              <XAxis dataKey="year" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="rgba(148, 163, 184, 0.4)" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Legend />
              <Bar yAxisId="left" dataKey="totalCost" fill="#8b5cf6" name="Total Cost (₹)" radius={[12, 12, 0, 0]} animationDuration={1000} animationEasing="ease-out" />
              <Line yAxisId="right" type="monotone" dataKey="avgEfficiency" stroke="#10b981" strokeWidth={3} name="Avg Efficiency (km/l)" dot={{ fill: '#10b981', strokeWidth: 0, r: 5 }} animationDuration={1000} animationEasing="ease-out" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Record Insights */}
      <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-3xl">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUpIcon className="w-6 h-6 text-emerald-600" />
          Record Milestones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.length > 0 && (
            <>
              <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/50 dark:to-emerald-800/30 rounded-xl p-4 border-2 border-emerald-300 dark:border-emerald-700">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="font-semibold text-stone-900 dark:text-white">Best Efficiency</h4>
                </div>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {insights.bestEfficiency.toFixed(2)} km/l
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  {new Date(entries.find(e => e.efficiency === insights.bestEfficiency)?.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/30 rounded-xl p-4 border-2 border-blue-300 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-stone-900 dark:text-white">Longest Trip</h4>
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.max(...entries.map(e => e.distance)).toFixed(0)} km
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  {new Date(entries.find(e => e.distance === Math.max(...entries.map(e => e.distance)))?.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/50 dark:to-amber-800/30 rounded-xl p-4 border-2 border-amber-300 dark:border-amber-700">
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h4 className="font-semibold text-stone-900 dark:text-white">Highest Cost</h4>
                </div>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  ₹{Math.max(...entries.map(e => e.amount)).toFixed(0)}
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  {new Date(entries.find(e => e.amount === Math.max(...entries.map(e => e.amount)))?.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/50 dark:to-purple-800/30 rounded-xl p-4 border-2 border-purple-300 dark:border-purple-700">
                <div className="flex items-center gap-2 mb-2">
                  <Droplet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h4 className="font-semibold text-stone-900 dark:text-white">Largest Refuel</h4>
                </div>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.max(...entries.map(e => e.fuel_used)).toFixed(2)} L
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  {new Date(entries.find(e => e.fuel_used === Math.max(...entries.map(e => e.fuel_used)))?.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/50 dark:to-rose-800/30 rounded-xl p-4 border-2 border-rose-300 dark:border-rose-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <h4 className="font-semibold text-stone-900 dark:text-white">Highest Price</h4>
                </div>
                <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                  ₹{Math.max(...entries.map(e => e.petrol_price)).toFixed(2)}/L
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  {new Date(entries.find(e => e.petrol_price === Math.max(...entries.map(e => e.petrol_price)))?.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/50 dark:to-teal-800/30 rounded-xl p-4 border-2 border-teal-300 dark:border-teal-700">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <h4 className="font-semibold text-stone-900 dark:text-white">Total Entries</h4>
                </div>
                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                  {entries.length}
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  refueling records
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export default memo(Analytics);
