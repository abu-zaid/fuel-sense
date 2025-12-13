import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { getDashboardStats } from '@/lib/services';
import type { DashboardStats } from '@/lib/types';
import { TrendingUp, Zap, RouteIcon, Fuel } from 'lucide-react';

interface StatCardsProps {
  vehicleId?: string;
}

export default function StatCards({ vehicleId }: StatCardsProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [vehicleId]);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats(vehicleId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total Cost',
      value: `₹${stats.totalFuelCost.toFixed(2)}`,
      icon: Fuel,
      color: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Total Distance',
      value: `${stats.totalDistance.toFixed(0)} km`,
      icon: RouteIcon,
      color: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
      iconColor: 'text-green-600',
    },
    {
      label: 'Avg Efficiency',
      value: `${stats.averageEfficiency.toFixed(1)} km/l`,
      icon: TrendingUp,
      color: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Total Fuel',
      value: `${stats.totalFuelUsed.toFixed(2)} L`,
      icon: Zap,
      color: 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            variants={{
              initial: { opacity: 0, scale: 0.9 },
              animate: { opacity: 1, scale: 1 },
            }}
          >
            <Card 
              className={`p-6 border-0 bg-gradient-to-br ${item.color} shadow-sm rounded-2xl`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-stone-600 dark:text-stone-300 text-sm font-medium">{item.label}</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-white mt-3">{item.value}</p>
                </div>
                <motion.div 
                  className={`${item.iconColor} opacity-80`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="w-10 h-10" />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
