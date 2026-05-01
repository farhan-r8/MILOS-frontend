import { Award, Calendar, Star, Target, Trophy, type LucideIcon } from 'lucide-react';
import type { TransactionItem } from './milosApi';

export const POINTS_TO_RUPIAH_DIVISOR = 1000;

export type LevelConfig = {
  label: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  progress: number;
  remaining: number;
  next: 'Silver' | 'Gold' | 'Platinum' | null;
};

export type AchievementItem = {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  progress: number;
  unlocked: boolean;
};

const LEVEL_RULES = [
  { label: 'Bronze', minPoints: 0, next: 'Silver', nextMinPoints: 5000 },
  { label: 'Silver', minPoints: 5000, next: 'Gold', nextMinPoints: 10000 },
  { label: 'Gold', minPoints: 10000, next: 'Platinum', nextMinPoints: 50000 },
  { label: 'Platinum', minPoints: 50000, next: null, nextMinPoints: null },
] as const;

export function getLevelConfig(points: number): LevelConfig {
  const activeRule =
    [...LEVEL_RULES].reverse().find((rule) => points >= rule.minPoints) ?? LEVEL_RULES[0];

  if (!activeRule.next || !activeRule.nextMinPoints) {
    return {
      label: activeRule.label,
      progress: 100,
      remaining: 0,
      next: null,
    };
  }

  const range = activeRule.nextMinPoints - activeRule.minPoints;
  const progress = Math.min(
    100,
    Math.round(((points - activeRule.minPoints) / range) * 100)
  );

  return {
    label: activeRule.label,
    progress,
    remaining: Math.max(0, activeRule.nextMinPoints - points),
    next: activeRule.next,
  };
}

export function buildAchievements(
  transactions: TransactionItem[],
  currentPoints: number
): AchievementItem[] {
  const totalTransactions = transactions.length;
  const plasticWeight = transactions
    .filter((transaction) => /plastik/i.test(transaction.wasteType))
    .reduce((sum, transaction) => sum + transaction.weight, 0);
  const uniqueMonths = new Set(
    transactions.map((transaction) => {
      const date = new Date(transaction.date);
      return `${date.getFullYear()}-${date.getMonth()}`;
    })
  ).size;

  return [
    {
      id: 1,
      title: 'Pemula Hijau',
      description: 'Selesaikan 5 transaksi pertama',
      icon: Star,
      progress: Math.min(100, Math.round((totalTransactions / 5) * 100)),
      unlocked: totalTransactions >= 5,
    },
    {
      id: 2,
      title: 'Pengumpul Plastik',
      description: 'Kumpulkan 50 kg plastik',
      icon: Trophy,
      progress: Math.min(100, Math.round((plasticWeight / 50) * 100)),
      unlocked: plasticWeight >= 50,
    },
    {
      id: 3,
      title: 'Pejuang Lingkungan',
      description: 'Raih 10,000 poin',
      icon: Award,
      progress: Math.min(100, Math.round((currentPoints / 10000) * 100)),
      unlocked: currentPoints >= 10000,
    },
    {
      id: 4,
      title: 'Konsisten',
      description: 'Transaksi 6 bulan berturut-turut',
      icon: Calendar,
      progress: Math.min(100, Math.round((uniqueMonths / 6) * 100)),
      unlocked: uniqueMonths >= 6,
    },
    {
      id: 5,
      title: 'Master Recycler',
      description: 'Raih 50,000 poin',
      icon: Target,
      progress: Math.min(100, Math.round((currentPoints / 50000) * 100)),
      unlocked: currentPoints >= 50000,
    },
  ];
}
