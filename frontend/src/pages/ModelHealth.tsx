import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { generateModelMetrics, generateModelDriftData } from '@/lib/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const ModelHealth = () => {
  const metrics = generateModelMetrics();
  const driftData = generateModelDriftData(14);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Model Health</h1>
            <p className="text-muted-foreground">ML model performance and drift monitoring</p>
          </div>
          <Badge variant="outline" className="bg-risk-safe/10 text-risk-safe border-risk-safe/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Model {metrics.modelVersion} • Trained {format(metrics.lastTrainingDate, 'MMM d')}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Precision" value={`${(metrics.precision * 100).toFixed(1)}%`} icon={<Brain className="w-5 h-5 text-primary" />} variant="safe" />
          <StatCard title="Recall" value={`${(metrics.recall * 100).toFixed(1)}%`} icon={<TrendingUp className="w-5 h-5 text-primary" />} variant="safe" />
          <StatCard title="F1 Score" value={`${(metrics.f1Score * 100).toFixed(1)}%`} icon={<CheckCircle2 className="w-5 h-5 text-risk-safe" />} variant="safe" />
          <StatCard title="False Positive Rate" value={`${(metrics.falsePositiveRate * 100).toFixed(2)}%`} icon={<AlertTriangle className="w-5 h-5 text-risk-warning" />} variant="warning" />
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Model Drift (14 Days)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={driftData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
                <XAxis dataKey="date" stroke="hsl(215 20% 65%)" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="hsl(215 20% 65%)" fontSize={12} domain={[0.8, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip contentStyle={{ background: 'hsl(222 47% 13%)', border: '1px solid hsl(217 33% 20%)', borderRadius: '8px' }} formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                <Line type="monotone" dataKey="precision" stroke="hsl(160 84% 39%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="recall" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ModelHealth;
