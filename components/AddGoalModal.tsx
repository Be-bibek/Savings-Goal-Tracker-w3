'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, Plus } from 'lucide-react';
import { useSavingsStore } from '../lib/store';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_PRESETS = [
  { name: 'Travel', emoji: '✈️' },
  { name: 'Tech', emoji: '💻' },
  { name: 'Finance', emoji: '🛡️' },
  { name: 'Education', emoji: '🎓' },
  { name: 'Home', emoji: '🏡' },
  { name: 'Auto', emoji: '🚗' },
  { name: 'Leisure', emoji: '🎮' },
  { name: 'Crypto', emoji: '🚀' },
];

const EMOJI_OPTIONS = ['🏖️', '💻', '🛡️', '🚀', '🎓', '🏡', '🚗', '🎮', '✈️', '🎨', '🍕', '⌚', '👟', '💍', '🎁'];

const COLOR_OPTIONS = [
  { value: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-500' },
  { value: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', text: 'text-indigo-500' },
  { value: 'blue', label: 'Blue', bg: 'bg-blue-500', text: 'text-blue-500' },
  { value: 'violet', label: 'Violet', bg: 'bg-violet-500', text: 'text-violet-500' },
  { value: 'rose', label: 'Rose', bg: 'bg-rose-500', text: 'text-rose-500' },
  { value: 'amber', label: 'Amber', bg: 'bg-amber-500', text: 'text-amber-500' },
];

export function AddGoalModal({ isOpen, onClose }: AddGoalModalProps) {
  const addGoal = useSavingsStore((state) => state.addGoal);

  // Form states
  const [title, setTitle] = React.useState('');
  const [targetAmount, setTargetAmount] = React.useState('');
  const [category, setCategory] = React.useState('Travel');
  const [emoji, setEmoji] = React.useState('🏖️');
  const [color, setColor] = React.useState('indigo');
  const [error, setError] = React.useState('');

  const handleCategorySelect = (catName: string, catEmoji: string) => {
    setCategory(catName);
    setEmoji(catEmoji);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a descriptive title for your savings goal.');
      return;
    }

    const amountNum = parseFloat(targetAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please provide a valid target savings amount greater than 0.');
      return;
    }

    addGoal({
      title: title.trim(),
      targetAmount: Number(amountNum.toFixed(2)),
      category,
      emoji,
      color,
    });

    // Reset fields and close
    setTitle('');
    setTargetAmount('');
    setCategory('Travel');
    setEmoji('🏖️');
    setColor('indigo');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-lg glass-card p-6 rounded-[32px] shadow-2xl z-50 overflow-hidden"
          >
            {/* Header decor */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 via-amber-500 to-emerald-400" />

            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-extrabold tracking-tight">Create Savings Goal</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-lg font-medium">
                  ⚠️ {error}
                </div>
              )}

              {/* Goal Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Goal Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., New Laptop, Tokyo Vacation, Tesla Downpayment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border border-border text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-foreground"
                />
              </div>

              {/* Target Savings and Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Target Amount ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 1500"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-background border border-border text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Theme Color Accent
                  </label>
                  <div className="flex items-center gap-2 h-11 border border-border px-3 rounded-xl bg-background justify-between">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        type="button"
                        key={c.value}
                        onClick={() => setColor(c.value)}
                        className={`w-5 h-5 rounded-full ${c.bg} transition-transform relative`}
                      >
                        {color === c.value && (
                          <span className="absolute inset-0 border-2 border-white dark:border-background rounded-full scale-110" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Categories preset selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Goal Category Presets
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORY_PRESETS.map((cat) => (
                    <button
                      type="button"
                      key={cat.name}
                      onClick={() => handleCategorySelect(cat.name, cat.emoji)}
                      className={`py-2 px-1 text-center rounded-xl border text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                        category === cat.name
                          ? 'bg-primary/10 border-primary text-primary font-bold'
                          : 'bg-background hover:bg-muted/50 border-border text-muted-foreground'
                      }`}
                    >
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="text-[10px] truncate w-full">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Emoji Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Select Custom Emoji
                </label>
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-border bg-background max-h-[85px] overflow-y-auto">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      type="button"
                      key={em}
                      onClick={() => setEmoji(em)}
                      className={`text-xl p-1 rounded-lg hover:bg-muted transition-all ${
                        emoji === em ? 'bg-primary/20 scale-110 border border-primary/40' : ''
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 text-sm font-semibold rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm font-semibold rounded-full bg-primary text-primary-foreground hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  Save Goal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
