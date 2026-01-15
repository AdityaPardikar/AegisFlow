import { Transaction, Alert, ModelMetrics, DashboardStats, getRiskLevel, ShapFactor } from '@/types/transaction';

const merchants = [
  { name: 'Amazon', category: 'E-commerce' },
  { name: 'Uber', category: 'Transportation' },
  { name: 'Netflix', category: 'Entertainment' },
  { name: 'Starbucks', category: 'Food & Beverage' },
  { name: 'Apple Store', category: 'Electronics' },
  { name: 'Walmart', category: 'Retail' },
  { name: 'Shell Gas', category: 'Fuel' },
  { name: 'Binance', category: 'Crypto Exchange' },
  { name: 'Unknown Vendor', category: 'Unknown' },
  { name: 'Wire Transfer', category: 'Financial Services' },
];

const locations = [
  { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.006 },
  { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { city: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792 },
  { city: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333 },
  { city: 'Mumbai', country: 'India', lat: 19.076, lng: 72.8777 },
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405 },
  { city: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173 },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
];

const shapFactorTemplates: ShapFactor[][] = [
  [
    { name: 'IP Mismatch', contribution: 45, description: 'Transaction IP differs from usual location' },
    { name: 'High Velocity', contribution: 30, description: '5 transactions in last 10 minutes' },
    { name: 'New Device', contribution: 15, description: 'First time seeing this device ID' },
  ],
  [
    { name: 'Unusual Amount', contribution: 50, description: 'Transaction 10x higher than average' },
    { name: 'Midnight Purchase', contribution: 25, description: 'Outside normal purchasing hours' },
    { name: 'High-Risk Merchant', contribution: 20, description: 'Merchant category flagged for fraud' },
  ],
  [
    { name: 'Geo Anomaly', contribution: 60, description: 'Impossible travel detected' },
    { name: 'Card Not Present', contribution: 20, description: 'Online transaction with new merchant' },
    { name: 'Velocity Spike', contribution: 15, description: 'Rapid succession of purchases' },
  ],
];

function generateTransactionId(): string {
  return `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function randomAmount(): number {
  const ranges = [
    { min: 5, max: 50, weight: 40 },
    { min: 50, max: 200, weight: 30 },
    { min: 200, max: 1000, weight: 20 },
    { min: 1000, max: 10000, weight: 8 },
    { min: 10000, max: 50000, weight: 2 },
  ];
  
  const rand = Math.random() * 100;
  let cumulative = 0;
  
  for (const range of ranges) {
    cumulative += range.weight;
    if (rand <= cumulative) {
      return Math.round((Math.random() * (range.max - range.min) + range.min) * 100) / 100;
    }
  }
  
  return Math.round(Math.random() * 100 * 100) / 100;
}

function randomRiskScore(): number {
  // Weighted towards lower risk
  const rand = Math.random();
  if (rand < 0.7) return Math.floor(Math.random() * 40);
  if (rand < 0.9) return Math.floor(Math.random() * 30) + 40;
  return Math.floor(Math.random() * 30) + 70;
}

export function generateTransaction(timestamp?: Date): Transaction {
  const riskScore = randomRiskScore();
  const riskLevel = getRiskLevel(riskScore);
  const merchant = merchants[Math.floor(Math.random() * merchants.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  
  let status: Transaction['status'] = 'approved';
  if (riskLevel === 'fraud') {
    status = Math.random() > 0.3 ? 'blocked' : 'reviewing';
  } else if (riskLevel === 'warning') {
    status = Math.random() > 0.5 ? 'pending' : 'approved';
  }

  const shapFactors = riskScore > 60 
    ? shapFactorTemplates[Math.floor(Math.random() * shapFactorTemplates.length)]
    : undefined;

  return {
    id: generateTransactionId(),
    timestamp: timestamp || new Date(),
    amount: randomAmount(),
    currency: 'USD',
    merchant: merchant.name,
    merchantCategory: merchant.category,
    location,
    riskScore,
    riskLevel,
    status,
    userId: `USR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    cardLast4: Math.floor(1000 + Math.random() * 9000).toString(),
    ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    deviceId: `DEV-${Math.random().toString(36).substring(2, 10)}`,
    deviceType: ['iPhone', 'Android', 'Desktop', 'Tablet'][Math.floor(Math.random() * 4)],
    isNewDevice: Math.random() > 0.8,
    velocity: Math.floor(Math.random() * 10),
    shapFactors,
  };
}

export function generateTransactions(count: number): Transaction[] {
  const transactions: Transaction[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now - i * (Math.random() * 60000 + 10000));
    transactions.push(generateTransaction(timestamp));
  }
  
  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateDashboardStats(): DashboardStats {
  return {
    currentRiskLevel: Math.floor(Math.random() * 30) + 20,
    blockedToday: Math.floor(Math.random() * 50000) + 10000,
    blockedTodayDelta: Math.floor(Math.random() * 30) - 15,
    activeThreats: Math.floor(Math.random() * 15) + 3,
    avgLatency: Math.floor(Math.random() * 100) + 80,
    totalTransactionsToday: Math.floor(Math.random() * 100000) + 50000,
    approvalRate: Math.floor(Math.random() * 5) + 94,
  };
}

export function generateAlerts(count: number): Alert[] {
  const types: Alert['type'][] = ['high_risk', 'velocity', 'geo_anomaly', 'device_change', 'amount_unusual'];
  const messages: Record<Alert['type'], string[]> = {
    high_risk: ['High-risk transaction detected', 'Suspicious activity flagged', 'Anomalous pattern identified'],
    velocity: ['Rapid transaction velocity', 'Multiple transactions in short period', 'Velocity threshold exceeded'],
    geo_anomaly: ['Impossible travel detected', 'Geographic anomaly', 'Cross-border transaction surge'],
    device_change: ['New device detected', 'Device fingerprint mismatch', 'Unusual device activity'],
    amount_unusual: ['Unusually high amount', 'Amount exceeds typical range', 'Large transaction flagged'],
  };

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = (['safe', 'warning', 'fraud'] as const)[Math.floor(Math.random() * 3)];
    
    return {
      id: `ALT-${Date.now().toString(36)}-${i}`,
      transactionId: generateTransactionId(),
      type,
      severity,
      message: messages[type][Math.floor(Math.random() * messages[type].length)],
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      acknowledged: Math.random() > 0.7,
    };
  });
}

export function generateModelMetrics(): ModelMetrics {
  return {
    precision: 0.92 + Math.random() * 0.06,
    recall: 0.88 + Math.random() * 0.08,
    f1Score: 0.89 + Math.random() * 0.07,
    auc: 0.94 + Math.random() * 0.04,
    falsePositiveRate: 0.02 + Math.random() * 0.03,
    modelVersion: 'v3.2.1',
    lastTrainingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    drift: Math.random() * 0.05,
  };
}

export function generateHistoricalData(days: number): { date: string; blocked: number; approved: number; flagged: number }[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    
    return {
      date: date.toISOString().split('T')[0],
      blocked: Math.floor(Math.random() * 200) + 50,
      approved: Math.floor(Math.random() * 5000) + 3000,
      flagged: Math.floor(Math.random() * 300) + 100,
    };
  });
}

export function generateModelDriftData(days: number): { date: string; precision: number; recall: number; drift: number }[] {
  let basePrecision = 0.95;
  let baseRecall = 0.92;
  
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    
    // Simulate gradual drift
    basePrecision -= (Math.random() * 0.002);
    baseRecall -= (Math.random() * 0.001);
    
    return {
      date: date.toISOString().split('T')[0],
      precision: Math.max(0.85, basePrecision + Math.random() * 0.02),
      recall: Math.max(0.82, baseRecall + Math.random() * 0.02),
      drift: Math.min(0.1, (0.95 - basePrecision) * 2),
    };
  });
}
