import { Transaction, getRiskColor, getRiskLevel } from '@/types/transaction';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Smartphone,
  Globe,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (transaction: Transaction) => void;
  onConfirmFraud?: (transaction: Transaction) => void;
}

export function TransactionDetailModal({
  transaction,
  open,
  onOpenChange,
  onApprove,
  onConfirmFraud,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const riskLevel = getRiskLevel(transaction.riskScore);

  const riskStyles = {
    safe: 'bg-risk-safe/20 border-risk-safe/50 text-risk-safe',
    warning: 'bg-risk-warning/20 border-risk-warning/50 text-risk-warning',
    fraud: 'bg-risk-fraud/20 border-risk-fraud/50 text-risk-fraud',
  };

  const statusIcon = {
    approved: <CheckCircle2 className="w-5 h-5 text-risk-safe" />,
    pending: <Clock className="w-5 h-5 text-risk-warning" />,
    blocked: <XCircle className="w-5 h-5 text-risk-fraud" />,
    reviewing: <AlertTriangle className="w-5 h-5 text-primary" />,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-bold font-mono">
                {transaction.id}
              </DialogTitle>
              {statusIcon[transaction.status]}
            </div>
            
            {/* Large Risk Score */}
            <div
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border-2',
                riskStyles[riskLevel]
              )}
            >
              <span className="text-3xl font-bold font-mono">
                {transaction.riskScore}
              </span>
              <span className="text-sm font-medium">/100</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold font-mono">
                    ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">{transaction.merchant}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {transaction.location.city}, {transaction.location.country}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Device</p>
                  <p className="font-medium">{transaction.deviceType}</p>
                  {transaction.isNewDevice && (
                    <Badge variant="outline" className="mt-1 text-xs bg-risk-warning/10 text-risk-warning border-risk-warning/30">
                      New Device
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-mono text-sm">{transaction.ipAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-mono text-sm">
                    {format(transaction.timestamp, 'PPpp')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* SHAP Factors - Explainable AI */}
          {transaction.shapFactors && transaction.shapFactors.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-risk-fraud" />
                <h4 className="font-semibold text-foreground">AI Decision Factors (SHAP)</h4>
              </div>

              <div className="space-y-3">
                {transaction.shapFactors.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {factor.name}
                      </span>
                      <span className="text-sm font-mono font-bold text-risk-fraud">
                        +{factor.contribution}
                      </span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-risk-warning to-risk-fraud rounded-full transition-all duration-500"
                        style={{ width: `${factor.contribution}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-border/50" />

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => onApprove?.(transaction)}
              className="flex-1 h-12 bg-risk-safe hover:bg-risk-safe/90 text-risk-safe-foreground font-semibold"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Approve (False Positive)
            </Button>
            <Button
              onClick={() => onConfirmFraud?.(transaction)}
              className="flex-1 h-12 bg-risk-fraud hover:bg-risk-fraud/90 text-white font-semibold"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Confirm Fraud
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
