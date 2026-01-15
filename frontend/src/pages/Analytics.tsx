import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { generateHistoricalData } from '@/lib/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const data = generateHistoricalData(30);
  const pieData = [
    { name: 'Approved', value: 85, color: 'hsl(160 84% 39%)' },
    { name: 'Flagged', value: 10, color: 'hsl(38 92% 50%)' },
    { name: 'Blocked', value: 5, color: 'hsl(350 89% 60%)' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Fraud detection trends and patterns</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="font-semibold mb-4">Transaction Volume (30 Days)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(160 84% 39%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(350 89% 60%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(350 89% 60%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
                  <XAxis dataKey="date" stroke="hsl(215 20% 65%)" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(222 47% 13%)', border: '1px solid hsl(217 33% 20%)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="approved" stroke="hsl(160 84% 39%)" fill="url(#colorApproved)" />
                  <Area type="monotone" dataKey="blocked" stroke="hsl(350 89% 60%)" fill="url(#colorBlocked)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Transaction Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(222 47% 13%)', border: '1px solid hsl(217 33% 20%)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
