export interface ChartConfig {
  type: ChartType;
  data: ChartData;
  options: ChartOptions;
  plugins?: ChartPlugin[];
}

export type ChartType = 
  | 'line'
  | 'bar'
  | 'scatter'
  | 'heatmap'
  | 'radar'
  | 'pie'
  | 'doughnut'
  | 'area';

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[] | Point[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  borderDash?: number[];
  fill?: boolean;
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
}

export interface Point {
  x: number;
  y: number;
  label?: string;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  animation?: AnimationConfig;
  interaction?: InteractionConfig;
  scales?: ScalesConfig;
  plugins?: PluginConfig;
  layout?: LayoutConfig;
}

export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad';
  delay?: number;
}

export interface InteractionConfig {
  mode: 'point' | 'nearest' | 'index' | 'dataset';
  intersect: boolean;
}

export interface ScalesConfig {
  x?: AxisConfig;
  y?: AxisConfig;
  r?: AxisConfig;
}

export interface AxisConfig {
  type: 'linear' | 'logarithmic' | 'category' | 'time';
  display: boolean;
  title?: {
    display: boolean;
    text: string;
  };
  min?: number;
  max?: number;
  beginAtZero?: boolean;
  ticks?: TickConfig;
}

export interface TickConfig {
  stepSize?: number;
  callback?: (value: number | string, index: number, values: (number | string)[]) => string;
}

export interface PluginConfig {
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  title?: TitleConfig;
}

export interface LegendConfig {
  display: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface TooltipConfig {
  enabled: boolean;
  mode: 'point' | 'nearest' | 'index';
  callbacks?: {
    title?: (context: TooltipContext[]) => string;
    label?: (context: TooltipContext) => string;
  };
}

export interface TooltipContext {
  parsed: {
    x: number;
    y: number;
    v?: number;
  };
  dataIndex: number;
  datasetIndex: number;
}

export interface TitleConfig {
  display: boolean;
  text: string;
  position: 'top' | 'bottom';
}

export interface LayoutConfig {
  padding: number | {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ChartPlugin {
  id: string;
  beforeInit?: (chart: any) => void;
  afterInit?: (chart: any) => void;
  beforeUpdate?: (chart: any) => void;
  afterUpdate?: (chart: any) => void;
  beforeDraw?: (chart: any) => void;
  afterDraw?: (chart: any) => void;
}

export interface TimeSeriesData {
  timestamps: Date[];
  values: number[];
  label: string;
  color?: string;
}

export interface HeatMapData {
  x: string[];
  y: string[];
  values: number[][];
  colorScale?: ColorScale;
}

export interface ColorScale {
  min: number;
  max: number;
  colors: string[];
}

export interface ProgressData {
  current: number;
  target: number;
  history: HistoryPoint[];
  milestones: Milestone[];
}

export interface HistoryPoint {
  date: Date;
  value: number;
  note?: string;
}

export interface HeatMapConfig extends ChartConfig {
  colorScale: ColorScale;
  cellSize: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface VisualizationTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  gridColor: string;
  accentColors: string[];
}

export interface ChartExportOptions {
  width: number;
  height: number;
  backgroundColor?: string;
  quality?: number;
  filename?: string;
}

export interface InteractiveFeatures {
  zoom: boolean;
  pan: boolean;
  hover: boolean;
  click: boolean;
  brush: boolean;
  crossfilter: boolean;
}

export interface VisualizationConfig {
  theme: VisualizationTheme;
  interactive: InteractiveFeatures;
  responsive: boolean;
  animations: boolean;
  exportOptions: ChartExportOptions;
}

export interface ChartDataPoint {
  x: number | string | Date;
  y: number;
  label?: string;
  color?: string;
  metadata?: Record<string, any>;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  type?: ChartType;
  color?: string;
  visible?: boolean;
}

export interface ChartAxis {
  title: string;
  type: 'linear' | 'logarithmic' | 'category' | 'time';
  min?: number;
  max?: number;
  format?: string;
  gridLines?: boolean;
}

export interface ChartLegend {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
}

export interface ChartTooltip {
  enabled: boolean;
  format?: string;
  shared?: boolean;
  followCursor?: boolean;
}

export interface AdvancedChartConfig {
  series: ChartSeries[];
  xAxis: ChartAxis;
  yAxis: ChartAxis;
  legend: ChartLegend;
  tooltip: ChartTooltip;
  theme: VisualizationTheme;
  responsive: boolean;
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
}

export interface Milestone {
  id: string;
  name: string;
  targetValue: number;
  achievedDate?: Date;
  description?: string;
  color?: string;
}

export interface ComparisonData {
  label: string;
  values: number[];
  color?: string;
  metadata?: {
    patientId?: string;
    timeRange?: string;
    sessionType?: string;
  };
}

export interface PerformanceMetrics {
  accuracy: number;
  responseTime: number;
  successRate: number;
  completionRate: number;
  improvementTrend: number;
  categories: {
    [category: string]: number;
  };
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface VisualizationService {
  generateTimeSeriesChart(data: TimeSeriesData[]): ChartConfig;
  generateHeatMap(data: HeatMapData): HeatMapConfig;
  generateProgressChart(data: ProgressData): ChartConfig;
  generateComparisonChart(data: ComparisonData[]): ChartConfig;
  generatePerformanceRadar(data: PerformanceMetrics): ChartConfig;
  exportChart(chartId: string, format: 'png' | 'svg' | 'pdf'): Promise<Blob>;
}

// Export the PerformanceMetrics interface for use in analytics
export interface AnalyticsPerformanceMetrics {
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