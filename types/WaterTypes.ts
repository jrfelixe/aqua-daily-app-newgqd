
export interface WaterIntake {
  id: string;
  amount: number; // in ml
  timestamp: Date;
  date: string; // YYYY-MM-DD format
}

export interface DailyGoal {
  amount: number; // in ml
  date: string; // YYYY-MM-DD format
}

export interface WaterReminder {
  id: string;
  time: string; // HH:MM format
  enabled: boolean;
  message: string;
}

export interface WeeklyProgress {
  date: string; // YYYY-MM-DD format
  totalIntake: number; // in ml
  goalAmount: number; // in ml
  percentage: number; // 0-100
}

export const PRESET_AMOUNTS = [
  { label: '250ml', value: 250, icon: 'cup' },
  { label: '500ml', value: 500, icon: 'bottle' },
  { label: '750ml', value: 750, icon: 'bottle.large' },
  { label: '1L', value: 1000, icon: 'bottle.xl' },
];

export const DEFAULT_DAILY_GOAL = 2000; // 2 liters in ml
