import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  PerformanceData,
  TimeRange,
  ProgressReport,
  ComparisonData,
  PerformanceMetrics,
  TrendAnalysis,
  MetricType,
  Recommendation,
  Goal,
  AnalyticsService
} from '@/types/analytics';

class AnalyticsServiceImpl implements AnalyticsService {
  async getPerformanceMetrics(patientId: string, timeRange: TimeRange): Promise<PerformanceData> {
    try {
      // Get sessions within time range
      const sessionsQuery = query(
        collection(db, 'sessions'),
        where('patientId', '==', patientId),
        where('startTime', '>=', Timestamp.fromDate(timeRange.startDate)),
        where('startTime', '<=', Timestamp.fromDate(timeRange.endDate)),
        orderBy('startTime', 'desc')
      );

      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime?.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      }));

      // Calculate metrics from sessions
      const metrics = this.calculateMetricsFromSessions(sessions);
      const trends = await this.calculateTrendAnalysis(patientId, timeRange);
      const comparisons = await this.getComparisonData(patientId, timeRange);

      return {
        patientId,
        timeRange,
        metrics,
        trends,
        comparisons
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw new Error('Failed to get performance metrics');
    }
  }

  async generateProgressReport(patientId: string): Promise<ProgressReport> {
    try {
      const timeRange: TimeRange = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        endDate: new Date(),
        granularity: 'day'
      };

      const performanceData = await this.getPerformanceMetrics(patientId, timeRange);
      const recommendations = await this.getRecommendations(patientId);
      const goals = await this.getPatientGoals(patientId);

      return {
        patientId,
        generatedAt: new Date(),
        period: timeRange,
        summary: {
          overallProgress: this.calculateOverallProgress(performanceData.metrics),
          keyAchievements: [],
          areasForImprovement: [],
          nextMilestones: []
        },
        detailedMetrics: {
          sessionCount: performanceData.metrics.totalSessions || 0,
          totalDuration: performanceData.metrics.totalGameTime || 0,
          averageSessionDuration: performanceData.metrics.averageSessionDuration || 0,
          performanceByExercise: [],
          performanceByDay: [],
          streaks: {
            currentStreak: 0,
            longestStreak: 0,
            streakType: 'daily_sessions',
            lastStreakDate: new Date()
          }
        },
        recommendations,
        goals
      };
    } catch (error) {
      console.error('Error generating progress report:', error);
      throw new Error('Failed to generate progress report');
    }
  }

  async getComparativeAnalysis(patientIds: string[], metric: MetricType): Promise<ComparisonData[]> {
    try {
      const comparisons: ComparisonData[] = [];
      
      for (const patientId of patientIds) {
        const timeRange: TimeRange = {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          granularity: 'day'
        };

        const performanceData = await this.getPerformanceMetrics(patientId, timeRange);
        const currentValue = this.extractMetricValue(performanceData.metrics, metric);
        
        // Get previous period for comparison
        const previousTimeRange: TimeRange = {
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          granularity: 'day'
        };

        const previousPerformanceData = await this.getPerformanceMetrics(patientId, previousTimeRange);
        const previousValue = this.extractMetricValue(previousPerformanceData.metrics, metric);

        comparisons.push({
          metric,
          currentPeriod: {
            value: currentValue,
            label: 'Current Period',
            period: 'Last 30 days',
            sampleSize: performanceData.metrics.totalSessions || 0
          },
          previousPeriod: {
            value: previousValue,
            label: 'Previous Period',
            period: 'Previous 30 days',
            sampleSize: previousPerformanceData.metrics.totalSessions || 0
          }
        });
      }

      return comparisons;
    } catch (error) {
      console.error('Error getting comparative analysis:', error);
      throw new Error('Failed to get comparative analysis');
    }
  }

  async getTrendAnalysis(patientId: string, metric: MetricType, timeRange: TimeRange): Promise<TrendAnalysis> {
    try {
      // This is a simplified implementation
      // In a real scenario, you would calculate trends based on historical data
      return {
        accuracy: { current: 85, previous: 80, change: 5, changePercentage: 6.25, direction: 'up', significance: 'moderate' },
        responseTime: { current: 1200, previous: 1300, change: -100, changePercentage: -7.69, direction: 'up', significance: 'moderate' },
        successRate: { current: 78, previous: 75, change: 3, changePercentage: 4, direction: 'up', significance: 'minimal' },
        overall: { current: 81, previous: 78, change: 3, changePercentage: 3.85, direction: 'up', significance: 'moderate' }
      };
    } catch (error) {
      console.error('Error getting trend analysis:', error);
      throw new Error('Failed to get trend analysis');
    }
  }

  async getRecommendations(patientId: string): Promise<Recommendation[]> {
    try {
      // This would typically be generated based on AI/ML analysis
      return [
        {
          id: '1',
          type: 'exercise',
          priority: 'high',
          title: 'Focus on Fine Motor Skills',
          description: 'Increase practice time for finger dexterity exercises',
          rationale: 'Recent sessions show decreased accuracy in fine motor tasks',
          expectedOutcome: 'Improved finger coordination and response time',
          implementationSteps: [
            'Add 10 minutes of finger exercises daily',
            'Use progressive difficulty levels',
            'Monitor weekly progress'
          ],
          createdAt: new Date()
        }
      ];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw new Error('Failed to get recommendations');
    }
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
    try {
      const docRef = doc(db, 'goals', goalId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      });

      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('Goal not found after update');
      }

      const data = updatedDoc.data();
      return {
        id: updatedDoc.id,
        ...data,
        deadline: data.deadline.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Goal;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw new Error('Failed to update goal');
    }
  }

  private calculateMetricsFromSessions(sessions: any[]): any {
    // This would contain the actual calculation logic
    // For now, returning a placeholder
    return {
      totalSessions: sessions.length,
      totalGameTime: sessions.reduce((total, session) => {
        if (session.endTime && session.startTime) {
          return total + (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
        }
        return total;
      }, 0),
      averageSessionDuration: sessions.length > 0 ? 
        sessions.reduce((total, session) => {
          if (session.endTime && session.startTime) {
            return total + (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
          }
          return total;
        }, 0) / sessions.length : 0,
      averageResponseTime: sessions.reduce((total, session) => 
        total + (session.performanceMetrics?.responseTime || 0), 0) / sessions.length || 0,
      averageScore: sessions.reduce((total, session) => 
        total + (session.performanceMetrics?.accuracy || 0), 0) / sessions.length || 0,
      bestScore: Math.max(...sessions.map(session => session.performanceMetrics?.accuracy || 0)),
      improvementTrend: 0, // Would be calculated based on trend analysis
      sessionConsistency: 85 // Placeholder
    };
  }

  private async calculateTrendAnalysis(patientId: string, timeRange: TimeRange): Promise<TrendAnalysis> {
    // Simplified implementation
    return {
      accuracy: { current: 85, previous: 80, change: 5, changePercentage: 6.25, direction: 'up', significance: 'moderate' },
      responseTime: { current: 1200, previous: 1300, change: -100, changePercentage: -7.69, direction: 'up', significance: 'moderate' },
      successRate: { current: 78, previous: 75, change: 3, changePercentage: 4, direction: 'up', significance: 'minimal' },
      overall: { current: 81, previous: 78, change: 3, changePercentage: 3.85, direction: 'up', significance: 'moderate' }
    };
  }

  private async getComparisonData(patientId: string, timeRange: TimeRange): Promise<ComparisonData[]> {
    // Simplified implementation
    return [];
  }

  private async getPatientGoals(patientId: string): Promise<Goal[]> {
    try {
      const goalsQuery = query(
        collection(db, 'goals'),
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      );

      const goalsSnapshot = await getDocs(goalsQuery);
      return goalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Goal[];
    } catch (error) {
      console.error('Error getting patient goals:', error);
      return [];
    }
  }

  private calculateOverallProgress(metrics: PerformanceMetrics): number {
    // Simplified calculation
    return Math.round((metrics.averageScore + metrics.sessionConsistency) / 2);
  }

  private extractMetricValue(metrics: PerformanceMetrics, metric: MetricType): number {
    switch (metric) {
      case 'accuracy':
        return metrics.averageScore || 0;
      case 'response_time':
        return metrics.averageResponseTime || 0;
      case 'success_rate':
        return metrics.averageScore || 0;
      case 'completion_rate':
        return metrics.sessionConsistency || 0;
      case 'engagement_score':
        return metrics.sessionConsistency || 0;
      case 'improvement_rate':
        return metrics.improvementTrend || 0;
      default:
        return 0;
    }
  }
}

export const analyticsService = new AnalyticsServiceImpl();