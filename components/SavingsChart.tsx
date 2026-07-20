'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Deposit, SavingsGoal } from '../lib/store';

interface SavingsChartProps {
  goal: SavingsGoal;
  deposits: Deposit[];
}

export function SavingsChart({ goal, deposits }: SavingsChartProps) {
  const { resolvedTheme } = useTheme();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Sort deposits by timestamp ascending
  const sortedDeposits = React.useMemo(() => {
    return [...deposits]
      .filter((d) => d.goalId === goal.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [deposits, goal.id]);

  // Generate cumulative progress data points in a clean loop to avoid closure mutation warnings
  const chartData = React.useMemo(() => {
    const list = [
      {
        date: new Date(new Date(goal.createdAt).getTime() - 24 * 60 * 60 * 1000), // Day before creation
        cumulative: 0,
        note: 'Goal Created',
      }
    ];

    let runningSum = 0;
    for (let i = 0; i < sortedDeposits.length; i++) {
      runningSum += sortedDeposits[i].amount;
      list.push({
        date: new Date(sortedDeposits[i].timestamp),
        cumulative: runningSum,
        note: sortedDeposits[i].note,
      });
    }

    // If the actual currentAmount is higher than cumulative deposits, make sure to add it as the final current point
    if (goal.currentAmount > runningSum) {
      list.push({
        date: new Date(),
        cumulative: goal.currentAmount,
        note: 'Current Balance',
      });
    }

    return list;
  }, [goal.createdAt, goal.currentAmount, sortedDeposits]);

  // SVG dimensions
  const width = 500;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };

  const usableWidth = width - padding.left - padding.right;
  const usableHeight = height - padding.top - padding.bottom;

  // Max value for Y scale (at least target amount, or max cumulative value + 10% margin)
  const maxCumulativeValue = Math.max(...chartData.map((d) => d.cumulative), goal.targetAmount);
  const yMax = maxCumulativeValue * 1.1; // Add 10% breathing room

  // Map data to SVG coordinates
  const points = chartData.map((d, index) => {
    const x =
      padding.left +
      (chartData.length > 1 ? (index / (chartData.length - 1)) * usableWidth : usableWidth / 2);
    // SVG Y grows downwards, so we subtract from usableHeight
    const y = padding.top + usableHeight - (d.cumulative / yMax) * usableHeight;
    return { x, y, ...d };
  });

  // Generate SVG path for line
  let linePath = '';
  let areaPath = '';

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    points.forEach((p, i) => {
      if (i > 0) {
        // Can make bezier curves for premium feel!
        const prev = points[i - 1];
        const cpX1 = prev.x + (p.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (p.x - prev.x) / 2;
        const cpY2 = p.y;
        linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
      }
    });

    // Close the area for the gradient fill
    areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + usableHeight} L ${points[0].x} ${padding.top + usableHeight} Z`;
  }

  // Target line Y coordinate
  const targetY = padding.top + usableHeight - (goal.targetAmount / yMax) * usableHeight;

  // Formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <div id="savings-chart-container" className="w-full glass-card rounded-[32px] p-6 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Cumulative Savings History
          </h3>
          <p className="text-xl font-bold tracking-tight">
            Goal: <span className="text-primary">{formatCurrency(goal.targetAmount)}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary/70 inline-block" />
            <span className="text-muted-foreground">My Savings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 border-t-2 border-dashed border-rose-500/60 inline-block" />
            <span className="text-muted-foreground">Target</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="overflow-visible">
          <defs>
            {/* Area chart gradient */}
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
            
            {/* Glow filters for premium visual appeal */}
            <filter id="chart-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="var(--primary)" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const val = ratio * yMax;
            const y = padding.top + usableHeight - (val / yMax) * usableHeight;
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={isDark ? '#1e293b' : '#e2e8f0'}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fontFamily="monospace"
                  fill="var(--muted-foreground)"
                >
                  {formatCurrency(val)}
                </text>
              </g>
            );
          })}

          {/* Target line indicator */}
          {targetY >= padding.top && (
            <g className="transition-all">
              <line
                x1={padding.left}
                y1={targetY}
                x2={width - padding.right}
                y2={targetY}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                className="opacity-60"
              />
              <text
                x={width - padding.right}
                y={targetY - 6}
                textAnchor="end"
                fontSize="10"
                fontWeight="semibold"
                fill="#ef4444"
                className="opacity-80"
              >
                TARGET REACHED ({formatCurrency(goal.targetAmount)})
              </text>
            </g>
          )}

          {/* Area under the path */}
          {areaPath && (
            <path d={areaPath} fill="url(#chart-gradient)" className="transition-all duration-500" />
          )}

          {/* Main trend line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#chart-glow)"
              className="transition-all duration-500"
            />
          )}

          {/* Points circles and interactive hovers */}
          {points.map((p, index) => {
            if (index === 0 && p.cumulative === 0) return null; // Hide starting baseline circle
            return (
              <g key={index} className="cursor-pointer">
                {/* Larger hover target area */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="12"
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                
                {/* Visual node */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIndex === index ? '7' : '4.5'}
                  fill={hoveredIndex === index ? 'var(--card)' : 'var(--primary)'}
                  stroke="var(--primary)"
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dynamic, responsive tooltip card displayed below/inside chart to avoid messy absolute overlaps */}
      <div className="mt-2 min-h-[50px] bg-background/80 border border-border rounded-xl p-3 flex items-center justify-between transition-all duration-300">
        {hoveredIndex !== null && points[hoveredIndex] ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase font-mono">
                {points[hoveredIndex].date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="text-xs font-semibold text-foreground/80">
                &ldquo;{points[hoveredIndex].note || 'Savings Deposit'}&rdquo;
              </span>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-xs text-muted-foreground font-mono">Total Saved</span>
              <span className="text-sm font-bold text-primary">
                {formatCurrency(points[hoveredIndex].cumulative)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-muted-foreground text-xs italic">
            <span>💡 Tip: Hover over nodes to explore deposit details and cumulative growth.</span>
            <span className="font-mono text-[10px]">
              Created on {new Date(goal.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
