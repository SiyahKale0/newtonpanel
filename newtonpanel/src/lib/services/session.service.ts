import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Session, 
  SessionDetails,
  CreateSessionRequest, 
  SessionFilters, 
  SessionService,
  PerformanceMetrics,
  SessionStatus
} from '@/types/session';

class SessionServiceImpl implements SessionService {
  private readonly collection = 'sessions';

  async createSession(sessionData: CreateSessionRequest): Promise<Session> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, this.collection), {
        ...sessionData,
        therapistId: '', // Will be set by auth context
        startTime: sessionData.scheduledTime || now,
        endTime: null,
        performanceMetrics: {
          accuracy: 0,
          responseTime: 0,
          successRate: 0,
          completionRate: 0,
          improvementTrend: { direction: 'stable', percentage: 0, period: 'current' },
          detailedMetrics: {}
        },
        notes: '',
        status: 'scheduled' as SessionStatus,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      });

      const session: Session = {
        id: docRef.id,
        therapistId: '',
        ...sessionData,
        startTime: sessionData.scheduledTime || now,
        endTime: new Date(), // Placeholder
        performanceMetrics: {
          accuracy: 0,
          responseTime: 0,
          successRate: 0,
          completionRate: 0,
          improvementTrend: { direction: 'stable', percentage: 0, period: 'current' },
          detailedMetrics: {}
        },
        notes: '',
        status: 'scheduled',
        createdAt: now,
        updatedAt: now
      };

      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session> {
    try {
      const docRef = doc(db, this.collection, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      await updateDoc(docRef, updateData);
      
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('Session not found after update');
      }

      const data = updatedDoc.data();
      return {
        id: updatedDoc.id,
        ...data,
        startTime: data.startTime.toDate(),
        endTime: data.endTime?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Session;
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update session');
    }
  }

  async getSessionHistory(patientId: string, filters?: SessionFilters): Promise<Session[]> {
    try {
      let q = query(
        collection(db, this.collection),
        where('patientId', '==', patientId),
        orderBy('startTime', 'desc')
      );

      if (filters?.therapistId) {
        q = query(q, where('therapistId', '==', filters.therapistId));
      }

      if (filters?.type) {
        q = query(q, where('type', '==', filters.type));
      }

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      const querySnapshot = await getDocs(q);
      const sessions: Session[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          ...data,
          startTime: data.startTime.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Session);
      });

      return this.applyClientSideFilters(sessions, filters);
    } catch (error) {
      console.error('Error getting session history:', error);
      throw new Error('Failed to get session history');
    }
  }

  async getSessionDetails(sessionId: string): Promise<SessionDetails> {
    try {
      const session = await this.getSessionById(sessionId);
      
      // In a real implementation, you would fetch exercise results and timeline events
      const sessionDetails: SessionDetails = {
        ...session,
        exerciseResults: [],
        timelineEvents: []
      };

      return sessionDetails;
    } catch (error) {
      console.error('Error getting session details:', error);
      throw new Error('Failed to get session details');
    }
  }

  async updateSessionNotes(sessionId: string, notes: string): Promise<void> {
    try {
      const docRef = doc(db, this.collection, sessionId);
      await updateDoc(docRef, {
        notes,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating session notes:', error);
      throw new Error('Failed to update session notes');
    }
  }

  async startSession(sessionId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collection, sessionId);
      await updateDoc(docRef, {
        status: 'in_progress',
        startTime: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error starting session:', error);
      throw new Error('Failed to start session');
    }
  }

  async endSession(sessionId: string, metrics: PerformanceMetrics): Promise<void> {
    try {
      const docRef = doc(db, this.collection, sessionId);
      await updateDoc(docRef, {
        status: 'completed',
        endTime: Timestamp.fromDate(new Date()),
        performanceMetrics: metrics,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error ending session:', error);
      throw new Error('Failed to end session');
    }
  }

  private async getSessionById(id: string): Promise<Session> {
    const docRef = doc(db, this.collection, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Session not found');
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      startTime: data.startTime.toDate(),
      endTime: data.endTime?.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as Session;
  }

  private applyClientSideFilters(sessions: Session[], filters?: SessionFilters): Session[] {
    if (!filters) return sessions;

    let filtered = sessions;

    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter(session => 
        session.startTime >= startDate && session.startTime <= endDate
      );
    }

    if (filters.performanceRange) {
      const [minPerf, maxPerf] = filters.performanceRange;
      filtered = filtered.filter(session => 
        session.performanceMetrics.accuracy >= minPerf && 
        session.performanceMetrics.accuracy <= maxPerf
      );
    }

    return filtered;
  }
}

export const sessionService = new SessionServiceImpl();