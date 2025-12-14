'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Fuel, 
  TrendingUp, 
  PieChart, 
  Smartphone, 
  Zap, 
  Shield,
  Download,
  BarChart3,
  Car,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <Fuel className="w-6 h-6" />,
      title: 'Track Every Fill-Up',
      description: 'Log fuel entries with date, amount, cost, and odometer reading in seconds.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Monitor Efficiency',
      description: 'See your fuel efficiency trends and identify patterns over time.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: 'Visual Analytics',
      description: 'Beautiful charts and graphs showing your fuel costs and efficiency.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'Progressive Web App',
      description: 'Install on your device for offline access and native app experience.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Optimized performance with instant load times and smooth animations.',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and securely stored with industry standards.',
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '10K+' },
    { label: 'Fuel Entries', value: '500K+' },
    { label: 'Countries', value: '50+' },
    { label: 'App Rating', value: '4.9★' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-blue-50 to-stone-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-16"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Fuel className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                  FuelSense
                </h1>
                <p className="text-xs text-stone-600 dark:text-stone-400">Smart Fuel Tracking</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/signin')}
              variant="outline"
              className="gap-2"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                New: Dark Mode & PWA Support
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold text-stone-900 dark:text-white mb-6 leading-tight">
                Track Your Fuel,
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Save Money
                </span>
              </h2>
              
              <p className="text-xl text-stone-600 dark:text-stone-300 mb-8 leading-relaxed">
                The smartest way to monitor your vehicle's fuel consumption, track expenses, and optimize your driving efficiency.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Button
                  size="lg"
                  onClick={() => router.push('/signin')}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-xl shadow-blue-500/25 gap-2 px-8"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    if ('serviceWorker' in navigator) {
                      window.location.href = '/signin';
                    } else {
                      import('@/components/ui/toast').then(({ toast }) => {
                        toast.error('PWA installation not supported on this browser');
                      });
                    }
                  }}
                  className="gap-2 px-8"
                >
                  <Download className="w-5 h-5" />
                  Install App
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Free forever
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  No credit card
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Secure
                </div>
              </div>
            </motion.div>

            {/* Hero Image/Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                {/* Mock Dashboard UI */}
                <div className="p-6 bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Car className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-900 dark:text-white">My Pulsar</h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Bike</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-slate-700" />
                      <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-slate-700" />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { label: 'Total Spent', value: '₹12,450', icon: <Fuel className="w-4 h-4" /> },
                      { label: 'Avg Efficiency', value: '42 km/l', icon: <TrendingUp className="w-4 h-4" /> },
                      { label: 'Total Fuel', value: '285 L', icon: <BarChart3 className="w-4 h-4" /> },
                      { label: 'Total Distance', value: '11,970 km', icon: <Zap className="w-4 h-4" /> }
                    ].map((stat, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                          {stat.icon}
                          <span className="text-xs font-medium text-stone-600 dark:text-stone-400">{stat.label}</span>
                        </div>
                        <p className="text-xl font-bold text-stone-900 dark:text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chart Preview */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-stone-900 dark:text-white">Efficiency Trend</span>
                      <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="h-32 bg-gradient-to-t from-blue-100 to-transparent dark:from-blue-900/20 rounded-lg flex items-end gap-1 p-2">
                      {[60, 75, 80, 65, 85, 70, 90, 95].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-sm"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/50 flex items-center justify-center"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
              Powerful features designed to make fuel tracking effortless and insightful
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-stone-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-300">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            
            <div className="relative p-12 md:p-16 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Start Tracking Your Fuel Today
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already saving money and optimizing their fuel efficiency
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => router.push('/signin')}
                  className="bg-white text-blue-600 hover:bg-stone-100 shadow-xl gap-2 px-8"
                >
                  Get Started Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/signin')}
                  className="border-white text-white hover:bg-white/10 gap-2 px-8"
                >
                  <Download className="w-5 h-5" />
                  Install App
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-stone-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Fuel className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 dark:text-white">FuelSense</p>
                <p className="text-xs text-stone-600 dark:text-stone-400">Smart Fuel Tracking</p>
              </div>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              © 2025 FuelSense. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
