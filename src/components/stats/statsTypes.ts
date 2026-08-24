export type MonthDayCell = {
  dateKey: string;
  dayNum: number;
  isCurrentMonth: boolean;
};

export type WardrobeInsight = {
  id: string;
  title: string;
  body: string;
  icon: string;
  tag: string;
  tone: 'gold' | 'sage' | 'terracotta' | 'plum';
};
