import * as domain from "../domain"
import type { Model } from "../domain"
import { AvatarGroup, FieldChips, ItemImage, RequirementTag, StatusBadge, StatusMarker } from "../ui/primitives"
import { CalendarView, MapView } from "./ScheduleViews"
import { TimelineBlock } from "./Timeline"

const {
  scenario,
  personName,
  isStudent,
  canConfirm,
  actionLabel,
  visualStatus,
  statusLabel,
  isHistoryStatus,
  formatScheduleDate,
  formatScheduleLabel,
  adventureRunTitle,
  runSubtitle,
  adventureEntries,
  getAdventure,
  adventureRunsForAdventure,
  getQuest,
  standaloneQuestEntries,
  stepEntries,
  getQuestForStep,
  getStandaloneOffer,
  standaloneLocation,
  recurrenceSummary,
  runParticipantIds,
  runHasParticipant,
  runHasParticipantSlot,
  adventureRun,
  runWindowStarted,
  runStartHint,
  runsForStep,
  findRun,
  participantIdsForAdventureRun,
  participationPolicyForStep,
  participationPolicyForStandalone,
  runHasEnoughParticipants,
  runsForAdventureRun,
  joinableRunForStep,
  stepHasParticipantSlot,
  isScheduledStandaloneQuest,
  runsForStandaloneQuest,
  openStandaloneRuns,
  nextOpenStandaloneRun,
  findStandaloneRun,
  standaloneCapacityReached,
  hasConfirmation,
  evidenceForRun,
  ownRunPhoto,
  ownFramePhoto,
  developmentFieldsForStep,
  standaloneQuestStatus,
  isStandaloneQuestHistory,
  standaloneOfferLabel,
  dependenciesMet,
  dependencyText,
  questRunTimestamp,
  standaloneRunPlaceTimeLabel,
  developmentFieldsForAdventure,
  freeStepCount,
  scheduleItems
} = domain

export function QuestSurface(props: any) {
  const { state } = props
  if (state.selectedTab === "map") return <MapView {...props} />
  if (state.selectedTab === "calendar") return <CalendarView {...props} />
  if (state.selectedView === "adventure") return <AdventureDetail {...props} />
  if (state.selectedView === "standalone") return <StandaloneQuestDetail {...props} />
  return <QuestOverview {...props} />
}

export function QuestOverview(props: any) {
  const { state } = props
  const sections: Record<string, any[]> = {
    turn: [],
    planned: [],
    participating: [],
    discovery: [],
    others: [],
    history: []
  }

  adventureEntries().forEach(([adventureId]: any) => {
    const runs = adventureRunsForAdventure(state, adventureId)
    const catalogItem = <AdventureCatalogCard key={`catalog:${adventureId}`} adventureId={adventureId} {...props} />
    sections.discovery.push(catalogItem)

    runs.forEach((run: any) => {
      const markup = <AdventureRunCard key={run.id} run={run} {...props} />
      const participants = participantIdsForAdventureRun(state, run)
      const isMine = participants.includes(state.selectedRole)
      if (isHistoryStatus(run.status)) {
        sections.history.push(markup)
        return
      }

      if (isMine) {
        nextActionsForAdventureRun(state, run, props).forEach((item) => sections.turn.push(item))
        sections.participating.push(markup)
        return
      }

      if (freeStepCount(state, run.id) > 0 && isStudent(state.selectedRole)) sections.discovery.push(markup)
      else sections.others.push(markup)
    })
  })

  standaloneQuestEntries().forEach(([questKey, offer]: any) => {
    const questRuns = runsForStandaloneQuest(state, questKey)
    const ownRuns = isStudent(state.selectedRole)
      ? questRuns.filter((run: any) => runHasParticipant(run, state.selectedRole) && ["accepted", "in-progress"].includes(run.status))
      : []
    const markup = <StandaloneQuestCard key={questKey} questKey={questKey} offer={offer} {...props} />
    if (isStandaloneQuestHistory(state, questKey)) sections.history.push(markup)
    else if (ownRuns.length) {
      const sortedOwnRuns = ownRuns.slice().sort((a: any, b: any) => questRunTimestamp(a) - questRunTimestamp(b))
      const urgentRuns = sortedOwnRuns.filter(isRunDueForOverview)
      const plannedRuns = sortedOwnRuns.filter((run: any) => !isRunDueForOverview(run))

      if (urgentRuns.length === 1) {
        sections.turn.push(<NextActionCard key={`next:${urgentRuns[0].id}`} mode="own-run" run={urgentRuns[0]} {...props} />)
      } else if (urgentRuns.length > 1) {
        sections.turn.push(<StandaloneRunGroupCard key={`next-group:${questKey}`} questKey={questKey} runs={urgentRuns} mode="urgent" {...props} />)
      }

      if (plannedRuns.length) {
        sections.planned.push(<StandaloneRunGroupCard key={`planned:${questKey}`} questKey={questKey} runs={plannedRuns} mode="planned" {...props} />)
      }
    } else if (canActOnStandaloneQuest(state, questKey)) sections.discovery.push(markup)
    else if (questRuns.some((run: any) => runParticipantIds(run).length && !isHistoryStatus(run.status))) sections.others.push(markup)
    else sections.discovery.push(markup)
  })

  const prioritySectionsVisible = sections.turn.length || sections.planned.length || sections.participating.length
  const lowerSectionsVisible = sections.discovery.length || sections.others.length || sections.history.length

  return (
    <div className="surface-stack">
      <div className="overview-main">
        {sections.turn.length && sections.planned.length ? (
          <div className="overview-priority-row">
            <OverviewSection eyebrow="Höchste Priorität" title="Du bist dran" items={sections.turn} variant="priority" />
            <OverviewSection eyebrow="Geplant" title="Demnächst" items={sections.planned} variant="planned" />
          </div>
        ) : (
          <>
            <OverviewSection eyebrow="Höchste Priorität" title="Du bist dran" items={sections.turn} variant="priority" />
            <OverviewSection eyebrow="Geplant" title="Demnächst" items={sections.planned} variant="planned" />
          </>
        )}
        <OverviewSection eyebrow="Du bist dabei" title="Du machst mit" items={sections.participating} variant="participating" />
        {prioritySectionsVisible && lowerSectionsVisible ? <OverviewDivider label="Danach · wenn du noch Kapazität hast" /> : null}
        <OverviewSection eyebrow="Discovery" title="Frei für dich" items={sections.discovery} variant="discovery" />
        <OverviewSection eyebrow="Sozialer Kontext" title="Andere arbeiten dran" items={sections.others} variant="compact" />
        <OverviewSection title="Erledigt" items={sections.history} variant="compact" />
      </div>
      <TimelineBlock events={state.timeline.filter((event: any) => event.scopes.includes("global"))} emptyText="Noch keine Ereignisse." />
    </div>
  )
}

export function isRunDueForOverview(run: any) {
  const start = domain.runStartTimestamp(run)
  if (!start) return true
  if (start <= Date.now()) return true

  return domain.dateKey(new Date(start)) === domain.todayKey()
}

export function OverviewSection({ eyebrow, title, items, variant = "default" }: { eyebrow?: string, title: string, items: any[], variant?: string }) {
  if (!items.length) return null

  return (
    <section className={`overview-section overview-section-${variant}`}>
      <div className="overview-section-heading">
        <span>
          {eyebrow ? <small>{eyebrow}</small> : null}
          <strong>{title}</strong>
        </span>
        <span>{items.length}</span>
      </div>
      <div className="quest-grid">
        {items}
      </div>
    </section>
  )
}

export function OverviewDivider({ label }: { label: string }) {
  return (
    <div className="overview-divider">
      <span>{label}</span>
    </div>
  )
}

export function StandaloneRunGroupCard(props: any) {
  const { state, questKey, runs, mode, selectStandaloneQuest, setMainTab } = props
  const quest = getQuest(questKey)
  const sortedRuns = runs.slice().sort((a: any, b: any) => questRunTimestamp(a) - questRunTimestamp(b))
  const nextRun = sortedRuns[0]
  const participantIds = Array.from(new Set(sortedRuns.flatMap(runParticipantIds))) as string[]
  const isUrgent = mode === "urgent"
  const runCount = sortedRuns.length
  const status = isUrgent ? nextRun.status : "accepted"
  const scheduleLabel = runCount > 1
    ? `Nächster Termin ${formatScheduleDate(nextRun)}`
    : undefined
  const cta = isUrgent
    ? actionLabel("continue", "Weitermachen")
    : "Termine ansehen"

  return (
    <article className={`quest-card next-action-card run-group-card ${isUrgent ? "is-urgent" : "is-planned"}`} data-action="open" onClick={() => selectStandaloneQuest(questKey)}>
      <span className="quest-card-top">
        <span className="quest-card-main">
          <ItemImage src={quest.image} label={quest.title} />
          <span className="quest-card-copy">
            <span className="quest-title">{quest.title}</span>
            <CardMetaLinks
              location={domain.getLocation(nextRun?.locationId) || standaloneLocation(questKey)}
              schedule={nextRun}
              scheduleLabel={scheduleLabel}
              setMainTab={setMainTab}
            />
          </span>
        </span>
        <StatusBadge status={status} className="card-status" />
      </span>
      <span className="field-list card-field-list"><FieldChips fields={quest.developmentFields} adaptive /></span>
      <span className="quest-card-actions">
        <span className="action-row">
          <span className="action-context card-footer-context">
            {participantIds.length ? <AvatarGroup personIds={participantIds} /> : null}
            <span>{runCount} {runCount === 1 ? "Termin" : "Termine"}</span>
          </span>
          <button className="action-button" type="button" onClick={(event) => { event.stopPropagation(); selectStandaloneQuest(questKey) }}>
            {cta}
          </button>
        </span>
      </span>
    </article>
  )
}

export function nextActionsForAdventureRun(state: Model, run: any, props: any) {
  if (!isStudent(state.selectedRole) || isHistoryStatus(run.status)) return []

  const items: any[] = []
  runsForAdventureRun(state, run.id)
    .filter((questRun: any) => runHasParticipant(questRun, state.selectedRole) && ["accepted", "in-progress"].includes(questRun.status))
    .forEach((questRun: any) => {
      items.push(<NextActionCard key={`next:${questRun.id}`} mode="own-run" run={questRun} {...props} />)
    })

  const freeStep = nextFreeStepForAdventureRun(state, run)
  if (freeStep) {
    items.push(<NextActionCard key={`next:${run.id}:${freeStep.id}`} mode="free-step" adventureRun={run} step={freeStep} {...props} />)
  }

  return items
}

export function nextFreeStepForAdventureRun(state: Model, run: any) {
  return stepEntries(run.adventureId)
    .map(([, step]: any) => step)
    .find((step: any) => {
      const ownStepRun = runsForStep(state, step.id, run.id)
        .some((questRun: any) => runHasParticipant(questRun, state.selectedRole))
      return !ownStepRun &&
        stepHasParticipantSlot(state, step, run.id) &&
        dependenciesMet(state, step.id, run.id)
    })
}

export function NextActionCard(props: any) {
  const { state, mode, run, step, adventureRun: parentRun, selectAdventure, selectAdventureStep, selectStandaloneQuest, acceptStep, setMainTab } = props
  const isFreeStep = mode === "free-step"
  const targetStep = isFreeStep ? step : (run.adventureStepRelationId ? domain.getStep(run.adventureStepRelationId) : null)
  const quest = isFreeStep ? getQuestForStep(step) : getQuest(run.questKey)
  const parentTitle = isFreeStep
    ? adventureRunTitle(parentRun)
    : runSubtitle(state, run)
  const metaLocation = isFreeStep
    ? domain.stepLocation(step)
    : run.adventureRunId && targetStep
      ? domain.stepLocation(targetStep)
      : domain.getLocation(run.locationId) || standaloneLocation(run.questKey)
  const metaSchedule = isFreeStep
    ? domain.stepSchedule(step)
    : run.adventureRunId && targetStep
      ? domain.stepSchedule(targetStep)
      : domain.runSchedule(run) || domain.standaloneSchedule(run.questKey)
  const cta = isFreeStep
    ? actionLabel("acceptQuest", "Aufgabe übernehmen")
    : actionLabel("continue", "Weitermachen")
  const status = isFreeStep ? "suggested" : run.status
  const contextParticipants = isFreeStep
    ? participantIdsForAdventureRun(state, parentRun)
    : runParticipantIds(run)

  function openDetail() {
    if (isFreeStep) return selectAdventureStep?.(parentRun.id, step.id)
    if (run.adventureRunId) {
      if (selectAdventureStep) return selectAdventureStep(run.adventureRunId, run.adventureStepRelationId)
      return selectAdventure(run.adventureRunId)
    }
    return selectStandaloneQuest(run.questKey)
  }

  function performAction(event: any) {
    event.stopPropagation()
    if (isFreeStep) {
      acceptStep(state.selectedRole, step.id, parentRun.id)
      return
    }
    openDetail()
  }

  return (
    <article className="quest-card next-action-card" data-action="open" onClick={openDetail}>
      <span className="quest-card-top">
        <span className="quest-card-main">
          <ItemImage src={quest.image} label={quest.title} />
          <span className="quest-card-copy">
            <span className="quest-title">{quest.title}</span>
            <CardMetaLinks
              contextLabel={isFreeStep || run.adventureRunId ? parentTitle : undefined}
              location={metaLocation}
              schedule={metaSchedule}
              setMainTab={setMainTab}
            />
          </span>
        </span>
        <StatusBadge status={status} className="card-status" />
      </span>
      <span className="field-list card-field-list"><FieldChips fields={quest.developmentFields} adaptive /></span>
      <span className="quest-card-actions">
        <span className="action-row">
          <span className="action-context card-footer-context">
            {contextParticipants.length ? <AvatarGroup personIds={contextParticipants} /> : null}
          </span>
          <button className="action-button" type="button" onClick={performAction}>{cta}</button>
        </span>
      </span>
    </article>
  )
}

export function standaloneActionRuns(state: Model, questKey: string) {
  const policy = participationPolicyForStandalone(questKey)
  const currentOpenRuns = openStandaloneRuns(state, questKey)
    .filter((run: any) => runHasParticipantSlot(run, policy))
  if (currentOpenRuns.length) return currentOpenRuns

  return runsForStandaloneQuest(state, questKey)
    .filter((run: any) => run.status === "open" && runHasParticipantSlot(run, policy))
}

export function canActOnStandaloneQuest(state: Model, questKey: string) {
  if (!isStudent(state.selectedRole)) return false
  if (findStandaloneRun(state, state.selectedRole, questKey)) return true
  if (standaloneActionRuns(state, questKey).length) return true

  const offer = getStandaloneOffer(questKey)
  const existingRuns = runsForStandaloneQuest(state, questKey)
  if (offer?.repeatable && !isScheduledStandaloneQuest(questKey)) return !standaloneCapacityReached(state, questKey)
  return !existingRuns.length && !standaloneCapacityReached(state, questKey)
}

export function OverviewLenses({ state, setMainTab, selectAdventure, selectStandaloneQuest }: any) {
  const activeTab = state.selectedTab || "quests"

  return (
    <aside className="overview-lenses" aria-label="Linsen">
      <p className="eyebrow">Linsen</p>
      {activeTab !== "map" ? (
        <MapLens
          state={state}
          setMainTab={setMainTab}
          selectAdventure={selectAdventure}
          selectStandaloneQuest={selectStandaloneQuest}
        />
      ) : null}
      {activeTab !== "calendar" ? (
        <CalendarLens
          state={state}
          setMainTab={setMainTab}
          selectAdventure={selectAdventure}
          selectStandaloneQuest={selectStandaloneQuest}
        />
      ) : null}
    </aside>
  )
}

export function MapLens({ state, setMainTab, selectAdventure, selectStandaloneQuest }: any) {
  const items = scheduleItems(state)
  const mapItems = items.filter((item: any) => item.location).slice(0, 2)

  return (
    <section className="lens-card">
      <div className="lens-heading">
        <h3>Karte</h3>
        <button className="text-button" type="button" onClick={() => setMainTab?.("map")}>öffnen</button>
      </div>
      <div className="mini-map" aria-hidden="true">
        {mapItems.map((item: any) => (
          <span
            className={`mini-map-marker status-${visualStatus(item.status)}`}
            key={item.id}
            style={{ left: `${item.location.map?.x || 50}%`, top: `${item.location.map?.y || 50}%` }}
          />
        ))}
      </div>
      <div className="lens-list">
        {mapItems.map((item: any) => (
          <button className="lens-row" type="button" key={item.id} onClick={() => openLensItem(item, { selectAdventure, selectStandaloneQuest })}>
            <strong>{item.title}</strong>
            <span>{item.location.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export function CalendarLens({ state, setMainTab, selectAdventure, selectStandaloneQuest }: any) {
  const calendarItems = scheduleItems(state).filter((item: any) => item.schedule).slice(0, 3)

  return (
    <section className="lens-card">
      <div className="lens-heading">
        <h3>Kalender</h3>
        <button className="text-button" type="button" onClick={() => setMainTab?.("calendar")}>öffnen</button>
      </div>
      <div className="lens-list">
        {calendarItems.map((item: any) => (
          <button className="lens-row" type="button" key={item.id} onClick={() => openLensItem(item, { selectAdventure, selectStandaloneQuest })}>
            <strong>{formatScheduleLabel(item.schedule)}</strong>
            <span>{item.title}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export function openLensItem(item: any, props: any) {
  if (item.action?.kind === "adventure") {
    props.selectAdventure(item.action.runId || null, item.action.adventureId || null)
    return
  }

  if (item.action?.kind === "standalone") props.selectStandaloneQuest(item.action.questKey)
}

export function AdventureCatalogCard({ state, adventureId, selectAdventure, setMainTab }: any) {
  const adventure = getAdventure(adventureId)
  const runs = adventureRunsForAdventure(state, adventureId)
  const fields = developmentFieldsForAdventure(adventureId)
  const completedSteps = stepEntries(adventureId).filter(([, step]: any) => (
    runs.some((run: any) => runsForStep(state, step.id, run.id).some((questRun: any) => questRun.status === "confirmed"))
  ))

  return (
    <article className="quest-card adventure-card" data-action="open" onClick={() => selectAdventure(null, adventureId)}>
      <span className="quest-card-top">
        <span className="quest-card-main">
          <ItemImage src={adventure.image} label={adventure.title} className="item-image adventure-image" />
          <span className="quest-card-copy">
            <span className="quest-title">{adventure.title}</span>
            <CardMetaLinks
              location={domain.adventureLocation(adventureId)}
              schedule={domain.adventureSchedule(adventureId)}
              setMainTab={setMainTab}
            />
          </span>
        </span>
        <CardBadgeStack labels={["Vorlage"]} />
      </span>
      <span className="field-list card-field-list"><FieldChips fields={fields} adaptive /></span>
      <span className="step-checklist">
        {stepEntries(adventureId).map(([, step]: any) => {
          const stepDone = completedSteps.some(([, item]: any) => item.id === step.id)
          return (
            <span className="step-check" key={step.id}>
              <StatusMarker status={stepDone ? "confirmed" : "suggested"} />
              <span>{getQuestForStep(step).title}</span>
            </span>
          )
        })}
      </span>
      {!isStudent(state.selectedRole) ? (
        <span className="quest-card-bottom">
          <span>{stepEntries(adventureId).length} Aufgaben</span>
          <span>{runs.length} {runs.length === 1 ? "Adventure" : "Adventures"}</span>
        </span>
      ) : null}
      {isStudent(state.selectedRole) ? (
        <div className="quest-card-actions">
          <div className="action-row">
            <span className="action-context card-footer-context">
              <span>{stepEntries(adventureId).length} Aufgaben</span>
              <span>{runs.length} {runs.length === 1 ? "Adventure" : "Adventures"}</span>
            </span>
            <button className="action-button" type="button" onClick={(event) => { event.stopPropagation(); selectAdventure(null, adventureId) }}>
              Starten
            </button>
          </div>
        </div>
      ) : null}
    </article>
  )
}

export function AdventureRunCard({ state, run, selectAdventure, setMainTab }: any) {
  const adventure = getAdventure(run.adventureId) || scenario.adventure
  const steps = stepEntries(adventure.id)
  const participants = participantIdsForAdventureRun(state, run) as string[]
  const history = isHistoryStatus(run.status)
  const freeSteps = freeStepCount(state, run.id)
  const isMine = participants.includes(state.selectedRole)
  const canAct = isStudent(state.selectedRole) && !history && (isMine || freeSteps > 0)

  return (
    <article
      className={[
        "quest-card",
        "adventure-card",
        "adventure-run-card",
        history ? "is-history" : "",
        isMine ? "is-mine" : ""
      ].filter(Boolean).join(" ")}
      data-action="open"
      onClick={() => selectAdventure(run.id)}
    >
      <span className="quest-card-top">
        <span className="quest-card-main">
          <ItemImage src={adventure.image} label={adventure.title} className="item-image adventure-image" />
          <span className="quest-card-copy">
            <span className="quest-title">{adventureRunTitle(run)}</span>
            <CardMetaLinks
              location={domain.adventureLocation(adventure.id)}
              schedule={domain.adventureSchedule(adventure.id)}
              setMainTab={setMainTab}
            />
          </span>
        </span>
        <StatusBadge status={run.status} context="adventure" className="card-status" />
      </span>
      <span className="step-checklist-wrap">
        <span className="step-checklist">
          {steps.map(([, step]: any) => (
            <span className="step-check" key={step.id}>
              <StatusMarker status={domain.stepStatus(state, step.id, run.id)} />
              <span>{getQuestForStep(step).title}</span>
            </span>
          ))}
        </span>
        {!history && freeSteps ? <span className="checklist-side-note">{freeSteps} frei</span> : null}
      </span>
      {!canAct ? (
        participants.length ? (
          <span className="quest-card-bottom">
            <AvatarGroup personIds={participants} />
          </span>
        ) : null
      ) : null}
      {canAct ? (
        <div className="quest-card-actions">
          <div className="action-row">
            <span className="action-context card-footer-context">
              {participants.length ? <AvatarGroup personIds={participants} /> : null}
            </span>
            <button className="action-button" type="button" onClick={(event) => { event.stopPropagation(); selectAdventure(run.id) }}>
              {isMine ? actionLabel("continue", "Weitermachen") : actionLabel("join", "Mitmachen")}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  )
}

export function StandaloneQuestCard(props: any) {
  const { state, questKey, offer, selectStandaloneQuest, acceptStandaloneQuest, setMainTab } = props
  const quest = getQuest(questKey)
  const status = standaloneQuestStatus(state, questKey)
  const offerLabel = standaloneOfferLabel(state, offer, questKey)
  const runs = runsForStandaloneQuest(state, questKey)
  const assignedRuns = runs.filter((run: any) => runParticipantIds(run).length)
  const ownRun = isStudent(state.selectedRole) ? findStandaloneRun(state, state.selectedRole, questKey) : null
  const hasResultStatus = isHistoryStatus(status)
  const actionRuns = standaloneActionRuns(state, questKey)
  const nextOpenRun = nextOpenStandaloneRun(state, questKey) || actionRuns[0] || null
  const canCreateRun = isStudent(state.selectedRole) &&
    !isScheduledStandaloneQuest(questKey) &&
    (!runs.length || (offer?.repeatable && !ownRun)) &&
    !standaloneCapacityReached(state, questKey)
  const canAcceptDirect = isStudent(state.selectedRole) && ((nextOpenRun && actionRuns.length <= 1) || canCreateRun)
  const needsTermPicker = isStudent(state.selectedRole) && actionRuns.length > 1

  return (
    <article
      className={[
        "quest-card",
        "standalone-quest-card",
        hasResultStatus ? "is-history" : "",
        ownRun && ["accepted", "in-progress"].includes(ownRun.status) ? "is-mine" : "",
        assignedRuns.length && !ownRun ? "is-occupied" : ""
      ].filter(Boolean).join(" ")}
      data-action="open"
      onClick={() => selectStandaloneQuest(questKey)}
    >
      <span className="quest-card-top">
        <span className="quest-card-main">
          <ItemImage src={quest.image} label={quest.title} />
          <span className="quest-card-copy">
            <span className="quest-title">{quest.title}</span>
            <CardMetaLinks
              location={domain.getLocation(nextOpenRun?.locationId) || standaloneLocation(questKey)}
              schedule={domain.runSchedule(nextOpenRun) || domain.standaloneSchedule(questKey)}
              setMainTab={setMainTab}
            />
          </span>
        </span>
        <CardBadgeStack
          status={status}
          labels={[offerLabel]}
        />
      </span>
      <span className="field-list card-field-list"><FieldChips fields={quest.developmentFields} adaptive /></span>
      {needsTermPicker || canAcceptDirect ? null : (
        <span className="quest-card-bottom">
          <AssigneeLabel runs={assignedRuns} fallbackText={runs.length ? runCountLabel(runs.length) : ""} />
        </span>
      )}
      {needsTermPicker ? (
        <div className="standalone-actions">
          <div className="action-row">
            <span className="action-context card-footer-context">
              <AssigneeLabel runs={assignedRuns} fallbackText={runs.length ? runCountLabel(runs.length) : ""} />
            </span>
            <button className="action-button" type="button" onClick={(event) => { event.stopPropagation(); selectStandaloneQuest(questKey) }}>Termin wählen</button>
          </div>
        </div>
      ) : canAcceptDirect ? (
        <div className="standalone-actions">
          <div className="action-row">
            <span className="action-context card-footer-context">
              <AssigneeLabel runs={assignedRuns} fallbackText={runs.length ? runCountLabel(runs.length) : ""} />
            </span>
            <button
              className="action-button"
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                acceptStandaloneQuest(state.selectedRole, questKey, nextOpenRun?.id)
              }}
            >
              {actionLabel("acceptQuest", "Aufgabe übernehmen")}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  )
}

export function CardBadgeStack({ status, labels = [] }: { status?: string, labels?: string[] }) {
  const visibleLabels = labels.filter(Boolean)
  if (!status && !visibleLabels.length) return null

  return (
    <span className="card-badge-stack">
      {status ? <StatusBadge status={status} className="card-status" /> : null}
      {visibleLabels.map((label) => (
        <span className="requirement-tag standalone-tag card-rule-tag" key={label}>{label}</span>
      ))}
    </span>
  )
}

export function AssigneeLabel({ runs, fallbackText }: { runs: any[], fallbackText?: string }) {
  if (!runs.length) return fallbackText ? <span>{fallbackText}</span> : null
  const personIds = Array.from(new Set(runs.flatMap(runParticipantIds)))
  if (!personIds.length) return fallbackText ? <span>{fallbackText}</span> : null

  return (
    <span className="assignee-list">
      <span className="assignee-pill">
        <AvatarGroup personIds={personIds} />
        <span>{personIds.map(personName).join(", ")}</span>
      </span>
    </span>
  )
}

export function runCountLabel(count: number) {
  return count === 1 ? "1 Termin" : `${count} Termine`
}

export function CardMetaLinks({
  contextLabel,
  location,
  schedule,
  scheduleLabel,
  setMainTab
}: {
  contextLabel?: string,
  location?: any,
  schedule?: any,
  scheduleLabel?: string,
  setMainTab?: (tabId: string) => void
}) {
  const hasContext = Boolean(contextLabel)
  const hasLocation = Boolean(location?.label)
  const hasSchedule = Boolean(scheduleLabel || schedule?.startsAt || schedule?.date)
  if (!hasContext && !hasLocation && !hasSchedule) return null

  function goTo(event: any, tabId: string) {
    event.stopPropagation()
    setMainTab?.(tabId)
  }

  return (
    <span className="quest-card-meta card-meta-links">
      {hasContext ? <span className="card-meta-context">{contextLabel}</span> : null}
      {hasContext && (hasLocation || hasSchedule) ? <span aria-hidden="true">·</span> : null}
      {hasLocation ? (
        <button type="button" onClick={(event) => goTo(event, "map")}>
          {location.label}
        </button>
      ) : null}
      {hasLocation && hasSchedule ? <span aria-hidden="true">·</span> : null}
      {hasSchedule ? (
        <button type="button" onClick={(event) => goTo(event, "calendar")}>
          {scheduleLabel || formatScheduleLabel(schedule)}
        </button>
      ) : null}
    </span>
  )
}

export function DetailShell({ children }: { children: any }) {
  return (
    <div className="stack">
      <section className="panel adventure-detail detail-shell">
        {children}
      </section>
    </div>
  )
}

export function DetailHero({ image, title, typeLabel, typeHint, status, statusContext = "task", fields = [], actions, metaLocation, metaSchedule, metaScheduleLabel, metaText, setMainTab }: any) {
  const hasSide = typeLabel || status || actions

  return (
    <header className={`detail-hero ${hasSide ? "has-side" : "is-single"}`}>
      <div className="detail-hero-main">
        <ItemImage src={image} label={title} className="item-image detail-hero-image" />
        <div className="detail-hero-copy">
          <h3>{title}</h3>
          {metaText ? (
            <p className="quest-card-meta">{metaText}</p>
          ) : (
            <CardMetaLinks location={metaLocation} schedule={metaSchedule} scheduleLabel={metaScheduleLabel} setMainTab={setMainTab} />
          )}
          {fields.length ? <div className="field-list detail-hero-fields"><FieldChips fields={fields} adaptive /></div> : null}
        </div>
      </div>
      {hasSide ? (
        <div className="detail-hero-side">
          <div className="detail-hero-tags">
            {typeLabel ? <span className="requirement-tag standalone-tag" title={typeHint || ""}>{typeLabel}</span> : null}
            {status ? <StatusBadge status={status} context={statusContext} /> : null}
          </div>
          {actions ? <div className="detail-hero-actions">{actions}</div> : null}
        </div>
      ) : null}
    </header>
  )
}

export function DetailSection({ eyebrow, title, children }: { eyebrow?: string, title: string, children: any }) {
  return (
    <section className="detail-section">
      <div className="section-heading-row">
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h3 className="detail-section-title">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  )
}

export function ExecutionRow({
  image,
  title,
  fields = [],
  meta,
  metaLocation,
  metaSchedule,
  metaScheduleLabel,
  setMainTab,
  tags,
  side,
  actions,
  focused = false,
  assigned = false,
  className = ""
}: any) {
  const hasSide = side || actions
  const hasLinkedMeta = metaLocation || metaSchedule || metaScheduleLabel

  return (
    <section className={[
      "work-step",
      "execution-row",
      image ? "" : "is-iconless",
      focused ? "is-focused" : "",
      assigned ? "is-assigned" : "",
      className
    ].filter(Boolean).join(" ")}>
      {image ? <ItemImage src={image} label={title} className="item-image work-step-image" /> : null}
      <div className="work-step-copy">
        <h4>{title}</h4>
        {meta ? <p className="meta">{meta}</p> : null}
        {!meta && hasLinkedMeta ? (
          <CardMetaLinks
            location={metaLocation}
            schedule={metaSchedule}
            scheduleLabel={metaScheduleLabel}
            setMainTab={setMainTab}
          />
        ) : null}
        {fields.length ? <div className="field-list card-field-list"><FieldChips fields={fields} adaptive /></div> : null}
      </div>
      <div className="work-step-tags">
        {tags}
      </div>
      <div className="work-step-side">
        {side}
        {actions}
        {!hasSide ? <div className="work-step-actions is-empty" /> : null}
      </div>
    </section>
  )
}

export function detailEventsForAdventure(state: Model, run: any, adventureId: string) {
  if (run) return state.timeline.filter((event: any) => event.adventureRunId === run.id)

  const runIds = new Set(adventureRunsForAdventure(state, adventureId).map((item: any) => item.id))
  return state.timeline.filter((event: any) => runIds.has(event.adventureRunId))
}

export function detailEventsForStandaloneQuest(state: Model, questKey: string) {
  const runIds = new Set(runsForStandaloneQuest(state, questKey)
    .filter((run: any) => !run.virtual)
    .map((run: any) => run.id))

  return state.timeline.filter((event: any) => runIds.has(event.questRunId))
}

export function AdventureDetail(props: any) {
  const { state, selectAdventure, selectAdventureStep, setMainTab } = props
  const activeRun = adventureRun(state)
  const selectedAdventureId = activeRun?.adventureId || state.selectedAdventureId || scenario.adventure.id
  const adventure = getAdventure(selectedAdventureId) || scenario.adventure
  const runs = adventureRunsForAdventure(state, adventure.id)
  const title = activeRun ? adventureRunTitle(activeRun) : adventure.title
  const steps = stepEntries(adventure.id)
  const nextFreeStep = activeRun ? nextFreeStepForAdventureRun(state, activeRun) : null
  const location = domain.adventureLocation(adventure.id)
  const schedule = domain.adventureSchedule(adventure.id)
  const events = detailEventsForAdventure(state, activeRun, adventure.id)
  const typeHint = activeRun
    ? `Laufendes Adventure aus der Vorlage "${adventure.title}".`
    : "Vorlage für ein Adventure. Eine konkrete Ausführung entsteht erst, wenn jemand eine Aufgabe übernimmt."

  return (
    <DetailShell>
      <DetailHero
        image={adventure.image}
        title={title}
        typeLabel={activeRun ? "Adventure" : "Adventure-Vorlage"}
        typeHint={typeHint}
        status={activeRun?.status}
        statusContext="adventure"
        fields={developmentFieldsForAdventure(adventure.id)}
        metaLocation={location}
        metaSchedule={schedule}
        setMainTab={setMainTab}
        actions={activeRun && nextFreeStep ? (
          <button className="action-button" type="button" onClick={() => selectAdventureStep?.(activeRun.id, nextFreeStep.id)}>
            Freie Aufgabe ansehen
          </button>
        ) : null}
      />
      {!activeRun && runs.length ? (
        <DetailSection eyebrow="Ausführungen" title="Aktive Adventures">
          <div className="work-step-list">
            {runs.map((run: any) => (
              <ExecutionRow
                key={run.id}
                className="standalone-run-step"
                title={adventureRunTitle(run)}
                fields={developmentFieldsForAdventure(adventure.id)}
                metaLocation={location}
                metaSchedule={schedule}
                setMainTab={setMainTab}
                tags={<StatusBadge status={run.status} context="adventure" />}
                side={<AdventureRunParticipants state={state} run={run} />}
                actions={(
                  <div className="work-step-actions">
                    <button className="action-button compact-action secondary" type="button" onClick={() => selectAdventure(run.id)}>Öffnen</button>
                  </div>
                )}
              />
            ))}
          </div>
        </DetailSection>
      ) : null}
      <DetailSection
        eyebrow={activeRun ? "Adventure" : "Vorlage"}
        title={activeRun ? "Aufgaben in diesem Adventure" : "Aufgaben in dieser Vorlage"}
      >
        <div className="work-step-list">
          {steps.map(([, step]: any) => <AdventureWorkStep key={step.id} step={step} {...props} />)}
        </div>
      </DetailSection>
      {activeRun || events.length ? <TimelineBlock events={events} emptyText="Noch keine Ereignisse in diesem Adventure." /> : null}
    </DetailShell>
  )
}

export function AdventureRunParticipants({ state, run }: { state: Model, run: any }) {
  const participants = participantIdsForAdventureRun(state, run) as string[]
  const freeSteps = freeStepCount(state, run.id)
  const label = freeSteps
    ? `${freeSteps} freie Aufgaben`
    : `${participants.length} ${participants.length === 1 ? "Person" : "Personen"}`

  return (
    <div className="work-step-assignees">
      {participants.length ? (
        <span className="work-step-assignee">
          <AvatarGroup personIds={participants} />
          <span>{participants.map(personName).join(", ")}</span>
        </span>
      ) : null}
      <span className="meta">{label}</span>
    </div>
  )
}

export function AdventureWorkStep(props: any) {
  const { state, step, setMainTab } = props
  const quest = getQuestForStep(step)
  const runs = runsForStep(state, step.id)
  const focused = state.selectedStepId === step.id
  const actions = isStudent(state.selectedRole) || canConfirm(state.selectedRole)
    ? <InlineStepActions {...props} />
    : null

  return (
    <ExecutionRow
      image={quest.image}
      title={quest.title}
      fields={developmentFieldsForStep(step)}
      metaLocation={domain.stepLocation(step)}
      metaSchedule={domain.stepSchedule(step)}
      setMainTab={setMainTab}
      tags={<RequirementTag step={step} />}
      side={<WorkStepAssignees runs={runs} />}
      actions={actions}
      focused={focused}
      assigned={Boolean(runs.length)}
    />
  )
}

export function WorkStepAssignees({ runs }: { runs: any[] }) {
  if (!runs.length) return null
  return (
    <div className="work-step-assignees">
      {runs.map((run) => (
        <span className="work-step-assignee" key={run.id}>
          <AvatarGroup personIds={runParticipantIds(run)} />
          <span>{runParticipantIds(run).map(personName).join(", ") || "frei"}</span>
        </span>
      ))}
    </div>
  )
}

export function InlineStepActions(props: any) {
  const { state, step } = props
  if (isStudent(state.selectedRole)) return <InlineStudentStepActions {...props} actorId={state.selectedRole} />
  if (canConfirm(state.selectedRole)) return <InlineMentorStepActions {...props} />
  return null
}

export function InlineStudentStepActions({ state, step, actorId, acceptStep, completeStep, postFramePhoto }: any) {
  const activeRun = adventureRun(state)
  const run = findRun(state, actorId, step.id)
  const assignedToOther = Boolean(activeRun) && !run && !stepHasParticipantSlot(state, step, activeRun.id)
  const dependencyNote = activeRun ? dependencyText(state, step.id, activeRun.id) : ""
  const photo = ownFramePhoto(state, actorId)
  const canPostPhoto = step.questKey === "documentation" && run?.status === "accepted" && !photo

  return (
    <div className="work-step-actions">
      {dependencyNote ? <p className="meta">{dependencyNote}</p> : null}
      <StepActionButtons
        state={state}
        step={step}
        run={run}
        actorId={actorId}
        assignedToOther={assignedToOther}
        canPostPhoto={canPostPhoto}
        acceptStep={acceptStep}
        completeStep={completeStep}
        postFramePhoto={postFramePhoto}
      />
      {photo && step.questKey === "documentation" ? <p className="meta">Gepostet: {photo.caption}</p> : null}
    </div>
  )
}

export function StepActionButtons(props: any) {
  const { state, step, run, actorId, assignedToOther, canPostPhoto, acceptStep, completeStep, postFramePhoto } = props
  if (assignedToOther) {
    const peerRuns = runsForStep(state, step.id).filter((item: any) => !runHasParticipant(item, actorId))
    return (
      <div className="peer-run-list">
        {peerRuns.map((peerRun: any) => <PeerRunStatus key={peerRun.id} run={peerRun} />)}
      </div>
    )
  }

  if (!run) {
    const buttonLabel = joinableRunForStep(state, actorId, step)
      ? actionLabel("join", "Mitmachen")
      : actionLabel("acceptQuest", "Aufgabe übernehmen")
    return (
      <div className="action-row">
        <button className="action-button" type="button" onClick={() => acceptStep(actorId, step.id)}>{buttonLabel}</button>
      </div>
    )
  }

  if (["completed", "confirmed"].includes(run.status)) {
    return (
      <div className={`completion-indicator is-${visualStatus(run.status)}`}>
        <StatusMarker status={run.status} />
        <span>{statusLabel(run.status)}</span>
      </div>
    )
  }

  const policy = participationPolicyForStep(step)
  const isStartBlocked = !runWindowStarted(run)
  const completeDisabled = run.status !== "accepted" ||
    !runHasEnoughParticipants(run, policy) ||
    !dependenciesMet(state, step.id) ||
    isStartBlocked
  const missing = policy.minParticipants - runParticipantIds(run).length

  return (
    <>
      {run.status === "accepted" && missing > 0 ? <p className="meta">Wartet auf {missing} weitere {missing === 1 ? "Person" : "Personen"}.</p> : null}
      {run.status === "accepted" && isStartBlocked ? <p className="meta">{runStartHint(run)}</p> : null}
      <div className="action-row">
        <button className="action-button" type="button" onClick={() => completeStep(actorId, step.id)} disabled={completeDisabled}>
          {actionLabel("completeQuest", "Fertig melden")}
        </button>
        {step.questKey === "documentation" ? (
          <button className="action-button secondary" type="button" onClick={() => postFramePhoto(actorId)} disabled={!canPostPhoto}>
            {actionLabel("postPhoto", "Foto posten")}
          </button>
        ) : null}
      </div>
    </>
  )
}

export function PeerRunStatus({ run }: { run: any }) {
  return (
    <div className={`peer-run-status is-${visualStatus(run.status)}`}>
      <StatusMarker status={run.status} small />
      <span>{statusLabel(run.status)}</span>
    </div>
  )
}

export function InlineMentorStepActions({ state, step, confirmRun }: any) {
  const runs = runsForStep(state, step.id)
  return (
    <div className="work-step-actions">
      {runs.length
        ? runs.map((run: any) => <MentorRunReview state={state} run={run} key={run.id} confirmRun={confirmRun} />)
        : <p className="meta">Noch kein bestätigbarer Beitrag.</p>}
    </div>
  )
}

export function MentorRunReview({ state, run, confirmRun }: any) {
  const evidence = evidenceForRun(state, run)
  const reviewable = run.status === "completed" && !hasConfirmation(state, run.id)
  const evidenceText = evidence.length
    ? (evidence.some((item: any) => item.type === "photo") ? "Foto vorhanden" : "Beleg vorhanden")
    : (reviewable ? "ohne Beleg" : "")

  return (
    <div className="review-row">
      <div className="review-main">
        <PeerRunStatus run={run} />
        {evidenceText ? <p className="review-note">{evidenceText}</p> : null}
      </div>
      {reviewable ? <button className="action-button" type="button" onClick={() => confirmRun(run.id, state.selectedRole)}>{actionLabel("confirm", "Bestätigen")}</button> : null}
    </div>
  )
}

export function StandaloneQuestDetail(props: any) {
  const { state, setMainTab } = props
  const questKey = state.selectedStandaloneQuestKey || scenario.campaign?.standaloneQuestOfferKeys?.[0]
  const quest = getQuest(questKey)
  const offer = getStandaloneOffer(questKey)
  const runs = runsForStandaloneQuest(state, questKey)
  const isScheduled = isScheduledStandaloneQuest(questKey)
  const isRepeatable = Boolean(offer?.repeatable)
  const location = standaloneLocation(questKey)
  const schedule = domain.standaloneSchedule(questKey)
  const scheduleLabel = isScheduled ? recurrenceSummary(state, questKey) : undefined
  const heroStatus = standaloneQuestStatus(state, questKey)
  const detailKind = standaloneDetailKind(offer, isScheduled, isRepeatable)
  const sectionTitle = isScheduled
    ? "Konkrete Termine"
    : isRepeatable
      ? "Durchführungen"
      : "Konkrete Durchführung"
  const sectionEyebrow = isScheduled ? "Termine" : "Runs"
  const events = detailEventsForStandaloneQuest(state, questKey)

  return (
    <DetailShell>
      <DetailHero
        image={quest.image}
        title={quest.title}
        typeLabel={detailKind.typeLabel}
        typeHint={detailKind.typeHint}
        status={heroStatus}
        fields={quest.developmentFields}
        metaLocation={location}
        metaSchedule={schedule}
        metaScheduleLabel={scheduleLabel}
        metaText={standaloneDetailMetaText(offer, location, schedule)}
        setMainTab={setMainTab}
      />
      <DetailSection eyebrow={sectionEyebrow} title={sectionTitle}>
        <div className="work-step-list standalone-run-list">
          <StandaloneDetailRows questKey={questKey} {...props} />
        </div>
      </DetailSection>
      <TimelineBlock events={events} emptyText="Noch keine Ereignisse zu dieser Aufgabe." />
    </DetailShell>
  )
}

export function standaloneDetailKind(offer: any, isScheduled: boolean, isRepeatable: boolean) {
  if (isScheduled) {
    return {
      typeLabel: "Wiederkehrende Aufgabe",
      typeHint: "Jeder Termin ist ein eigener konkreter Run und kann einzeln übernommen werden."
    }
  }

  if (isRepeatable) {
    return {
      typeLabel: "Wiederholbare Aufgabe",
      typeHint: "Jede Übernahme erzeugt einen neuen konkreten Run."
    }
  }

  return {
    typeLabel: "Einzelaufgabe",
    typeHint: offer?.runPolicy?.type === "single"
      ? "Diese Aufgabe soll genau einmal erledigt werden."
      : "Der konkrete Run entsteht, wenn jemand diese Aufgabe übernimmt."
  }
}

export function standaloneDetailMetaText(offer: any, location: any, schedule: any) {
  if (location || schedule) return ""
  if (offer?.locationScope === "anywhere") return "überall · jederzeit"
  return ""
}

export function StandaloneDetailRows(props: any) {
  const { state, questKey } = props
  const runs = runsForStandaloneQuest(state, questKey)
  const offer = getStandaloneOffer(questKey)
  const isScheduled = isScheduledStandaloneQuest(questKey)
  const canCreateRepeatableRun = isStudent(state.selectedRole) &&
    offer?.repeatable &&
    !isScheduled &&
    !findStandaloneRun(state, state.selectedRole, questKey) &&
    !standaloneCapacityReached(state, questKey)
  if (!runs.length && isScheduled) {
    return (
      <ExecutionRow
        className="standalone-run-step"
        title="Kein offener Termin"
        meta="Die Wiederholung erzeugt aktuell keinen übernehmbaren Termin."
        tags={(
          <>
            <StatusBadge status="suggested" />
            <span className="requirement-tag standalone-tag">{standaloneOfferLabel(state, getStandaloneOffer(questKey), questKey)}</span>
          </>
        )}
      />
    )
  }

  const rows = runs.length ? (canCreateRepeatableRun ? [null, ...runs] : runs) : [null]
  const sortedRows = rows.slice().sort(compareStandaloneDetailRuns)
  const { visibleRows, hiddenRows } = splitStandaloneDetailRows(sortedRows, isScheduled)

  return (
    <>
      {visibleRows.map((run: any, index: number) => <StandaloneWorkRun key={run?.id || `new-${index}`} run={run} {...props} />)}
      {hiddenRows.length ? (
        <details className="run-list-expand">
          <summary>{hiddenRows.length} weitere Termine anzeigen</summary>
          {hiddenRows.map((run: any, index: number) => <StandaloneWorkRun key={run?.id || `hidden-${index}`} run={run} {...props} />)}
        </details>
      ) : null}
    </>
  )
}

export function compareStandaloneDetailRuns(a: any, b: any) {
  if (!a || !b) return a ? 1 : b ? -1 : 0

  return questRunTimestamp(a) - questRunTimestamp(b)
}

export function splitStandaloneDetailRows(rows: any[], isScheduled: boolean) {
  if (!isScheduled) return { visibleRows: rows, hiddenRows: [] }

  const windowEnd = detailWindowEndTimestamp()
  let visibleRows = rows.filter((run: any) => {
    const start = domain.runStartTimestamp(run)
    return !start || start <= windowEnd
  })

  if (!visibleRows.length && rows.length) visibleRows = [rows[0]]

  const visibleIds = new Set(visibleRows.map((run: any) => run?.id || run))
  const hiddenRows = rows.filter((run: any) => !visibleIds.has(run?.id || run))
  return { visibleRows, hiddenRows }
}

export function detailWindowEndTimestamp() {
  return Date.now() + (7 * 24 * 60 * 60 * 1000)
}

export function StandaloneWorkRun(props: any) {
  const { state, run, questKey, setMainTab } = props
  const quest = getQuest(questKey)
  const offer = getStandaloneOffer(questKey)
  const status = run?.status || "suggested"
  const participantIds = run ? runParticipantIds(run) : []
  const isRepeatableTemplateRun = !run && offer?.repeatable && !isScheduledStandaloneQuest(questKey)
  const title = run?.startsAt || run?.date
    ? formatScheduleDate(run)
    : isRepeatableTemplateRun
      ? "Neue Durchführung"
      : quest.title

  return (
    <ExecutionRow
      className="standalone-run-step"
      title={title}
      fields={quest.developmentFields}
      meta={!run && !standaloneLocation(questKey) && !domain.standaloneSchedule(questKey)
        ? standaloneRunPlaceTimeLabel(run, questKey)
        : undefined}
      metaLocation={domain.getLocation(run?.locationId) || standaloneLocation(questKey)}
      metaSchedule={run || domain.standaloneSchedule(questKey)}
      setMainTab={setMainTab}
      tags={(
        <>
          <StatusBadge status={status} />
          <span className="requirement-tag standalone-tag">{standaloneOfferLabel(state, offer, questKey)}</span>
        </>
      )}
      side={participantIds.length ? (
        <div className="work-step-assignees">
          <span className="work-step-assignee">
            <AvatarGroup personIds={participantIds} />
            <span>{participantIds.map(personName).join(", ")}</span>
          </span>
        </div>
      ) : null}
      actions={<StandaloneRunAction run={run} {...props} />}
      assigned={Boolean(participantIds.length)}
    />
  )
}

export function StandaloneRunAction(props: any) {
  const { state, run, questKey, acceptStandaloneQuest, completeStandaloneQuest, postRunPhoto, confirmRun } = props
  if (!run) {
    if (!isStudent(state.selectedRole) || standaloneCapacityReached(state, questKey)) return <div className="work-step-actions is-empty" />
    return (
      <div className="work-step-actions standalone-run-actions">
        <button className="action-button compact-action" type="button" onClick={() => acceptStandaloneQuest(state.selectedRole, questKey)}>
          {actionLabel("acceptQuest", "Aufgabe übernehmen")}
        </button>
      </div>
    )
  }

  if (isStudent(state.selectedRole)) {
    const ownRun = runHasParticipant(run, state.selectedRole)
    const photo = ownRunPhoto(state, state.selectedRole, run.id)
    if (run.status === "open") {
      return (
        <div className="work-step-actions standalone-run-actions">
          <button className="action-button compact-action" type="button" onClick={() => acceptStandaloneQuest(state.selectedRole, questKey, run.id)}>
            {actionLabel("acceptQuest", "Aufgabe übernehmen")}
          </button>
        </div>
      )
    }
    if (ownRun && run.status === "accepted") {
      const isStartBlocked = !runWindowStarted(run)
      return (
        <div className="work-step-actions standalone-run-actions">
          {isStartBlocked ? <span className="run-action-hint">{runStartHint(run)}</span> : null}
          <button className="action-button compact-action" type="button" onClick={() => completeStandaloneQuest(state.selectedRole, questKey, run.id)} disabled={isStartBlocked}>
            {actionLabel("completeQuest", "Fertig melden")}
          </button>
          {photo ? null : (
            <button className="action-button secondary compact-action" type="button" onClick={() => postRunPhoto(state.selectedRole, run.id)}>
              {actionLabel("postPhoto", "Foto posten")}
            </button>
          )}
        </div>
      )
    }
    if (ownRun && run.status === "completed" && !photo) {
      return (
        <div className="work-step-actions standalone-run-actions">
          <button className="action-button secondary compact-action" type="button" onClick={() => postRunPhoto(state.selectedRole, run.id)}>
            {actionLabel("postPhoto", "Foto posten")}
          </button>
        </div>
      )
    }
  }

  if (canConfirm(state.selectedRole) && run.status === "completed" && !hasConfirmation(state, run.id)) {
    return (
      <div className="work-step-actions standalone-run-actions">
        <button className="action-button compact-action" type="button" onClick={() => confirmRun(run.id, state.selectedRole)}>
          {actionLabel("confirm", "Bestätigen")}
        </button>
      </div>
    )
  }

  return <div className="work-step-actions is-empty" />
}
