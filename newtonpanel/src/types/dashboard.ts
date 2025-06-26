import type React from "react"
// Dashboard için genel tip tanımlamaları

export interface Patient {
  id: number
  name: string
  age: number
  diagnosis: string
  arm: "Sağ" | "Sol"
  romLimit: number
  lastSession: string
  totalSessions: number
  avgScore: number
  improvement: string
  status: "active" | "paused" | "completed"
}

export interface SessionData {
  id: number
  patientId: number
  level: number
  taskType: TaskType
  difficulty: DifficultyLevel
  duration: number
  apples: Apple[]
  baskets: Basket[]
  createdAt: string
  status: "draft" | "active" | "completed"
}

export interface Apple {
  id: number
  type: "fresh" | "rotten"
  position: Position3D
  realDistance: number
}

export interface Basket {
  id: number
  type: "fresh" | "rotten"
  position: Position3D
}

export interface Position3D {
  x: number
  y: number
  z: number
}

export type TaskType = "touch" | "grab-hold" | "grab-drop" | "drag" | "sort"

export type DifficultyLevel = "easy" | "medium" | "hard"

export interface PerformanceMetrics {
  patient: string
  sessions: number
  avgTouchTime: number
  avgGrabTime: number
  avgCarryTime: number
  avgDropTime: number
  successRate: number
  improvement: string
}

export interface WeeklyProgress {
  week: string
  sessions: number
  avgScore: number
}

export interface MenuItem {
  title: string
  icon: React.ComponentType<any>
  id: string
}

export interface DifficultyConfig {
  name: string
  distance: number
  color: string
}

export interface DashboardPatient {
  id: number
  name: string
  romLimit: number
}

export interface DashboardApple {
  id: number
  type: "fresh" | "rotten"
  position: { x: number; y: number; z: number }
  realDistance: number
}

export interface DashboardBasket {
  id: number
  type: "fresh" | "rotten"
  position: { x: number; y: number; z: number }
}

export interface DashboardTaskType {
  id: string
  name: string
  description: string
}
