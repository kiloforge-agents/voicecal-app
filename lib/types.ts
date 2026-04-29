export type LogEntry = {
  id: string;
  timestamp: number;
  description: string;
  calories: number;
  category: string;
  raw: string;
};

export type DailyGoal = {
  calories: number;
};
