import * as domain from "../domain"
import type { Model } from "../domain"
import { AvatarGroup, FieldChips, ItemImage, RequirementTag, StatusBadge, StatusMarker, UserAvatar } from "../ui/primitives"
import { CalendarView, MapView } from "./ScheduleViews"
import { TimelineBlock } from "./Timeline"

const {
  WEEKDAY_OPTIONS,
  scenario,
  personName,
  isStudent,
  canConfirm,
  actionLabel,
  visualStatus,
  statusLabel,
  isHistoryStatus,
  formatScheduleDate,
  getQuest,
  standaloneQuestEntries,
  stepEntries,
  getQuestForStep,
  getStandaloneOffer,
  standaloneLocation,
  recurrenceRuleForQuest,
  recurrenceSummary,
  runParticipantIds,
  runHasParticipant,
  adventureRuns,
  adventureRun,
  runWindowStarted,
  runStartHint,
  runsForStep,
  findRun,
  participantIdsForAdventureRun,
  participationPolicyForStep,
  runHasEnoughParticipants,
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
  stepPlaceTimeLabel,
  standaloneRunPlaceTimeLabel,
  developmentFieldsForAdventure,
  freeStepCount
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
  const items = [
    { history: false, markup: <AdventureCatalogCard key="adventure" {...props} /> },
    ...standaloneQuestEntries().map(([questKey, offer]: any) => ({
      history: isStandaloneQuestHistory(state, questKey),
      markup: <StandaloneQuestCard key={questKey} questKey={questKey} offer={offer} {...props} />
    }))
  ]
  const sorted = items.sort((a, b) => Number(a.history) - Number(b.history))

  return (
    <div className="surface-stack">
      <div className="quest-grid">
        {sorted.map((item) => item.markup)}
      </div>
      <TimelineBlock events={state.timeline.filter((event: any) => event.scopes.includes("global"))} emptyText="Noch keine Ereignisse." />
    </div>
  )
}

export function AdventureCatalogCard({ state, selectAdventure }: any) {
  const runs = adventureRuns(state)
  const fields = developmentFieldsForAdventure()
  const status = runs.some((run: any) => run.status === "active")
    ? "accepted"
    : runs.length && runs.every((run: any) => ["completed", "confirmed"].includes(run.status))
      ? "confirmed"
      : "suggested"
  const completedSteps = stepEntries().filter(([, step]: any) => (
    runs.some((run: any) => runsForStep(state, step.id, run.id).some((questRun: any) => questRun.status === "confirmed"))
  ))

  return (
    <article className={`quest-card adventure-card ${isHistoryStatus(status) ? "is-history" : ""}`} onClick={() => selectAdventure(null)}>
      <span className="quest-card-top">
        <span className="quest-card-main">
          <ItemImage src={scenario.adventure.image} label={scenario.adventure.title} className="item-image adventure-image" />
          <span>
            <span className="quest-title">{scenario.adventure.title}</span>
          </span>
        </span>
        <StatusBadge status={status} context="adventure" className="card-status" />
      </span>
      <span className="field-list card-field-list"><FieldChips fields={fields} limit={2} /></span>
      <span className="step-checklist">
        {stepEntries().map(([, step]: any) => {
          const stepDone = completedSteps.some(([, item]: any) => item.id === step.id)
          return (
            <span className="step-check" key={step.id}>
              <StatusMarker status={stepDone ? "confirmed" : "suggested"} />
              <span>{getQuestForStep(step).title}</span>
            </span>
          )
        })}
      </span>
      <span className="quest-card-bottom">
        <span>{stepEntries().length} Aufgaben</span>
        <span>{runs.length} Gruppen</span>
      </span>
      <div className="quest-card-actions">
        <div className="action-row">
          <button className="action-button" type="button" onClick={(event) => { event.stopPropagation(); selectAdventure(null) }}>
            {runs.length ? "Ansehen" : "Starten"}
          </button>
        </div>
      </div>
    </article>
  )
}

export function StandaloneQuestCard(props: any) {
  const { state, questKey, offer, selectStandaloneQuest, acceptStandaloneQuest } = props
  const quest = getQuest(questKey)
  const status = standaloneQuestStatus(state, questKey)
  const runs = runsForStandaloneQuest(state, questKey)
  const assignedRuns = runs.filter((run: any) => runParticipantIds(run).length)
  const ownRun = isStudent(state.selectedRole) ? findStandaloneRun(state, state.selectedRole, questKey) : null
  const hasResultStatus = isHistoryStatus(status)
  const nextOpenRun = nextOpenStandaloneRun(state, questKey)
  const canAcceptDirect = isStudent(state.selectedRole) && nextOpenRun && openStandaloneRuns(state, questKey).length <= 1
  const needsTermPicker = isStudent(state.selectedRole) && nextOpenRun && openStandaloneRuns(state, questKey).length > 1

  return (
    <article
      className={[
        "quest-card",
        "standalone-quest-card",
        hasResultStatus ? "is-history" : "",
        ownRun && ["accepted", "in-progress"].includes(ownRun.status) ? "is-mine" : "",
        assignedRuns.length && !ownRun ? "is-occupied" : ""
      ].filter(Boolean).join(" ")}
      onClick={() => selectStandaloneQuest(questKey)}
    >
      <span className="quest-card-top">
        <span className="quest-card-main">
          <ItemImage src={quest.image} label={quest.title} />
          <span className="quest-card-copy">
            <span className="quest-title">{quest.title}</span>
          </span>
        </span>
        {!hasResultStatus ? <StatusBadge status={status} className="card-status" /> : null}
      </span>
      <span className="field-list card-field-list"><FieldChips fields={quest.developmentFields} limit={2} /></span>
      <span className="quest-card-bottom">
        <AssigneeLabel runs={assignedRuns} fallbackText={runs.length ? runCountLabel(runs.length) : ""} />
        <span className="quest-card-bottom-meta">
          <span className="requirement-tag standalone-tag">{standaloneOfferLabel(state, offer, questKey)}</span>
          {hasResultStatus ? <StatusBadge status={status} className="card-status result-card-status" /> : null}
        </span>
      </span>
      {needsTermPicker ? (
        <div className="standalone-actions">
          <div className="action-row">
            <button className="action-button" type="button" onClick={(event) => { event.stopPropagation(); selectStandaloneQuest(questKey) }}>Termin wählen</button>
          </div>
        </div>
      ) : canAcceptDirect ? (
        <div className="standalone-actions">
          <div className="action-row">
            <button
              className="action-button"
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                acceptStandaloneQuest(state.selectedRole, questKey, nextOpenRun.id)
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

export function AdventureDetail(props: any) {
  const { state, selectAdventure } = props
  const activeRun = adventureRun(state)
  const runs = adventureRuns(state)
  const title = activeRun?.title || scenario.adventure.title
  const status = activeRun?.status || (runs.length ? "active" : "suggested")
  const subtitle = activeRun
    ? `Teilnehmende: ${participantIdsForAdventureRun(state, activeRun).map(personName).join(", ") || "noch offen"}`
    : runs.length
      ? `${runs.length} Gruppen · ${scenario.adventure.title}`
      : "Übernimm eine Aufgabe, dann entsteht ein neues Adventure."

  return (
    <div className="stack">
      <section className="panel adventure-detail">
        <EntityHeader
          image={scenario.adventure.image}
          title={title}
          subtitle={subtitle}
          tags={<><span className="requirement-tag standalone-tag">{activeRun ? "Adventure" : "Adventure-Vorlage"}</span><StatusBadge status={status} context="adventure" /></>}
        />
        <div className="field-list"><FieldChips fields={developmentFieldsForAdventure()} /></div>
        {runs.length ? (
          <section className="detail-section">
            <div className="section-heading-row">
              <p className="eyebrow">Ausführungen</p>
            </div>
            <div className="work-step-list">
              {runs.map((run: any) => (
                <section className={`work-step standalone-run-step ${activeRun?.id === run.id ? "is-focused" : ""}`} key={run.id}>
                  <div className="work-step-copy">
                    <h4>{run.title}</h4>
                    <p className="meta">{participantIdsForAdventureRun(state, run).map(personName).join(", ") || "noch offen"}</p>
                  </div>
                  <div className="work-step-tags">
                    <StatusBadge status={run.status} context="adventure" />
                  </div>
                  <div className="work-step-side">
                    <span className="meta">{freeStepCount(state, run.id) ? `${freeStepCount(state, run.id)} freie Aufgaben` : `${participantIdsForAdventureRun(state, run).length} Teilnehmende`}</span>
                    <div className="work-step-actions">
                      <button className="action-button compact-action secondary" type="button" onClick={() => selectAdventure(run.id)}>Öffnen</button>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </section>
        ) : null}
        <section className="detail-section">
          <p className="eyebrow">{activeRun ? "Aufgaben im aktiven Adventure" : "Aufgaben der Vorlage"}</p>
          <div className="work-step-list">
            {stepEntries().map(([, step]: any) => <AdventureWorkStep key={step.id} step={step} {...props} />)}
          </div>
        </section>
        {activeRun ? <TimelineBlock events={state.timeline.filter((event: any) => event.adventureRunId === activeRun.id || event.scopes.includes("adventure"))} emptyText="Noch keine Ereignisse in diesem Adventure." /> : null}
      </section>
    </div>
  )
}

export function EntityHeader({ image, title, subtitle, tags }: any) {
  return (
    <div className="adventure-detail-header">
      <div className="detail-title-row adventure-title-row">
        <ItemImage src={image} label={title} />
        <div>
          <h3>{title}</h3>
          <p className="meta">{subtitle}</p>
        </div>
      </div>
      <div className="detail-tags">{tags}</div>
    </div>
  )
}

export function AdventureWorkStep(props: any) {
  const { state, step } = props
  const quest = getQuestForStep(step)
  const runs = runsForStep(state, step.id)
  const focused = state.selectedStepId === step.id

  return (
    <section className={`work-step ${focused ? "is-focused" : ""} ${runs.length ? "is-assigned" : ""}`}>
      <ItemImage src={quest.image} label={quest.title} className="item-image work-step-image" />
      <div className="work-step-copy">
        <h4>{quest.title}</h4>
        <div className="field-list card-field-list"><FieldChips fields={developmentFieldsForStep(step)} limit={2} /></div>
        <p className="meta">{stepPlaceTimeLabel(step)}</p>
      </div>
      <div className="work-step-tags">
        <RequirementTag step={step} />
      </div>
      <div className="work-step-side">
        <WorkStepAssignees runs={runs} />
        <InlineStepActions {...props} />
      </div>
    </section>
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
  const { state } = props
  const questKey = state.selectedStandaloneQuestKey || scenario.campaign?.standaloneQuestOfferKeys?.[0]
  const quest = getQuest(questKey)
  const offer = getStandaloneOffer(questKey)
  const runs = runsForStandaloneQuest(state, questKey)
  const status = standaloneQuestStatus(state, questKey)
  const periodText = isScheduledStandaloneQuest(questKey)
    ? recurrenceSummary(state, questKey)
    : offer.repeatable && offer.cadence === "daily"
      ? `${runCountLabel(runs.length)} geplant`
      : "Einmalige Aufgabe"
  const location = standaloneLocation(questKey)

  return (
    <div className="stack">
      <section className="panel adventure-detail standalone-detail">
        <EntityHeader
          image={quest.image}
          title={quest.title}
          subtitle={`${periodText} · ${location?.label || "ortsunabhängig"}`}
          tags={<><span className="requirement-tag standalone-tag">Einzelaufgabe</span><StatusBadge status={status} /></>}
        />
        {isScheduledStandaloneQuest(questKey) ? <RecurrencePanel questKey={questKey} {...props} /> : null}
        <div className="work-step-list standalone-run-list">
          <StandaloneDetailRows questKey={questKey} {...props} />
        </div>
        <TimelineBlock events={state.timeline.filter((event: any) => event.scopes.includes("questRun"))} emptyText="Noch keine Ereignisse zu dieser Aufgabe." />
      </section>
    </div>
  )
}

export function RecurrencePanel({ state, questKey, setRecurrenceWeekday, setRecurrenceUntil }: any) {
  const rule = recurrenceRuleForQuest(state, questKey)
  const editable = canConfirm(state.selectedRole)
  const selectedWeekdays = new Set(rule.weekdays)

  return (
    <section className="recurrence-panel" aria-label="Wiederholung">
      <div>
        <h4>Wiederholung</h4>
        <p className="meta">{recurrenceSummary(state, questKey)}</p>
      </div>
      {editable ? (
        <div className="recurrence-controls">
          <div className="weekday-toggle-group" aria-label="Wochentage">
            {WEEKDAY_OPTIONS.map((weekday) => (
              <label className={`weekday-toggle ${selectedWeekdays.has(weekday.value) ? "is-selected" : ""}`} key={weekday.value}>
                <input
                  type="checkbox"
                  checked={selectedWeekdays.has(weekday.value)}
                  onChange={(event) => setRecurrenceWeekday(questKey, weekday.value, event.currentTarget.checked)}
                />
                <span>{weekday.label}</span>
              </label>
            ))}
          </div>
          <label className="recurrence-until">
            <span>Bis</span>
            <input type="date" value={rule.until || ""} onChange={(event) => setRecurrenceUntil(questKey, event.currentTarget.value)} />
          </label>
        </div>
      ) : null}
    </section>
  )
}

export function StandaloneDetailRows(props: any) {
  const { state, questKey } = props
  const runs = runsForStandaloneQuest(state, questKey)
  if (!runs.length && isScheduledStandaloneQuest(questKey)) {
    return (
      <section className="work-step standalone-run-step">
        <div className="work-step-copy">
          <h4>Kein offener Termin</h4>
          <p className="meta">Die Wiederholung erzeugt aktuell keinen übernehmbaren Termin.</p>
        </div>
        <div className="work-step-tags">
          <StatusBadge status="suggested" />
          <span className="requirement-tag standalone-tag">{standaloneOfferLabel(state, getStandaloneOffer(questKey), questKey)}</span>
        </div>
        <div className="work-step-side">
          <div className="work-step-actions is-empty" />
        </div>
      </section>
    )
  }

  const rows = runs.length ? runs : [null]
  return rows
    .slice()
    .sort(compareStandaloneDetailRuns)
    .map((run: any, index: number) => <StandaloneWorkRun key={run?.id || `new-${index}`} run={run} {...props} />)
}

export function compareStandaloneDetailRuns(a: any, b: any) {
  if (!a || !b) return a ? -1 : b ? 1 : 0
  const order: Record<string, number> = {
    accepted: 0,
    "in-progress": 0,
    open: 1,
    completed: 2,
    confirmed: 3
  }

  return (order[a.status] ?? 4) - (order[b.status] ?? 4) ||
    questRunTimestamp(a) - questRunTimestamp(b)
}

export function StandaloneWorkRun(props: any) {
  const { state, run, questKey } = props
  const quest = getQuest(questKey)
  const offer = getStandaloneOffer(questKey)
  const status = run?.status || "suggested"
  const participantIds = run ? runParticipantIds(run) : []

  return (
    <section className={`work-step standalone-run-step ${participantIds.length ? "is-assigned" : ""}`}>
      <div className="work-step-copy">
        <h4>{run?.startsAt ? formatScheduleDate(run) : quest.title}</h4>
        <div className="field-list card-field-list"><FieldChips fields={quest.developmentFields} limit={2} /></div>
        <p className="meta">{standaloneRunPlaceTimeLabel(run, questKey)}</p>
      </div>
      <div className="work-step-tags">
        <StatusBadge status={status} />
        <span className="requirement-tag standalone-tag">{standaloneOfferLabel(state, offer, questKey)}</span>
      </div>
      <div className="work-step-side">
        {participantIds.length ? (
          <div className="work-step-assignees">
            <span className="work-step-assignee">
              <AvatarGroup personIds={participantIds} />
              <span>{participantIds.map(personName).join(", ")}</span>
            </span>
          </div>
        ) : null}
        <StandaloneRunAction run={run} {...props} />
      </div>
    </section>
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
