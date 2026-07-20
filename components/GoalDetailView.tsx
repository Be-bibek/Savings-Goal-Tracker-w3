'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Trash2,
  DollarSign,
  Calendar,
  Layers,
  Flame,
  CheckCircle2,
  Cpu,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useSavingsStore } from '../lib/store';
import { SavingsChart } from './SavingsChart';
import { createStellarSavingsTransaction } from '../lib/stellar';

interface GoalDetailViewProps {
  goalId: string;
  onBack: () => void;
}

const colorMap: Record<string, {
  text: string;
  badgeBg: string;
  bgGlow: string;
  btnBg: string;
  progressBg: string;
}> = {
  emerald: {
    text: 'text-emerald-500',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    bgGlow: 'from-emerald-500/10 to-transparent',
    btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    progressBg: 'bg-emerald-500',
  },
  indigo: {
    text: 'text-indigo-500',
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    bgGlow: 'from-indigo-500/10 to-transparent',
    btnBg: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    progressBg: 'bg-indigo-500',
  },
  blue: {
    text: 'text-blue-500',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    bgGlow: 'from-blue-500/10 to-transparent',
    btnBg: 'bg-blue-600 hover:bg-blue-500 text-white',
    progressBg: 'bg-blue-500',
  },
  violet: {
    text: 'text-violet-500',
    badgeBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
    bgGlow: 'from-violet-500/10 to-transparent',
    btnBg: 'bg-violet-600 hover:bg-violet-500 text-white',
    progressBg: 'bg-violet-500',
  },
  rose: {
    text: 'text-rose-500',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    bgGlow: 'from-rose-500/10 to-transparent',
    btnBg: 'bg-rose-600 hover:bg-rose-500 text-white',
    progressBg: 'bg-rose-500',
  },
  amber: {
    text: 'text-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    bgGlow: 'from-amber-500/10 to-transparent',
    btnBg: 'bg-amber-600 hover:bg-amber-500 text-white',
    progressBg: 'bg-amber-500',
  }
};

export function GoalDetailView({ goalId, onBack }: GoalDetailViewProps) {
  const { goals, deposits, addDeposit, deleteGoal, publicKey } = useSavingsStore();

  const goal = goals.find((g) => g.id === goalId);
  const goalDeposits = deposits.filter((d) => d.goalId === goalId);

  // Form states
  const [depositAmount, setDepositAmount] = React.useState('');
  const [depositNote, setDepositNote] = React.useState('');
  const [useStellar, setUseStellar] = React.useState(true);
  const [formError, setFormError] = React.useState('');

  // Stellar process states
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [stellarStep, setStellarStep] = React.useState(0);
  const [stellarTxResult, setStellarTxResult] = React.useState<{ txHash: string; ledger: number } | null>(null);

  // Delete confirmation
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-bold text-rose-500">Goal not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const colors = colorMap[goal.color] || colorMap.indigo;

  // Calculators
  const percentage = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
  const totalSaved = goal.currentAmount;

  const averageDeposit = goalDeposits.length
    ? Math.round(goalDeposits.reduce((acc, d) => acc + d.amount, 0) / goalDeposits.length)
    : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Encouraging quote
  const getMotivationMessage = () => {
    if (percentage === 0) return 'The journey of a thousand miles begins with a single dollar. Make your first deposit!';
    if (percentage < 25) return 'Great start! You are building the savings habit. Keep going!';
    if (percentage < 50) return 'Almost a quarter of the way there! Consistent inputs make dreams real.';
    if (percentage < 75) return 'Halfway point passed! You are on track. Your future self is cheering!';
    if (percentage < 100) return 'Incredibly close! Home stretch. Power through to reach the finish line!';
    return '🎉 Congratulations! You met your target. Your Stellar dedication paid off!';
  };

  // Submit deposit
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setStellarTxResult(null);

    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Please enter a deposit amount greater than $0.');
      return;
    }

    const finalNote = depositNote.trim() || 'Savings deposit';

    if (useStellar) {
      setIsSubmitting(true);
      setStellarStep(1); // Connecting/checking wallet

      try {
        // Step 1: Initialize transaction builder
        await new Promise((r) => setTimeout(r, 800));
        setStellarStep(2); // Compiling operation payload

        // Step 2: Formulate operation details
        await new Promise((r) => setTimeout(r, 800));
        setStellarStep(3); // Awaiting Stellar ledger network broadcast

        // Execute transaction (will use connected wallet key if available, otherwise high-fidelity simulated ledger response)
        const response = await createStellarSavingsTransaction({
          publicKey,
          amount: amountNum,
          memoText: finalNote,
        });

        setStellarStep(4); // Success, block minted
        await new Promise((r) => setTimeout(r, 600));

        setStellarTxResult({
          txHash: response.txHash,
          ledger: response.ledger,
        });

        // Save to state store
        addDeposit(goal.id, amountNum, `${finalNote} (via Stellar)`, response.txHash);
        
        // Reset form
        setDepositAmount('');
        setDepositNote('');
      } catch (err: any) {
        console.error('Stellar submission failed:', err);
        setFormError('Failed to commit Stellar transaction. Please try again.');
        setIsSubmitting(false);
      }
    } else {
      // Normal immediate database deposit
      addDeposit(goal.id, amountNum, finalNote);
      setDepositAmount('');
      setDepositNote('');
      
      // Flash a quick success feedback or complete
      const el = document.getElementById('success-flash');
      if (el) {
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 2500);
      }
    }
  };

  const handleDeleteConfirm = () => {
    deleteGoal(goal.id);
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Top Bar with back button and delete goal action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground bg-card/90 border border-border px-4 py-2 rounded-full transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </button>

        <div className="relative">
          <AnimatePresence>
            {showConfirmDelete ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-0 z-10 bg-card border border-rose-500/30 rounded-full p-3 shadow-lg flex items-center gap-2 w-max"
              >
                <span className="text-xs font-semibold text-rose-500">Confirm Delete?</span>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-semibold transition-all"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground rounded-full text-xs font-semibold border border-border transition-all"
                >
                  No
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center gap-2 text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-full transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete Goal
              </button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className={`relative overflow-hidden glass-card rounded-[32px] p-6 md:p-8 shadow-xl bg-gradient-to-b ${colors.bgGlow}`}>
        {/* Animated grid lines background pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-background border border-border shadow-md">
              {goal.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${colors.badgeBg}`}>
                  {goal.category}
                </span>
                <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Created {new Date(goal.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 text-foreground">
                {goal.title}
              </h1>
            </div>
          </div>

          {/* Quick Progress Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="text-left md:text-right flex flex-col">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Total Progress</span>
              <span className="text-3xl font-extrabold font-mono text-foreground">
                {percentage}% <span className="text-sm text-muted-foreground font-normal">complete</span>
              </span>
            </div>
            <div className="w-24 h-24 relative flex items-center justify-center flex-shrink-0">
              {/* Radial Progress Display */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="38" className="stroke-muted/30" strokeWidth="7" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  className={`${colors.text} stroke-current transition-all duration-700`}
                  strokeWidth="7"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 - (percentage / 100) * (2 * Math.PI * 38)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-base font-extrabold font-mono">{percentage}%</span>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar & Motivation Message */}
        <div className="relative mt-6 pt-5 border-t border-border/60">
          <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden border border-border/20">
            <div className={`h-full ${colors.progressBg} rounded-full`} style={{ width: `${percentage}%` }} />
          </div>
          <p className="text-xs italic text-muted-foreground mt-3 font-medium flex items-center gap-1.5">
            💡 {getMotivationMessage()}
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Chart & Stats bento (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress Chart */}
          <SavingsChart goal={goal} deposits={goalDeposits} />

          {/* Statistics Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Stat Card 1 */}
            <div className="glass-card rounded-[24px] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Saved</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-extrabold font-mono tracking-tight text-foreground">
                  {formatCurrency(totalSaved)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Across {goalDeposits.length} deposits
                </p>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="glass-card rounded-[24px] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Remaining</span>
                <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-extrabold font-mono tracking-tight text-foreground">
                  {formatCurrency(remainingAmount)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  To achieve target budget
                </p>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="glass-card rounded-[24px] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Avg. Contribution</span>
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-extrabold font-mono tracking-tight text-foreground">
                  {formatCurrency(averageDeposit)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Per ledger transaction
                </p>
              </div>
            </div>

          </div>

          {/* Deposit History Log (Desktop: Bottom of left column) */}
          <div className="glass-card rounded-[32px] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Deposit Ledger History</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-muted rounded-full font-mono">
                {goalDeposits.length} Transactions
              </span>
            </div>

            {goalDeposits.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl bg-background/20">
                🫙 No deposits recorded yet. Save funds using the form on the right!
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {goalDeposits.map((dep, idx) => (
                  <motion.div
                    key={dep.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-background border border-border/60 hover:border-primary/30 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {dep.note || 'Savings Deposit'}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {new Date(dep.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-0 text-right flex flex-col items-end w-full sm:w-auto">
                      <span className="text-sm font-extrabold text-success font-mono">
                        +{formatCurrency(dep.amount)}
                      </span>
                      {dep.txHash && (
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${dep.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-primary hover:underline font-mono flex items-center gap-0.5 mt-0.5 opacity-80"
                        >
                          Stellar Explorer <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column - Add Funds Form (1 col wide) */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="glass-card rounded-[32px] p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 via-amber-500 to-emerald-400" />
            
            <h3 className="text-md font-bold tracking-tight text-foreground flex items-center gap-1.5 mb-1">
              💰 Add Funds
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Allocate new cash to this goal and sync with Stellar.
            </p>

            {/* Standard Immediate Success Notification */}
            <div
              id="success-flash"
              className="hidden mb-3 text-xs bg-success/10 border border-success/20 text-success p-3 rounded-lg font-medium"
            >
              🎉 Success! Deposit recorded instantly.
            </div>

            {formError && (
              <div className="mb-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-lg font-medium">
                ⚠️ {formError}
              </div>
            )}

            {isSubmitting ? (
              /* Stellar Transaction Immersive Stepper */
              <div className="space-y-5 py-4">
                <div className="text-center">
                  <div className="inline-block p-2 bg-primary/15 rounded-full text-primary animate-spin mb-2">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Stellar Consensus Committing</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Submitting payload to Stellar Horizon Testnet.
                  </p>
                </div>

                <div className="space-y-3.5 border border-border/60 bg-background/50 rounded-xl p-3.5">
                  {[
                    'Initializing wallet security verification',
                    'Compiling deposit operation parameters',
                    'Broadcasting network consensus handshake',
                    'Final ledger state committed successfully',
                  ].map((stepText, idx) => {
                    const stepNum = idx + 1;
                    const isPassed = stellarStep > stepNum;
                    const isCurrent = stellarStep === stepNum;
                    const isFuture = stellarStep < stepNum;

                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full text-[10px] font-bold font-mono flex items-center justify-center transition-all ${
                            isPassed
                              ? 'bg-success text-success-foreground'
                              : isCurrent
                              ? 'bg-primary text-primary-foreground animate-pulse'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isPassed ? '✓' : stepNum}
                        </div>
                        <span
                          className={`text-xs ${
                            isPassed
                              ? 'text-muted-foreground line-through'
                              : isCurrent
                              ? 'text-primary font-semibold'
                              : 'text-muted-foreground/60'
                          }`}
                        >
                          {stepText}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {stellarTxResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-success/10 border border-success/20 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-success">
                      <CheckCircle2 className="w-4 h-4" /> Ledger Consensus Complete
                    </div>
                    <div className="text-[10px] space-y-1 font-mono text-muted-foreground">
                      <div>
                        Block Height:{' '}
                        <span className="font-semibold text-foreground">
                          #{stellarTxResult.ledger}
                        </span>
                      </div>
                      <div className="truncate">
                        Tx Hash:{' '}
                        <span className="text-primary font-semibold">
                          {stellarTxResult.txHash}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsSubmitting(false);
                        setStellarTxResult(null);
                      }}
                      className="w-full mt-2 py-1.5 bg-success text-success-foreground font-bold text-xs rounded-lg hover:bg-opacity-90 transition-all"
                    >
                      Awesome, Done
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                {/* Deposit Amount input */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Deposit Amount ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 250"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-background border border-border text-sm pl-8 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-foreground font-mono font-semibold"
                    />
                  </div>
                </div>

                {/* Deposit Note input */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Source Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Weekly paycheck savings"
                    value={depositNote}
                    onChange={(e) => setDepositNote(e.target.value)}
                    className="w-full bg-background border border-border text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-foreground"
                  />
                </div>

                {/* Stellar Consensus Toggle */}
                <div className="p-3 bg-background border border-border rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-primary" />
                      Stellar Testnet Sync
                    </label>
                    <input
                      type="checkbox"
                      checked={useStellar}
                      onChange={(e) => setUseStellar(e.target.checked)}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Syncs the deposit parameters as a Testnet transaction with Freighter signing capabilities or high-fidelity simulated ledger consensus block.
                  </p>
                </div>

                {/* Wallet Info Check */}
                {useStellar && (
                  <div className="text-[10px] border border-border bg-background p-2.5 rounded-xl text-muted-foreground flex items-center gap-1.5">
                    {publicKey ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-success inline-block animate-pulse" />
                        <span className="truncate">
                          Connected wallet key:{' '}
                          <span className="font-mono text-foreground font-semibold">
                            {publicKey.substring(0, 6)}...{publicKey.substring(publicKey.length - 4)}
                          </span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                        <span>
                          No wallet linked. App will run high-fidelity Testnet simulations.
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className={`w-full py-3 text-sm font-semibold rounded-xl ${colors.btnBg} transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10`}
                >
                  <DollarSign className="w-4 h-4" />
                  Deposit Funds
                </button>
              </form>
            )}
          </div>

          {/* Motivation target block */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground/80">Target Forecast</p>
              <p className="text-xs text-muted-foreground">
                You are{' '}
                <span className="font-bold text-foreground">
                  {formatCurrency(remainingAmount)}
                </span>{' '}
                away from your goal!
              </p>
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
