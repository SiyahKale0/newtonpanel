/**
 * Statistics Components
 * 
 * This module provides components for displaying various game statistics,
 * particularly for the Apple Game (Elma Oyunu) therapy sessions.
 */

export { 
  AppleStatisticsChart, 
  type AppleStatisticsChartProps,
  type AppleSessionStats,
  type ApplePositionData,
  sampleAppleSessionStats
} from './AppleStatisticsChart';

/**
 * Utility function to parse position_log.json data
 * 
 * @example
 * ```typescript
 * import { parsePositionLogData } from '@/components/statistics';
 * 
 * const rawData = await fetch('/api/position-logs/session_123.json').then(r => r.json());
 * const sessionStats = parsePositionLogData(rawData);
 * ```
 */
export function parsePositionLogData(positionLogData: unknown[]): import('./AppleStatisticsChart').ApplePositionData[] {
  return positionLogData.map((entry: unknown) => {
    const item = entry as Record<string, unknown>;
    const position = item.position as Record<string, unknown> | undefined;
    
    return {
      timestamp: (item.timestamp as number) || Date.now(),
      appleId: (item.appleId as number) || (item.id as number) || 0,
      position: {
        x: (position?.x as number) || (item.x as number) || 0,
        y: (position?.y as number) || (item.y as number) || 0,
        z: (position?.z as number) || (item.z as number) || 0,
      },
      status: (item.status as 'spawned' | 'grabbed' | 'dropped' | 'collected') || 'spawned',
      type: (item.type as 'fresh' | 'rotten') || 'fresh',
    };
  });
}

/**
 * Utility function to calculate session statistics from position data
 */
export function calculateSessionStats(
  sessionId: string,
  patientId: string,
  date: string,
  positionData: import('./AppleStatisticsChart').ApplePositionData[]
): import('./AppleStatisticsChart').AppleSessionStats {
  const totalApples = positionData.length;
  const collectedApples = positionData.filter(apple => apple.status === 'collected');
  const applesCollected = collectedApples.length;
  const successRate = totalApples > 0 ? (applesCollected / totalApples) * 100 : 0;
  
  // Calculate average time (simplified - would need actual timing data)
  const averageTime = collectedApples.length > 0 ? 
    collectedApples.reduce((sum, apple, index, arr) => {
      if (index === 0) return sum;
      return sum + (apple.timestamp - arr[index - 1].timestamp) / 1000;
    }, 0) / collectedApples.length : 0;

  return {
    sessionId,
    patientId,
    date,
    totalApples,
    applesCollected,
    successRate: Math.round(successRate * 10) / 10,
    averageTime: Math.round(averageTime * 10) / 10,
    positionData,
  };
}