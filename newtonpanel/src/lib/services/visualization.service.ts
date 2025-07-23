import { 
  ChartConfig, 
  HeatMapConfig, 
  TimeSeriesData, 
  HeatMapData, 
  ProgressData, 
  ComparisonData, 
  PerformanceMetrics,
  VisualizationService, 
  TooltipContext
} from '@/types/visualization';

class VisualizationServiceImpl implements VisualizationService {
  generateTimeSeriesChart(data: TimeSeriesData[]): ChartConfig {
    return {
      type: 'line',
      data: {
        labels: data[0]?.timestamps.map(ts => ts.toLocaleDateString()) || [],
        datasets: data.map(series => ({
          label: series.label,
          data: series.values,
          backgroundColor: series.color || '#3b82f6',
          borderColor: series.color || '#3b82f6',
          borderWidth: 2,
          fill: false,
          tension: 0.4
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 750,
          easing: 'easeInOutQuad'
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: {
            type: 'category',
            display: true,
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            type: 'linear',
            display: true,
            title: {
              display: true,
              text: 'Value'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            enabled: true,
            mode: 'index'
          }
        }
      }
    };
  }

  generateHeatMap(data: HeatMapData): HeatMapConfig {
    return {
      type: 'heatmap',
      data: {
        labels: data.x,
        datasets: [{
          label: 'Heat Map',
          data: data.values.flat().map((value, index) => ({
            x: index % data.x.length,
            y: Math.floor(index / data.x.length),
            v: value
          })),
          backgroundColor: '#3b82f6'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
            position: 'top'
          },
          tooltip: {
            enabled: true,
            mode: 'point',
            callbacks: {
              title: (context: TooltipContext[]) => `${data.x[context[0].parsed.x]} - ${data.y[context[0].parsed.y]}`,
              label: (context: TooltipContext) => `Value: ${context.parsed.v}`
            }
          }
        }
      },
      colorScale: data.colorScale || { min: 0, max: 100, colors: ['#3b82f6', '#ef4444'] },
      cellSize: 20,
      margin: { top: 20, right: 20, bottom: 20, left: 20 }
    };
  }

  generateProgressChart(data: ProgressData): ChartConfig {
    return {
      type: 'line',
      data: {
        labels: data.history.map(point => point.date.toLocaleDateString()),
        datasets: [
          {
            label: 'Progress',
            data: data.history.map(point => point.value),
            backgroundColor: '#10b981',
            borderColor: '#10b981',
            borderWidth: 3,
            fill: false,
            tension: 0.4
          },
          {
            label: 'Target',
            data: Array(data.history.length).fill(data.target),
            backgroundColor: '#ef4444',
            borderColor: '#ef4444',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            display: true,
            beginAtZero: true,
            max: Math.max(data.target * 1.2, Math.max(...data.history.map(p => p.value)) * 1.1)
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    };
  }

  generateComparisonChart(data: ComparisonData[]): ChartConfig {
    return {
      type: 'bar',
      data: {
        labels: data.map(item => item.label),
        datasets: [{
          label: 'Comparison',
          data: data.map(item => item.values[0] || 0),
          backgroundColor: data.map(item => item.color || '#3b82f6'),
          borderColor: data.map(item => item.color || '#3b82f6'),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
            position: 'top'
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            beginAtZero: true
          }
        }
      }
    };
  }

  generatePerformanceRadar(data: PerformanceMetrics): ChartConfig {
    const categories = Object.keys(data.categories);
    const values = Object.values(data.categories);

    return {
      type: 'radar',
      data: {
        labels: categories,
        datasets: [{
          label: 'Performance',
          data: values,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3b82f6',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            type: 'linear',
            display: true,
            beginAtZero: true,
            max: 100
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    };
  }

  async exportChart(chartId: string, format: 'png' | 'svg' | 'pdf'): Promise<Blob> {
    try {
      const canvas = document.getElementById(chartId) as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('Chart not found');
      }

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to export chart'));
          }
        }, `image/${format === 'pdf' ? 'png' : format}`);
      });
    } catch (error) {
      console.error('Error exporting chart:', error);
      throw new Error('Failed to export chart');
    }
  }

  // Utility method for color interpolation, can be used for gradient effects
  private interpolateColor(color1: string, color2: string, factor: number): string {
    // Simple color interpolation
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);
    
    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export const visualizationService = new VisualizationServiceImpl();