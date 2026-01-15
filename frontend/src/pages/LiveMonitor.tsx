import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RiskGauge } from '@/components/dashboard/RiskGauge';
import { TransactionFeed } from '@/components/dashboard/TransactionFeed';
import { WorldMap } from '@/components/dashboard/WorldMap';
import { TransactionDetailModal } from '@/components/dashboard/TransactionDetailModal';
import { Transaction } from '@/types/transaction';
import { generateTransactions, generateDashboardStats } from '@/lib/mockData';
import { ShieldAlert, DollarSign, AlertTriangle, Zap } from 'lucide-react';
import api from '@/lib/api';

const LiveMonitor = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState(generateDashboardStats());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);


  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get('/transactions');
        const data = response.data;
        
        // Map backend to frontend model
        const mapped: Transaction[] = data.map((tx: any) => ({
          id: tx.id,
          timestamp: new Date(tx.timestamp),
          amount: tx.amount,
          currency: "USD",
          merchant: "Unknown Merchant", // Placeholder as backend doesn't store this yet
          merchantCategory: "General",
          location: {
            city: "Unknown",
            country: "Unknown",
            lat: 0,
            lng: 0
          },
          riskScore: tx.risk_score * 100, // Frontend expects 0-100 probably? getRiskLevel checks < 40. Backend is 0-1. So * 100.
          riskLevel: tx.risk_level === 'CRITICAL' ? 'fraud' : (tx.risk_level === 'HIGH' ? 'warning' : 'safe'),
          status: tx.risk_level === 'CRITICAL' ? 'blocked' : 'approved',
          userId: "user_1",
          cardLast4: "0000",
          ipAddress: "127.0.0.1",
          deviceId: "device_1",
          deviceType: "Desktop",
          isNewDevice: false,
          velocity: 1
        }));
        
        if (mapped.length > 0) {
            setTransactions(mapped);
        } else {
            // Fallback to mock if DB is empty so user sees something
            setTransactions(generateTransactions(20));    
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setTransactions(generateTransactions(20));
      }
    };
    
    fetchTransactions();
    // Poll every 5 seconds
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Hero Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Current Risk Level"
            value=""
            className="flex flex-col items-center justify-center"
          >
            <RiskGauge value={stats.currentRiskLevel} size="md" />
          </StatCard>

          <StatCard
            title="Blocked Today"
            value={`$${stats.blockedToday.toLocaleString()}`}
            trend={stats.blockedTodayDelta}
            trendLabel="vs yesterday"
            icon={<DollarSign className="w-5 h-5 text-primary" />}
          />

          <StatCard
            title="Active Threats"
            value={stats.activeThreats}
            variant="fraud"
            icon={<AlertTriangle className="w-5 h-5 text-risk-fraud" />}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-risk-fraud pulse-fraud" />
              <span className="text-xs text-muted-foreground">Monitoring</span>
            </div>
          </StatCard>

          <StatCard
            title="Avg Latency"
            value={`${stats.avgLatency}ms`}
            subtitle={`${stats.approvalRate}% approval rate`}
            icon={<Zap className="w-5 h-5 text-risk-safe" />}
            variant="safe"
          />
        </div>

        {/* Main Content - Map and Feed */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <WorldMap
              transactions={transactions}
              onTransactionClick={handleTransactionClick}
            />
          </div>
          <div className="xl:col-span-1">
            <TransactionFeed
              transactions={transactions}
              onTransactionClick={handleTransactionClick}
            />
          </div>
        </div>
      </div>

      <TransactionDetailModal
        transaction={selectedTransaction}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onApprove={(tx) => {
          console.log('Approved:', tx.id);
          setModalOpen(false);
        }}
        onConfirmFraud={(tx) => {
          console.log('Confirmed fraud:', tx.id);
          setModalOpen(false);
        }}
      />
    </DashboardLayout>
  );
};

export default LiveMonitor;
