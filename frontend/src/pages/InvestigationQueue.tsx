import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Search, Filter, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateTransactions } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const InvestigationQueue = () => {
  const pendingTransactions = generateTransactions(12).filter(
    (tx) => tx.status === 'pending' || tx.status === 'reviewing' || tx.riskScore > 50
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Investigation Queue</h1>
            <p className="text-muted-foreground">Review and action flagged transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search cases..." className="pl-10 w-64 bg-card border-border" />
            </div>
            <Button variant="outline" className="border-border">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {pendingTransactions.map((tx) => (
            <div key={tx.id} className="glass-card p-4 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center font-mono text-lg font-bold',
                    tx.riskScore >= 70 ? 'bg-risk-fraud/20 text-risk-fraud' :
                    tx.riskScore >= 40 ? 'bg-risk-warning/20 text-risk-warning' :
                    'bg-risk-safe/20 text-risk-safe'
                  )}>
                    {tx.riskScore}
                  </div>
                  <div>
                    <p className="font-mono font-medium text-foreground">{tx.id}</p>
                    <p className="text-sm text-muted-foreground">
                      ${tx.amount.toLocaleString()} • {tx.merchant} • {tx.location.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge variant="outline" className={cn(
                      'capitalize',
                      tx.status === 'pending' && 'bg-risk-warning/20 text-risk-warning border-risk-warning/30',
                      tx.status === 'reviewing' && 'bg-primary/20 text-primary border-primary/30'
                    )}>
                      {tx.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-risk-safe/50 text-risk-safe hover:bg-risk-safe/10">
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-risk-fraud/50 text-risk-fraud hover:bg-risk-fraud/10">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvestigationQueue;
