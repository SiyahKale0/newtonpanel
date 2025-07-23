# Tasarım Belgesi

## Genel Bakış

Terapist portalı, React/Next.js tabanlı modern bir web uygulaması olarak geliştirilecektir. Portal, Firebase backend altyapısı kullanarak hasta yönetimi, seans takibi, performans analizi ve kişiselleştirme özelliklerini sunacaktır. Material-UI tasarım sistemi ve responsive design ilkeleri kullanılarak kullanıcı dostu bir arayüz oluşturulacaktır.

## Mimari

### Frontend Mimarisi
- **Framework**: Next.js 15.3.4 (App Router)
- **UI Kütüphanesi**: Radix UI + Tailwind CSS (mevcut stack ile uyumlu)
- **State Management**: React Context API + useReducer
- **Veri Görselleştirme**: Chart.js, React-Chartjs-2, Recharts, D3.js
- **Kimlik Doğrulama**: Firebase Auth ile OAuth 2.0
- **Styling**: Tailwind CSS v4
- **Form Management**: React Hook Form + Yup validation
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend Mimarisi
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Cloud Functions**: Firebase Functions (Node.js)
- **File Storage**: Firebase Storage
- **Real-time Updates**: Firestore Real-time Listeners

### Güvenlik Mimarisi
- **Kimlik Doğrulama**: OAuth 2.0 + JWT
- **Yetkilendirme**: Role-based Access Control (RBAC)
- **Veri Şifreleme**: HTTPS + Firestore Security Rules
- **Session Management**: Secure HTTP-only cookies

## Bileşenler ve Arayüzler

### Ana Bileşenler

#### 1. Authentication Module
```typescript
interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResult>
  logout(): Promise<void>
  refreshToken(): Promise<string>
  getCurrentUser(): User | null
}

interface User {
  id: string
  email: string
  role: 'admin' | 'therapist'
  permissions: Permission[]
  profile: UserProfile
}

interface LoginCredentials {
  email: string
  password: string
}

interface AuthResult {
  user: User
  token: string
  refreshToken: string
}

interface Permission {
  resource: string
  actions: string[]
}

interface UserProfile {
  firstName: string
  lastName: string
  specialization?: string
  licenseNumber?: string
  avatar?: string
}
```

#### 2. Patient Management Module
```typescript
interface PatientService {
  createPatient(patient: CreatePatientRequest): Promise<Patient>
  updatePatient(id: string, updates: UpdatePatientRequest): Promise<Patient>
  deletePatient(id: string): Promise<void>
  getPatients(filters?: PatientFilters): Promise<Patient[]>
  getPatientById(id: string): Promise<Patient>
}

interface Patient {
  id: string
  personalInfo: PersonalInfo
  medicalHistory: MedicalRecord[]
  sessions: Session[]
  customParameters: CustomParameter[]
  createdAt: Date
  updatedAt: Date
}

interface PersonalInfo {
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: string
  contactInfo: ContactInfo
}

interface ContactInfo {
  email?: string
  phone?: string
  address?: string
}

interface MedicalRecord {
  id: string
  date: Date
  diagnosis: string
  medications: string[]
  allergies: string[]
  notes: string
}

interface CustomParameter {
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'object'
  description?: string
}

interface CreatePatientRequest {
  personalInfo: PersonalInfo
  medicalInfo?: Partial<MedicalRecord>
  customParameters?: CustomParameter[]
}

interface UpdatePatientRequest {
  personalInfo?: Partial<PersonalInfo>
  medicalInfo?: Partial<MedicalRecord>
  customParameters?: CustomParameter[]
}

interface PatientFilters {
  search?: string
  ageRange?: [number, number]
  diagnosis?: string
  therapistId?: string
  dateRange?: [Date, Date]
}
```

#### 3. Session Management Module
```typescript
interface SessionService {
  createSession(session: CreateSessionRequest): Promise<Session>
  getSessionHistory(patientId: string, filters?: SessionFilters): Promise<Session[]>
  getSessionDetails(sessionId: string): Promise<SessionDetails>
  updateSessionNotes(sessionId: string, notes: string): Promise<void>
}

interface Session {
  id: string
  patientId: string
  type: SessionType
  startTime: Date
  endTime: Date
  performanceMetrics: PerformanceMetrics
  notes: string
  customConfig: SessionConfig
}

interface SessionType {
  id: string
  name: string
  description: string
  category: 'appleGame' | 'fingerDance' | 'custom'
}

interface SessionConfig {
  difficulty: number
  duration: number
  exerciseTypes: string[]
  customSettings: Record<string, any>
}

interface CreateSessionRequest {
  patientId: string
  type: SessionType
  customConfig: SessionConfig
  notes?: string
}

interface SessionFilters {
  dateRange?: [Date, Date]
  sessionType?: string
  performanceRange?: [number, number]
}

interface SessionDetails extends Session {
  results: SessionResult[]
  analytics: SessionAnalytics
}

interface SessionResult {
  metric: string
  value: number
  timestamp: Date
}

interface SessionAnalytics {
  accuracy: number
  responseTime: number
  completionRate: number
  improvementFromPrevious: number
}
```

#### 4. Analytics Module
```typescript
interface AnalyticsService {
  getPerformanceMetrics(patientId: string, timeRange: TimeRange): Promise<PerformanceData>
  generateProgressReport(patientId: string): Promise<ProgressReport>
  getComparativeAnalysis(patientIds: string[], metric: MetricType): Promise<ComparisonData>
}

interface PerformanceMetrics {
  accuracy: number
  responseTime: number
  successRate: number
  improvementTrend: TrendData
}

interface TrendData {
  direction: 'up' | 'down' | 'stable'
  percentage: number
  period: string
}

interface TimeRange {
  startDate: Date
  endDate: Date
}

interface PerformanceData {
  metrics: PerformanceMetrics
  trends: TrendData[]
  comparisons: ComparisonData[]
}

interface ProgressReport {
  patientId: string
  generatedAt: Date
  summary: PerformanceMetrics
  recommendations: string[]
  charts: ChartConfig[]
}

interface ComparisonData {
  metric: string
  current: number
  previous: number
  change: number
  changeType: 'improvement' | 'decline' | 'stable'
}

interface MetricType {
  name: string
  unit: string
  description: string
}
```

#### 5. Visualization Module
```typescript
interface VisualizationService {
  generateTimeSeriesChart(data: TimeSeriesData): ChartConfig
  generateHeatMap(data: HeatMapData): HeatMapConfig
  generateProgressChart(data: ProgressData): ChartConfig
}

interface ChartConfig {
  type: 'line' | 'bar' | 'heatmap' | 'scatter'
  data: any
  options: ChartOptions
  plugins: ChartPlugin[]
}

interface ChartOptions {
  responsive: boolean
  maintainAspectRatio: boolean
  scales?: any
  plugins?: any
  interaction?: any
}

interface ChartPlugin {
  id: string
  beforeInit?: (chart: any) => void
  afterUpdate?: (chart: any) => void
}

interface TimeSeriesData {
  labels: string[]
  datasets: TimeSeriesDataset[]
}

interface TimeSeriesDataset {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
  tension?: number
}

interface HeatMapData {
  x: string[]
  y: string[]
  values: number[][]
  colorScale: string[]
}

interface HeatMapConfig extends ChartConfig {
  colorScale: {
    min: number
    max: number
    colors: string[]
  }
  legend: {
    show: boolean
    position: 'top' | 'bottom' | 'left' | 'right'
  }
}

interface ProgressData {
  timeline: string[]
  metrics: ProgressMetric[]
}

interface ProgressMetric {
  name: string
  values: number[]
  target?: number
  unit: string
}
```

### UI Bileşen Yapısı

#### Layout Components
- `AppLayout`: Ana sayfa düzeni
- `Sidebar`: Navigasyon menüsü
- `Header`: Üst bar ve kullanıcı menüsü
- `Breadcrumb`: Sayfa yolu göstergesi

#### Feature Components
- `PatientList`: Hasta listesi tablosu
- `PatientForm`: Hasta ekleme/düzenleme formu
- `SessionHistory`: Seans geçmişi listesi
- `PerformanceChart`: Performans grafikleri
- `HeatMapVisualization`: Isı haritası görselleştirmesi
- `CustomConfigPanel`: Özel konfigürasyon paneli

## Veri Modelleri

### Firestore Koleksiyonları

#### Users Collection
```typescript
interface UserDocument {
  id: string
  email: string
  role: 'admin' | 'therapist'
  profile: {
    firstName: string
    lastName: string
    specialization?: string
    licenseNumber?: string
  }
  permissions: string[]
  createdAt: Timestamp
  lastLogin: Timestamp
}
```

#### Patients Collection
```typescript
interface PatientDocument {
  id: string
  therapistId: string
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: Date
    gender: string
    contactInfo: ContactInfo
  }
  medicalInfo: {
    diagnosis: string
    medications: string[]
    allergies: string[]
    notes: string
  }
  customParameters: {
    [key: string]: any
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### Sessions Collection
```typescript
interface SessionDocument {
  id: string
  patientId: string
  therapistId: string
  sessionType: string
  startTime: Timestamp
  endTime: Timestamp
  metrics: {
    accuracy: number
    responseTime: number
    successRate: number
    completionRate: number
  }
  configuration: {
    difficulty: number
    duration: number
    exerciseTypes: string[]
    customSettings: any
  }
  notes: string
  createdAt: Timestamp
}
```

## Hata Yönetimi

### Error Handling Strategy
1. **Global Error Boundary**: React Error Boundary ile beklenmeyen hataları yakala
2. **API Error Handling**: Axios interceptors ile HTTP hatalarını yönet
3. **Form Validation**: Yup schema validation ile form hatalarını önle
4. **Firebase Error Handling**: Firebase specific error codes için özel mesajlar

### Error Types
```typescript
enum ErrorType {
  AUTHENTICATION_ERROR = 'AUTH_ERROR',
  AUTHORIZATION_ERROR = 'AUTHZ_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

interface AppError {
  type: ErrorType
  message: string
  code?: string
  details?: any
  timestamp: Date
}
```

### Error Recovery
- **Retry Mechanism**: Network hatalarında otomatik yeniden deneme
- **Offline Support**: Service Worker ile offline çalışma desteği
- **Graceful Degradation**: Kritik olmayan özelliklerin devre dışı kalması
- **User Feedback**: Kullanıcıya anlaşılır hata mesajları

## Test Stratejisi

### Unit Testing
- **Framework**: Jest + React Testing Library
- **Coverage**: %90+ kod kapsamı hedefi
- **Components**: Tüm UI bileşenleri için unit testler
- **Services**: Business logic ve API servisleri için testler
- **Utilities**: Helper fonksiyonlar için testler

### Integration Testing
- **API Integration**: Firebase servisleri ile entegrasyon testleri
- **Component Integration**: Bileşenler arası etkileşim testleri
- **Authentication Flow**: Giriş/çıkış süreçleri için testler

### End-to-End Testing
- **Framework**: Cypress
- **User Journeys**: Kritik kullanıcı senaryoları
- **Cross-browser**: Chrome, Firefox, Safari testleri
- **Mobile Responsive**: Mobil cihaz testleri

### Performance Testing
- **Load Testing**: Yük altında performans testleri
- **Bundle Analysis**: JavaScript bundle boyut analizi
- **Lighthouse**: Web vitals ve performans metrikleri
- **API Response Time**: Backend yanıt süresi testleri

### Security Testing
- **Authentication Testing**: Kimlik doğrulama güvenlik testleri
- **Authorization Testing**: Yetkilendirme kontrol testleri
- **Input Validation**: XSS ve injection saldırı testleri
- **Penetration Testing**: Güvenlik açığı taraması

### Usability Testing
- **User Experience**: Terapistlerle kullanılabilirlik testleri
- **Accessibility**: WCAG 2.1 AA uyumluluk testleri
- **Mobile UX**: Mobil kullanıcı deneyimi testleri
- **Performance UX**: Sayfa yükleme ve etkileşim testleri

## Performans Optimizasyonları

### Frontend Optimizasyonları
- **Code Splitting**: Route-based ve component-based lazy loading
- **Image Optimization**: Next.js Image component ile otomatik optimizasyon
- **Caching**: React Query ile akıllı veri önbellekleme
- **Bundle Optimization**: Tree shaking ve minification

### Backend Optimizasyonları
- **Firestore Indexing**: Query performansı için uygun indeksler
- **Caching Strategy**: Redis ile API response caching
- **Connection Pooling**: Database bağlantı havuzu yönetimi
- **CDN**: Static asset'ler için CDN kullanımı

### Monitoring ve Analytics
- **Performance Monitoring**: Web vitals ve kullanıcı deneyimi metrikleri
- **Error Tracking**: Sentry ile hata izleme
- **Usage Analytics**: Google Analytics ile kullanım analizi
- **Real-time Monitoring**: Firebase Performance Monitoring