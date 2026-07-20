'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SavingsGoal } from '../lib/store';

interface GoalCardProps {
  goal: SavingsGoal;
  onSelect: (id: string) => void;
}

const colorMap: Record<string, {
  bg: string;
  text: string;
  stroke: string;
  track: string;
  badgeBg: string;
  glow: string;
}> = {
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    stroke: 'stroke-emerald-500',
    track: 'stroke-emerald-500/15 dark:stroke-emerald-500/10',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    glow: 'shadow-emerald-500/10',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-500',
    stroke: 'stroke-indigo-500',
    track: 'stroke-indigo-500/15 dark:stroke-indigo-500/10',
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    glow: 'shadow-indigo-500/10',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    stroke: 'stroke-blue-500',
    track: 'stroke-blue-500/15 dark:stroke-blue-500/10',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    glow: 'shadow-blue-500/10',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-500',
    stroke: 'stroke-violet-500',
    track: 'stroke-violet-500/15 dark:stroke-violet-500/10',
    badgeBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
    glow: 'shadow-violet-500/10',
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-500',
    stroke: 'stroke-rose-500',
    track: 'stroke-rose-500/15 dark:stroke-rose-500/10',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    glow: 'shadow-rose-500/10',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    stroke: 'stroke-amber-500',
    track: 'stroke-amber-500/15 dark:stroke-amber-500/10',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    glow: 'shadow-amber-500/10',
  }
};

export function GoalCard({ goal, onSelect }: GoalCardProps) {
  const colors = colorMap[goal.color] || colorMap.indigo;

  // Calculate percentages
  const percentage = Math.min(
    Math.round((goal.currentAmount / goal.targetAmount) * 100),
    100
  );

  const isCompleted = goal.currentAmount >= goal.targetAmount;

  // Circular progress SVG variables
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <motion.div
      id={`goal-card-${goal.id}`}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(goal.id)}
      className={`relative glass-card cursor-pointer rounded-[28px] p-6 border border-border/80 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${colors.glow}`}
    >
      {/* Decorative Shimmer and Corner highlights */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-20" />
      <div className="shimmer-bg absolute inset-0 opacity-10 pointer-events-none" />

      {/* Header section with emoji, category tag and action */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm bg-card/80 border border-border">
            {goal.emoji}
          </div>
          <div className="flex flex-col">
            <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full w-fit ${colors.badgeBg}`}>
              {goal.category}
            </span>
          </div>
        </div>
        
        {/* Animated Arrow element */}
        <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-primary/20 transition-all">
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      {/* Main body: Goal details */}
      <div className="my-5 flex flex-row items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold tracking-tight truncate flex items-center gap-1.5 text-foreground/95">
            {goal.title}
            {isCompleted && (
              <span className="text-amber-500">
                <Sparkles className="w-4 h-4 inline-block animate-pulse" />
              </span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            Saved: <span className="font-semibold text-foreground">{formatCurrency(goal.currentAmount)}</span> of {formatCurrency(goal.targetAmount)}
          </p>
        </div>

        {/* Circular Progress Display */}
        <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Track */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className={`${colors.track}`}
              strokeWidth="6"
              fill="transparent"
            />
            {/* Animated Progress Indicator */}
            <motion.circle
              cx="40"
              cy="40"
              r={radius}
              className={`${colors.stroke} transition-all duration-500 ease-out`}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-bold tracking-tight font-mono">
              {percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Linear Micro Progress Bar for extra responsiveness on mobile */}
      <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden border border-border/20">
        <motion.div
          className={`h-full bg-gradient-to-r from-primary to-primary/80`}
          style={{ width: `${percentage}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Completion Indicator */}
      {isCompleted ? (
        <div className="mt-3 text-[10px] font-bold text-success flex items-center gap-1">
          🎉 TARGET MET! Stellar savings achieved.
        </div>
      ) : (
        <div className="mt-3 text-[10px] font-mono text-muted-foreground flex justify-between items-center">
          <span>Remaining</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}
          </span>
        </div>
      )}
    </motion.div>
  );
}
