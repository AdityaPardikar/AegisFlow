import { memo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { Transaction, getRiskLevel } from '@/types/transaction';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface WorldMapProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

interface MapMarkerProps {
  transaction: Transaction;
  onClick?: () => void;
}

const MapMarker = memo(({ transaction, onClick }: MapMarkerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const riskLevel = getRiskLevel(transaction.riskScore);
  
  const colors = {
    safe: '#10b981',
    warning: '#f59e0b',
    fraud: '#f43f5e',
  };

  const glowColors = {
    safe: 'rgba(16, 185, 129, 0.6)',
    warning: 'rgba(245, 158, 11, 0.6)',
    fraud: 'rgba(244, 63, 94, 0.8)',
  };

  return (
    <Marker
      coordinates={[transaction.location.lng, transaction.location.lat]}
      onClick={onClick}
    >
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <g
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: 'pointer' }}
          >
            {/* Outer glow */}
            <circle
              r={isHovered ? 12 : 8}
              fill={glowColors[riskLevel]}
              className="map-dot"
              style={{
                transition: 'r 0.2s ease-out',
                opacity: 0.4,
              }}
            />
            {/* Inner dot */}
            <circle
              r={isHovered ? 6 : 4}
              fill={colors[riskLevel]}
              stroke="white"
              strokeWidth={1}
              style={{
                transition: 'r 0.2s ease-out',
                filter: `drop-shadow(0 0 4px ${colors[riskLevel]})`,
              }}
            />
          </g>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-card/95 backdrop-blur-sm border-border p-3 max-w-[200px]"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Location</span>
              <span className="text-xs font-medium text-foreground">
                {transaction.location.city}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Amount</span>
              <span className="text-xs font-mono font-medium text-foreground">
                ${transaction.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Risk</span>
              <span
                className={cn(
                  'text-xs font-mono font-bold',
                  riskLevel === 'safe' && 'text-risk-safe',
                  riskLevel === 'warning' && 'text-risk-warning',
                  riskLevel === 'fraud' && 'text-risk-fraud'
                )}
              >
                {transaction.riskScore}%
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </Marker>
  );
});

MapMarker.displayName = 'MapMarker';

export const WorldMap = memo(({ transactions, onTransactionClick }: WorldMapProps) => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Global Transaction Activity</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-risk-safe" />
              <span className="text-xs text-muted-foreground">Safe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-risk-warning" />
              <span className="text-xs text-muted-foreground">Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-risk-fraud" />
              <span className="text-xs text-muted-foreground">Blocked</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[400px] bg-background/50">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 140,
            center: [0, 30],
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="hsl(217 33% 17%)"
                    stroke="hsl(217 33% 25%)"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: 'hsl(217 33% 22%)', outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {transactions.map((tx) => (
              <MapMarker
                key={tx.id}
                transaction={tx}
                onClick={() => onTransactionClick?.(tx)}
              />
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
});

WorldMap.displayName = 'WorldMap';
