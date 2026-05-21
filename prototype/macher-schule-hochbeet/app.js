const STORAGE_KEY = "rlg-macher-schule-hochbeet-state-v9"
const BUNDLE_STORAGE_KEY = window.SIMULATION_BUNDLE_STORAGE_KEY || "rlg-macher-schule-hochbeet-bundle-v1"
const ACTIVE_RUN_STATUSES = ["open", "accepted", "in-progress", "completed", "confirmed"]
const scenario = window.SCENARIO
const MAIN_TABS = [
  { id: "quests", label: "Quests" },
  { id: "map", label: "Karte" },
  { id: "calendar", label: "Kalender" }
]
const WEEKDAY_OPTIONS = [
  { value: 1, label: "Mo" },
  { value: 2, label: "Di" },
  { value: 3, label: "Mi" },
  { value: 4, label: "Do" },
  { value: 5, label: "Fr" },
  { value: 6, label: "Sa" },
  { value: 7, label: "So" }
]
const PRIMARY_WORLD_METRIC_KEY = scenario.campaign?.worldState?.primaryMetricKey ||
  Object.keys(scenario.worldStateMetrics || {})[0] ||
  "raisedBedsBuilt"
const WORLD_TARGET = scenario.worldStateMetrics?.[PRIMARY_WORLD_METRIC_KEY]?.target || 5

const surfaceHeading = document.querySelector("#surfaceHeading")
const surfaceNav = document.querySelector("#surfaceNav")
const questView = document.querySelector("#questView")
const profileView = document.querySelector("#profileView")
const worldStateView = document.querySelector("#worldStateView")
const modelInfoView = document.querySelector("#modelInfoView")
const appTitle = document.querySelector("#appTitle")
const contextMenu = document.querySelector("#contextMenu")
const contextSwitchOptions = document.querySelector("#contextSwitchOptions")
const mainTabs = document.querySelector("#mainTabs")
const userMenu = document.querySelector("#userMenu")
const currentUserAvatar = document.querySelector("#currentUserAvatar")
const currentUserName = document.querySelector("#currentUserName")
const currentUserRole = document.querySelector("#currentUserRole")
const userSwitchOptions = document.querySelector("#userSwitchOptions")
const debugPanel = document.querySelector("#debugPanel")
const debugToggle = document.querySelector("#debugToggle")
const resetButton = document.querySelector("#resetButton")
const exportBundleButton = document.querySelector("#exportBundleButton")
const exportStateButton = document.querySelector("#exportStateButton")
const importSimulationButton = document.querySelector("#importSimulationButton")
const importSimulationInput = document.querySelector("#importSimulationInput")
const resetModelButton = document.querySelector("#resetModelButton")
const importStatus = document.querySelector("#importStatus")

let state = loadState()
let debugVisible = false

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function loadState() {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return normalizeState(clone(scenario.initialState))

  try {
    return normalizeState(JSON.parse(stored))
  } catch {
    return normalizeState(clone(scenario.initialState))
  }
}

function normalizeState(value) {
  const fallback = clone(scenario.initialState)
  const selectedTab = MAIN_TABS.some((tab) => tab.id === value.selectedTab)
    ? value.selectedTab
    : fallback.selectedTab || "quests"
  const selectedView = value.selectedView === "adventure" || value.selectedView === "step"
    ? "adventure"
    : value.selectedView === "standalone"
      ? "standalone"
    : fallback.selectedView
  const timelineSource = Array.isArray(value.timeline) ? value.timeline : fallback.timeline
  const adventureRuns = Array.isArray(value.adventureRuns)
    ? value.adventureRuns
    : value.adventureRun
      ? [value.adventureRun]
      : []
  const selectedAdventureRunId = typeof value.selectedAdventureRunId === "string" &&
    adventureRuns.some((run) => run.id === value.selectedAdventureRunId)
    ? value.selectedAdventureRunId
    : adventureRuns[0]?.id || null

  return {
    ...fallback,
    ...value,
    selectedRole: scenario.roles[value.selectedRole] ? value.selectedRole : fallback.selectedRole,
    adventureRun: null,
    adventureRuns,
    selectedAdventureRunId,
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
    selectedStandaloneQuestKey: typeof value.selectedStandaloneQuestKey === "string" ? value.selectedStandaloneQuestKey : null,
    worldState: {
      ...fallback.worldState,
      ...(value.worldState || {})
    }
  }
}

function normalizeRuns(runs) {
  return runs.map((run, index) => {
    const createdAt = timestampValue(run.createdAt) || timestampFromId(run.id) || Date.now() - ((runs.length - index) * 60 * 1000)
    const completedAt = timestampValue(run.completedAt)
    const confirmedAt = timestampValue(run.confirmedAt)
    const participants = normalizeParticipants(run)

    return {
      ...run,
      participants,
      createdAt,
      ...(completedAt ? { completedAt } : {}),
      ...(confirmedAt ? { confirmedAt } : {})
    }
  })
}

function normalizeParticipants(run) {
  if (Array.isArray(run.participants)) {
    return run.participants
      .map((participant) => {
        if (typeof participant === "string") {
          return { personId: participant, status: participantStatusForRun(run.status) }
        }

        return {
          personId: participant.personId,
          status: participant.status || participantStatusForRun(run.status)
        }
      })
      .filter((participant) => typeof participant.personId === "string" && participant.personId)
  }

  return []
}

function participantStatusForRun(status) {
  if (status === "confirmed") return "confirmed"
  if (status === "completed") return "completed"
  if (status === "open") return "open"
  return "active"
}

function normalizeTimeline(items) {
  return items.map((item, index) => {
    if (typeof item === "string") {
      return {
        id: `event:legacy-${index}`,
        text: normalizeDisplayText(item),
        scopes: ["global"],
        public: false,
        createdAt: Date.now()
      }
    }

    return {
      id: item.id || `event:legacy-${index}`,
      text: normalizeDisplayText(item.text || ""),
      scopes: Array.isArray(item.scopes) ? item.scopes : [item.scope || "global"],
      public: Boolean(item.public),
      adventureRunId: item.adventureRunId || null,
      questRunId: item.questRunId || null,
      personId: item.personId || null,
      createdAt: eventCreatedAt(item)
    }
  })
}

function normalizeDisplayText(text) {
  return text
    .replaceAll("Hochbeet-Runs", "Hochbeet-Gruppen")
    .replaceAll("AdventureRun", "Adventure")
    .replaceAll("QuestRuns", "Beiträge")
    .replaceAll("QuestRun", "Aufgabe")
    .replaceAll("Einzelquests", "Aufgaben")
    .replaceAll("Einzelquest", "Aufgabe")
    .replaceAll("den Step", "die Aufgabe")
    .replaceAll("der Step", "die Aufgabe")
    .replaceAll("ein Step", "eine Aufgabe")
    .replaceAll("Steps", "Aufgaben")
    .replaceAll("Step", "Aufgabe")
}

function timestampValue(value) {
  if (Number.isFinite(value)) return value

  if (typeof value === "string") {
    const numeric = Number(value)
    if (Number.isFinite(numeric)) return numeric

    const parsed = Date.parse(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return null
}

function timestampFromId(id) {
  const idMatch = typeof id === "string" ? id.match(/^event:(\d{12,})-/) : null
  return idMatch ? Number(idMatch[1]) : null
}

function eventCreatedAt(item) {
  const timestamp = timestampValue(item.createdAt) || timestampFromId(item.id)
  if (timestamp) return timestamp

  return Date.now()
}

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function applyGamePackVisuals() {
  const visuals = scenario.gamePack?.visuals || {}
  const root = document.documentElement
  const colorVars = {
    primaryColor: "--green",
    accentColor: "--amber",
    completedColor: "--blue",
    historyBackground: "--history-card"
  }

  Object.entries(colorVars).forEach(([key, cssVar]) => {
    if (typeof visuals[key] === "string" && visuals[key]) {
      root.style.setProperty(cssVar, visuals[key])
    }
  })
}

function setRole(roleId) {
  state.selectedRole = roleId
  state.selectedView = "overview"
  state.selectedTab = "quests"
  state.selectedStepId = null
  state.selectedStandaloneQuestKey = null
  userMenu.removeAttribute("open")
  saveState()
  render()
}

function setMainTab(tabId) {
  if (!MAIN_TABS.some((tab) => tab.id === tabId)) return

  state.selectedTab = tabId
  saveState()
  render()
}

function selectCampaign(campaignId) {
  const bundle = currentSimulationBundle()
  if (!bundle?.campaigns?.[campaignId]) return

  if (campaignId === bundle.activeCampaignId) {
    contextMenu?.removeAttribute("open")
    return
  }

  const nextBundle = {
    ...bundle,
    activeCampaignId: campaignId
  }
  window.localStorage.setItem(BUNDLE_STORAGE_KEY, JSON.stringify(nextBundle))
  window.localStorage.removeItem(STORAGE_KEY)
  window.location.reload()
}

function selectAdventure(runId) {
  if (arguments.length > 0) {
    state.selectedAdventureRunId = runId || null
  } else if (!adventureRun()) {
    state.selectedAdventureRunId = adventureRuns()[0]?.id || null
  }

  state.selectedView = "adventure"
  state.selectedTab = "quests"
  state.selectedStepId = null
  state.selectedStandaloneQuestKey = null
  saveState()
  render()
}

function selectStep(stepId) {
  state.selectedView = "adventure"
  state.selectedTab = "quests"
  state.selectedStepId = stepId
  state.selectedStandaloneQuestKey = null
  saveState()
  render()
}

function selectAdventureStep(runId, stepId) {
  state.selectedAdventureRunId = runId || null
  state.selectedView = "adventure"
  state.selectedTab = "quests"
  state.selectedStepId = stepId || null
  state.selectedStandaloneQuestKey = null
  saveState()
  render()
}

function selectStandaloneQuest(questKey) {
  state.selectedView = "standalone"
  state.selectedTab = "quests"
  state.selectedStepId = null
  state.selectedStandaloneQuestKey = questKey
  saveState()
  render()
}

function showQuestOverview() {
  state.selectedView = "overview"
  state.selectedTab = "quests"
  state.selectedStepId = null
  state.selectedStandaloneQuestKey = null
  saveState()
  render()
}

function addEvent(text, options = {}) {
  const scopes = Array.isArray(options.scopes) ? options.scopes : [options.scope || "global"]
  const now = Date.now()

  state.timeline.unshift({
    id: `event:${now}-${state.timeline.length}`,
    text,
    scopes,
    public: Boolean(options.public),
    adventureRunId: options.adventureRunId || null,
    questRunId: options.questRunId || null,
    personId: options.personId || null,
    createdAt: now
  })
}

function personName(personId) {
  return scenario.people[personId] || personId
}

function runParticipantIds(run) {
  if (!run) return []

  if (Array.isArray(run.participants) && run.participants.length) {
    return run.participants
      .map((participant) => participant.personId)
      .filter(Boolean)
  }

  return []
}

function runHasParticipant(run, personId) {
  return runParticipantIds(run).includes(personId)
}

function addRunParticipant(run, personId) {
  if (!run || !personId || runHasParticipant(run, personId)) return

  const participants = Array.isArray(run.participants) ? run.participants : []
  participants.push({ personId, status: "active" })
  run.participants = participants
}

function markRunParticipants(run, status) {
  if (!Array.isArray(run.participants)) return

  run.participants = run.participants.map((participant) => ({
    ...participant,
    status
  }))
}

function isStudent(roleId) {
  return scenario.students.includes(roleId)
}

function canConfirm(roleId) {
  return scenario.confirmers?.includes(roleId) ||
    scenario.roles[roleId]?.capabilities?.includes("confirmation.create")
}

function statusLabelKey(status) {
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

function actionLabel(key, fallback) {
  return scenario.gamePack?.language?.actionLabels?.[key] || fallback
}

function worldMetric(metricKey) {
  return scenario.worldStateMetrics?.[metricKey] || {}
}

function primaryWorldMetric() {
  return worldMetric(PRIMARY_WORLD_METRIC_KEY)
}

function visualStatus(status) {
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

function statusLabel(status, context = "task") {
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

function compactStatusLabel(status, context = "task") {
  return statusLabel(status, context)
}

function renderStatusMarker(status, className = "") {
  const visual = visualStatus(status)
  return `<span class="status-marker status-${visual} ${className}" aria-hidden="true"></span>`
}

function renderStatusBadge(status, options = {}) {
  const context = options.context || "task"
  const visual = context === "adventure" && status === "completed" ? "confirmed" : visualStatus(status)
  const label = options.label || statusLabel(status, context)
  const className = options.className || ""

  return `
    <span class="status status-badge status-${visual} ${status} ${className}">
      <span class="status-marker status-${visual} status-badge-icon" aria-hidden="true"></span>
      <span>${label}</span>
    </span>
  `
}

function isHistoryStatus(status) {
  return ["completed", "confirmed"].includes(status)
}

function overviewItems() {
  const items = [
    {
      history: false,
      markup: renderAdventureTemplateCard()
    },
    ...adventureRuns().map((run) => ({
      history: run.status === "completed",
      markup: renderAdventureRunCard(run)
    })),
    ...standaloneQuestEntries().map(([questKey, offer]) => ({
      history: isStandaloneQuestHistory(questKey),
      markup: renderStandaloneQuestCard(questKey, offer)
    }))
  ]

  return [
    ...items.filter((item) => !item.history),
    ...items.filter((item) => item.history)
  ]
}

function disabledAttr(condition) {
  return condition ? "disabled" : ""
}

function slug(value) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()
}

function todayKey() {
  return dateKey(new Date())
}

function dateKey(value) {
  const date = value instanceof Date ? value : new Date(value)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

function localDateFromKey(value) {
  const [year, month, day] = String(value || "").split("-").map(Number)
  if (!year || !month || !day) return null

  return new Date(year, month - 1, day, 23, 59, 59, 999)
}

function weekdayNumber(date) {
  return date.getDay() || 7
}

function adventureRuns() {
  return state.adventureRuns || []
}

function adventureRunById(runId) {
  return adventureRuns().find((run) => run.id === runId) || null
}

function adventureRun() {
  return adventureRunById(state.selectedAdventureRunId)
}

function completedAdventureRuns() {
  return adventureRuns().filter((run) => run.status === "completed")
}

function adventureRunLetter(index) {
  return String.fromCharCode("A".charCodeAt(0) + index)
}

function nextAdventureRunTitle() {
  return `${scenario.adventure.runTitlePrefix || scenario.adventure.title} ${adventureRunLetter(adventureRuns().length)}`
}

function stepEntries() {
  return Object.entries(scenario.adventureQuestRelations)
    .filter(([, step]) => !scenario.adventure?.id || step.from === scenario.adventure.id)
    .sort(([, a], [, b]) => a.meta.order - b.meta.order)
}

function standaloneQuestEntries() {
  const offerKeys = scenario.campaign?.standaloneQuestOfferKeys

  return Object.entries(scenario.standaloneQuestOffers || {})
    .filter(([questKey]) => !Array.isArray(offerKeys) || offerKeys.includes(questKey))
    .sort(([, a], [, b]) => a.order - b.order)
}

function getStandaloneOffer(questKey) {
  return scenario.standaloneQuestOffers?.[questKey]
}

function getStep(stepId) {
  return Object.values(scenario.adventureQuestRelations).find((step) => step.id === stepId)
}

function getStepByKey(stepKey) {
  return scenario.adventureQuestRelations[stepKey]
}

function getQuest(questKey) {
  return scenario.quests[questKey]
}

function getQuestForStep(step) {
  return getQuest(step.questKey)
}

function getLocation(locationId) {
  return scenario.locations?.[locationId] || null
}

function stepLocation(step) {
  return getLocation(step?.meta?.locationId || scenario.adventure?.locationId || scenario.campaign?.locationId)
}

function standaloneLocation(questKey) {
  const offer = getStandaloneOffer(questKey)
  const quest = getQuest(questKey)
  return getLocation(offer?.locationId || quest?.locationId || scenario.campaign?.locationId)
}

function stepSchedule(step) {
  return step?.meta?.schedule || scenario.adventure?.schedule || null
}

function standaloneSchedule(questKey) {
  const offer = getStandaloneOffer(questKey)
  const quest = getQuest(questKey)
  return offer?.schedule || quest?.schedule || null
}

function recurrenceRuleForQuest(questKey) {
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
  const override = state.recurrenceRules?.[questKey] || {}
  const weekdays = Array.isArray(override.weekdays)
    ? override.weekdays
    : baseRule.weekdays

  return {
    ...baseRule,
    ...override,
    weekdays: weekdays
      .map(Number)
      .filter((weekday) => weekday >= 1 && weekday <= 7)
      .sort((a, b) => a - b)
  }
}

function updateRecurrenceRule(questKey, patch) {
  state.recurrenceRules = {
    ...(state.recurrenceRules || {}),
    [questKey]: {
      ...recurrenceRuleForQuest(questKey),
      ...patch
    }
  }
  saveState()
  render()
}

function setRecurrenceWeekday(questKey, weekday, enabled) {
  const rule = recurrenceRuleForQuest(questKey)
  const weekdays = new Set(rule.weekdays)
  if (enabled) weekdays.add(weekday)
  if (!enabled && weekdays.size > 1) weekdays.delete(weekday)
  updateRecurrenceRule(questKey, { weekdays: Array.from(weekdays).sort((a, b) => a - b) })
}

function setRecurrenceUntil(questKey, until) {
  updateRecurrenceRule(questKey, { until: until || null })
}

function weekdayLabel(weekday) {
  return WEEKDAY_OPTIONS.find((item) => item.value === weekday)?.label || String(weekday)
}

function weekdayRangeLabel(weekdays) {
  if (!weekdays?.length) return "kein Wochentag"
  if (weekdays.join(",") === "1,2,3,4,5") return "Mo-Fr"
  if (weekdays.join(",") === "1,2,3,4,5,6,7") return "täglich"
  return weekdays.map(weekdayLabel).join(", ")
}

function formatDateOnly(value) {
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return "offen"

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(timestamp))
}

function recurrenceSummary(questKey) {
  const rule = recurrenceRuleForQuest(questKey)
  const until = rule.until ? ` bis ${formatDateOnly(rule.until)}` : ""
  return `Jede Woche ${weekdayRangeLabel(rule.weekdays)}${until}`
}

function getRun(runId) {
  return state.runs.find((run) => run.id === runId)
}

function runSchedule(run) {
  if (!run) return null
  if (run.startsAt || run.endsAt) return run

  const step = run.adventureStepRelationId ? getStep(run.adventureStepRelationId) : null
  return stepSchedule(step)
}

function runStartTimestamp(run) {
  const schedule = runSchedule(run)
  return timestampValue(schedule?.startsAt || schedule?.date)
}

function runEndTimestamp(run) {
  const schedule = runSchedule(run)
  return timestampValue(schedule?.endsAt)
}

function runWindowStarted(run) {
  const start = runStartTimestamp(run)
  return !start || start <= Date.now()
}

function runCanStillBeAccepted(run) {
  const end = runEndTimestamp(run)
  if (end) return end >= Date.now()

  const start = runStartTimestamp(run)
  return !start || start >= Date.now()
}

function runStartHint(run) {
  const schedule = runSchedule(run)
  if (!runStartTimestamp(run)) return ""

  return `Ab ${formatScheduleDate(schedule)} · ${formatScheduleTime(schedule)} möglich.`
}

function isActiveRun(run) {
  return ACTIVE_RUN_STATUSES.includes(run.status)
}

function findRun(actorId, stepId) {
  const activeAdventureRun = adventureRun()
  if (!activeAdventureRun) return null

  return findRunInAdventureRun(actorId, stepId, activeAdventureRun.id)
}

function findRunInAdventureRun(actorId, stepId, runId) {
  return state.runs.find((run) => (
    runHasParticipant(run, actorId) &&
    run.adventureRunId === runId &&
    run.adventureStepRelationId === stepId &&
    isActiveRun(run)
  ))
}

function runsForStep(stepId, runId = state.selectedAdventureRunId) {
  const activeAdventureRun = adventureRunById(runId)
  if (!activeAdventureRun) return []

  return state.runs.filter((run) => (
    run.adventureRunId === activeAdventureRun.id &&
    run.adventureStepRelationId === stepId &&
    isActiveRun(run)
  ))
}

function runsForAdventureRun(runId) {
  return state.runs.filter((run) => run.adventureRunId === runId && isActiveRun(run))
}

function joinableRunForStep(actorId, step, runId = state.selectedAdventureRunId) {
  const policy = participationPolicyForStep(step)

  return runsForStep(step.id, runId).find((run) => (
    ["open", "accepted", "in-progress"].includes(run.status) &&
    !runHasParticipant(run, actorId) &&
    runHasParticipantSlot(run, policy)
  ))
}

function stepHasParticipantSlot(step, runId = state.selectedAdventureRunId) {
  return Boolean(joinableRunForStep("__probe__", step, runId)) || !capacityReached(step, runId)
}

function participantIdsForAdventureRun(run) {
  if (!run) return []

  const ids = new Set(run.participantIds || [])
  runsForAdventureRun(run.id).forEach((questRun) => {
    runParticipantIds(questRun).forEach((personId) => ids.add(personId))
  })
  return Array.from(ids)
}

function addParticipantToAdventureRun(run, actorId) {
  if (!run || !isStudent(actorId)) return

  const ids = new Set(run.participantIds || [])
  ids.add(actorId)
  run.participantIds = Array.from(ids)
}

function isStandaloneRunForQuest(run, questKey) {
  return (
    run.questKey === questKey &&
    !run.adventureRunId &&
    !run.adventureStepRelationId &&
    isActiveRun(run)
  )
}

function scheduledRunId(questKey, periodKey) {
  return `quest-run:${questKey}-${periodKey}`
}

function standalonePeriodKey(offer) {
  return offer?.repeatable && offer.cadence === "daily" ? todayKey() : null
}

function isScheduledStandaloneQuest(questKey) {
  return getStandaloneOffer(questKey)?.runPolicy?.type === "scheduled"
}

function allowsMultipleStandaloneRuns(questKey) {
  const offer = getStandaloneOffer(questKey)
  return Boolean(offer?.repeatable || isScheduledStandaloneQuest(questKey))
}

function materializedStandaloneRunsForQuest(questKey) {
  return state.runs.filter((run) => {
    if (!isStandaloneRunForQuest(run, questKey)) return false
    return true
  })
}

function virtualStandaloneRunsForQuest(questKey, materializedRuns = materializedStandaloneRunsForQuest(questKey)) {
  const quest = getQuest(questKey)
  const offer = getStandaloneOffer(questKey)
  const schedule = standaloneSchedule(questKey)
  if (!quest || offer?.runPolicy?.type !== "scheduled" || !schedule?.startsAt) return []

  const existingIds = new Set(materializedRuns.map((run) => run.id))
  const start = new Date(scheduleTimestamp(schedule))
  const endTimestamp = Date.parse(schedule.endsAt)
  const duration = Number.isFinite(endTimestamp) ? Math.max(0, endTimestamp - start.getTime()) : null
  const rule = recurrenceRuleForQuest(questKey)
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
      startsAt: occurrenceStart.toISOString(),
      endsAt: duration === null ? null : new Date(occurrenceStart.getTime() + duration).toISOString(),
      virtual: true,
      completion: null
    }

    if (!existingIds.has(run.id) && runCanStillBeAccepted(run)) {
      runs.push(run)
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return runs
}

function runsForStandaloneQuest(questKey) {
  const materializedRuns = materializedStandaloneRunsForQuest(questKey)
  return [
    ...materializedRuns,
    ...virtualStandaloneRunsForQuest(questKey, materializedRuns)
  ]
}

function findStandaloneRun(actorId, questKey) {
  return runsForStandaloneQuest(questKey).find((run) => (
    runHasParticipant(run, actorId) &&
    ["accepted", "in-progress"].includes(run.status)
  ))
}

function openStandaloneRuns(questKey) {
  return runsForStandaloneQuest(questKey).filter((run) => run.status === "open" && runCanStillBeAccepted(run))
}

function nextOpenStandaloneRun(questKey) {
  return openStandaloneRuns(questKey)
    .filter((run) => runHasParticipantSlot(run, participationPolicyForStandalone(questKey)))
    .sort((a, b) => questRunTimestamp(a) - questRunTimestamp(b))[0] || null
}

function standaloneRunOption(questKey, runId) {
  return runsForStandaloneQuest(questKey).find((run) => run.id === runId) || null
}

function hasConfirmation(runId) {
  return state.confirmations.some((item) => item.subjectId === runId)
}

function confirmationForRun(runId) {
  return state.confirmations.find((item) => item.subjectId === runId)
}

function hasConfirmedStep(stepId, runId = state.selectedAdventureRunId) {
  return runsForStep(stepId, runId).some((run) => run.status === "confirmed")
}

function hasCompletedOrConfirmedStep(stepId, runId = state.selectedAdventureRunId) {
  return runsForStep(stepId, runId).some((run) => ["completed", "confirmed"].includes(run.status))
}

function hasFrameResult(runId = state.selectedAdventureRunId) {
  const frameStep = getStepByKey("frame")
  if (!frameStep) return false

  return runsForStep(frameStep.id, runId).some((run) => ["completed", "confirmed"].includes(run.status))
}

function dependenciesMet(stepId, runId = state.selectedAdventureRunId) {
  const step = getStep(stepId)
  return (step.meta.dependsOn || []).every((requiredStepId) => hasCompletedOrConfirmedStep(requiredStepId, runId))
}

function dependencyText(stepId, runId = state.selectedAdventureRunId) {
  if (!adventureRunById(runId)) return ""

  const step = getStep(stepId)
  const missing = (step.meta.dependsOn || []).filter((requiredStepId) => !hasCompletedOrConfirmedStep(requiredStepId, runId))
  if (!missing.length) return ""

  const labels = missing.map((requiredStepId) => getQuestForStep(getStep(requiredStepId)).title).join(", ")
  return `Kann erst fertig gemeldet werden, wenn "${labels}" fertig ist.`
}

function stepCapacity(step) {
  return Number.isFinite(step.meta.capacity) ? step.meta.capacity : Number.POSITIVE_INFINITY
}

function participationPolicyForStep(step) {
  return {
    minParticipants: step?.meta?.participationPolicy?.minParticipants || 1,
    maxParticipants: step?.meta?.participationPolicy?.maxParticipants || 1
  }
}

function participationPolicyForStandalone(questKey) {
  const offer = getStandaloneOffer(questKey)
  const quest = getQuest(questKey)

  return {
    minParticipants: offer?.participationPolicy?.minParticipants || quest?.participationPolicy?.minParticipants || 1,
    maxParticipants: offer?.participationPolicy?.maxParticipants || quest?.participationPolicy?.maxParticipants || 1
  }
}

function runHasParticipantSlot(run, policy) {
  return runParticipantIds(run).length < policy.maxParticipants
}

function runHasEnoughParticipants(run, policy) {
  return runParticipantIds(run).length >= policy.minParticipants
}

function capacityReached(step, runId = state.selectedAdventureRunId) {
  return runsForStep(step.id, runId).length >= stepCapacity(step)
}

function standaloneCapacity(offer) {
  return Number.isFinite(offer?.capacity) ? offer.capacity : Number.POSITIVE_INFINITY
}

function standaloneCapacityReached(questKey) {
  const offer = getStandaloneOffer(questKey)
  if (openStandaloneRuns(questKey).some((run) => runHasParticipantSlot(run, participationPolicyForStandalone(questKey)))) {
    return false
  }

  return runsForStandaloneQuest(questKey).length >= standaloneCapacity(offer)
}

function ownFramePhoto(actorId, runId = state.selectedAdventureRunId) {
  return state.evidence.find((item) => (
    item.createdBy === actorId &&
    item.type === "photo" &&
    item.subjectId === runId &&
    item.id.includes("frame-photo")
  ))
}

function ownRunPhoto(actorId, runId) {
  return state.evidence.find((item) => (
    item.createdBy === actorId &&
    item.type === "photo" &&
    item.subjectId === runId
  ))
}

function evidenceForRun(run) {
  const refs = run.completion?.evidenceRefs || []
  return state.evidence.filter((item) => refs.includes(item.id))
}

function developmentFieldsForStep(step) {
  if (!step) return []
  const quest = getQuestForStep(step)
  return step?.meta.developmentFields || quest?.developmentFields || []
}

function developmentFieldsForRun(run) {
  const step = getStep(run.adventureStepRelationId)
  if (step) return developmentFieldsForStep(step)
  return getQuest(run.questKey)?.developmentFields || []
}

function fieldChips(fields) {
  return fields.map((field) => `<span class="field">${field}</span>`).join("")
}

function compactFieldChips(fields, limit = 2) {
  const visibleFields = fields.slice(0, limit)
  const remaining = fields.length - visibleFields.length

  return [
    fieldChips(visibleFields),
    remaining > 0 ? `<span class="field field-more">+${remaining}</span>` : ""
  ].join("")
}

function requirementLabel(step) {
  return step.meta.required ? "Pflicht" : "Extra"
}

function renderRequirementTag(step) {
  return `
    <span class="requirement-tag ${step.meta.required ? "is-required" : "is-optional"}">
      ${requirementLabel(step)}
    </span>
  `
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function renderAvatar(role) {
  if (role.avatar) {
    return `<img class="profile-avatar" src="${role.avatar}" alt="" aria-hidden="true">`
  }

  return `<div class="profile-avatar profile-avatar-fallback" aria-hidden="true">${initials(role.name)}</div>`
}

function renderTinyAvatar(personId) {
  const role = scenario.roles[personId]
  if (!role) return ""

  if (role.avatar) {
    return `<img class="tiny-avatar" src="${role.avatar}" alt="" aria-hidden="true">`
  }

  return `<span class="tiny-avatar tiny-avatar-fallback" aria-hidden="true">${initials(role.name)}</span>`
}

function renderAvatarGroup(personIds) {
  if (!personIds.length) return ""

  return `
    <span class="avatar-group" aria-label="${personIds.map(personName).join(", ")}">
      ${personIds.map((personId) => renderTinyAvatar(personId)).join("")}
    </span>
  `
}

function renderAssigneeLabel(runs, fallbackText) {
  if (!runs.length) return fallbackText ? `<span>${fallbackText}</span>` : ""
  const personIds = Array.from(new Set(runs.flatMap(runParticipantIds)))
  if (!personIds.length) return fallbackText ? `<span>${fallbackText}</span>` : ""

  return `
    <span class="assignee-list">
      <span class="assignee-pill">
        ${renderAvatarGroup(personIds)}
        <span>${personIds.map(personName).join(", ")}</span>
      </span>
    </span>
  `
}

function renderItemImage(src, label, className = "item-image") {
  if (!src) return ""

  return `<img class="${className}" src="${src}" alt="" aria-hidden="true" title="${label}">`
}

function runsForPerson(personId) {
  return state.runs.filter((run) => runHasParticipant(run, personId) && isActiveRun(run))
}

function confirmedRunsForPerson(personId) {
  return runsForPerson(personId).filter((run) => run.status === "confirmed")
}

function completedAdventureRunsForPerson(personId) {
  return adventureRuns().filter((run) => (
    run.status === "completed" &&
    runsForAdventureRun(run.id).some((questRun) => runHasParticipant(questRun, personId) && questRun.status === "confirmed")
  ))
}

function developmentTouchesForPerson(personId) {
  const touches = new Map()

  confirmedRunsForPerson(personId).forEach((run) => {
    const confirmation = confirmationForRun(run.id)
    developmentFieldsForRun(run).forEach((field) => {
      if (!touches.has(field)) {
        touches.set(field, {
          field,
          questTitle: getQuest(run.questKey).title,
          count: 1,
          sourceConfirmationId: confirmation?.id || "confirmation:pending"
        })
        return
      }

      touches.get(field).count += 1
    })
  })

  return Array.from(touches.values())
}

function badgesForPerson(personId) {
  const badges = new Map()

  confirmedRunsForPerson(personId).forEach((run) => {
    const confirmation = confirmationForRun(run.id)
    if (!confirmation) return

    const quest = getQuest(run.questKey)
    const existing = badges.get(run.questKey)
    if (existing) {
      existing.count += 1
      existing.sourceConfirmations.push(confirmation)
      return
    }

    badges.set(run.questKey, {
      questKey: run.questKey,
      title: quest.title,
      image: quest.image,
      count: 1,
      sourceConfirmations: [confirmation]
    })
  })

  completedAdventureRunsForPerson(personId).forEach((run) => {
    const confirmation = confirmationForRun(run.id)
    const key = scenario.adventure.id
    const existing = badges.get(key)
    if (existing) {
      existing.count += 1
      if (confirmation) existing.sourceConfirmations.push(confirmation)
      return
    }

    badges.set(key, {
      questKey: key,
      title: scenario.adventure.resultBadgeTitle || scenario.adventure.title,
      image: scenario.adventure.image,
      count: 1,
      sourceConfirmations: confirmation ? [confirmation] : []
    })
  })

  return Array.from(badges.values())
}

function stepStatus(stepId, runId = state.selectedAdventureRunId) {
  const runs = runsForStep(stepId, runId)
  if (runs.some((run) => run.status === "confirmed")) return "confirmed"
  if (runs.some((run) => run.status === "completed")) return "completed"
  if (runs.some((run) => run.status === "accepted")) return "accepted"
  return "suggested"
}

function standaloneQuestStatus(questKey) {
  const runs = runsForStandaloneQuest(questKey)
  if (runs.some((run) => run.status === "accepted")) return "accepted"
  if (runs.some((run) => run.status === "open")) return "suggested"
  if (runs.some((run) => run.status === "completed")) return "completed"
  if (runs.length && runs.every((run) => run.status === "confirmed")) return "confirmed"
  return "suggested"
}

function isStandaloneQuestHistory(questKey) {
  const offer = getStandaloneOffer(questKey)
  const runs = runsForStandaloneQuest(questKey)
  if (offer?.repeatable) return false
  return runs.length > 0 && runs.every((run) => run.status === "confirmed")
}

function standaloneOfferLabel(offer, questKey = offer?.questKey) {
  if (offer?.runPolicy?.type === "scheduled") return weekdayRangeLabel(recurrenceRuleForQuest(questKey).weekdays)
  if (offer?.repeatable && offer.cadence === "daily") return "Täglich"
  return "Einmalig"
}

function completionClaim(questKey) {
  const quest = getQuest(questKey)
  if (quest?.completionClaim) return quest.completionClaim

  return {
    frame: "Ich habe einen Teil des Hochbeet-Rahmens verschraubt.",
    documentation: "Ich habe den Baufortschritt dokumentiert.",
    soil: "Ich habe Erde ins Hochbeet gefüllt.",
    carrots: "Ich habe Karotten gepflanzt.",
    watering: "Ich habe gegossen."
  }[questKey] || "Ich habe diese Aufgabe fertig gemacht."
}

function confirmationClaim(run) {
  const actors = runParticipantIds(run).map(personName)
  const actor = actors.length > 1
    ? `${actors.slice(0, -1).join(", ")} und ${actors.at(-1)}`
    : actors[0] || "Jemand"
  const quest = getQuest(run.questKey)
  if (quest?.confirmationClaim) return quest.confirmationClaim.replaceAll("{actor}", actor)

  return {
    frame: `${actor} hat einen Teil des Hochbeet-Rahmens verschraubt.`,
    documentation: `${actor} hat den Bau des Hochbeets dokumentiert.`,
    soil: `${actor} hat Erde ins Hochbeet gefüllt.`,
    carrots: `${actor} hat Karotten gepflanzt.`,
    watering: `${actor} hat gegossen.`
  }[run.questKey] || `${actor} hat die Aufgabe "${getQuest(run.questKey).title}" fertig gemacht.`
}

function canStartAdventure(roleId) {
  return isStudent(roleId)
}

function createAdventureRun(actorId) {
  const title = nextAdventureRunTitle()
  const run = {
    id: `adventure-run:${slug(scenario.adventure.id)}-${slug(title)}`,
    adventureId: scenario.adventure.id,
    title,
    participantIds: isStudent(actorId) ? [actorId] : [],
    status: "active"
  }

  state.adventureRuns.push(run)
  state.selectedAdventureRunId = run.id
  addEvent(`${personName(actorId)} hat das Adventure ${title} gestartet.`, {
    scopes: ["global", "adventure"],
    adventureRunId: run.id,
    personId: actorId
  })

  return run
}

function acceptStep(actorId, stepId) {
  const step = getStep(stepId)
  let activeAdventureRun = adventureRun()
  const joinableRun = activeAdventureRun ? joinableRunForStep(actorId, step, activeAdventureRun.id) : null
  if (
    !step ||
    !isStudent(actorId) ||
    findRun(actorId, stepId) ||
    (activeAdventureRun && !joinableRun && capacityReached(step))
  ) return

  if (!activeAdventureRun) {
    if (!canStartAdventure(actorId)) return
    activeAdventureRun = createAdventureRun(actorId)
  }

  const quest = getQuestForStep(step)
  const schedule = stepSchedule(step)
  if (joinableRun) {
    addRunParticipant(joinableRun, actorId)
    joinableRun.status = "accepted"
    addParticipantToAdventureRun(activeAdventureRun, actorId)
    addEvent(`${personName(actorId)} macht in ${activeAdventureRun.title} bei "${quest.title}" mit.`, {
      scopes: ["adventure", "questRun"],
      adventureRunId: activeAdventureRun.id,
      questRunId: joinableRun.id,
      personId: actorId
    })
    saveState()
    render()
    return
  }

  const run = {
    id: `quest-run:${slug(activeAdventureRun.id)}-${slug(step.id)}-${state.runs.length + 1}`,
    questKey: step.questKey,
    questId: quest.id,
    participants: [{ personId: actorId, status: "active" }],
    adventureRunId: activeAdventureRun.id,
    adventureStepRelationId: step.id,
    status: "accepted",
    locationId: step.meta.locationId || scenario.adventure?.locationId || null,
    startsAt: schedule?.startsAt || null,
    endsAt: schedule?.endsAt || null,
    createdAt: Date.now(),
    completion: null
  }

  addParticipantToAdventureRun(activeAdventureRun, actorId)
  state.runs.push(run)
  addEvent(`${personName(actorId)} hat in ${activeAdventureRun.title} die Aufgabe "${quest.title}" übernommen.`, {
    scopes: ["adventure", "questRun"],
    adventureRunId: activeAdventureRun.id,
    questRunId: run.id,
    personId: actorId
  })
  saveState()
  render()
}

function completeStep(actorId, stepId) {
  const step = getStep(stepId)
  const run = findRun(actorId, stepId)
  const policy = participationPolicyForStep(step)
  if (
    !step ||
    !run ||
    run.status !== "accepted" ||
    !runHasEnoughParticipants(run, policy) ||
    !dependenciesMet(stepId) ||
    !runWindowStarted(run)
  ) return

  const evidenceRefs = []
  if (step.questKey === "documentation") {
    const photo = ownFramePhoto(actorId)
    if (photo) evidenceRefs.push(photo.id)
  }

  run.status = "completed"
  run.completedAt = Date.now()
  markRunParticipants(run, "completed")
  run.completion = {
    claim: completionClaim(step.questKey),
    evidenceRefs
  }

  addEvent(`${personName(actorId)} hat die Aufgabe "${getQuestForStep(step).title}" fertig gemeldet.`, {
    scopes: ["adventure", "questRun"],
    adventureRunId: run.adventureRunId,
    questRunId: run.id,
    personId: actorId
  })
  saveState()
  render()
}

function createStandaloneRun(actorId, questKey) {
  const quest = getQuest(questKey)
  const offer = getStandaloneOffer(questKey)
  const periodKey = standalonePeriodKey(offer)

  return {
    id: `quest-run:${slug(quest.id)}${periodKey ? `-${periodKey}` : ""}-${state.runs.length + 1}`,
    questKey,
    questId: quest.id,
    participants: [{ personId: actorId, status: "active" }],
    adventureRunId: null,
    adventureStepRelationId: null,
    periodKey,
    status: "accepted",
    locationId: offer?.locationId || quest.locationId || null,
    startsAt: offer?.schedule?.startsAt || quest.schedule?.startsAt || null,
    endsAt: offer?.schedule?.endsAt || quest.schedule?.endsAt || null,
    createdAt: Date.now(),
    completion: null
  }
}

function materializeStandaloneRun(run) {
  const materializedRun = clone(run)
  delete materializedRun.virtual
  return materializedRun
}

function acceptStandaloneQuest(actorId, questKey, runId = null) {
  const quest = getQuest(questKey)
  const offer = getStandaloneOffer(questKey)
  const selectedOpenRun = runId ? standaloneRunOption(questKey, runId) : nextOpenStandaloneRun(questKey)
  const canUseSelectedRun = selectedOpenRun &&
    selectedOpenRun.questKey === questKey &&
    selectedOpenRun.status === "open" &&
    !runHasParticipant(selectedOpenRun, actorId) &&
    runCanStillBeAccepted(selectedOpenRun) &&
    runHasParticipantSlot(selectedOpenRun, participationPolicyForStandalone(questKey))
  if (
    !quest ||
    !offer ||
    !isStudent(actorId) ||
    (!allowsMultipleStandaloneRuns(questKey) && findStandaloneRun(actorId, questKey)) ||
    (runId && !canUseSelectedRun) ||
    (!canUseSelectedRun && isScheduledStandaloneQuest(questKey)) ||
    (!canUseSelectedRun && standaloneCapacityReached(questKey))
  ) return

  const run = canUseSelectedRun
    ? (selectedOpenRun.virtual ? materializeStandaloneRun(selectedOpenRun) : selectedOpenRun)
    : createStandaloneRun(actorId, questKey)
  addRunParticipant(run, actorId)
  run.status = "accepted"

  if (!canUseSelectedRun || selectedOpenRun?.virtual) state.runs.push(run)
  addEvent(`${personName(actorId)} hat die Aufgabe "${quest.title}"${run.startsAt ? ` für ${formatScheduleDate(run)} ${formatScheduleTime(run)}` : ""} übernommen.`, {
    scopes: ["global", "questRun"],
    questRunId: run.id,
    personId: actorId
  })
  saveState()
  render()
}

function completeStandaloneQuest(actorId, questKey, runId = null) {
  const quest = getQuest(questKey)
  const run = runId ? getRun(runId) : findStandaloneRun(actorId, questKey)
  if (!quest || !run || run.status !== "accepted" || !runHasParticipant(run, actorId) || !runWindowStarted(run)) return

  run.status = "completed"
  run.completedAt = Date.now()
  markRunParticipants(run, "completed")
  const evidenceRefs = state.evidence
    .filter((item) => item.subjectId === run.id)
    .map((item) => item.id)
  run.completion = {
    claim: completionClaim(questKey),
    evidenceRefs
  }

  addEvent(`${personName(actorId)} hat die Aufgabe "${quest.title}" fertig gemeldet.`, {
    scopes: ["global", "questRun"],
    questRunId: run.id,
    personId: actorId
  })
  saveState()
  render()
}

function postFramePhoto(actorId) {
  const activeAdventureRun = adventureRun()
  if (!activeAdventureRun) return

  const documentationStep = getStepByKey("documentation")
  const frameStep = getStepByKey("frame")
  if (!documentationStep || !frameStep) return

  const run = findRun(actorId, documentationStep.id)
  if (!run || !["accepted", "completed"].includes(run.status)) return
  if (!hasFrameResult() || ownFramePhoto(actorId)) return

  const evidenceId = `evidence:${actorId}-${slug(activeAdventureRun.id)}-frame-photo`
  const supportRefs = runsForStep(frameStep.id)
    .filter((item) => ["completed", "confirmed"].includes(item.status))
    .map((item) => item.id)

  state.evidence.push({
    id: evidenceId,
    type: "photo",
    createdBy: actorId,
    subjectId: activeAdventureRun.id,
    caption: `Foto vom verschraubten Rahmen, gepostet von ${personName(actorId)}.`,
    supports: supportRefs
  })

  if (run.completion && !run.completion.evidenceRefs.includes(evidenceId)) {
    run.completion.evidenceRefs.push(evidenceId)
  }

  addEvent(`${personName(actorId)} hat ein Foto vom verschraubten Rahmen im Adventure-Kontext gepostet.`, {
    scopes: ["adventure", "questRun"],
    adventureRunId: activeAdventureRun.id,
    questRunId: run.id,
    personId: actorId
  })
  saveState()
  render()
}

function postRunPhoto(actorId, runId) {
  const run = getRun(runId)
  if (!run || !runHasParticipant(run, actorId) || !["accepted", "completed"].includes(run.status) || ownRunPhoto(actorId, run.id)) return

  const quest = getQuest(run.questKey)
  const evidenceId = `evidence:${actorId}-${slug(run.id)}-photo`
  state.evidence.push({
    id: evidenceId,
    type: "photo",
    createdBy: actorId,
    subjectId: run.id,
    caption: `Foto zu "${quest.title}", gepostet von ${personName(actorId)}.`,
    supports: [run.id]
  })

  if (run.completion) {
    const refs = new Set(run.completion.evidenceRefs || [])
    refs.add(evidenceId)
    run.completion.evidenceRefs = Array.from(refs)
  }

  addEvent(`${personName(actorId)} hat ein Foto zu "${quest.title}" gepostet.`, {
    scopes: [run.adventureRunId ? "adventure" : "global", "questRun"],
    adventureRunId: run.adventureRunId || null,
    questRunId: run.id,
    personId: actorId
  })
  saveState()
  render()
}

function confirmRun(runId, issuerId) {
  const run = getRun(runId)
  if (!run || run.status !== "completed" || hasConfirmation(runId)) return

  const claim = confirmationClaim(run)
  const scopes = run.adventureRunId ? ["adventure", "questRun"] : ["global", "questRun"]
  state.confirmations.push({
    id: `confirmation:${run.id}`,
    subjectId: run.id,
    subjectParticipantIds: runParticipantIds(run),
    issuerId,
    claim,
    trustLevel: "server-confirmed",
    evidenceRefs: run.completion?.evidenceRefs || []
  })

  run.status = "confirmed"
  run.confirmedAt = Date.now()
  markRunParticipants(run, "confirmed")
  addEvent(`${personName(issuerId)} hat bestätigt: ${claim}`, {
    scopes,
    adventureRunId: run.adventureRunId || null,
    questRunId: run.id,
    personId: issuerId
  })
  if (run.adventureRunId) completeAdventureRun(run.adventureRunId, "system", { renderAfter: false })
  saveState()
  render()
}

function requiredStepsConfirmed(runId = state.selectedAdventureRunId) {
  if (!adventureRunById(runId)) return false

  return stepEntries()
    .filter(([, step]) => step.meta.required)
    .every(([, step]) => hasConfirmedStep(step.id, runId))
}

function completeAdventureRun(runId = state.selectedAdventureRunId, issuerId = "system", options = {}) {
  const activeAdventureRun = adventureRunById(runId)
  if (!activeAdventureRun || activeAdventureRun.status === "completed" || !requiredStepsConfirmed(runId)) return false

  state.adventureCompleted = true
  state.selectedAdventureRunId = activeAdventureRun.id
  activeAdventureRun.status = "completed"
  state.worldState[PRIMARY_WORLD_METRIC_KEY] = completedAdventureRuns().length
  const confirmationId = `confirmation:${activeAdventureRun.id}:completed`
  if (!state.confirmations.some((item) => item.id === confirmationId)) {
    state.confirmations.push({
      id: confirmationId,
      subjectId: activeAdventureRun.id,
      subjectParticipantIds: participantIdsForAdventureRun(activeAdventureRun),
      issuerId,
      claim: `${activeAdventureRun.title}: ${scenario.adventure.resultBadgeTitle || scenario.adventure.title}.`,
      trustLevel: "server-confirmed",
      evidenceRefs: []
    })
  }

  const eventText = issuerId === "system"
    ? `${activeAdventureRun.title} ist abgeschlossen. Alle Pflichtaufgaben sind bestätigt.`
    : `${personName(issuerId)} hat den Abschluss von ${activeAdventureRun.title} bestätigt.`
  const metricLabel = primaryWorldMetric().label || "World State"
  addEvent(`${eventText} World State: ${metricLabel} = ${state.worldState[PRIMARY_WORLD_METRIC_KEY]}.`, {
    scopes: ["global", "adventure"],
    adventureRunId: activeAdventureRun.id,
    personId: scenario.roles[issuerId] ? issuerId : null,
    public: true
  })
  if (options.renderAfter !== false) {
    saveState()
    render()
  }
  return true
}

function syncAdventureCompletion() {
  let changed = false

  adventureRuns().forEach((run) => {
    if (run.status !== "completed" && requiredStepsConfirmed(run.id)) {
      changed = completeAdventureRun(run.id, "system", { renderAfter: false }) || changed
    }
  })

  if (changed) saveState()
}

function resetScenario() {
  state = normalizeState(clone(scenario.initialState))
  window.localStorage.removeItem(STORAGE_KEY)
  render()
}

function currentSimulationBundle() {
  return window.SIMULATION_BUNDLE || window.DEFAULT_SIMULATION_BUNDLE || null
}

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0)
}

function exportSimulationBundle() {
  const bundle = currentSimulationBundle()
  if (!bundle) return

  downloadJson(`${slug(bundle.title || bundle.id || "simulation")}-datenmodell.json`, bundle)
}

function exportSimulationState() {
  const bundle = currentSimulationBundle()
  const title = bundle?.title || scenario.title || "simulation"

  downloadJson(`${slug(title)}-stand.json`, {
    schemaVersion: "rlg-simulation-state@0.1",
    exportedAt: new Date().toISOString(),
    bundle,
    state
  })
}

function importedSimulationParts(payload) {
  const looksLikeBundle = payload?.schemaVersion === "rlg-simulation-bundle@0.1" ||
    (payload?.campaigns && payload?.gamePacks && payload?.initialState)
  const looksLikeState = payload?.selectedRole && Array.isArray(payload?.runs)

  return {
    bundle: payload?.bundle || payload?.simulationBundle || (looksLikeBundle ? payload : null),
    state: payload?.state || payload?.simulationState || (looksLikeState ? payload : null)
  }
}

function setImportStatus(text, kind = "neutral") {
  if (!importStatus) return

  importStatus.textContent = text
  importStatus.className = `debug-status is-${kind}`
}

async function importSimulationFile(file) {
  try {
    const payload = JSON.parse(await file.text())
    const imported = importedSimulationParts(payload)

    if (!imported.bundle && !imported.state) {
      throw new Error("Die Datei enthält weder ein SimulationBundle noch einen Simulationsstand.")
    }

    if (imported.bundle) {
      window.localStorage.setItem(BUNDLE_STORAGE_KEY, JSON.stringify(imported.bundle))
      if (imported.state) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(imported.state))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
      setImportStatus("Datenmodell importiert. Die Simulation wird neu geladen.", "success")
      window.setTimeout(() => window.location.reload(), 200)
      return
    }

    state = normalizeState(imported.state)
    saveState()
    setImportStatus("Simulationsstand importiert.", "success")
    render()
  } catch (error) {
    setImportStatus(error.message || "Import fehlgeschlagen.", "error")
  }
}

function resetImportedModel() {
  window.localStorage.removeItem(BUNDLE_STORAGE_KEY)
  window.localStorage.removeItem(STORAGE_KEY)
  window.location.reload()
}

function render() {
  syncAdventureCompletion()
  renderAppShell()
  renderQuestSurface()
  renderProfilePanel()
  renderWorldState()
  renderModelInfo()
  renderDebugVisibility()
}

function renderAppShell() {
  applyGamePackVisuals()
  appTitle.textContent = scenario.campaign?.title || scenario.title || "Real Life Game"
  renderContextMenu()
  renderMainTabs()
  renderUserMenu()
}

function renderContextMenu() {
  if (!contextSwitchOptions) return

  const bundle = currentSimulationBundle()
  const campaigns = Object.values(bundle?.campaigns || {})
  contextSwitchOptions.innerHTML = campaigns
    .map((campaign) => `
      <button class="context-switch-option ${campaign.id === scenario.campaign?.id ? "is-active" : ""}" type="button" data-campaign="${campaign.id}" ${campaign.id === scenario.campaign?.id ? "aria-current=\"true\"" : ""}>
        <span class="context-switch-title">${campaign.title}</span>
        <span class="context-switch-meta">${bundle?.gamePacks?.[campaign.gamePackId]?.title || "Game Pack"}</span>
      </button>
    `)
    .join("")
}

function renderMainTabs() {
  if (!mainTabs) return

  mainTabs.innerHTML = MAIN_TABS.map((tab) => `
    <button class="tab-button ${state.selectedTab === tab.id ? "is-active" : ""}" type="button" data-tab="${tab.id}" ${state.selectedTab === tab.id ? "aria-current=\"page\"" : ""}>
      ${tab.label}
    </button>
  `).join("")
}

function renderUserMenu() {
  const role = scenario.roles[state.selectedRole]
  currentUserAvatar.innerHTML = renderUserMenuAvatar(role)
  currentUserName.textContent = role.name
  currentUserRole.textContent = role.perspective
  userSwitchOptions.innerHTML = Object.entries(scenario.roles)
    .map(([roleId, item]) => `
      <button class="user-switch-option ${roleId === state.selectedRole ? "is-active" : ""}" type="button" data-role="${roleId}" ${roleId === state.selectedRole ? "aria-current=\"true\"" : ""}>
        ${renderUserOptionAvatar(item)}
        <span>
          <span class="user-switch-name">${item.name}</span>
          <span class="user-switch-role">${item.perspective}</span>
        </span>
      </button>
    `)
    .join("")
}

function renderUserMenuAvatar(role) {
  if (role.avatar) {
    return `<img class="user-menu-avatar" src="${role.avatar}" alt="" aria-hidden="true">`
  }

  return `<span class="user-menu-avatar user-menu-avatar-fallback" aria-hidden="true">${initials(role.name)}</span>`
}

function renderUserOptionAvatar(role) {
  if (role.avatar) {
    return `<img class="user-option-avatar" src="${role.avatar}" alt="" aria-hidden="true">`
  }

  return `<span class="user-option-avatar user-option-avatar-fallback" aria-hidden="true">${initials(role.name)}</span>`
}

function renderQuestSurface() {
  if (state.selectedTab === "map") {
    surfaceHeading.innerHTML = `<p class="eyebrow">Karte</p>`
    surfaceNav.innerHTML = ""
    questView.innerHTML = renderMapView()
    return
  }

  if (state.selectedTab === "calendar") {
    surfaceHeading.innerHTML = `<p class="eyebrow">Kalender</p>`
    surfaceNav.innerHTML = ""
    questView.innerHTML = renderCalendarView()
    return
  }

  const selectedStep = state.selectedStepId ? getStep(state.selectedStepId) : null
  const selectedStandaloneQuest = state.selectedStandaloneQuestKey ? getQuest(state.selectedStandaloneQuestKey) : null

  if (state.selectedView === "adventure") {
    surfaceHeading.innerHTML = `<button class="surface-heading-button" type="button" data-action="back-to-overview">← Aufgabenübersicht</button>`
    surfaceNav.innerHTML = ""
    questView.innerHTML = renderAdventureDetail()
    return
  }

  if (state.selectedView === "standalone" && selectedStandaloneQuest) {
    surfaceHeading.innerHTML = `<button class="surface-heading-button" type="button" data-action="back-to-overview">← Aufgabenübersicht</button>`
    surfaceNav.innerHTML = ""
    questView.innerHTML = renderStandaloneQuestDetail(state.selectedStandaloneQuestKey)
    return
  }

  if (state.selectedStepId && !selectedStep) {
    state.selectedView = "overview"
    state.selectedStepId = null
  }

  if (state.selectedView === "standalone" && !selectedStandaloneQuest) {
    state.selectedView = "overview"
    state.selectedStandaloneQuestKey = null
  }

  if (state.selectedView === "overview") {
    surfaceHeading.innerHTML = `<p class="eyebrow">Aufgabenübersicht</p>`
    surfaceNav.innerHTML = ""
    questView.innerHTML = renderQuestOverview()
  }
}

function renderProfilePanel() {
  profileView.innerHTML = `
    <section class="profile-region">
      <p class="eyebrow">Profil</p>
      <section class="panel profile-frame">
        ${renderPersonProfile(state.selectedRole)}
      </section>
    </section>
    ${renderCurrentWorkPanel(state.selectedRole)}
  `
}

function renderQuestOverview() {
  return `
    <div class="surface-stack">
      <div class="quest-grid">
        ${overviewItems().map((item) => item.markup).join("")}
      </div>
      ${renderTimelineBlock("Globale Timeline", globalTimelineEvents(), "Noch keine globalen Ereignisse.")}
    </div>
  `
}

function scheduledItems() {
  const items = []

  stepEntries().forEach(([, step]) => {
    const quest = getQuestForStep(step)
    items.push({
      id: `schedule:template:${step.id}`,
      kind: "Adventure-Vorlage",
      title: quest.title,
      contextTitle: scenario.adventure.title,
      status: "suggested",
      questKey: step.questKey,
      stepId: step.id,
      adventureRunId: "",
      location: stepLocation(step),
      schedule: stepSchedule(step),
      participantIds: []
    })
  })

  adventureRuns().forEach((run) => {
    stepEntries().forEach(([, step]) => {
      const quest = getQuestForStep(step)
      const runs = runsForStep(step.id, run.id)
      items.push({
        id: `schedule:${run.id}:${step.id}`,
        kind: "Adventure",
        title: quest.title,
        contextTitle: run.title,
        status: stepStatus(step.id, run.id),
        questKey: step.questKey,
        stepId: step.id,
        adventureRunId: run.id,
        location: stepLocation(step),
        schedule: stepSchedule(step),
        participantIds: runs.flatMap(runParticipantIds)
      })
    })
  })

  standaloneQuestEntries().forEach(([questKey]) => {
    const quest = getQuest(questKey)
    const runs = runsForStandaloneQuest(questKey)
    if (runs.length) {
      runs.forEach((run) => {
        items.push({
          id: `schedule:standalone:${run.id}`,
          kind: "QuestRun",
          title: quest.title,
          contextTitle: questRunContextLabel(run),
          status: run.status,
          questKey,
          runId: run.id,
          location: getLocation(run.locationId) || standaloneLocation(questKey),
          schedule: run,
          participantIds: runParticipantIds(run)
        })
      })
      return
    }

    items.push({
      id: `schedule:standalone:${questKey}`,
      kind: "Quest",
      title: quest.title,
      contextTitle: standaloneOfferLabel(getStandaloneOffer(questKey), questKey),
      status: standaloneQuestStatus(questKey),
      questKey,
      location: standaloneLocation(questKey),
      schedule: standaloneSchedule(questKey),
      participantIds: []
    })
  })

  return items.sort((a, b) => scheduleTimestamp(a.schedule) - scheduleTimestamp(b.schedule))
}

function scheduleItemActionAttrs(item) {
  const attrs = [`data-action="view-schedule-item"`]
  if (item.adventureRunId !== undefined) attrs.push(`data-adventure-run-id="${item.adventureRunId || ""}"`)
  if (item.stepId) attrs.push(`data-step="${item.stepId}"`)
  if (item.questKey && !item.stepId) attrs.push(`data-quest="${item.questKey}"`)
  if (item.runId) attrs.push(`data-run-id="${item.runId}"`)
  return attrs.join(" ")
}

function openScheduleItem(target) {
  if (target.dataset.quest) {
    selectStandaloneQuest(target.dataset.quest)
    return
  }

  selectAdventureStep(target.dataset.adventureRunId || null, target.dataset.step || null)
}

function renderMapView() {
  const items = scheduledItems()
  const locatedItems = items.filter((item) => item.location)
  const grouped = groupItemsByLocation(locatedItems)

  return `
    <div class="surface-stack">
      <section class="panel map-view">
        <div class="view-heading">
          <div>
            <h3>Karte</h3>
            <p class="meta">Aufgaben und Adventures mit Geodaten aus dem SimulationBundle.</p>
          </div>
          <span class="status suggested">${grouped.length} Orte</span>
        </div>
        <div class="map-layout">
          <div class="map-canvas" aria-label="Karte der Spielorte">
            <div class="map-grid-lines" aria-hidden="true"></div>
            ${grouped.map(renderMapMarker).join("")}
          </div>
          <div class="map-side-list">
            ${locatedItems.map((item) => renderScheduleItem(item, "map")).join("")}
          </div>
        </div>
      </section>
    </div>
  `
}

function groupItemsByLocation(items) {
  const groups = new Map()
  items.forEach((item) => {
    const id = item.location.id || item.location.label
    if (!groups.has(id)) {
      groups.set(id, {
        location: item.location,
        items: []
      })
    }

    groups.get(id).items.push(item)
  })

  return Array.from(groups.values())
}

function renderMapMarker(group) {
  const location = group.location
  const firstItem = group.items[0]
  const x = Number.isFinite(location.map?.x) ? location.map.x : 50
  const y = Number.isFinite(location.map?.y) ? location.map.y : 50
  const status = dominantStatus(group.items.map((item) => item.status))

  return `
    <button class="map-marker status-${visualStatus(status)}" type="button" style="left:${x}%;top:${y}%;" ${scheduleItemActionAttrs(firstItem)}>
      <span class="status-marker status-${visualStatus(status)}" aria-hidden="true"></span>
      <span>
        <strong>${location.label}</strong>
        <small>${group.items.length} Aufgaben</small>
      </span>
    </button>
  `
}

function dominantStatus(statuses) {
  if (statuses.some((status) => visualStatus(status) === "active")) return "accepted"
  if (statuses.some((status) => visualStatus(status) === "open")) return "suggested"
  if (statuses.some((status) => visualStatus(status) === "completed")) return "completed"
  if (statuses.some((status) => visualStatus(status) === "confirmed")) return "confirmed"
  return statuses[0] || "suggested"
}

function renderCalendarView() {
  const items = scheduledItems()
  const groups = groupItemsByDate(items)

  return `
    <div class="surface-stack">
      <section class="panel calendar-view">
        <div class="view-heading">
          <div>
            <h3>Kalender</h3>
            <p class="meta">Zeitfenster der Aufgaben aus dem SimulationBundle.</p>
          </div>
          <span class="status suggested">${items.length} Termine</span>
        </div>
        <div class="calendar-days">
          ${groups.map(renderCalendarDay).join("")}
        </div>
      </section>
    </div>
  `
}

function groupItemsByDate(items) {
  const groups = new Map()
  items.forEach((item) => {
    const key = scheduleDateKey(item.schedule)
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key).push(item)
  })

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, dayItems]) => ({
      key,
      label: key === "unscheduled" ? "Ohne Termin" : formatScheduleDate(dayItems[0].schedule),
      items: dayItems.sort((a, b) => scheduleTimestamp(a.schedule) - scheduleTimestamp(b.schedule))
    }))
}

function renderCalendarDay(group) {
  return `
    <section class="calendar-day">
      <h3>${group.label}</h3>
      <div class="calendar-item-list">
        ${group.items.map((item) => renderScheduleItem(item, "calendar")).join("")}
      </div>
    </section>
  `
}

function renderScheduleItem(item, variant) {
  return `
    <button class="schedule-item ${variant === "map" ? "is-map-item" : ""}" type="button" ${scheduleItemActionAttrs(item)}>
      <span class="schedule-time">${formatScheduleTime(item.schedule)}</span>
      <span class="schedule-main">
        <strong>${item.title}</strong>
        <span>${item.contextTitle} · ${item.kind}</span>
        ${item.location ? `<small>${item.location.label}${locationCoordinateText(item.location)}</small>` : ""}
      </span>
      <span class="schedule-side">
        ${renderStatusMarker(item.status)}
        ${renderAvatarGroup(item.participantIds)}
      </span>
    </button>
  `
}

function locationCoordinateText(location) {
  if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return ""
  return ` · ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
}

function runCountLabel(count) {
  return `${count} ${count === 1 ? "Termin" : "Termine"}`
}

function eventHasScope(event, scope) {
  return Array.isArray(event.scopes) && event.scopes.includes(scope)
}

function globalTimelineEvents() {
  return state.timeline.filter((event) => (
    eventHasScope(event, "global") &&
    (state.selectedRole !== "visitor" || event.public)
  ))
}

function adventureTimelineEvents() {
  const activeAdventureRun = adventureRun()
  if (!activeAdventureRun) return []

  return state.timeline.filter((event) => (
    eventHasScope(event, "adventure") &&
    event.adventureRunId === activeAdventureRun.id &&
    (state.selectedRole !== "visitor" || event.public)
  ))
}

function renderTimelineBlock(title, events, emptyText) {
  return `
    <details class="timeline-block collapse-panel">
      <summary class="collapse-summary">
        <span class="eyebrow">Timeline</span>
        <span class="collapse-count">${events.length} ${events.length === 1 ? "Eintrag" : "Einträge"}</span>
      </summary>
      ${events.length
        ? `<ol class="timeline">${events.map(renderTimelineEvent).join("")}</ol>`
        : `<p class="meta">${emptyText}</p>`}
    </details>
  `
}

function renderTimelineEvent(event) {
  const hasActor = Boolean(event.personId && scenario.roles[event.personId])

  return `
    <li class="timeline-event ${hasActor ? "has-actor" : "is-system"}">
      <span class="timeline-avatar-slot">
        ${hasActor ? renderTimelineAvatar(event.personId) : `<span class="timeline-system-marker" aria-hidden="true"></span>`}
      </span>
      <span class="timeline-event-body">
        <span class="timeline-event-copy">${event.text}</span>
        <span class="timeline-event-time">${formatRelativeTime(event.createdAt)}</span>
      </span>
    </li>
  `
}

function formatRelativeTime(createdAt) {
  const timestamp = Number(createdAt)
  if (!Number.isFinite(timestamp)) return "gerade eben"

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

function scheduleTimestamp(schedule) {
  const value = schedule?.startsAt || schedule?.date
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : 0
}

function formatScheduleDate(schedule) {
  const timestamp = scheduleTimestamp(schedule)
  if (!timestamp) return "ohne Datum"

  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(timestamp))
}

function formatScheduleTime(schedule) {
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

function scheduleDateKey(schedule) {
  const timestamp = scheduleTimestamp(schedule)
  if (!timestamp) return "unscheduled"

  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

function renderTimelineAvatar(personId) {
  const role = scenario.roles[personId]
  if (!role) return `<span class="timeline-avatar timeline-avatar-fallback" aria-hidden="true">?</span>`

  if (role.avatar) {
    return `<img class="timeline-avatar" src="${role.avatar}" alt="" aria-hidden="true">`
  }

  return `<span class="timeline-avatar timeline-avatar-fallback" aria-hidden="true">${initials(role.name)}</span>`
}

function renderAdventureTemplateCard() {
  const canJoin = isStudent(state.selectedRole) && canStartAdventure(state.selectedRole)

  return `
    <article class="quest-card adventure-card is-template" data-action="view-adventure" data-adventure-run-id="">
      <span class="quest-card-top">
        <span class="quest-card-main">
          ${renderItemImage(scenario.adventure.image, scenario.adventure.title, "item-image adventure-image")}
          <span>
            <span class="quest-title">${scenario.adventure.title}</span>
          </span>
        </span>
        ${renderStatusBadge("suggested", { context: "adventure", className: "card-status" })}
      </span>
      <span class="step-checklist">
        ${stepEntries().map(([, step]) => renderStepChecklistItem(step, null)).join("")}
      </span>
      <span class="quest-card-bottom">
        <span>${stepEntries().length} Aufgaben</span>
        <span>${adventureRuns().length} Gruppen</span>
      </span>
      ${canJoin
        ? `<div class="quest-card-actions">
            <div class="action-row">
              <button class="action-button" type="button" data-action="view-adventure" data-adventure-run-id="">${actionLabel("start", "Starten")}</button>
            </div>
          </div>`
        : ""}
    </article>
  `
}

function availableStepsForAdventureRun(run) {
  if (run.status === "completed") return []

  return stepEntries()
    .map(([, step]) => step)
    .filter((step) => stepHasParticipantSlot(step, run.id))
}

function ownOpenRunInAdventureRun(actorId, runId) {
  return runsForAdventureRun(runId).find((run) => (
    runHasParticipant(run, actorId) &&
    ["accepted", "in-progress"].includes(run.status)
  ))
}

function confirmableRunsForAdventureRun(runId) {
  return runsForAdventureRun(runId).filter((run) => run.status === "completed" && !hasConfirmation(run.id))
}

function renderAdventureRunCard(run) {
  const participants = participantIdsForAdventureRun(run)
  const freeSteps = availableStepsForAdventureRun(run)
  const actionMarkup = renderAdventureRunActions(run, participants)
  const isHistory = run.status === "completed"
  const stats = [
    actionMarkup ? "" : renderAvatarGroup(participants),
    isHistory ? renderStatusBadge(run.status, { context: "adventure", className: "card-status history-card-status" }) : "",
    freeSteps.length ? `${freeSteps.length} freie Aufgaben` : ""
  ].filter(Boolean)

  return `
    <article class="quest-card adventure-card is-active-run ${isHistory ? "is-history" : ""}" data-action="view-adventure" data-adventure-run-id="${run.id}">
      <span class="quest-card-top">
        <span class="quest-card-main">
          ${renderItemImage(scenario.adventure.image, run.title, "item-image adventure-image")}
          <span>
            <span class="quest-title">${run.title}</span>
          </span>
        </span>
        ${isHistory ? "" : renderStatusBadge(run.status, { context: "adventure", className: "card-status" })}
      </span>
      <span class="step-checklist">
        ${stepEntries().map(([, step]) => renderStepChecklistItem(step, run.id)).join("")}
      </span>
      <span class="quest-card-bottom">
        ${stats.map((item) => `<span>${item}</span>`).join("")}
      </span>
      ${actionMarkup}
    </article>
  `
}

function renderAdventureRunActions(run, participants = []) {
  if (isStudent(state.selectedRole)) return renderStudentAdventureRunActions(run, state.selectedRole, participants)
  if (canConfirm(state.selectedRole)) return renderMentorAdventureRunActions(run, participants)
  return ""
}

function renderAdventureActionRow(participants, buttonMarkup) {
  return `
    <div class="quest-card-actions">
      <div class="action-row">
        <span class="action-context">${renderAvatarGroup(participants)}</span>
        ${buttonMarkup}
      </div>
    </div>
  `
}

function renderStudentAdventureRunActions(run, actorId, participants = []) {
  const ownOpenRun = ownOpenRunInAdventureRun(actorId, run.id)
  const freeSteps = availableStepsForAdventureRun(run)
  const alreadyParticipant = participantIdsForAdventureRun(run).includes(actorId)

  if (ownOpenRun) {
    return renderAdventureActionRow(participants, `
      <button class="action-button" type="button" data-action="view-adventure" data-adventure-run-id="${run.id}">
        ${actionLabel("continue", "Weitermachen")}
      </button>
    `)
  }

  if (freeSteps.length) {
    return renderAdventureActionRow(participants, `
      <button class="action-button" type="button" data-action="view-adventure" data-adventure-run-id="${run.id}">
        ${alreadyParticipant ? actionLabel("continue", "Weitermachen") : actionLabel("join", "Mitmachen")}
      </button>
    `)
  }

  return ""
}

function renderMentorAdventureRunActions(run, participants = []) {
  const confirmableRuns = confirmableRunsForAdventureRun(run.id)
  if (!confirmableRuns.length) return ""

  return renderAdventureActionRow(participants, `
    <button class="action-button" type="button" data-action="view-adventure" data-adventure-run-id="${run.id}">${actionLabel("confirm", "Bestätigen")}</button>
  `)
}

function renderStepChecklistItem(step, runId = state.selectedAdventureRunId) {
  const status = runId ? stepStatus(step.id, runId) : "suggested"

  return `
    <span class="step-check ${runId ? "is-run-step" : ""}">
      ${renderStatusMarker(status)}
      <span>${getQuestForStep(step).title}</span>
    </span>
  `
}

function renderQuestCard(step) {
  const quest = getQuestForStep(step)
  const status = stepStatus(step.id)
  const runs = runsForStep(step.id)
  const assignedFallback = adventureRun() ? "" : "nur im Adventure"
  const ownRun = isStudent(state.selectedRole) ? findRun(state.selectedRole, step.id) : null
  const hasResultStatus = isHistoryStatus(status)
  const cardClass = [
    "quest-card",
    hasResultStatus ? "is-history" : "",
    ownRun && ["accepted", "in-progress"].includes(ownRun.status) ? "is-mine" : "",
    runs.length && !ownRun ? "is-occupied" : ""
  ].filter(Boolean).join(" ")

  return `
    <button class="${cardClass}" type="button" data-action="view-step" data-step="${step.id}">
      <span class="quest-card-top">
        <span class="quest-card-main">
          ${renderItemImage(quest.image, quest.title)}
          <span class="quest-card-copy">
            <span class="quest-title">${quest.title}</span>
          </span>
        </span>
        ${hasResultStatus ? "" : renderStatusBadge(status, { className: "card-status" })}
      </span>
      <span class="field-list card-field-list">${compactFieldChips(developmentFieldsForStep(step))}</span>
      <span class="quest-card-bottom">
        ${renderAssigneeLabel(runs, assignedFallback)}
        ${hasResultStatus ? renderStatusBadge(status, { className: "card-status result-card-status" }) : renderRequirementTag(step)}
      </span>
    </button>
  `
}

function renderStandaloneQuestCard(questKey, offer) {
  const quest = getQuest(questKey)
  const status = standaloneQuestStatus(questKey)
  const runs = runsForStandaloneQuest(questKey)
  const assignedRuns = runs.filter((run) => runParticipantIds(run).length)
  const ownRun = isStudent(state.selectedRole) ? findStandaloneRun(state.selectedRole, questKey) : null
  const hasResultStatus = isHistoryStatus(status)
  const cardClass = [
    "quest-card",
    "standalone-quest-card",
    hasResultStatus ? "is-history" : "",
    ownRun && ["accepted", "in-progress"].includes(ownRun.status) ? "is-mine" : "",
    assignedRuns.length && !ownRun ? "is-occupied" : ""
  ].filter(Boolean).join(" ")

  return `
    <article class="${cardClass}" data-action="view-standalone" data-quest="${questKey}">
      <span class="quest-card-top">
        <span class="quest-card-main">
          ${renderItemImage(quest.image, quest.title)}
          <span class="quest-card-copy">
            <span class="quest-title">${quest.title}</span>
          </span>
        </span>
        ${hasResultStatus ? "" : renderStatusBadge(status, { className: "card-status" })}
      </span>
      <span class="field-list card-field-list">${compactFieldChips(quest.developmentFields)}</span>
      <span class="quest-card-bottom">
        ${renderAssigneeLabel(assignedRuns, runs.length ? runCountLabel(runs.length) : "")}
        <span class="quest-card-bottom-meta">
          <span class="requirement-tag standalone-tag">${standaloneOfferLabel(offer, questKey)}</span>
          ${hasResultStatus ? renderStatusBadge(status, { className: "card-status result-card-status" }) : ""}
        </span>
      </span>
      ${renderStandaloneQuestActions(questKey)}
    </article>
  `
}

function renderStandaloneQuestActions(questKey, showDetails = true) {
  if (isStudent(state.selectedRole)) return renderStudentStandaloneQuestActions(questKey, state.selectedRole, showDetails)
  if (canConfirm(state.selectedRole)) return renderMentorStandaloneQuestActions(questKey, showDetails)
  return ""
}

function renderStudentStandaloneQuestActions(questKey, actorId, showDetails = true) {
  const run = findStandaloneRun(actorId, questKey)
  const nextOpenRun = nextOpenStandaloneRun(questKey)
  const openRuns = openStandaloneRuns(questKey)
  const assignedToOther = !run && standaloneCapacityReached(questKey)

  if (assignedToOther) {
    return ""
  }

  if (allowsMultipleStandaloneRuns(questKey) && nextOpenRun) {
    if (openRuns.length > 1) {
      return `
        <div class="standalone-actions">
          <div class="action-row">
            <button class="action-button" type="button" data-action="view-standalone" data-quest="${questKey}">
              Termin wählen
            </button>
          </div>
        </div>
      `
    }

    return `
      <div class="standalone-actions">
        <div class="action-row">
          <button class="action-button" type="button" data-action="accept-standalone" data-actor="${actorId}" data-quest="${questKey}" data-run-id="${nextOpenRun.id}">
            ${actionLabel("acceptQuest", "Aufgabe übernehmen")}
          </button>
        </div>
      </div>
    `
  }

  if (!run) {
    if (!nextOpenRun && isScheduledStandaloneQuest(questKey)) {
      return ""
    }

    if (openRuns.length > 1) {
      return `
        <div class="standalone-actions">
          <div class="action-row">
            <button class="action-button" type="button" data-action="view-standalone" data-quest="${questKey}">
              Termin wählen
            </button>
          </div>
        </div>
      `
    }

    return `
      <div class="standalone-actions">
        <div class="action-row">
          <button class="action-button" type="button" data-action="accept-standalone" data-actor="${actorId}" data-quest="${questKey}" ${nextOpenRun ? `data-run-id="${nextOpenRun.id}"` : ""}>
            ${actionLabel("acceptQuest", "Aufgabe übernehmen")}
          </button>
        </div>
      </div>
    `
  }

  if (["completed", "confirmed"].includes(run.status)) {
    return ""
  }

  const isStartBlocked = !runWindowStarted(run)
  return `
    <div class="standalone-actions">
      ${isStartBlocked ? `<p class="run-action-hint">${runStartHint(run)}</p>` : ""}
      <div class="action-row">
        <button class="action-button" type="button" data-action="complete-standalone" data-actor="${actorId}" data-quest="${questKey}" data-run-id="${run.id}" ${disabledAttr(isStartBlocked)}>
          ${actionLabel("completeQuest", "Fertig melden")}
        </button>
      </div>
    </div>
  `
}

function renderMentorStandaloneQuestActions(questKey, showDetails = true) {
  const runs = runsForStandaloneQuest(questKey)
    .filter((run) => run.status === "completed" && !hasConfirmation(run.id))
  if (!runs.length) return ""

  return `
    <div class="standalone-actions">
      ${runs.map((run) => renderMentorRunReview(run)).join("")}
    </div>
  `
}

function renderStandaloneQuestDetail(questKey) {
  const quest = getQuest(questKey)
  const offer = getStandaloneOffer(questKey)
  const runs = runsForStandaloneQuest(questKey)
  const status = standaloneQuestStatus(questKey)
  const periodText = isScheduledStandaloneQuest(questKey)
    ? recurrenceSummary(questKey)
    : offer.repeatable && offer.cadence === "daily"
    ? `${runCountLabel(runs.length)} geplant`
    : "Einmalige Aufgabe"
  const location = standaloneLocation(questKey)

  return `
    <div class="stack">
      <section class="panel adventure-detail standalone-detail">
        <div class="adventure-detail-header">
          <div class="detail-title-row adventure-title-row">
            ${renderItemImage(quest.image, quest.title)}
            <div>
              <h3>${quest.title}</h3>
              <p class="meta">${periodText} · ${location?.label || "ortsunabhängig"}</p>
            </div>
          </div>
          <div class="detail-tags">
            <span class="requirement-tag standalone-tag">Einzelaufgabe</span>
            ${renderStatusBadge(status)}
          </div>
        </div>
        ${renderRecurrenceControl(questKey)}
        <div class="work-step-list standalone-run-list">
          ${renderStandaloneDetailRows(questKey)}
        </div>
      </section>
    </div>
  `
}

function renderRecurrenceControl(questKey) {
  if (!isScheduledStandaloneQuest(questKey)) return ""

  const rule = recurrenceRuleForQuest(questKey)
  const editable = canConfirm(state.selectedRole)
  const selectedWeekdays = new Set(rule.weekdays)

  return `
    <section class="recurrence-panel" aria-label="Wiederholung">
      <div>
        <h4>Wiederholung</h4>
        <p class="meta">${recurrenceSummary(questKey)}</p>
      </div>
      ${editable
        ? `
          <div class="recurrence-controls">
            <div class="weekday-toggle-group" aria-label="Wochentage">
              ${WEEKDAY_OPTIONS.map((weekday) => `
                <label class="weekday-toggle ${selectedWeekdays.has(weekday.value) ? "is-selected" : ""}">
                  <input type="checkbox" data-recurrence-weekday="${weekday.value}" data-quest="${questKey}" ${selectedWeekdays.has(weekday.value) ? "checked" : ""}>
                  <span>${weekday.label}</span>
                </label>
              `).join("")}
            </div>
            <label class="recurrence-until">
              <span>Bis</span>
              <input type="date" data-recurrence-until data-quest="${questKey}" value="${rule.until || ""}">
            </label>
          </div>
        `
        : ""}
    </section>
  `
}

function renderStandaloneDetailRows(questKey) {
  const runs = runsForStandaloneQuest(questKey)

  if (!runs.length && isScheduledStandaloneQuest(questKey)) {
    return `
      <section class="work-step standalone-run-step">
        <div class="work-step-copy">
          <h4>Kein offener Termin</h4>
          <p class="meta">Die Wiederholung erzeugt aktuell keinen übernehmbaren Termin.</p>
        </div>
        <div class="work-step-tags">
          ${renderStatusBadge("suggested")}
          <span class="requirement-tag standalone-tag">${standaloneOfferLabel(getStandaloneOffer(questKey), questKey)}</span>
        </div>
        <div class="work-step-side">
          <div class="work-step-actions is-empty"></div>
        </div>
      </section>
    `
  }

  const rows = runs.length
    ? runs
    : [null]

  return rows
    .slice()
    .sort(compareStandaloneDetailRuns)
    .map((run) => renderStandaloneWorkRun(run, questKey))
    .join("")
}

function compareStandaloneDetailRuns(a, b) {
  if (!a || !b) return a ? -1 : b ? 1 : 0

  const order = {
    accepted: 0,
    "in-progress": 0,
    open: 1,
    completed: 2,
    confirmed: 3
  }

  return (order[a.status] ?? 4) - (order[b.status] ?? 4) ||
    questRunTimestamp(a) - questRunTimestamp(b)
}

function renderStandaloneWorkRun(run, questKey) {
  const quest = getQuest(questKey)
  const offer = getStandaloneOffer(questKey)
  const status = run?.status || "suggested"
  const participantIds = run ? runParticipantIds(run) : []
  const actionMarkup = renderStandaloneInlineAction(run, questKey)

  return `
    <section class="work-step standalone-run-step ${participantIds.length ? "is-assigned" : ""}">
      <div class="work-step-copy">
        <h4>${standaloneRunTitle(run, questKey)}</h4>
        <div class="field-list card-field-list">${compactFieldChips(quest.developmentFields)}</div>
        <p class="meta">${standaloneRunPlaceTimeLabel(run, questKey)}</p>
      </div>
      <div class="work-step-tags">
        ${renderStatusBadge(status)}
        <span class="requirement-tag standalone-tag">${standaloneOfferLabel(offer, questKey)}</span>
      </div>
      <div class="work-step-side">
        ${renderStandaloneRunAssignees(participantIds)}
        ${actionMarkup
          ? `<div class="work-step-actions standalone-run-actions">${actionMarkup}</div>`
          : `<div class="work-step-actions is-empty"></div>`}
      </div>
    </section>
  `
}

function standaloneRunTitle(run, questKey) {
  if (run?.startsAt) return formatScheduleDate(run)
  return getQuest(questKey).title
}

function standaloneRunPlaceTimeLabel(run, questKey) {
  const schedule = run || standaloneSchedule(questKey)
  const location = getLocation(run?.locationId) || standaloneLocation(questKey)
  const time = schedule?.startsAt ? formatScheduleTime(schedule) : "jederzeit"

  return [
    location?.label || "ortsunabhängig",
    time
  ].join(" · ")
}

function renderStandaloneRunAssignees(personIds) {
  if (!personIds.length) return ""

  return `
    <div class="work-step-assignees">
      <span class="work-step-assignee">
        ${renderAvatarGroup(personIds)}
        <span>${personIds.map(personName).join(", ")}</span>
      </span>
    </div>
  `
}

function renderStandaloneInlineAction(run, questKey) {
  if (run) return renderStandaloneRunAction(run, questKey)

  if (!isStudent(state.selectedRole) || standaloneCapacityReached(questKey)) return ""

  return `
    <button class="action-button compact-action" type="button" data-action="accept-standalone" data-actor="${state.selectedRole}" data-quest="${questKey}">
      ${actionLabel("acceptQuest", "Aufgabe übernehmen")}
    </button>
  `
}

function renderAdventureDetail() {
  const activeAdventureRun = adventureRun()
  const status = activeAdventureRun?.status || "suggested"
  const typeTag = activeAdventureRun ? "Adventure" : "Adventure-Vorlage"
  const subtitle = activeAdventureRun
    ? `Teilnehmende: ${participantIdsForAdventureRun(activeAdventureRun).map(personName).join(", ") || "noch offen"}`
    : "Übernimm eine Aufgabe, dann entsteht ein neues Adventure."

  return `
    <div class="stack">
      <section class="panel adventure-detail">
        <div class="adventure-detail-header">
          <div class="detail-title-row adventure-title-row">
            ${renderItemImage(scenario.adventure.image, scenario.adventure.title)}
            <div>
              <h3>${activeAdventureRun?.title || scenario.adventure.title}</h3>
              <p class="meta">${subtitle}</p>
            </div>
          </div>
          <div class="detail-tags">
            <span class="requirement-tag standalone-tag">${typeTag}</span>
            ${activeAdventureRun ? renderStatusBadge(status, { context: "adventure" }) : renderStatusBadge("suggested", { context: "adventure" })}
          </div>
        </div>
        <div class="work-step-list">
          ${stepEntries().map(([, step]) => renderAdventureWorkStep(step)).join("")}
        </div>
        ${activeAdventureRun ? renderTimelineBlock("Lokale Timeline", adventureTimelineEvents(), "Noch keine Ereignisse in diesem Adventure.") : ""}
      </section>
    </div>
  `
}

function renderAdventureWorkStep(step) {
  const quest = getQuestForStep(step)
  const runs = runsForStep(step.id)
  const status = stepStatus(step.id)
  const focused = state.selectedStepId === step.id
  const actionMarkup = adventureRun() || isStudent(state.selectedRole)
    ? renderInlineStepActions(step)
    : `<div class="work-step-actions is-empty"></div>`

  return `
    <section class="work-step ${focused ? "is-focused" : ""} ${runs.length ? "is-assigned" : ""}">
      ${renderItemImage(quest.image, quest.title, "item-image work-step-image")}
      <div class="work-step-copy">
        <h4>${quest.title}</h4>
        <div class="field-list card-field-list">${compactFieldChips(developmentFieldsForStep(step))}</div>
        <p class="meta">${stepPlaceTimeLabel(step)}</p>
      </div>
      <div class="work-step-tags">
        ${renderRequirementTag(step)}
      </div>
      <div class="work-step-side">
        ${renderWorkStepAssignees(runs)}
        ${actionMarkup}
      </div>
    </section>
  `
}

function stepPlaceTimeLabel(step) {
  const location = stepLocation(step)
  const schedule = stepSchedule(step)
  return [
    location?.label || "ortsunabhängig",
    schedule ? `${formatScheduleDate(schedule)} · ${formatScheduleTime(schedule)}` : "jederzeit"
  ].join(" · ")
}

function renderWorkStepAssignees(runs) {
  if (!runs.length) return ""

  return `
    <div class="work-step-assignees">
      ${runs.map((run) => `
        <span class="work-step-assignee">
          ${renderAvatarGroup(runParticipantIds(run))}
          <span>${runParticipantIds(run).map(personName).join(", ") || "frei"}</span>
        </span>
      `).join("")}
    </div>
  `
}

function renderInlineStepActions(step) {
  if (isStudent(state.selectedRole)) return renderInlineStudentStepActions(step, state.selectedRole)
  if (canConfirm(state.selectedRole)) return renderInlineMentorStepActions(step)
  return ""
}

function renderInlineStudentStepActions(step, actorId) {
  const activeAdventureRun = adventureRun()
  const run = findRun(actorId, step.id)
  const assignedToOther = Boolean(activeAdventureRun) && !run && !stepHasParticipantSlot(step, activeAdventureRun.id)
  const dependencyNote = activeAdventureRun ? dependencyText(step.id, activeAdventureRun.id) : ""
  const photo = ownFramePhoto(actorId)
  const canPostPhoto = step.questKey === "documentation" && run?.status === "accepted" && hasFrameResult() && !photo

  return `
    <div class="work-step-actions">
      ${dependencyNote ? `<p class="meta">${dependencyNote}</p>` : ""}
      ${renderStepActions(actorId, step, run, canPostPhoto, assignedToOther)}
      ${photo && step.questKey === "documentation" ? `<p class="meta">Gepostet: ${photo.caption}</p>` : ""}
    </div>
  `
}

function renderInlineMentorStepActions(step) {
  const runs = runsForStep(step.id)

  return `
    <div class="work-step-actions">
      ${runs.length
        ? runs.map((run) => renderMentorRunReview(run)).join("")
        : `<p class="meta">Noch kein bestätigbarer Beitrag.</p>`}
    </div>
  `
}

function renderStartAdventureAction() {
  if (!canStartAdventure(state.selectedRole)) {
    return ""
  }

  return `<p class="meta">Ein neues Adventure entsteht, sobald ein Schüler die erste Aufgabe übernimmt.</p>`
}

function renderQuestDetail(step) {
  const quest = getQuestForStep(step)
  const runs = runsForStep(step.id)
  const status = stepStatus(step.id)
  const policy = quest.evidencePolicy

  return `
    <div class="stack">
      <div class="detail-toolbar">
        <button class="ghost-button compact" type="button" data-action="back-to-overview">← Übersicht</button>
      </div>
      <article class="item quest-detail">
        <div class="item-header">
          <div>
            <div class="detail-title-row">
              ${renderItemImage(quest.image, quest.title)}
              <h3>${quest.title}</h3>
            </div>
            <p class="meta">Aufgabe: ${step.id}</p>
          </div>
          ${renderStatusBadge(status)}
        </div>
        <div class="field-list">${fieldChips(developmentFieldsForStep(step))}</div>
        <div class="detail-grid">
          <p class="meta">Rolle: ${step.meta.roleId}</p>
          <p class="meta">Kapazität: ${step.meta.capacity}</p>
          <p class="meta">Typ: ${step.meta.required ? "required" : "optional"}</p>
          <p class="meta">Evidence: ${policy.required ? "erforderlich" : "optional"} · ${policy.acceptedTypes.join(", ")}</p>
        </div>
        <div class="inline-link-row">
          <span class="meta">Teil von: ${adventureRun()?.title || scenario.adventure.title}</span>
          <button class="ghost-button compact" type="button" data-action="view-adventure">Adventure öffnen</button>
        </div>
        ${runs.length ? runs.map((run) => renderRunSummary(run)).join("") : `<p class="meta">Noch kein Beitrag zu dieser Aufgabe.</p>`}
      </article>
      ${renderQuestDetailActions(step)}
    </div>
  `
}

function renderRunSummary(run) {
  return `
    <div class="run-summary">
      <div>
        <strong>${runParticipantIds(run).map(personName).join(", ") || "Noch frei"}</strong>
        <p class="meta">${run.id}</p>
      </div>
      ${renderStatusBadge(run.status)}
    </div>
  `
}

function renderStandaloneRunAction(run, questKey) {
  if (isStudent(state.selectedRole)) {
    const ownRun = runHasParticipant(run, state.selectedRole)
    const photo = ownRunPhoto(state.selectedRole, run.id)
    if (run.status === "open") {
      return `<button class="action-button compact-action" type="button" data-action="accept-standalone" data-actor="${state.selectedRole}" data-quest="${questKey}" data-run-id="${run.id}">${actionLabel("acceptQuest", "Aufgabe übernehmen")}</button>`
    }
    if (ownRun && run.status === "accepted") {
      const isStartBlocked = !runWindowStarted(run)
      return `
        ${isStartBlocked ? `<span class="run-action-hint">${runStartHint(run)}</span>` : ""}
        <button class="action-button compact-action" type="button" data-action="complete-standalone" data-actor="${state.selectedRole}" data-quest="${questKey}" data-run-id="${run.id}" ${disabledAttr(isStartBlocked)}>${actionLabel("completeQuest", "Fertig melden")}</button>
        ${photo ? "" : `<button class="action-button secondary compact-action" type="button" data-action="post-run-photo" data-actor="${state.selectedRole}" data-run-id="${run.id}">${actionLabel("postPhoto", "Foto posten")}</button>`}
      `
    }
    if (ownRun && run.status === "completed" && !photo) {
      return `<button class="action-button secondary compact-action" type="button" data-action="post-run-photo" data-actor="${state.selectedRole}" data-run-id="${run.id}">${actionLabel("postPhoto", "Foto posten")}</button>`
    }
  }

  if (canConfirm(state.selectedRole) && run.status === "completed" && !hasConfirmation(run.id)) {
    return `<button class="action-button compact-action" type="button" data-action="confirm-run" data-run-id="${run.id}">${actionLabel("confirm", "Bestätigen")}</button>`
  }

  return ""
}

function renderQuestDetailActions(step) {
  if (isStudent(state.selectedRole)) return renderStudentQuestDetail(step, state.selectedRole)
  if (canConfirm(state.selectedRole)) return renderMentorQuestDetail(step)
  return renderVisitorQuestDetail()
}

function renderStudentQuestDetail(step, actorId) {
  if (!adventureRun()) {
    return `
      <article class="item">
        <div class="item-header">
          <div>
            <h3>Noch kein aktives Adventure</h3>
            <p class="meta">Diese Aufgabe kann erst übernommen werden, wenn das Adventure gestartet wurde.</p>
          </div>
        </div>
        ${canStartAdventure(actorId) ? renderStartAdventureAction() : ""}
      </article>
    `
  }

  const run = findRun(actorId, step.id)
  const assignedToOther = !run && !stepHasParticipantSlot(step)
  const blocked = run?.status === "accepted" && !dependenciesMet(step.id)
  const dependencyNote = dependencyText(step.id)
  const photo = ownFramePhoto(actorId)
  const canPostPhoto = step.questKey === "documentation" && run && ["accepted", "completed"].includes(run.status) && hasFrameResult() && !photo

  return `
    <article class="item">
      <div class="item-header">
        <div>
          <h3>Meine Aktion</h3>
          ${run?.completion ? `<p class="meta">Self-Claim: ${run.completion.claim}</p>` : `<p class="meta">Noch nicht fertig gemeldet.</p>`}
        </div>
        ${renderStatusBadge(assignedToOther || blocked ? "blocked" : run?.status || "suggested", {
          label: assignedToOther ? "belegt" : undefined
        })}
      </div>
      ${dependencyNote ? `<p class="meta">${dependencyNote}</p>` : ""}
      ${renderStepActions(actorId, step, run, canPostPhoto, assignedToOther)}
      ${photo && step.questKey === "documentation" ? `<p class="meta">Gepostet: ${photo.caption}</p>` : ""}
    </article>
  `
}

function renderMentorQuestDetail(step) {
  if (!adventureRun()) {
    return `
      <article class="item">
        <div class="item-header">
          <div>
            <h3>Noch kein aktives Adventure</h3>
            <p class="meta">Der Mentor kann Beiträge bestätigen, sobald Schüler Aufgaben fertig gemeldet haben.</p>
          </div>
        </div>
      </article>
    `
  }

  const runs = runsForStep(step.id)

  return `
    <article class="item">
      <div class="item-header">
        <div>
          <h3>Beiträge bestätigen</h3>
          <p class="meta">${runs.length} Beiträge in dieser Aufgabe</p>
        </div>
      </div>
      ${runs.length
        ? runs.map((run) => renderMentorRunReview(run)).join("")
        : `<p class="meta">Noch kein bestätigbarer Beitrag.</p>`}
    </article>
  `
}

function renderVisitorQuestDetail() {
  return `
    <article class="item">
      <div class="item-header">
        <div>
          <h3>Öffentliche Sicht</h3>
          <p class="meta">Private Beiträge, Evidence und Schülerprofile bleiben verborgen.</p>
        </div>
      </div>
    </article>
  `
}

function renderPersonProfile(personId) {
  const role = scenario.roles[personId]
  const runs = runsForPerson(personId)
  const confirmedRuns = confirmedRunsForPerson(personId)
  const touches = developmentTouchesForPerson(personId)
  const issuedConfirmations = state.confirmations.filter((item) => item.issuerId === personId)
  const badges = badgesForPerson(personId)

  if (personId === "visitor") {
    return `
      <article class="profile-card">
        <div class="profile-top">
          <div class="profile-identity">
              ${renderAvatar(role)}
              <div>
                <h3>${role.name}</h3>
                <p class="meta">${role.perspective}</p>
              </div>
          </div>
          <span class="status suggested">${role.perspective}</span>
        </div>
        <p class="meta">Sichtbar: freigegebener World State. Nicht sichtbar: private Beiträge, Evidence und Entwicklungskarten der Beteiligten.</p>
      </article>
    `
  }

  return `
    <article class="profile-card">
      <div class="profile-top">
        <div class="profile-identity">
            ${renderAvatar(role)}
            <div>
              <h3>${role.name}</h3>
              <p class="meta">${role.perspective}</p>
            </div>
        </div>
        <span class="status ${isStudent(personId) ? "accepted" : "suggested"}">${role.perspective}</span>
      </div>
      <div class="profile-stats">
        <div>
          <strong>${runs.length}</strong>
          <span>Aufgaben</span>
        </div>
        <div>
          <strong>${badges.length}</strong>
          <span>Badges</span>
        </div>
        <div>
          <strong>${isStudent(personId) ? touches.length : issuedConfirmations.length}</strong>
          <span>${isStudent(personId) ? "Felder" : "Confirmations"}</span>
        </div>
      </div>
      ${isStudent(personId) ? renderStudentProfileDetails(badges, touches, runs) : renderRoleProfileDetails(personId, issuedConfirmations)}
    </article>
  `
}

function renderStudentProfileDetails(badges, touches, runs) {
  return `
    <div class="profile-section">
      <h4>Badges</h4>
      ${badges.length
        ? `<div class="badge-grid">${badges.map(renderProfileBadge).join("")}</div>`
        : `<p class="meta">Noch keine Badges.</p>`}
    </div>
    <div class="profile-section">
      <h4>Entwicklungskarte</h4>
      ${touches.length
        ? `<div class="field-list">${touches.map(renderDevelopmentFieldTouch).join("")}</div>`
        : `<p class="meta">Noch keine bestätigten Feld-Berührungen.</p>`}
    </div>
    <div class="profile-section">
      ${renderQuestLogBlock(runs)}
    </div>
  `
}

function renderCurrentWorkPanel(personId) {
  if (!isStudent(personId)) return ""

  const openRuns = runsForPerson(personId).filter((run) => ["accepted", "in-progress"].includes(run.status))
  if (!openRuns.length) return ""
  const label = openRuns.length === 1 ? "Aktuelle Aufgabe" : "Aktuelle Aufgaben"

  return `
    <section class="current-work-region">
      <p class="eyebrow">${label}</p>
      <section class="panel current-work-panel">
        <div class="open-work-list">
          ${openRuns.map(renderOpenWorkItem).join("")}
        </div>
      </section>
    </section>
  `
}

function renderOpenWorkItem(run) {
  const quest = getQuest(run.questKey)
  const action = run.adventureRunId
    ? `data-action="view-adventure" data-adventure-run-id="${run.adventureRunId}"`
    : `data-action="view-standalone" data-quest="${run.questKey}"`

  return `
    <button class="open-work-item" type="button" ${action}>
      ${renderItemImage(quest.image, quest.title, "open-work-image")}
      <span class="open-work-copy">
        <strong>${quest.title}</strong>
        <span>${questRunContextLabel(run)}</span>
      </span>
      <span class="open-work-cta">${actionLabel("continue", "Weitermachen")}</span>
    </button>
  `
}

function renderQuestLogBlock(runs) {
  const sortedRuns = runs.slice().sort((a, b) => questRunTimestamp(b) - questRunTimestamp(a))

  return `
    <details class="collapse-panel quest-log-panel">
      <summary class="collapse-summary">
        <span class="collapse-title">Aufgabenlog</span>
        <span class="collapse-count">${runs.length} ${runs.length === 1 ? "Eintrag" : "Einträge"}</span>
      </summary>
      ${sortedRuns.length
        ? `<ol class="quest-log">${sortedRuns.map(renderQuestLogEntry).join("")}</ol>`
        : `<p class="meta">Noch keine Aufgaben.</p>`}
    </details>
  `
}

function questRunTimestamp(run) {
  return timestampValue(run.confirmedAt) ||
    timestampValue(run.completedAt) ||
    timestampValue(run.startsAt) ||
    timestampValue(run.createdAt) ||
    0
}

function questRunContextLabel(run) {
  if (run.adventureRunId) {
    return adventureRunById(run.adventureRunId)?.title || "Adventure"
  }

  const offer = getStandaloneOffer(run.questKey)
  if (offer?.repeatable && offer.cadence === "daily") return `Einzelaufgabe · ${run.periodKey || todayKey()}`
  return "Einzelaufgabe"
}

function renderQuestLogEntry(run) {
  const quest = getQuest(run.questKey)

  return `
    <li class="quest-log-entry">
      <span class="quest-log-icon-slot">
        ${renderItemImage(quest.image, quest.title, "quest-log-image")}
      </span>
      <span class="quest-log-body">
        <span class="quest-log-copy">
          <strong>${quest.title}</strong>
          <span>${statusLabel(run.status)} · ${questRunContextLabel(run)}</span>
        </span>
        <span class="quest-log-time">${formatRelativeTime(questRunTimestamp(run))}</span>
      </span>
    </li>
  `
}

function renderDevelopmentFieldTouch(touch) {
  return `
    <span class="field field-with-count">
      <span>${touch.field}</span>
      ${touch.count > 1 ? `<span class="field-count">${touch.count}</span>` : ""}
    </span>
  `
}

function renderProfileBadge(badge) {
  return `
    <div class="profile-badge">
      <span class="badge-image-wrap">
        ${renderItemImage(badge.image, badge.title, "badge-image")}
        ${badge.count > 1 ? `<span class="badge-count">${badge.count}</span>` : ""}
      </span>
      <span class="badge-title">${badge.title}</span>
    </div>
  `
}

function renderRoleProfileDetails(personId, issuedConfirmations) {
  return `
    <div class="profile-section">
      <h4>Ausgestellte Confirmations</h4>
      ${issuedConfirmations.length
        ? issuedConfirmations.map((item) => `<p class="meta">${item.claim}</p>`).join("")
        : `<p class="meta">Noch keine Confirmations.</p>`}
    </div>
  `
}

function peerRunStatusText(run) {
  return compactStatusLabel(run.status)
}

function renderPeerRunStatus(run) {
  return `
    <div class="peer-run-status is-${visualStatus(run.status)}">
      ${renderStatusMarker(run.status, "is-small")}
      <span>${peerRunStatusText(run)}</span>
    </div>
  `
}

function renderStepActions(actorId, step, run, canPostPhoto, assignedToOther) {
  if (assignedToOther) {
    const peerRuns = runsForStep(step.id).filter((item) => !runHasParticipant(item, actorId))

    return `
      <div class="peer-run-list">
        ${peerRuns.map(renderPeerRunStatus).join("")}
      </div>
    `
  }

  if (!run) {
    const buttonLabel = joinableRunForStep(actorId, step)
      ? actionLabel("join", "Mitmachen")
      : actionLabel("acceptQuest", "Aufgabe übernehmen")

    return `
      <div class="action-row">
        <button class="action-button" type="button" data-action="accept-step" data-actor="${actorId}" data-step="${step.id}">
          ${buttonLabel}
        </button>
      </div>
    `
  }

  if (["completed", "confirmed"].includes(run.status)) {
    return `
      <div class="completion-indicator is-${visualStatus(run.status)}">
        ${renderStatusMarker(run.status)}
        <span>${statusLabel(run.status)}</span>
      </div>
    `
  }

  const policy = participationPolicyForStep(step)
  const isStartBlocked = !runWindowStarted(run)
  const completeDisabled = run.status !== "accepted" || !runHasEnoughParticipants(run, policy) || !dependenciesMet(step.id) || isStartBlocked
  const participantHint = run.status === "accepted" && !runHasEnoughParticipants(run, policy)
    ? `<p class="meta">Wartet auf ${policy.minParticipants - runParticipantIds(run).length} weitere ${policy.minParticipants - runParticipantIds(run).length === 1 ? "Person" : "Personen"}.</p>`
    : ""
  const startHint = run.status === "accepted" && isStartBlocked
    ? `<p class="meta">${runStartHint(run)}</p>`
    : ""
  const photoButton = step.questKey === "documentation"
    ? `<button class="action-button secondary" type="button" data-action="post-frame-photo" data-actor="${actorId}" ${disabledAttr(!canPostPhoto)}>${actionLabel("postPhoto", "Foto posten")}</button>`
    : ""

  return `
    ${participantHint}
    ${startHint}
    <div class="action-row">
      <button class="action-button" type="button" data-action="complete-step" data-actor="${actorId}" data-step="${step.id}" ${disabledAttr(completeDisabled)}>
        ${actionLabel("completeQuest", "Fertig melden")}
      </button>
      ${photoButton}
    </div>
  `
}

function renderMentorRunReview(run) {
  const evidence = evidenceForRun(run)
  const canConfirm = run.status === "completed" && !hasConfirmation(run.id)
  const evidenceText = evidence.length
    ? (evidence.some((item) => item.type === "photo") ? "Foto vorhanden" : "Beleg vorhanden")
    : (canConfirm ? "ohne Beleg" : "")

  return `
    <div class="review-row">
      <div class="review-main">
        <div class="peer-run-status is-${visualStatus(run.status)}">
          ${renderStatusMarker(run.status, "is-small")}
          <span>${compactStatusLabel(run.status)}</span>
        </div>
        ${evidenceText ? `<p class="review-note">${evidenceText}</p>` : ""}
      </div>
      ${canConfirm
        ? `<button class="action-button" type="button" data-action="confirm-run" data-run-id="${run.id}">${actionLabel("confirm", "Bestätigen")}</button>`
        : ""}
    </div>
  `
}

function renderWorldState() {
  const activeAdventureRun = adventureRun()
  const builtCount = completedAdventureRuns().length
  const raisedBedMetric = primaryWorldMetric()
  const metricLabel = raisedBedMetric.label || "Schulhof-Hochbeete gebaut"
  state.worldState[PRIMARY_WORLD_METRIC_KEY] = builtCount
  state.adventureCompleted = builtCount > 0
  const width = Math.min(100, (builtCount / WORLD_TARGET) * 100)
  const requiredSteps = stepEntries().filter(([, step]) => step.meta.required)

  if (state.selectedRole === "visitor") {
    worldStateView.innerHTML = `
      <div class="stack">
        <div class="item">
          <div class="item-header">
            <div>
              <h3>Öffentlich sichtbarer World State</h3>
              <p class="meta">${metricLabel}: ${builtCount} / ${WORLD_TARGET}</p>
            </div>
            ${renderStatusBadge(builtCount ? "confirmed" : "suggested", {
              label: builtCount ? "sichtbar" : "leer"
            })}
          </div>
        </div>
      </div>
    `
    return
  }

  worldStateView.innerHTML = `
    <div class="stack">
      <div class="world-meter">
        <h3>${metricLabel}: ${builtCount} / ${WORLD_TARGET}</h3>
        <div class="meter-track" aria-hidden="true"><div class="meter-fill" style="width:${width}%"></div></div>
        <p class="meta">Ein Hochbeet zählt erst, wenn alle Pflichtaufgaben im jeweiligen Adventure mindestens einen bestätigten Beitrag haben.</p>
      </div>
      <div class="flow">
        ${activeAdventureRun
          ? requiredSteps.map(([, step]) => renderNode(getQuestForStep(step).title, stepStatus(step.id))).join("")
          : renderNode("Adventure wählen", "suggested")}
        ${renderNode("World State", builtCount ? "confirmed" : "in-progress")}
      </div>
    </div>
  `
}

function renderModelInfo() {
  if (!modelInfoView) return

  const bundle = currentSimulationBundle()
  const isImported = Boolean(window.localStorage.getItem(BUNDLE_STORAGE_KEY))
  const campaignTitle = scenario.campaign?.title || "Keine Kampagne"
  const gamePackTitle = scenario.gamePack?.title || "Kein Game Pack"
  const questCount = Object.keys(scenario.quests || {}).length
  const adventureStepCount = stepEntries().length

  modelInfoView.innerHTML = `
    <div class="debug-model-info">
      <div>
        <strong>${bundle?.title || scenario.title || "Simulation"}</strong>
        <span>${isImported ? "importiertes Datenmodell" : "Standard-Datenmodell"}</span>
      </div>
      <div>
        <strong>${campaignTitle}</strong>
        <span>Kampagne</span>
      </div>
      <div>
        <strong>${gamePackTitle}</strong>
        <span>Game Pack</span>
      </div>
      <div>
        <strong>${questCount} Aufgaben · ${adventureStepCount} Adventure-Aufgaben</strong>
        <span>Datenumfang</span>
      </div>
    </div>
  `
}

function renderDebugVisibility() {
  debugPanel.classList.toggle("is-hidden", !debugVisible)
  debugToggle.textContent = debugVisible ? "Debug ausblenden" : "Debug anzeigen"
  debugToggle.setAttribute("aria-expanded", String(debugVisible))
}

function renderNode(label, status) {
  return `
    <div class="node">
      <strong>${label}</strong>
      ${renderStatusBadge(status)}
    </div>
  `
}

document.addEventListener("click", (event) => {
  const tabTarget = event.target.closest("[data-tab]")
  if (tabTarget) {
    setMainTab(tabTarget.dataset.tab)
    return
  }

  const campaignTarget = event.target.closest("[data-campaign]")
  if (campaignTarget) {
    selectCampaign(campaignTarget.dataset.campaign)
    return
  }

  const roleTarget = event.target.closest("[data-role]")
  if (roleTarget) {
    setRole(roleTarget.dataset.role)
    return
  }

  const target = event.target.closest("[data-action]")
  if (!target) return

  const action = target.dataset.action
  if (action === "accept-step") acceptStep(target.dataset.actor, target.dataset.step)
  if (action === "complete-step") completeStep(target.dataset.actor, target.dataset.step)
  if (action === "accept-standalone") acceptStandaloneQuest(target.dataset.actor, target.dataset.quest, target.dataset.runId || null)
  if (action === "complete-standalone") completeStandaloneQuest(target.dataset.actor, target.dataset.quest, target.dataset.runId || null)
  if (action === "post-frame-photo") postFramePhoto(target.dataset.actor)
  if (action === "post-run-photo") postRunPhoto(target.dataset.actor, target.dataset.runId)
  if (action === "confirm-run" && canConfirm(state.selectedRole)) confirmRun(target.dataset.runId, state.selectedRole)
  if (action === "view-adventure") selectAdventure(target.dataset.adventureRunId)
  if (action === "view-standalone") selectStandaloneQuest(target.dataset.quest)
  if (action === "view-step") selectStep(target.dataset.step)
  if (action === "view-schedule-item") openScheduleItem(target)
  if (action === "back-to-overview") showQuestOverview()
  if (action === "toggle-debug") {
    debugVisible = !debugVisible
    renderDebugVisibility()
  }
})

document.addEventListener("change", (event) => {
  const weekdayTarget = event.target.closest("[data-recurrence-weekday]")
  if (weekdayTarget) {
    setRecurrenceWeekday(
      weekdayTarget.dataset.quest,
      Number(weekdayTarget.dataset.recurrenceWeekday),
      weekdayTarget.checked
    )
    return
  }

  const untilTarget = event.target.closest("[data-recurrence-until]")
  if (untilTarget) {
    setRecurrenceUntil(untilTarget.dataset.quest, untilTarget.value)
  }
})

resetButton.addEventListener("click", resetScenario)
exportBundleButton?.addEventListener("click", exportSimulationBundle)
exportStateButton?.addEventListener("click", exportSimulationState)
importSimulationButton?.addEventListener("click", () => importSimulationInput?.click())
importSimulationInput?.addEventListener("change", (event) => {
  const file = event.target.files?.[0]
  if (file) importSimulationFile(file)
  event.target.value = ""
})
resetModelButton?.addEventListener("click", resetImportedModel)

render()
window.setInterval(render, 60 * 1000)
