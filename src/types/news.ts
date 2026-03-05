export interface NewsLocation {
  readonly country: string
  readonly countryCode: string
  readonly lat: number
  readonly lng: number
  readonly city?: string
}

export type EventCategory = 'AI' | 'IT' | 'WAR' | 'STOCK' | 'CRYPTO' | 'POLITICS' | 'SCIENCE' | 'STARTUP' | 'CYBER' | 'CLIMATE'

export type NewsSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface NewsArticle {
  readonly id: string
  readonly title: string
  readonly summary: string
  readonly source: string
  readonly url: string
  readonly category: EventCategory
  readonly severity: NewsSeverity
  readonly publishedAt: string
  readonly saved: boolean
  readonly location: NewsLocation
  readonly videoUrl?: string
  readonly tags: readonly string[]
}

export interface FinancialTicker {
  readonly symbol: string
  readonly name: string
  readonly price: number
  readonly change: number
  readonly changePercent: number
}

export interface PredictionMarket {
  readonly id: string
  readonly question: string
  readonly probability: number
  readonly category: EventCategory
  readonly volume: number
}

export interface AgentAnalysis {
  readonly id: string
  readonly articleId: string
  readonly summary: string
  readonly sentiment: 'positive' | 'negative' | 'neutral'
  readonly impact: NewsSeverity
  readonly keywords: readonly string[]
  readonly analyzedAt: string
}

export interface NewsDashboardData {
  readonly articles: readonly NewsArticle[]
  readonly savedArticles: readonly NewsArticle[]
  readonly lastUpdated: string
}

export const EVENT_CATEGORIES: readonly EventCategory[] = [
  'AI', 'IT', 'WAR', 'STOCK', 'CRYPTO', 'POLITICS', 'SCIENCE', 'STARTUP', 'CYBER', 'CLIMATE',
]

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  AI: '#00ff88',
  IT: '#3b82f6',
  WAR: '#ef4444',
  STOCK: '#f59e0b',
  CRYPTO: '#8b5cf6',
  POLITICS: '#ec4899',
  SCIENCE: '#06b6d4',
  STARTUP: '#10b981',
  CYBER: '#ff6b35',
  CLIMATE: '#22d3ee',
}

export const SEVERITY_COLORS: Record<NewsSeverity, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#6b7280',
}

export const CATEGORY_ICONS: Record<EventCategory, string> = {
  AI: '\u2B23',
  IT: '\u25C6',
  WAR: '\u26A0',
  STOCK: '\u25B2',
  CRYPTO: '\u25C8',
  POLITICS: '\u2691',
  SCIENCE: '\u269B',
  STARTUP: '\u2B50',
  CYBER: '\u26A1',
  CLIMATE: '\u2600',
}
