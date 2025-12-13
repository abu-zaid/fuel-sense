'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { generateSampleData, clearSampleData } from '@/lib/sample-data';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function SampleDataPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleGenerateData = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const result = await generateSampleData();
      if (result) {
        setMessage(`✅ Successfully created sample data! Vehicle: ${result.vehicle.name}, Entries: ${result.entries.length}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate sample data');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await clearSampleData();
      setMessage('✅ All data cleared successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 border-0 shadow-sm">
          <h1 className="text-3xl font-bold text-stone-900 mb-4">Sample Data Generator</h1>
          <p className="text-stone-600 mb-8">Generate weekly fuel fill data for testing purposes</p>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What this will create:</h3>
              <ul className="text-sm text-blue-800 space-y-1 ml-4">
                <li>✓ 1 sample vehicle (Sample Car)</li>
                <li>✓ 8 fuel entries spanning 8 weeks</li>
                <li>✓ Latest entry: Yesterday</li>
                <li>✓ Weekly intervals between entries</li>
                <li>✓ Realistic fuel efficiency (12-16 km/l)</li>
              </ul>
            </div>

            {message && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex gap-2 animate-fade-in">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex gap-2 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleGenerateData}
                disabled={loading}
                size="lg"
                className="flex-1 gap-2"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                {loading ? 'Generating...' : 'Generate Sample Data'}
              </Button>

              <Button
                onClick={handleClearData}
                disabled={loading}
                variant="destructive"
                size="lg"
                className="flex-1 gap-2"
              >
                {loading ? 'Loading...' : 'Clear All Data'}
              </Button>
            </div>

            <p className="text-xs text-stone-500 text-center mt-4">
              After generating data, navigate back to the dashboard to see your fuel tracker in action.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
