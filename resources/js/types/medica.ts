// -----------------------------------------------------------
// Medical rep visit tracking types
// -----------------------------------------------------------

// Objectives
export type Objective = {
  id: number
  name: string
  category: string | null
  importance: 'high' | 'standard' | 'low'
  weight: number
}

export type VisitObjectiveInput = {
  objective_id: number
  outcome: 'met' | 'partially_met' | 'not_met'
}

export type VisitObjective = {
  name: string
  outcome: 'met' | 'partially_met' | 'not_met'
  score: number
}

// Objection Tags
export type ObjectionTag = {
  id: number
  name: string
}

// Doctor profile (list view)
export type DoctorSummary = {
  id: number
  name: string
  specialty: string | null
  institution: string | null
  location: string | null
  segment: 'A' | 'B' | 'C'
  stance: 'supportive' | 'neutral' | 'resistant'
  access_difficulty: 'easy' | 'moderate' | 'hard'
  visits_count?: number
  trend?: string
}

// Doctor profile (detail view)
export type DoctorDetail = DoctorSummary & {
  avg_score: number
  visit_history: VisitHistoryItem[]
  trend_data: TrendDataPoint[]
  open_loops: OpenLoop[]
}

export type VisitHistoryItem = {
  id: number
  date: string
  rep: string
  type: string
  objectives_summary: string
  score: number
  time_spent: string | null
}

export type TrendDataPoint = {
  label: string
  score: number
}

export type OpenLoop = {
  id: number
  description: string
  type: string | null
  due_date: string | null
  visit_date: string | null
  is_overdue: boolean
}

// Doctor context for visit form
export type DoctorContext = {
  difficulty: string
  stance: string
  segment: string
  last_visit: string | null
  visit_count: number
  avg_score: number
  trend: string
  open_loops: number
}

// Visit
export type VisitType = 'in_person' | 'call' | 'event' | 'follow_up'

export type NextStepInput = {
  description: string
  type: string | null
  due_date: string | null
}

export type NextStepItem = {
  description: string
  due_date: string | null
  is_completed: boolean
}

export type RecentVisit = {
  doctor: string
  specialty: string
  rep: string
  outcome: 'Positive' | 'Negative' | 'Neutral'
  time: string
  score: number | null
}

// Dashboard
export type StatItem = {
  label: string
  value: string
  change: string
  up: boolean
}

export type RepScore = {
  name: string
  score: number
  visits: number
  change: number
  trend: 'up' | 'down' | 'flat'
}

export type EfficiencyTrendPoint = {
  month: string
  avg: number
  top: number
}

export type VisitTrendPoint = {
  month: string
  visits: number
  outcomes: number
}

export type HeatmapDay = {
  day: string
  count: number
  level: number
}

export type TopDoctor = {
  name: string
  specialty: string
  visits: number
}

export type CoachingInsight = {
  type: 'warning' | 'info' | 'action' | 'success'
  title: string
  message: string
}

export type OutcomeSlice = {
  name: string
  value: number
  color: string
}

export type DailyVisitBar = {
  date: string
  day: string
  visits: number
}

export type GoalProgress = {
  weeklyVisits: number
  weeklyTarget: number
  avgScore: number
  uniqueDoctors: number
  doctorTarget: number
  positiveOutcomes: number
  positiveTarget: number
}

// Page props
export type DashboardPageProps = {
  stats: StatItem[]
  repScores: RepScore[]
  recentVisits: RecentVisit[]
  efficiencyTrend: EfficiencyTrendPoint[]
  visitTrend: VisitTrendPoint[]
  heatmapData: HeatmapDay[]
  topDoctors: TopDoctor[]
  coachingInsights: CoachingInsight[]
  outcomeDistribution: OutcomeSlice[]
  dailyVisits: DailyVisitBar[]
  goalProgress: GoalProgress
}

export type VisitCreatePageProps = {
  doctors: DoctorSummary[]
  objectives: Objective[]
  objectionTags: ObjectionTag[]
  doctorContext: DoctorContext | null
}

export type DoctorsPageProps = {
  doctors: DoctorSummary[]
  selectedDoctor: DoctorDetail | null
}

export type VisitFormData = {
  doctor_profile_id: number | null
  visit_type: VisitType
  visit_date: string
  objectives: VisitObjectiveInput[]
  engagement_quality: 'low' | 'medium' | 'high' | null
  access_difficulty: 'easy' | 'moderate' | 'hard' | null
  time_spent_minutes: number | null
  confidence: number | null
  stance_before: 'supportive' | 'neutral' | 'resistant' | null
  stance_after: 'supportive' | 'neutral' | 'resistant' | null
  notes: string
  objection_tag_ids: number[]
  next_step: NextStepInput | null
}
