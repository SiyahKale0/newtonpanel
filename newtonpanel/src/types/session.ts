export interface Session {
  id: string;
  patientId: string;
  therapistId: string;
  type: SessionType;
  startTime: Date;
  endTime: Date;
  performanceMetrics: PerformanceMetrics;
  configuration: SessionConfig;
  notes: string;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type SessionType = 
  | 'cognitive_training'
  | 'motor_skills'
  | 'speech_therapy'
  | 'occupational_therapy'
  | 'physical_therapy'
  | 'custom';

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface PerformanceMetrics {
  accuracy: number;
  responseTime: number;
  successRate: number;
  completionRate: number;
  improvementTrend: TrendData;
  detailedMetrics: Record<string, number>;
}

export interface TrendData {
  direction: 'improving' | 'declining' | 'stable';
  percentage: number;
  period: string;
}

export interface SessionConfig {
  difficulty: number;
  duration: number;
  exerciseTypes: string[];
  customSettings: Record<string, any>;
  adaptiveMode: boolean;
  targetMetrics: Record<string, number>;
}

export interface SessionDetails extends Session {
  exerciseResults: ExerciseResult[];
  timelineEvents: TimelineEvent[];
}

export interface ExerciseResult {
  exerciseId: string;
  exerciseName: string;
  startTime: Date;
  endTime: Date;
  score: number;
  attempts: number;
  errors: ErrorLog[];
}

export interface ErrorLog {
  timestamp: Date;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TimelineEvent {
  timestamp: Date;
  type: 'start' | 'pause' | 'resume' | 'exercise_complete' | 'end';
  description: string;
  metadata?: Record<string, any>;
}

export interface CreateSessionRequest {
  patientId: string;
  type: SessionType;
  configuration: SessionConfig;
  scheduledTime?: Date;
}

export interface SessionFilters {
  patientId?: string;
  therapistId?: string;
  type?: SessionType;
  status?: SessionStatus;
  dateRange?: [Date, Date];
  performanceRange?: [number, number];
}

export interface SessionService {
  createSession(session: CreateSessionRequest): Promise<Session>;
  updateSession(id: string, updates: Partial<Session>): Promise<Session>;
  getSessionHistory(patientId: string, filters?: SessionFilters): Promise<Session[]>;
  getSessionDetails(sessionId: string): Promise<SessionDetails>;
  updateSessionNotes(sessionId: string, notes: string): Promise<void>;
  startSession(sessionId: string): Promise<void>;
  endSession(sessionId: string, metrics: PerformanceMetrics): Promise<void>;
}