import { useState, useEffect } from 'react';
import { Transaction, getRiskColor, getRiskLevel } from '@/types/transaction';
import { generateTransaction } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';

interface TransactionFeedProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
  onNewTransaction?: (transaction: Transaction) => void;
  maxItems?: number;
}

export function TransactionFeed({
  transactions: initialTransactions,
  onTransactionClick,
  onNewTransaction,
  maxItems = 15,
}: TransactionFeedProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  // Simulate real-time transactions
  useEffect(() => {
    const interval = setInterval(() => {
      const newTx = generateTransaction();
      setTransactions((prev) => [newTx, ...prev.slice(0, maxItems - 1)]);
      setNewIds((prev) => new Set([...prev, newTx.id]));
      onNewTransaction?.(newTx);

      // Remove "new" indicator after animation
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(newTx.id);
          return next;
        });
      }, 3000);
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [maxItems, onNewTransaction]);

  const getStatusBadge = (status: Transaction['status']) => {
    const styles = {
      approved: 'bg-risk-safe/20 text-risk-safe border-risk-safe/30',
      pending: 'bg-risk-warning/20 text-risk-warning border-risk-warning/30',
      blocked: 'bg-risk-fraud/20 text-risk-fraud border-risk-fraud/30',
      reviewing: 'bg-primary/20 text-primary border-primary/30',
    };

    return (
      <Badge variant="outline" className={cn('text-xs capitalize', styles[status])}>
        {status}
      </Badge>
    );
  };

  const getRiskProgressColor = (score: number) => {
    const level = getRiskLevel(score);
    return {
      safe: 'bg-risk-safe',
      warning: 'bg-risk-warning',
      fraud: 'bg-risk-fraud',
    }[level];
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Live Transaction Feed</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-risk-safe animate-pulse" />
            <span className="text-xs text-muted-foreground">Real-time</span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto custom-scrollbar">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            onClick={() => onTransactionClick?.(tx)}
            className={cn(
              'p-4 hover:bg-accent/30 cursor-pointer transition-all duration-200',
              newIds.has(tx.id) && 'transaction-row-enter bg-primary/5'
            )}
          >
            <div className="flex items-center gap-4">
              {/* Transaction ID & Time */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-foreground truncate">
                    {tx.id}
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                </span>
              </div>

              {/* Amount */}
              <div className="text-right min-w-[80px]">
                <span className="font-mono font-medium text-foreground">
                  ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <div className="text-xs text-muted-foreground truncate max-w-[100px]">
                  {tx.merchant}
                </div>
              </div>

              {/* Risk Score */}
              <div className="w-24">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-xs font-mono font-medium', getRiskColor(tx.riskLevel))}>
                    {tx.riskScore}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', getRiskProgressColor(tx.riskScore))}
                    style={{ width: `${tx.riskScore}%` }}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="w-24 flex justify-end">
                {getStatusBadge(tx.status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
