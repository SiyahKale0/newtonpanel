// src/types/analytics.ts

export interface PerformanceMetrics {
  totalSessions: number;
  totalGameTime: number; // in minutes
  averageResponseTime: number; // in ms
  averageScore: number;
  bestScore: number;
  improvementTrend: number;
  sessionConsistency: number;
  averageSessionDuration: number; // in minutes
  gamePreference: { [key: string]: number };
  weeklyProgress: Array<{
    week: string;
    sessions: number;
    averageScore: number;
    totalTime: number;
  }>;
  fingerPerformance: Array<{
    finger: string;
    accuracy: number;
    improvement: number;
  }>;
  difficultyProgress: Array<{
    level: number;
    successRate: number;
    attempts: number;
  }>;
  romAnalysis: Array<{
    finger: string;
    rom: number;
  }>;
}

export interface TrendData {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  period: string;
}

export interface TimeRange {
  startDate: Date;
  endDate: Date;
  start?: Date;
  end?: Date;
  granularity?: string;
}

export interface TrendAnalysis {
  accuracy: TrendMetric;
  responseTime: TrendMetric;
  successRate: TrendMetric;
  overall: TrendMetric;
}

export interface TrendMetric {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  direction: 'up' | 'down' | 'stable';
  significance: 'minimal' | 'moderate' | 'significant';
}

export interface Recommendation {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  rationale: string;
  expectedOutcome: string;
  implementationSteps: string[];
  createdAt: Date;
}

export interface Goal {
  id: string;
  patientId: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsService {
  getPerformanceMetrics(patientId: string, timeRange: TimeRange): Promise<PerformanceData>;
  generateProgressReport(patientId: string): Promise<ProgressReport>;
  getComparativeAnalysis(patientIds: string[], metric: MetricType): Promise<ComparisonData[]>;
  getTrendAnalysis(patientId: string, metric: MetricType, timeRange: TimeRange): Promise<TrendAnalysis>;
  getRecommendations(patientId: string): Promise<Recommendation[]>;
  updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal>;
}

export interface PerformanceData {
  patientId: string;
  timeRange: TimeRange;
  metrics: PerformanceMetrics;
  trends: TrendAnalysis;
  comparisons: ComparisonData[];
}

export interface ProgressReport {
  patientId: string;
  generatedAt: Date;
  period: TimeRange;
  summary: {
    overallProgress: number;
    keyAchievements: string[];
    areasForImprovement: string[];
    nextMilestones: string[];
  };
  detailedMetrics: {
    sessionCount: number;
    totalDuration: number;
    averageSessionDuration: number;
    performanceByExercise: any[];
    performanceByDay: any[];
    streaks: {
      currentStreak: number;
      longestStreak: number;
      streakType: string;
      lastStreakDate: Date;
    };
  };
  recommendations: Recommendation[];
  goals: Goal[];
}

export interface ComparisonData {
  metric: MetricType;
  currentPeriod: {
    value: number;
    label: string;
    period: string;
    sampleSize: number;
  };
  previousPeriod: {
    value: number;
    label: string;
    period: string;
    sampleSize: number;
  };
}

export type MetricType = 
  | 'accuracy'
  | 'response_time'
  | 'success_rate'
  | 'completion_rate'
  | 'engagement_score'
  | 'improvement_rate';

export interface ChartConfig {
  type: 'line' | 'bar' | 'heatmap' | 'scatter';
  data: any;
  options: ChartOptions;
  plugins: ChartPlugin[];
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  scales?: any;
  plugins?: any;
  interaction?: any;
}

export interface ChartPlugin {
  id: string;
  beforeInit?: (chart: any) => void;
  afterUpdate?: (chart: any) => void;
}

export interface ImprovementSuggestion {
  icon: any;
  color: string;
  text: string;
}