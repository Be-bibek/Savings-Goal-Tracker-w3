'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  emoji: string;
  color: string; // e.g., 'indigo', 'emerald', 'amber', 'rose', 'blue'
  createdAt: string;
}

export interface Deposit {
  id: string;
  goalId: string;
  amount: number;
  timestamp: string; // ISO string or short date
  note: string;
  txHash?: string; // Optional Stellar transaction hash
}

interface SavingsState {
  publicKey: string | null;
  stellarNetwork: string; // 'TESTNET' or 'PUBLIC'
  goals: SavingsGoal[];
  deposits: Deposit[];
  setPublicKey: (key: string | null) => void;
  setStellarNetwork: (network: string) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'createdAt'>) => void;
  deleteGoal: (id: string) => void;
  addDeposit: (goalId: string, amount: number, note: string, txHash?: string) => void;
  resetAll: () => void;
}

const DEFAULT_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'Dream Vacation',
    targetAmount: 5000,
    currentAmount: 3200,
    category: 'Travel',
    emoji: '🏖️',
    color: 'emerald',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  },
  {
    id: 'goal-2',
    title: 'New Workstation',
    targetAmount: 2500,
    currentAmount: 1800,
    category: 'Tech',
    emoji: '💻',
    color: 'indigo',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'goal-3',
    title: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 4500,
    category: 'Finance',
    emoji: '🛡️',
    color: 'blue',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'goal-4',
    title: 'Stellar Pioneer',
    targetAmount: 500,
    currentAmount: 150,
    category: 'Crypto',
    emoji: '🚀',
    color: 'violet',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_DEPOSITS: Deposit[] = [
  // Dream Vacation deposits
  {
    id: 'dep-1',
    goalId: 'goal-1',
    amount: 1500,
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Initial vacation budget seed',
  },
  {
    id: 'dep-2',
    goalId: 'goal-1',
    amount: 1000,
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Monthly savings contribution',
  },
  {
    id: 'dep-3',
    goalId: 'goal-1',
    amount: 700,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Stellar testnet savings swap',
    txHash: '4a6b2e1189acdf019bbcc20287a91a99d6fb3501bc89a71649abf6804aee9812',
  },
  // New Workstation deposits
  {
    id: 'dep-4',
    goalId: 'goal-2',
    amount: 1000,
    timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Sold old graphics card',
  },
  {
    id: 'dep-5',
    goalId: 'goal-2',
    amount: 800,
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Freelance design project payout',
  },
  // Emergency Fund deposits
  {
    id: 'dep-6',
    goalId: 'goal-3',
    amount: 3000,
    timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Moved from general savings account',
  },
  {
    id: 'dep-7',
    goalId: 'goal-3',
    amount: 1500,
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Quarterly bonus',
  },
  // Stellar Pioneer deposits
  {
    id: 'dep-8',
    goalId: 'goal-4',
    amount: 50,
    timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Testnet faucet test deposit',
    txHash: 'b9d10e8d0119e7a6858cb0a552bfef69022ee0cf819ab29ef11ab60bfce191df',
  },
  {
    id: 'dep-9',
    goalId: 'goal-4',
    amount: 100,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Deposited 100 XLM from Freighter',
    txHash: '98e7fcbf019ab7630bc129ae78dfb9a8cfd6f830d1a938fc287ba981cb027f1a',
  },
];

export const useSavingsStore = create<SavingsState>()(
  persist(
    (set, get) => ({
      publicKey: null,
      stellarNetwork: 'TESTNET',
      goals: DEFAULT_GOALS,
      deposits: DEFAULT_DEPOSITS,

      setPublicKey: (key) => set({ publicKey: key }),
      setStellarNetwork: (network) => set({ stellarNetwork: network }),

      addGoal: (goalData) => {
        const newGoal: SavingsGoal = {
          ...goalData,
          id: `goal-${Date.now()}`,
          currentAmount: 0,
          createdAt: new Date().toISOString(),
        };
        set({ goals: [newGoal, ...get().goals] });
      },

      deleteGoal: (id) => {
        set({
          goals: get().goals.filter((g) => g.id !== id),
          deposits: get().deposits.filter((d) => d.goalId !== id),
        });
      },

      addDeposit: (goalId, amount, note, txHash) => {
        const newDeposit: Deposit = {
          id: `dep-${Date.now()}`,
          goalId,
          amount,
          timestamp: new Date().toISOString(),
          note,
          txHash,
        };

        // Update both the deposits list and the goal's current amount
        const updatedDeposits = [newDeposit, ...get().deposits];
        const updatedGoals = get().goals.map((g) => {
          if (g.id === goalId) {
            return {
              ...g,
              currentAmount: Number((g.currentAmount + amount).toFixed(2)),
            };
          }
          return g;
        });

        set({
          deposits: updatedDeposits,
          goals: updatedGoals,
        });
      },

      resetAll: () => {
        set({
          goals: DEFAULT_GOALS,
          deposits: DEFAULT_DEPOSITS,
          publicKey: null,
        });
      },
    }),
    {
      name: 'stellar-savings-goal-tracker',
      partialize: (state) => ({
        publicKey: state.publicKey,
        stellarNetwork: state.stellarNetwork,
        goals: state.goals,
        deposits: state.deposits,
      }),
    }
  )
);
