export type RiskLevel = 'safe' | 'warning' | 'fraud';

export type TransactionStatus = 'approved' | 'pending' | 'blocked' | 'reviewing';

export interface Transaction {
  id: string;
  timestamp: Date;
  amount: number;
  currency: string;
  merchant: string;
  merchantCategory: string;
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  riskScore: number;
  riskLevel: RiskLevel;
  status: TransactionStatus;
  userId: string;
  cardLast4: string;
  ipAddress: string;
  deviceId: string;
  deviceType: string;
  isNewDevice: boolean;
  velocity: number;
  shapFactors?: ShapFactor[];
}

export interface ShapFactor {
  name: string;
  contribution: number;
  description: string;
}

export interface Alert {
  id: string;
  transactionId: string;
  type: 'high_risk' | 'velocity' | 'geo_anomaly' | 'device_change' | 'amount_unusual';
  severity: RiskLevel;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface ModelMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  falsePositiveRate: number;
  modelVersion: string;
  lastTrainingDate: Date;
  drift: number;
}

export interface DashboardStats {
  currentRiskLevel: number;
  blockedToday: number;
  blockedTodayDelta: number;
  activeThreats: number;
  avgLatency: number;
  totalTransactionsToday: number;
  approvalRate: number;
}

export function getRiskLevel(score: number): RiskLevel {
  if (score < 40) return 'safe';
  if (score < 70) return 'warning';
  return 'fraud';
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'safe':
      return 'text-risk-safe';
    case 'warning':
      return 'text-risk-warning';
    case 'fraud':
      return 'text-risk-fraud';
  }
}

export function getRiskBgColor(level: RiskLevel): string {
  switch (level) {
    case 'safe':
      return 'bg-risk-safe';
    case 'warning':
      return 'bg-risk-warning';
    case 'fraud':
      return 'bg-risk-fraud';
  }
}
