'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';
import {
  Wallet,
  Sun,
  Moon,
  Plus,
  Sparkles,
  Info,
  DollarSign,
  Cpu,
  RefreshCw,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import { useSavingsStore } from '../lib/store';
import { GoalCard } from '../components/GoalCard';
import { AddGoalModal } from '../components/AddGoalModal';
import { GoalDetailView } from '../components/GoalDetailView';
import { connectWallet, initStellarKit } from '../lib/stellar';

export default function Home() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // Zustand state
  const { publicKey, goals, deposits, setPublicKey, resetAll } = useSavingsStore();

  // Navigation and Modal states
  const [activeGoalId, setActiveGoalId] = React.useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [walletError, setWalletError] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);

  // Initialize Stellar Kit on mount
  React.useEffect(() => {
    initStellarKit();
  }, []);

  // Sync back button / URL hash for a premium multi-page browser experience
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#goal-')) {
        const goalId = hash.replace('#goal-', '');
        setActiveGoalId(goalId);
      } else {
        setActiveGoalId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial load check
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectGoal = (id: string) => {
    window.location.hash = `goal-${id}`;
    setActiveGoalId(id);
  };

  const handleBackToDashboard = () => {
    window.location.hash = '';
    setActiveGoalId(null);
  };

  // Wallet Connect Trigger
  const handleConnectWallet = async () => {
    setWalletError(null);
    setIsConnecting(true);
    try {
      await connectWallet(
        (address) => {
          setPublicKey(address);
          setIsConnecting(false);
        },
        (err) => {
          console.error(err);
          setWalletError('Failed to connect to Freighter or detected sandbox iframe limits. Falling back to sandbox test ledger mode.');
          setIsConnecting(false);
          // Set a fallback mock key for testing in standard non-extension environment
          setPublicKey('GD7V...FREIGHTER_TESTNET_KEY_MOCK');
        }
      );
    } catch (e) {
      setIsConnecting(false);
      setPublicKey('GD7V...FREIGHTER_TESTNET_KEY_MOCK');
    }
  };

  const handleDisconnectWallet = () => {
    setPublicKey(null);
    setWalletError(null);
  };

  // Calculators for overall dashboard metrics
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallPercentage = totalTarget > 0 ? Math.min(Math.round((totalSaved / totalTarget) * 100), 100) : 0;
  const completedGoalsCount = goals.filter((g) => g.currentAmount >= g.targetAmount).length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <div id="savings-tracker-root" className="min-h-screen bg-background text-foreground transition-colors duration-200 relative pb-20 overflow-x-hidden">
      
      {/* Immersive Floating Aurora background blur highlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none select-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none select-none" />

      {/* Primary Top Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleBackToDashboard}>
            <div className="w-9 h-9 rounded-xl vibrant-gradient-1 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Stellar Goals
              </span>
              <span className="hidden sm:inline text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground block leading-none">
                Savings Tracker
              </span>
            </div>
          </div>

          {/* Right Controls Bar */}
          <div className="flex items-center gap-3">
            
            {/* Wallet Info Check & Action */}
            <div className="flex items-center">
              {publicKey ? (
                <div className="flex items-center gap-2 bg-card/90 border border-border rounded-full px-4 py-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span className="text-xs font-mono font-bold text-muted-foreground max-w-[90px] sm:max-w-none truncate">
                    {publicKey.substring(0, 4)}...{publicKey.substring(publicKey.length - 4)}
                  </span>
                  <button
                    onClick={handleDisconnectWallet}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600 pl-2 border-l border-border transition-all"
                    title="Disconnect Stellar Wallet"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConnectWallet}
                  className="flex items-center gap-2 vibrant-gradient-blue text-white hover:opacity-95 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wallet className="w-3.5 h-3.5" />
                  )}
                  <span>Connect Wallet</span>
                </motion.button>
              )}
            </div>

            {/* Light/Dark Toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-sm"
              aria-label="Toggle Light/Dark Theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Sun className="w-4.5 h-4.5 text-amber-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Moon className="w-4.5 h-4.5 text-indigo-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

          </div>

        </div>
      </header>

      {/* Primary Workspace container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Wallet error banner display */}
        <AnimatePresence>
          {walletError && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-sm overflow-hidden"
            >
              <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wide">Freighter Extension Link Notice</h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                  No extension detected, or the preview sandbox sandbox constraints are preventing communication. Enabled the <strong className="text-foreground">High-Fidelity simulated ledger fallback</strong> so you can still record and submit ledger consensus swaps!
                </p>
              </div>
              <button
                onClick={() => setWalletError(null)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground hover:underline transition-all"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeGoalId ? (
            
            /* VIEW 2: Dynamic Goal Detail Page */
            <div id="view-goal-detail">
              <GoalDetailView goalId={activeGoalId} onBack={handleBackToDashboard} />
            </div>
            
          ) : (
            
            /* VIEW 1: Dashboard Overview */
            <motion.div
              id="view-dashboard-overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              
              {/* Grand Overview Bento Header */}
              <div className="relative overflow-hidden glass-card rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Visual decoration line */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 via-amber-500 to-emerald-400" />

                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      Savings Goals Ledger
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                      Track your financial milestones dynamically, make simulated or wallet-signed deposits, and witness cumulative curves update in real-time.
                    </p>
                  </div>

                  {/* Progressive total indicator bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-muted-foreground font-mono">
                      <span>SAVED: {formatCurrency(totalSaved)}</span>
                      <span>TARGET: {formatCurrency(totalTarget)}</span>
                    </div>
                    <div className="w-full bg-muted/60 h-3 rounded-full overflow-hidden border border-border/20">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${overallPercentage}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Circular Stats and Quick Info Metrics block */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:border-l md:border-border/60 md:pl-8 flex-shrink-0">
                  <div className="bg-background/80 border border-border px-4 py-3 rounded-[20px] flex flex-col justify-center shadow-sm">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Progress</span>
                    <span className="text-xl font-extrabold font-mono text-indigo-500 dark:text-indigo-400 mt-1">{overallPercentage}%</span>
                  </div>
                  <div className="bg-background/80 border border-border px-4 py-3 rounded-[20px] flex flex-col justify-center shadow-sm">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Active Goals</span>
                    <span className="text-xl font-extrabold font-mono text-foreground mt-1">{goals.length}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 bg-background/80 border border-border px-4 py-3 rounded-[20px] flex flex-col justify-center shadow-sm">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Completed</span>
                    <span className="text-xl font-extrabold font-mono text-emerald-500 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      {completedGoalsCount} <Trophy className="w-4 h-4 text-amber-500 inline-block animate-bounce" />
                    </span>
                  </div>
                </div>

              </div>

              {/* Goals list and grid control */}
              <div>
                <div className="flex items-center justify-between mb-5 gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-md font-bold tracking-tight text-foreground uppercase tracking-wide">
                      My Milestones
                    </h3>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 vibrant-gradient-1 text-white rounded-full text-xs font-extrabold shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    New Goal
                  </motion.button>
                </div>

                {goals.length === 0 ? (
                  <div className="text-center py-24 bg-card border border-border/80 rounded-2xl flex flex-col items-center justify-center p-6 shadow-sm">
                    <span className="text-4xl mb-3">🎯</span>
                    <h4 className="text-base font-bold text-foreground">No active goals found</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      Create your first custom financial savings goal using the button below to start tracking.
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-4 px-5 py-2 vibrant-gradient-1 text-white text-xs font-extrabold rounded-full shadow-md shadow-indigo-500/20"
                    >
                      Create Savings Goal
                    </button>
                  </div>
                ) : (
                  /* Staggered Goals Grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((g) => (
                      <GoalCard key={g.id} goal={g} onSelect={handleSelectGoal} />
                    ))}

                    {/* Quick Create Bento Placeholder inside Grid */}
                    <motion.div
                      onClick={() => setIsAddModalOpen(true)}
                      whileHover={{ scale: 1.02 }}
                      className="border-2 border-dashed border-border/80 hover:border-primary/50 cursor-pointer rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 bg-card/10 hover:bg-card/40 transition-all duration-300 min-h-[220px]"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Plus className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground/80">Add Savings Goal</h4>
                      <p className="text-[11px] text-muted-foreground max-w-[200px]">
                        Add a new workstation, vehicle, house fund, or custom milestone.
                      </p>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Stellar educational card bottom */}
              <div className="p-5 border border-border/50 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="p-3 bg-indigo-500/15 rounded-xl text-indigo-500 flex-shrink-0">
                  <Cpu className="w-6 h-6" />
                </div>
                <div className="space-y-0.5 text-center sm:text-left">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                    How Stellar Integrations Enhance Your Savings
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                    By linking with the Stellar network, our goal tracker maps each deposit as an independent ledger-certified transaction. This allows micro-payment security on-chain and supports Freighter signature wallets directly on the Stellar Testnet.
                  </p>
                </div>
                <button
                  onClick={resetAll}
                  className="mt-3 sm:mt-0 sm:ml-auto text-xs font-mono font-bold text-rose-500 border border-rose-500/10 hover:border-rose-500/20 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all"
                >
                  Reset All Data
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Savings Goal Modal */}
        <AddGoalModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      </main>
    </div>
  );
}
