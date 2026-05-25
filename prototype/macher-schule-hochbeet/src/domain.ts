export const STORAGE_KEY = "rlg-macher-schule-hochbeet-state-v10-react"
export const BUNDLE_STORAGE_KEY = window.SIMULATION_BUNDLE_STORAGE_KEY || "rlg-macher-schule-hochbeet-bundle-v1"
export const ACTIVE_RUN_STATUSES = ["open", "accepted", "in-progress", "completed", "confirmed"]
export const MAIN_TABS = [
  { id: "quests", label: "Quests" },
  { id: "map", label: "Karte" },
  { id: "calendar", label: "Kalender" }
]
export const WEEKDAY_OPTIONS = [
  { value: 1, label: "Mo" },
  { value: 2, label: "Di" },
  { value: 3, label: "Mi" },
  { value: 4, label: "Do" },
  { value: 5, label: "Fr" },
  { value: 6, label: "Sa" },
  { value: 7, label: "So" }
]

export const scenario = window.SCENARIO
export const PRIMARY_WORLD_METRIC_KEY = scenario.campaign?.worldState?.primaryMetricKey ||
  Object.keys(scenario.worldStateMetrics || {})[0] ||
  "raisedBedsBuilt"
export const WORLD_TARGET = scenario.worldStateMetrics?.[PRIMARY_WORLD_METRIC_KEY]?.target || 5

export type Model = Record<string, any>

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

export function timestampValue(value: any) {
  if (!value) return null
  if (typeof value === "number") return value
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function timestampFromId(id: string) {
  const match = String(id || "").match(/(\d{13})/)
  return match ? Number(match[1]) : null
}

export function eventCreatedAt(item: any) {
  return timestampValue(item.createdAt) || timestampFromId(item.id) || Date.now()
}

export function participantStatusForRun(status: string) {
  if (status === "confirmed") return "confirmed"
  if (status === "completed") return "completed"
  if (status === "open") return "open"
  return "active"
}

export function normalizeParticipants(run: any) {
  if (!Array.isArray(run.participants)) return []

  return run.participants
    .map((participant: any) => {
      if (typeof participant === "string") {
        return { personId: participant, status: participantStatusForRun(run.status) }
      }

      return {
        personId: participant.personId,
        status: participant.status || participantStatusForRun(run.status)
      }
    })
    .filter((participant: any) => typeof participant.personId === "string" && participant.personId)
}

export function normalizeRuns(runs: any[]) {
  return runs.map((run, index) => {
    const createdAt = timestampValue(run.createdAt) ||
      timestampFromId(run.id) ||
      Date.now() - ((runs.length - index) * 60 * 1000)
    const completedAt = timestampValue(run.completedAt)
    const confirmedAt = timestampValue(run.confirmedAt)

    return {
      ...run,
      participants: normalizeParticipants(run),
      createdAt,
      ...(completedAt ? { completedAt } : {}),
      ...(confirmedAt ? { confirmedAt } : {})
    }
  })
}

export function normalizeTimeline(items: any[]) {
  return items.map((item, index) => {
    if (typeof item === "string") {
      return {
        id: `event:legacy-${index}`,
        text: item,
        scopes: ["global"],
        public: false,
        adventureRunId: null,
        questRunId: null,
        personId: null,
        createdAt: Date.now() - ((items.length - index) * 60 * 1000)
      }
    }

    return {
      id: item.id || `event:${index}`,
      text: item.text || "",
      scopes: Array.isArray(item.scopes) ? item.scopes : ["global"],
      public: Boolean(item.public),
      adventureRunId: item.adventureRunId || null,
      questRunId: item.questRunId || null,
      personId: item.personId || null,
      createdAt: eventCreatedAt(item)
    }
  })
}

export function normalizeState(value: any) {
  const fallback = clone(scenario.initialState)
  const selectedTab = MAIN_TABS.some((tab) => tab.id === value.selectedTab)
    ? value.selectedTab
    : fallback.selectedTab || "quests"
  const selectedView = value.selectedView === "profile"
    ? "profile"
    : value.selectedView === "adventure" || value.selectedView === "step"
    ? "adventure"
    : value.selectedView === "standalone"
      ? "standalone"
      : "overview"
  const timelineSource = Array.isArray(value.timeline) && value.timeline.length
    ? value.timeline
    : fallback.timeline

  return {
    ...fallback,
    ...value,
    adventureRuns: Array.isArray(value.adventureRuns)
      ? value.adventureRuns
      : value.adventureRun
        ? [value.adventureRun]
        : [],
    runs: normalizeRuns(Array.isArray(value.runs) ? value.runs : []),
    evidence: Array.isArray(value.evidence) ? value.evidence : [],
    confirmations: Array.isArray(value.confirmations) ? value.confirmations : [],
    recurrenceRules: {
      ...(fallback.recurrenceRules || {}),
      ...(value.recurrenceRules || {})
    },
    timeline: normalizeTimeline(timelineSource),
    selectedTab,
    selectedView,
    selectedStepId: typeof value.selectedStepId === "string" ? value.selectedStepId : null,
    selectedAdventureId: typeof value.selectedAdventureId === "string" ? value.selectedAdventureId : null,
    selectedStandaloneQuestKey: typeof value.selectedStandaloneQuestKey === "string" ? value.selectedStandaloneQuestKey : null,
    selectedAdventureRunId: typeof value.selectedAdventureRunId === "string" ? value.selectedAdventureRunId : null,
    selectedRole: scenario.roles[value.selectedRole] ? value.selectedRole : fallback.selectedRole
  }
}

export function loadState() {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return normalizeState(clone(scenario.initialState))

  try {
    return normalizeState(JSON.parse(stored))
  } catch {
    return normalizeState(clone(scenario.initialState))
  }
}

export function saveState(state: Model) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function currentSimulationBundle() {
  try {
    const stored = window.localStorage.getItem(BUNDLE_STORAGE_KEY)
    return stored ? JSON.parse(stored) : window.SIMULATION_BUNDLE
  } catch {
    return window.SIMULATION_BUNDLE
  }
}

export function personName(personId: string) {
  return scenario.people[personId] || personId
}

export function isStudent(roleId: string) {
  return scenario.students.includes(roleId)
}

export function canConfirm(roleId: string) {
  return scenario.confirmers?.includes(roleId) ||
    scenario.roles[roleId]?.capabilities?.includes("confirmation.create")
}

export function statusLabelKey(status: string) {
  return {
    suggested: "open",
    open: "open",
    active: "active",
    accepted: "active",
    "in-progress": "active",
    completed: "completed",
    confirmed: "confirmed",
    blocked: "blocked",
    abandoned: "blocked"
  }[status] || status
}

export function actionLabel(key: string, fallback: string) {
  return scenario.gamePack?.language?.actionLabels?.[key] || fallback
}

export function visualStatus(status: string) {
  return {
    suggested: "open",
    open: "open",
    active: "active",
    accepted: "active",
    "in-progress": "active",
    completed: "completed",
    confirmed: "confirmed",
    blocked: "blocked",
    abandoned: "blocked"
  }[status] || "open"
}

export function statusLabel(status: string, context = "task") {
  const labelKey = statusLabelKey(status)
  const labels = scenario.gamePack?.language?.statusLabels || {}
  const contextKey = context === "adventure" ? "adventureRun" : "questRun"
  const gamePackLabel = labels[contextKey]?.[labelKey] || labels.default?.[labelKey]
  if (gamePackLabel) return gamePackLabel

  return {
    suggested: "offen",
    open: "offen",
    active: "aktiv",
    accepted: "aktiv",
    "in-progress": "aktiv",
    completed: "fertig",
    confirmed: "bestätigt",
    blocked: "blockiert",
    abandoned: "abgebrochen"
  }[status] || status
}

export function isHistoryStatus(status: string) {
  return ["completed", "confirmed"].includes(status)
}

export function slug(value: string) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function dateKey(value: any) {
  const date = value instanceof Date ? value : new Date(value)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

export function todayKey() {
  return dateKey(new Date())
}

export function localDateFromKey(value: string) {
  const [year, month, day] = String(value || "").split("-").map(Number)
  if (!year || !month || !day) return null

  return new Date(year, month - 1, day, 23, 59, 59, 999)
}

export function localDateStartFromKey(value: string) {
  const [year, month, day] = String(value || "").split("-").map(Number)
  if (!year || !month || !day) return null

  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

export function weekdayNumber(date: Date) {
  return date.getDay() || 7
}

export function weekdayLabel(weekday: number) {
  return WEEKDAY_OPTIONS.find((item) => item.value === weekday)?.label || String(weekday)
}

export function weekdayRangeLabel(weekdays: number[]) {
  if (!weekdays?.length) return "kein Wochentag"
  if (weekdays.join(",") === "1,2,3,4,5") return "Mo-Fr"
  if (weekdays.join(",") === "1,2,3,4,5,6,7") return "täglich"
  return weekdays.map(weekdayLabel).join(", ")
}

export function formatDateOnly(value: string) {
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return "offen"

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(timestamp))
}

export function relativeTime(value: any) {
  const timestamp = timestampValue(value)
  if (!timestamp) return ""

  const diff = Math.max(0, Date.now() - timestamp)
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return "gerade eben"
  if (diff < 2 * minute) return "vor 1 min"
  if (diff < hour) return `vor ${Math.floor(diff / minute)} min`
  if (diff < 2 * hour) return "vor 1 h"
  if (diff < day) return `vor ${Math.floor(diff / hour)} h`
  if (diff < 2 * day) return "gestern"
  return `vor ${Math.floor(diff / day)} d`
}

export function scheduleTimestamp(schedule: any) {
  if (schedule?.date && !schedule?.startsAt) {
    return localDateStartFromKey(schedule.date)?.getTime() || 0
  }

  const value = schedule?.startsAt || schedule?.date
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : 0
}

export function formatScheduleDate(schedule: any) {
  const timestamp = scheduleTimestamp(schedule)
  if (!timestamp) return "ohne Datum"

  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(timestamp))
}

export function formatScheduleTime(schedule: any) {
  if (schedule?.date && !schedule?.startsAt) return "ganztägig"

  const start = scheduleTimestamp(schedule)
  if (!start) return "zeitlich offen"

  const timeFormatter = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit"
  })
  const startText = timeFormatter.format(new Date(start))
  const end = Date.parse(schedule?.endsAt)
  if (!Number.isFinite(end)) return startText

  return `${startText}-${timeFormatter.format(new Date(end))}`
}

export function formatScheduleLabel(schedule: any) {
  if (!schedule) return "jederzeit"

  const date = formatScheduleDate(schedule)
  if (schedule.date && !schedule.startsAt) return date

  return `${date} · ${formatScheduleTime(schedule)}`
}

export function scheduleDateKey(schedule: any) {
  const timestamp = scheduleTimestamp(schedule)
  if (!timestamp) return "unscheduled"

  return dateKey(new Date(timestamp))
}

export function getQuest(questKey: string) {
  return scenario.quests[questKey]
}

export function standaloneQuestEntries() {
  return Object.entries(scenario.standaloneQuestOffers || {})
    .sort(([, a]: any, [, b]: any) => (a.order || 0) - (b.order || 0))
}

export function adventureEntries() {
  const ids = scenario.campaign?.adventureIds || [scenario.campaign?.primaryAdventureId || scenario.adventure?.id]
  return ids
    .map((adventureId: string) => [adventureId, getAdventure(adventureId)])
    .filter(([, adventure]: any) => Boolean(adventure))
}

export function getAdventure(adventureId: string) {
  return scenario.adventures?.[adventureId] || (scenario.adventure?.id === adventureId ? scenario.adventure : null)
}

export function stepEntries(adventureId = scenario.adventure?.id) {
  return Object.entries(scenario.adventureQuestRelations || {})
    .filter(([, item]: any) => !adventureId || item.from === adventureId)
    .sort(([, a]: any, [, b]: any) => (a.meta.order || 0) - (b.meta.order || 0))
}

export function allStepEntries() {
  return Object.entries(scenario.adventureQuestRelations || {})
    .sort(([, a]: any, [, b]: any) => {
      const adventureOrder = adventureEntries().findIndex(([adventureId]) => adventureId === a.from) -
        adventureEntries().findIndex(([adventureId]) => adventureId === b.from)
      return adventureOrder || (a.meta.order || 0) - (b.meta.order || 0)
    })
}

export function getStep(stepId: string) {
  return scenario.adventureQuestRelations[stepId] ||
    Object.values(scenario.adventureQuestRelations).find((step: any) => step.id === stepId)
}

export function getQuestForStep(step: any) {
  return getQuest(step.questKey)
}

export function getStandaloneOffer(questKey: string) {
  return scenario.standaloneQuestOffers?.[questKey]
}

export function getLocation(locationId: string) {
  return scenario.locations?.[locationId] || null
}

export function stepLocation(step: any) {
  const adventure = getAdventure(step?.from) || scenario.adventure
  return getLocation(step?.meta?.locationId || adventure?.locationId || scenario.campaign?.locationId)
}

export function standaloneLocation(questKey: string) {
  const offer = getStandaloneOffer(questKey)
  const quest = getQuest(questKey)
  if (offer?.locationScope === "anywhere" || quest?.locationScope === "anywhere") return null
  return getLocation(offer?.locationId || quest?.locationId || scenario.campaign?.locationId)
}

export function stepSchedule(step: any) {
  const adventure = getAdventure(step?.from) || scenario.adventure
  return step?.meta?.schedule || adventure?.schedule || null
}

export function adventureRunsForAdventure(model: Model, adventureId: string) {
  return adventureRuns(model).filter((run: any) => (run.adventureId || scenario.adventure?.id) === adventureId)
}

export function adventureLocation(adventureId: string) {
  const adventure = getAdventure(adventureId)
  return getLocation(adventure?.locationId || scenario.campaign?.locationId)
}

export function adventureSchedule(adventureId: string) {
  const adventure = getAdventure(adventureId)
  return adventure?.schedule || stepEntries(adventureId).map(([, step]: any) => stepSchedule(step)).find(Boolean) || null
}

export function adventurePlaceTimeLabel(adventureId: string) {
  const location = adventureLocation(adventureId)
  const schedule = adventureSchedule(adventureId)
  return [
    location?.label || "ortsunabhängig",
    formatScheduleLabel(schedule)
  ].join(" · ")
}

export function standaloneSchedule(questKey: string) {
  const offer = getStandaloneOffer(questKey)
  const quest = getQuest(questKey)
  return offer?.schedule || quest?.schedule || null
}

export function recurrenceRuleForQuest(model: Model, questKey: string) {
  const offer = getStandaloneOffer(questKey)
  const schedule = standaloneSchedule(questKey)
  const scheduleStart = schedule?.startsAt || schedule?.date || null
  const scheduleWeekday = scheduleStart ? weekdayNumber(new Date(scheduleTimestamp(schedule))) : 1
  const fallbackWeekdays = offer?.runPolicy?.cadence === "school-daily"
    ? [1, 2, 3, 4, 5]
    : [scheduleWeekday]
  const baseRule = {
    frequency: "weekly",
    weekdays: fallbackWeekdays,
    until: null,
    previewLimit: 10,
    ...(offer?.recurrenceRule || {})
  }
  const override = model.recurrenceRules?.[questKey] || {}
  const weekdays = Array.isArray(override.weekdays)
    ? override.weekdays
    : baseRule.weekdays

  return {
    ...baseRule,
    ...override,
    weekdays: weekdays
      .map(Number)
      .filter((weekday: number) => weekday >= 1 && weekday <= 7)
      .sort((a: number, b: number) => a - b)
  }
}

export function recurrenceSummary(model: Model, questKey: string) {
  const rule = recurrenceRuleForQuest(model, questKey)
  const until = rule.until ? ` bis ${formatDateOnly(rule.until)}` : ""
  return `Jede Woche ${weekdayRangeLabel(rule.weekdays)}${until}`
}

export function runParticipantIds(run: any) {
  if (!run) return []

  if (Array.isArray(run.participants) && run.participants.length) {
    return run.participants
      .map((participant: any) => participant.personId)
      .filter(Boolean)
  }

  return []
}

export function runHasParticipant(run: any, personId: string) {
  return runParticipantIds(run).includes(personId)
}

export function addRunParticipant(run: any, personId: string) {
  if (!run || !personId || runHasParticipant(run, personId)) return

  const participants = Array.isArray(run.participants) ? run.participants : []
  participants.push({ personId, status: "active" })
  run.participants = participants
}

export function markRunParticipants(run: any, status: string) {
  if (!Array.isArray(run.participants)) return

  run.participants = run.participants.map((participant: any) => ({
    ...participant,
    status
  }))
}

export function adventureRuns(model: Model) {
  return model.adventureRuns || []
}

export function adventureRun(model: Model, runId = model.selectedAdventureRunId) {
  return adventureRuns(model).find((run: any) => run.id === runId) || null
}

export function getRun(model: Model, runId: string) {
  return model.runs.find((run: any) => run.id === runId)
}

export function runSchedule(run: any) {
  if (!run) return null
  if (run.startsAt || run.endsAt || run.date) return run

  const step = run.adventureStepRelationId ? getStep(run.adventureStepRelationId) : null
  return stepSchedule(step)
}

export function runStartTimestamp(run: any) {
  const schedule = runSchedule(run)
  return scheduleTimestamp(schedule)
}

export function runEndTimestamp(run: any) {
  const schedule = runSchedule(run)
  const explicitEnd = timestampValue(schedule?.endsAt)
  if (explicitEnd) return explicitEnd
  if (schedule?.date && !schedule?.startsAt) {
    return localDateFromKey(schedule.date)?.getTime() || null
  }

  return null
}

export function runWindowStarted(run: any) {
  const start = runStartTimestamp(run)
  return !start || start <= Date.now()
}

export function runCanStillBeAccepted(run: any) {
  const end = runEndTimestamp(run)
  if (end) return end >= Date.now()

  const start = runStartTimestamp(run)
  return !start || start >= Date.now()
}

export function runStartHint(run: any) {
  const schedule = runSchedule(run)
  if (!runStartTimestamp(run)) return ""

  return `Ab ${formatScheduleLabel(schedule)} möglich.`
}

export function isActiveRun(run: any) {
  return ACTIVE_RUN_STATUSES.includes(run.status)
}

export function runsForStep(model: Model, stepId: string, runId = model.selectedAdventureRunId) {
  if (!runId) return []

  return model.runs.filter((run: any) => (
    run.adventureRunId === runId &&
    run.adventureStepRelationId === stepId &&
    isActiveRun(run)
  ))
}

export function runsForAdventureRun(model: Model, runId: string) {
  return model.runs.filter((run: any) => run.adventureRunId === runId && isActiveRun(run))
}

export function findRunInAdventureRun(model: Model, actorId: string, stepId: string, runId = model.selectedAdventureRunId) {
  return model.runs.find((run: any) => (
    runHasParticipant(run, actorId) &&
    run.adventureRunId === runId &&
    run.adventureStepRelationId === stepId &&
    isActiveRun(run)
  ))
}

export function findRun(model: Model, actorId: string, stepId: string) {
  return findRunInAdventureRun(model, actorId, stepId)
}

export function participantIdsForAdventureRun(model: Model, run: any) {
  if (!run) return []

  const ids = new Set(run.participantIds || [])
  runsForAdventureRun(model, run.id).forEach((questRun: any) => {
    runParticipantIds(questRun).forEach((personId: string) => ids.add(personId))
  })
  return Array.from(ids)
}

export function participationPolicyForStep(step: any) {
  return {
    minParticipants: step?.meta?.participationPolicy?.minParticipants || 1,
    maxParticipants: step?.meta?.participationPolicy?.maxParticipants || 1
  }
}

export function participationPolicyForStandalone(questKey: string) {
  const offer = getStandaloneOffer(questKey)
  const quest = getQuest(questKey)

  return {
    minParticipants: offer?.participationPolicy?.minParticipants || quest?.participationPolicy?.minParticipants || 1,
    maxParticipants: offer?.participationPolicy?.maxParticipants || quest?.participationPolicy?.maxParticipants || 1
  }
}

export function runHasParticipantSlot(run: any, policy: any) {
  return runParticipantIds(run).length < policy.maxParticipants
}

export function runHasEnoughParticipants(run: any, policy: any) {
  return runParticipantIds(run).length >= policy.minParticipants
}

export function stepCapacity(step: any) {
  return Number.isFinite(step?.meta?.capacity) ? step.meta.capacity : Number.POSITIVE_INFINITY
}

export function capacityReached(model: Model, step: any, runId = model.selectedAdventureRunId) {
  return runsForStep(model, step.id, runId).length >= stepCapacity(step)
}

export function joinableRunForStep(model: Model, actorId: string, step: any, runId = model.selectedAdventureRunId) {
  const policy = participationPolicyForStep(step)

  return runsForStep(model, step.id, runId).find((run: any) => (
    ["open", "accepted", "in-progress"].includes(run.status) &&
    !runHasParticipant(run, actorId) &&
    runHasParticipantSlot(run, policy)
  ))
}

export function stepHasParticipantSlot(model: Model, step: any, runId = model.selectedAdventureRunId) {
  return Boolean(joinableRunForStep(model, "__probe__", step, runId)) || !capacityReached(model, step, runId)
}

export function standalonePeriodKey(offer: any) {
  return offer?.repeatable && offer.cadence === "daily" ? todayKey() : null
}

export function isStandaloneRunForQuest(run: any, questKey: string) {
  return (
    run.questKey === questKey &&
    !run.adventureRunId &&
    !run.adventureStepRelationId &&
    isActiveRun(run)
  )
}

export function isScheduledStandaloneQuest(questKey: string) {
  return getStandaloneOffer(questKey)?.runPolicy?.type === "scheduled"
}

export function allowsMultipleStandaloneRuns(questKey: string) {
  const offer = getStandaloneOffer(questKey)
  return Boolean(offer?.repeatable || isScheduledStandaloneQuest(questKey))
}

export function scheduledRunId(questKey: string, periodKey: string) {
  return `quest-run:${questKey}-${periodKey}`
}

export function materializedStandaloneRunsForQuest(model: Model, questKey: string) {
  return model.runs.filter((run: any) => isStandaloneRunForQuest(run, questKey))
}

export function virtualStandaloneRunsForQuest(model: Model, questKey: string, materializedRuns = materializedStandaloneRunsForQuest(model, questKey)) {
  const quest = getQuest(questKey)
  const offer = getStandaloneOffer(questKey)
  const schedule = standaloneSchedule(questKey)
  if (!quest || offer?.runPolicy?.type !== "scheduled" || !(schedule?.startsAt || schedule?.date)) return []

  const existingIds = new Set(materializedRuns.map((run: any) => run.id))
  const start = new Date(scheduleTimestamp(schedule))
  const endTimestamp = schedule.startsAt ? Date.parse(schedule.endsAt) : NaN
  const duration = Number.isFinite(endTimestamp) ? Math.max(0, endTimestamp - start.getTime()) : null
  const rule = recurrenceRuleForQuest(model, questKey)
  const selectedWeekdays = new Set(rule.weekdays)
  const untilDate = rule.until ? localDateFromKey(rule.until) : null
  const horizonDate = new Date(start)
  horizonDate.setDate(horizonDate.getDate() + 60)
  const endDate = untilDate && untilDate < horizonDate ? untilDate : horizonDate
  const previewLimit = Number.isFinite(rule.previewLimit) ? rule.previewLimit : 10
  const runs = []
  const cursor = new Date(start)

  while (cursor <= endDate && runs.length < previewLimit) {
    if (!selectedWeekdays.has(weekdayNumber(cursor))) {
      cursor.setDate(cursor.getDate() + 1)
      continue
    }

    const occurrenceStart = new Date(cursor)
    const periodKey = dateKey(occurrenceStart)
    const run = {
      id: scheduledRunId(questKey, periodKey),
      questKey,
      questId: quest.id,
      participants: [],
      adventureRunId: null,
      adventureStepRelationId: null,
      periodKey,
      status: "open",
      locationId: offer?.locationId || quest.locationId || null,
      date: schedule.startsAt ? null : periodKey,
      startsAt: schedule.startsAt ? occurrenceStart.toISOString() : null,
      endsAt: duration === null ? null : new Date(occurrenceStart.getTime() + duration).toISOString(),
      virtual: true,
      completion: null
    }

    if (!existingIds.has(run.id) && runCanStillBeAccepted(run)) runs.push(run)
    cursor.setDate(cursor.getDate() + 1)
  }

  return runs
}

export function runsForStandaloneQuest(model: Model, questKey: string) {
  const materializedRuns = materializedStandaloneRunsForQuest(model, questKey)
  return [
    ...materializedRuns,
    ...virtualStandaloneRunsForQuest(model, questKey, materializedRuns)
  ]
}

export function openStandaloneRuns(model: Model, questKey: string) {
  return runsForStandaloneQuest(model, questKey)
    .filter((run: any) => run.status === "open" && runCanStillBeAccepted(run))
}

export function nextOpenStandaloneRun(model: Model, questKey: string) {
  return openStandaloneRuns(model, questKey)
    .filter((run: any) => runHasParticipantSlot(run, participationPolicyForStandalone(questKey)))
    .sort((a: any, b: any) => questRunTimestamp(a) - questRunTimestamp(b))[0] || null
}

export function standaloneRunOption(model: Model, questKey: string, runId: string) {
  return runsForStandaloneQuest(model, questKey).find((run: any) => run.id === runId) || null
}

export function findStandaloneRun(model: Model, actorId: string, questKey: string) {
  return runsForStandaloneQuest(model, questKey).find((run: any) => (
    runHasParticipant(run, actorId) &&
    ["accepted", "in-progress"].includes(run.status)
  ))
}

export function standaloneCapacity(offer: any) {
  return Number.isFinite(offer?.capacity) ? offer.capacity : Number.POSITIVE_INFINITY
}

export function standaloneCapacityReached(model: Model, questKey: string) {
  const offer = getStandaloneOffer(questKey)
  if (openStandaloneRuns(model, questKey).some((run: any) => runHasParticipantSlot(run, participationPolicyForStandalone(questKey)))) {
    return false
  }

  return runsForStandaloneQuest(model, questKey).length >= standaloneCapacity(offer)
}

export function hasConfirmation(model: Model, runId: string) {
  return model.confirmations.some((confirmation: any) => confirmation.subjectId === runId)
}

export function confirmationForRun(model: Model, runId: string) {
  return model.confirmations.find((confirmation: any) => confirmation.subjectId === runId)
}

export function evidenceForRun(model: Model, run: any) {
  return model.evidence.filter((item: any) => item.subjectId === run.id)
}

export function ownRunPhoto(model: Model, actorId: string, runId: string) {
  return model.evidence.find((item: any) => (
    item.createdBy === actorId &&
    item.type === "photo" &&
    item.subjectId === runId
  ))
}

export function ownFramePhoto(model: Model, actorId: string, runId = model.selectedAdventureRunId) {
  return model.evidence.find((item: any) => (
    item.createdBy === actorId &&
    item.type === "photo" &&
    item.subjectId === runId &&
    item.id.includes("frame-photo")
  ))
}

export function developmentFieldsForStep(step: any) {
  if (!step) return []
  const quest = getQuestForStep(step)
  return step?.meta.developmentFields || quest?.developmentFields || []
}

export function developmentFieldsForRun(run: any) {
  const step = getStep(run.adventureStepRelationId)
  if (step) return developmentFieldsForStep(step)
  return getQuest(run.questKey)?.developmentFields || []
}

export function fieldCountsForPerson(model: Model, personId: string) {
  const counts = new Map<string, number>()
  model.runs
    .filter((run: any) => run.status === "confirmed" && runHasParticipant(run, personId))
    .forEach((run: any) => {
      developmentFieldsForRun(run).forEach((field: string) => {
        counts.set(field, (counts.get(field) || 0) + 1)
      })
    })

  return Array.from(counts.entries()).map(([field, count]) => ({ field, count }))
}

export function completedAdventureRunsForPerson(model: Model, personId: string) {
  return adventureRuns(model).filter((run: any) => (
    ["completed", "confirmed"].includes(run.status) &&
    participantIdsForAdventureRun(model, run).includes(personId)
  ))
}

export function badgesForPerson(model: Model, personId: string) {
  const badges = new Map<string, any>()

  model.runs
    .filter((run: any) => run.status === "confirmed" && runHasParticipant(run, personId))
    .forEach((run: any) => {
      const quest = getQuest(run.questKey)
      const confirmation = confirmationForRun(model, run.id)
      const existing = badges.get(run.questKey)
      if (existing) {
        existing.count += 1
        if (confirmation) existing.sourceConfirmations.push(confirmation)
        return
      }

      badges.set(run.questKey, {
        questKey: run.questKey,
        title: quest.title,
        image: quest.image,
        count: 1,
        sourceConfirmations: confirmation ? [confirmation] : []
      })
    })

  completedAdventureRunsForPerson(model, personId).forEach((run: any) => {
    const adventure = getAdventure(run.adventureId) || scenario.adventure
    const key = adventure.id
    const confirmation = confirmationForRun(model, run.id)
    const existing = badges.get(key)
    if (existing) {
      existing.count += 1
      if (confirmation) existing.sourceConfirmations.push(confirmation)
      return
    }

    badges.set(key, {
      questKey: key,
      title: adventure.resultBadgeTitle || adventure.title,
      image: adventure.image,
      count: 1,
      sourceConfirmations: confirmation ? [confirmation] : []
    })
  })

  return Array.from(badges.values())
}

export function stepStatus(model: Model, stepId: string, runId = model.selectedAdventureRunId) {
  const runs = runsForStep(model, stepId, runId)
  if (runs.some((run: any) => run.status === "confirmed")) return "confirmed"
  if (runs.some((run: any) => run.status === "completed")) return "completed"
  if (runs.some((run: any) => run.status === "accepted")) return "accepted"
  return "suggested"
}

export function standaloneQuestStatus(model: Model, questKey: string) {
  const offer = getStandaloneOffer(questKey)
  const runs = runsForStandaloneQuest(model, questKey)
  if (runs.some((run: any) => run.status === "accepted")) return "accepted"
  if (runs.some((run: any) => run.status === "open")) return "suggested"
  if (runs.some((run: any) => run.status === "completed")) return "completed"
  if (offer?.repeatable) return "suggested"
  if (runs.length && runs.every((run: any) => run.status === "confirmed")) return "confirmed"
  return "suggested"
}

export function isStandaloneQuestHistory(model: Model, questKey: string) {
  const offer = getStandaloneOffer(questKey)
  const runs = runsForStandaloneQuest(model, questKey)
  if (offer?.repeatable) return false
  return runs.length > 0 && runs.every((run: any) => run.status === "confirmed")
}

export function standaloneOfferLabel(model: Model, offer: any, questKey = offer?.questKey) {
  if (offer?.runPolicy?.type === "scheduled") return weekdayRangeLabel(recurrenceRuleForQuest(model, questKey).weekdays)
  if (offer?.repeatable && offer.cadence === "daily") return "Täglich"
  if (offer?.repeatable) return "Jederzeit"
  return "Einmalig"
}

export function completionClaim(questKey: string) {
  const quest = getQuest(questKey)
  if (quest?.completionClaim) return quest.completionClaim

  return "Ich habe diese Aufgabe fertig gemacht."
}

export function confirmationClaim(run: any) {
  const actors = runParticipantIds(run).map(personName)
  const actor = actors.length > 1
    ? `${actors.slice(0, -1).join(", ")} und ${actors.at(-1)}`
    : actors[0] || "Jemand"
  const quest = getQuest(run.questKey)
  if (quest?.confirmationClaim) return quest.confirmationClaim.replaceAll("{actor}", actor)

  return `${actor} hat die Aufgabe "${quest.title}" fertig gemacht.`
}

export function dependenciesMet(model: Model, stepId: string, runId = model.selectedAdventureRunId) {
  const step = getStep(stepId)
  const dependencies = step?.meta?.dependsOn || []
  if (!dependencies.length) return true

  return dependencies.every((dependencyId: string) => {
    const dependency = Object.values(scenario.adventureQuestRelations)
      .find((item: any) => item.id === dependencyId || item.questKey === dependencyId)
    if (!dependency) return true

    return runsForStep(model, (dependency as any).id, runId)
      .some((run: any) => ["completed", "confirmed"].includes(run.status))
  })
}

export function dependencyText(model: Model, stepId: string, runId = model.selectedAdventureRunId) {
  const step = getStep(stepId)
  const dependencies = step?.meta?.dependsOn || []
  if (!dependencies.length || dependenciesMet(model, stepId, runId)) return ""

  const dependencyTitles = dependencies
    .map((dependencyId: string) => Object.values(scenario.adventureQuestRelations)
      .find((item: any) => item.id === dependencyId || item.questKey === dependencyId))
    .filter(Boolean)
    .map((item: any) => getQuest(item.questKey).title)

  return `Wartet auf fertige Aufgabe: ${dependencyTitles.join(", ")}.`
}

export function requiredSteps(adventureId = scenario.adventure?.id) {
  return stepEntries(adventureId).filter(([, step]: any) => step.meta.required)
}

export function confirmedRequiredSteps(model: Model, runId: string) {
  const run = adventureRun(model, runId)
  return requiredSteps(run?.adventureId || scenario.adventure?.id).filter(([, step]: any) => (
    runsForStep(model, step.id, runId).some((run: any) => run.status === "confirmed")
  ))
}

export function syncAdventureCompletion(model: Model) {
  adventureRuns(model).forEach((run: any) => {
    const required = requiredSteps(run.adventureId || scenario.adventure?.id)
    if (!required.length) return

    const completed = confirmedRequiredSteps(model, run.id)
    if (completed.length !== required.length) return
    if (["completed", "confirmed"].includes(run.status)) return

    run.status = "completed"
    run.completedAt = Date.now()
    const participantIds = participantIdsForAdventureRun(model, run)
    participantIds.forEach((personId: string) => {
      const confirmationId = `confirmation:adventure:${slug(run.id)}:${personId}`
      if (model.confirmations.some((item: any) => item.id === confirmationId)) return

      model.confirmations.push({
        id: confirmationId,
        subjectId: run.id,
        subjectType: "adventureRun",
        issuerId: "system",
        recipientId: personId,
        claim: `${personName(personId)} war am Adventure "${run.title}" beteiligt.`,
        createdAt: Date.now()
      })
    })

    addEvent(model, `Das Adventure ${run.title} ist abgeschlossen.`, {
      scopes: ["global", "adventure"],
      adventureRunId: run.id,
      public: true
    })
  })

  model.worldState = {
    ...(model.worldState || {}),
    [PRIMARY_WORLD_METRIC_KEY]: adventureRuns(model).filter((run: any) => ["completed", "confirmed"].includes(run.status)).length
  }
}

export function addEvent(model: Model, text: string, options: any = {}) {
  const now = Date.now()
  model.timeline.unshift({
    id: `event:${now}:${model.timeline.length}`,
    text,
    scopes: options.scopes || ["global"],
    public: Boolean(options.public),
    adventureRunId: options.adventureRunId || null,
    questRunId: options.questRunId || null,
    personId: options.personId || null,
    createdAt: now
  })
}

export function nextAdventureRunTitle(model: Model, adventureId = scenario.adventure?.id) {
  const adventure = getAdventure(adventureId) || scenario.adventure
  const prefix = adventure.runTitlePrefix || "Adventure"
  const suffix = String.fromCharCode(65 + adventureRunsForAdventure(model, adventure.id).length)
  return `${prefix} ${suffix}`
}

export function createAdventureRun(model: Model, actorId: string, adventureId = scenario.adventure?.id) {
  const adventure = getAdventure(adventureId) || scenario.adventure
  const title = nextAdventureRunTitle(model, adventure.id)
  const run = {
    id: `adventure-run:${slug(adventure.id)}-${slug(title)}`,
    adventureId: adventure.id,
    title,
    participantIds: isStudent(actorId) ? [actorId] : [],
    status: "active",
    createdAt: Date.now()
  }

  model.adventureRuns.push(run)
  model.selectedAdventureId = adventure.id
  model.selectedAdventureRunId = run.id
  addEvent(model, `${personName(actorId)} hat das Adventure ${title} gestartet.`, {
    scopes: ["global", "adventure"],
    adventureRunId: run.id,
    personId: actorId
  })

  return run
}

export function addParticipantToAdventureRun(run: any, actorId: string) {
  if (!run || !actorId) return
  const participantIds = new Set(run.participantIds || [])
  participantIds.add(actorId)
  run.participantIds = Array.from(participantIds)
}

export function createStandaloneRun(model: Model, actorId: string, questKey: string) {
  const quest = getQuest(questKey)
  const offer = getStandaloneOffer(questKey)
  const periodKey = standalonePeriodKey(offer)
  return {
    id: `quest-run:${questKey}-${periodKey || Date.now()}`,
    questKey,
    questId: quest.id,
    participants: [],
    adventureRunId: null,
    adventureStepRelationId: null,
    periodKey,
    status: "accepted",
    locationId: offer?.locationId || quest.locationId || null,
    date: offer?.schedule?.date || quest.schedule?.date || periodKey || null,
    startsAt: offer?.schedule?.startsAt || quest.schedule?.startsAt || null,
    endsAt: offer?.schedule?.endsAt || quest.schedule?.endsAt || null,
    createdAt: Date.now(),
    completion: null
  }
}

export function materializeStandaloneRun(run: any) {
  const materializedRun = clone(run)
  delete materializedRun.virtual
  return materializedRun
}

export function questRunTimestamp(run: any) {
  return timestampValue(run.confirmedAt) ||
    timestampValue(run.completedAt) ||
    runStartTimestamp(run) ||
    timestampValue(run.createdAt) ||
    0
}

export function runsForPerson(model: Model, personId: string) {
  return model.runs.filter((run: any) => runHasParticipant(run, personId) && isActiveRun(run))
}

export function sortedQuestRunsForPerson(model: Model, personId: string) {
  return runsForPerson(model, personId)
    .filter((run: any) => ["completed", "confirmed"].includes(run.status))
    .sort((a: any, b: any) => questRunTimestamp(b) - questRunTimestamp(a))
}

export function runTitle(run: any) {
  if (run.adventureRunId) {
    const step = getStep(run.adventureStepRelationId)
    return getQuestForStep(step).title
  }
  return getQuest(run.questKey).title
}

export function adventureRunTitle(run: any) {
  return String(run?.title || "Adventure")
    .replace(/-Gruppe\b/g, "")
    .replace(/-Team\b/g, "")
    .replace(/\bGruppe\s+/g, "")
    .replace(/\bTeam\s+/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function runSubtitle(model: Model, run: any) {
  if (run.adventureRunId) return adventureRunTitle(adventureRun(model, run.adventureRunId)) || "Adventure"
  if (run.startsAt || run.date) return formatScheduleLabel(run)
  return "Einzelaufgabe"
}

export function stepPlaceTimeLabel(step: any) {
  const location = stepLocation(step)
  const schedule = stepSchedule(step)
  return [
    location?.label || "ortsunabhängig",
    formatScheduleLabel(schedule)
  ].join(" · ")
}

export function standaloneRunPlaceTimeLabel(run: any, questKey: string) {
  const schedule = run || standaloneSchedule(questKey)
  const location = getLocation(run?.locationId) || standaloneLocation(questKey)
  const time = schedule?.startsAt || schedule?.date ? formatScheduleLabel(schedule) : "jederzeit"

  return [
    location?.label || "ortsunabhängig",
    time
  ].join(" · ")
}

export function activeActionRun(model: Model, personId: string) {
  return runsForPerson(model, personId).filter((run: any) => ["accepted", "in-progress"].includes(run.status))
}

export function scheduleItems(model: Model) {
  const items: any[] = []

  allStepEntries().forEach(([, step]: any) => {
    const schedule = stepSchedule(step)
    const location = stepLocation(step)
    if (!schedule && !location) return
    items.push({
      id: `schedule:step:${step.id}`,
      type: "adventure-step",
      title: getQuestForStep(step).title,
      parentTitle: getAdventure(step.from)?.title || scenario.adventure.title,
      schedule,
      location,
      status: stepStatus(model, step.id),
      action: { kind: "adventure", adventureId: step.from, runId: model.selectedAdventureRunId || null, stepId: step.id }
    })
  })

  standaloneQuestEntries().forEach(([questKey]: any) => {
    runsForStandaloneQuest(model, questKey).forEach((run: any) => {
      const location = getLocation(run.locationId) || standaloneLocation(questKey)
      const schedule = runSchedule(run)
      if (!schedule && !location) return

      items.push({
        id: `schedule:run:${run.id}`,
        type: "standalone-run",
        title: getQuest(questKey).title,
        parentTitle: standaloneOfferLabel(model, getStandaloneOffer(questKey), questKey),
        schedule,
        location,
        status: run.status,
        action: { kind: "standalone", questKey, runId: run.id }
      })
    })
  })

  return items.sort((a, b) => scheduleTimestamp(a.schedule) - scheduleTimestamp(b.schedule))
}

export function groupItemsByLocation(items: any[]) {
  const groups = new Map<string, any>()
  items.forEach((item) => {
    if (!item.location) return
    const id = item.location.id || item.location.label
    if (!groups.has(id)) groups.set(id, { location: item.location, items: [] })
    groups.get(id).items.push(item)
  })
  return Array.from(groups.values())
}

export function groupItemsByDay(items: any[]) {
  const groups = new Map<string, any[]>()
  items.forEach((item) => {
    const key = scheduleDateKey(item.schedule)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(item)
  })
  return Array.from(groups.entries()).map(([key, items]) => ({ key, items }))
}

export function dominantStatus(statuses: string[]) {
  if (statuses.some((status) => visualStatus(status) === "active")) return "accepted"
  if (statuses.some((status) => visualStatus(status) === "open")) return "suggested"
  if (statuses.some((status) => visualStatus(status) === "completed")) return "completed"
  if (statuses.some((status) => visualStatus(status) === "confirmed")) return "confirmed"
  return "suggested"
}

export function developmentFieldsForAdventure(adventureId = scenario.adventure?.id) {
  const set = new Set<string>()
  stepEntries(adventureId).forEach(([, step]: any) => {
    developmentFieldsForStep(step).forEach((field: string) => set.add(field))
  })
  return Array.from(set)
}

export function freeStepCount(model: Model, runId: string) {
  const run = adventureRun(model, runId)
  return stepEntries(run?.adventureId || scenario.adventure?.id).filter(([, step]: any) => stepHasParticipantSlot(model, step, runId)).length
}
