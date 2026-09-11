// The event catalogue is the single source of truth for public event metadata.
// Future dates remain internal/provisional until the owner approves the calendar.
export const PROFESSIONAL_STANDARD_SERIES = [
  {
    id: '01', cluster: 'FOUNDATION',
    title: 'Why Being Good at Your Job Is No Longer Enough',
    description: 'The opening Valoria conversation on professional worth, visibility, influence and the capabilities that increasingly determine whether good work becomes recognised opportunity.',
    start: '2026-07-18T10:00:00+01:00', end: '2026-07-18T11:30:00+01:00', replay: true, dateApproved: true,
  },
  {
    id: '02', cluster: 'INTELLIGENCE',
    title: 'Strategic Thinking: You Are Solving the Wrong Problems',
    description: 'A focused conversation on the difference between solving problems and selecting the problems worth solving — and why strategic trade-offs are a discipline, not a compromise.',
    start: '2026-09-26T10:00:00+01:00', end: '2026-09-26T11:30:00+01:00', dateApproved: false,
  },
  {
    id: '03', cluster: 'MASTERY',
    title: 'Execution Without Burnout: Why High Performers Plateau',
    description: 'A practical examination of the gap between being busy and creating impact, including the indispensability trap and how high performers can build a more sustainable operating model.',
    start: '2026-10-17T10:00:00+01:00', end: '2026-10-17T11:30:00+01:00', dateApproved: false,
  },
  {
    id: '04', cluster: 'RELATIONSHIPS',
    title: 'Emotional Intelligence Is Not About Being Nice',
    description: 'Treat emotional intelligence as a precision instrument for perception, regulation and strategic application.',
    start: '2026-11-14T10:00:00+01:00', end: '2026-11-14T11:30:00+01:00', dateApproved: false,
  },
  {
    id: '05', cluster: 'ENTERPRISE',
    title: 'Influence Without Authority: The Real Currency of Organisational Power',
    description: 'Understand authority versus influence and build a 90-day stakeholder influence map.',
    start: '2026-12-05T10:00:00+01:00', end: '2026-12-05T11:30:00+01:00', dateApproved: false,
  },
]

export function getSessionState(session, now = Date.now()) {
  if (!session.dateApproved) return 'coming-soon'
  const start = new Date(session.start).getTime()
  const end = new Date(session.end).getTime()
  const index = PROFESSIONAL_STANDARD_SERIES.findIndex((item) => item.id === session.id)
  const previous = index > 0 ? PROFESSIONAL_STANDARD_SERIES[index - 1] : null
  const previousEnd = previous ? new Date(previous.end).getTime() : 0
  if (now < previousEnd) return 'locked'
  if (now < start) return 'registration-open'
  if (now < end) return 'live'
  return 'ended'
}

export function getCountdownTarget(session, now = Date.now()) {
  const state = getSessionState(session, now)
  if (state === 'coming-soon') return null
  if (state === 'locked') {
    const index = PROFESSIONAL_STANDARD_SERIES.findIndex((item) => item.id === session.id)
    const previous = PROFESSIONAL_STANDARD_SERIES[index - 1]
    return new Date(previous.end).getTime()
  }
  if (state === 'registration-open') return new Date(session.start).getTime()
  if (state === 'live') return new Date(session.end).getTime()
  return null
}

export function formatSessionDate(session) {
  if (!session.dateApproved) return 'DATE TO BE CONFIRMED'
  return new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', month: 'long', day: '2-digit', year: 'numeric' }).format(new Date(session.start))
}
