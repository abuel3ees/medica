// Shared chat history utilities — localStorage-backed

export interface ChatHistoryMessage {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatHistoryMessage[]
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "medica_chat_history"
const MAX_SESSIONS = 30

function load(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)))
}

/** Get all sessions, newest first */
export function getSessions(): ChatSession[] {
  return load().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

/** Get a single session by id */
export function getSession(id: string): ChatSession | undefined {
  return load().find((s) => s.id === id)
}

/** Create a new session and return it */
export function createSession(): ChatSession {
  const session: ChatSession = {
    id: `chat-${Date.now()}`,
    title: "New Chat",
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const sessions = load()
  sessions.unshift(session)
  save(sessions)
  return session
}

/** Add a message to a session. Auto-titles from first user message. */
export function addMessage(sessionId: string, msg: ChatHistoryMessage) {
  const sessions = load()
  const session = sessions.find((s) => s.id === sessionId)
  if (!session) return

  session.messages.push(msg)
  session.updatedAt = new Date().toISOString()

  // Auto-title from first user message
  if (session.title === "New Chat" && msg.role === "user") {
    session.title = msg.content.length > 50 ? msg.content.slice(0, 50) + "…" : msg.content
  }

  save(sessions)
}

/** Delete a session */
export function deleteSession(id: string) {
  const sessions = load().filter((s) => s.id !== id)
  save(sessions)
}

/** Rename a session */
export function renameSession(id: string, title: string) {
  const sessions = load()
  const session = sessions.find((s) => s.id === id)
  if (session) {
    session.title = title
    save(sessions)
  }
}

/** Group sessions by relative date */
export function groupSessionsByDate(sessions: ChatSession[]): { label: string; sessions: ChatSession[] }[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)

  const groups: Record<string, ChatSession[]> = {}

  for (const s of sessions) {
    const d = new Date(s.updatedAt)
    let label: string
    if (d >= today) label = "Today"
    else if (d >= yesterday) label = "Yesterday"
    else if (d >= weekAgo) label = "This Week"
    else label = "Older"

    if (!groups[label]) groups[label] = []
    groups[label].push(s)
  }

  const order = ["Today", "Yesterday", "This Week", "Older"]
  return order.filter((l) => groups[l]?.length).map((l) => ({ label: l, sessions: groups[l] }))
}
