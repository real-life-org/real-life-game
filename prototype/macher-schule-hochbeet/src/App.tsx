import { useEffect, useRef, useState } from "react"
import * as domain from "./domain"
import type { Model } from "./domain"
import { QuestSurface, ProfilePanel, WorldState, ModelInfo } from "./components"
import { UserAvatar } from "./ui/primitives"

const {
  STORAGE_KEY,
  BUNDLE_STORAGE_KEY,
  MAIN_TABS,
  scenario,
  clone,
  normalizeState,
  loadState,
  saveState,
  currentSimulationBundle,
  personName,
  isStudent,
  canConfirm,
  slug,
  formatScheduleDate,
  formatScheduleTime,
  getQuest,
  getStep,
  getQuestForStep,
  getStandaloneOffer,
  stepSchedule,
  recurrenceRuleForQuest,
  runParticipantIds,
  runHasParticipant,
  addRunParticipant,
  markRunParticipants,
  adventureRun,
  getRun,
  runWindowStarted,
  runCanStillBeAccepted,
  findRun,
  participationPolicyForStep,
  participationPolicyForStandalone,
  runHasParticipantSlot,
  runHasEnoughParticipants,
  capacityReached,
  joinableRunForStep,
  isScheduledStandaloneQuest,
  allowsMultipleStandaloneRuns,
  nextOpenStandaloneRun,
  standaloneRunOption,
  findStandaloneRun,
  standaloneCapacityReached,
  hasConfirmation,
  completionClaim,
  confirmationClaim,
  dependenciesMet,
  syncAdventureCompletion,
  addEvent,
  createAdventureRun,
  addParticipantToAdventureRun,
  createStandaloneRun,
  materializeStandaloneRun,
  runTitle
} = domain

export function App() {
  const [state, setState] = useState(() => loadState())
  const [debugVisible, setDebugVisible] = useState(false)
  const [importStatus, setImportStatus] = useState("")
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const root = document.documentElement
    const visuals = scenario.gamePack?.visuals || {}
    if (visuals.primaryColor) root.style.setProperty("--green", visuals.primaryColor)
    if (visuals.accentColor) root.style.setProperty("--amber", visuals.accentColor)
    if (visuals.completedColor) root.style.setProperty("--blue", visuals.completedColor)
    if (visuals.historyBackground) root.style.setProperty("--history-card", visuals.historyBackground)
  }, [])

  function commit(mutator: (draft: Model) => void) {
    setState((previous: Model) => {
      const next = clone(previous)
      mutator(next)
      syncAdventureCompletion(next)
      return normalizeState(next)
    })
  }

  function setMainTab(tabId: string) {
    if (!MAIN_TABS.some((tab) => tab.id === tabId)) return
    commit((draft) => {
      draft.selectedTab = tabId
    })
  }

  function setRole(roleId: string) {
    if (!scenario.roles[roleId]) return
    commit((draft) => {
      draft.selectedRole = roleId
    })
  }

  function selectCampaign(campaignId: string) {
    const bundle = currentSimulationBundle()
    if (!bundle?.campaigns?.[campaignId]) return
    if (campaignId === bundle.activeCampaignId) return

    const nextBundle = {
      ...bundle,
      activeCampaignId: campaignId
    }
    window.localStorage.setItem(BUNDLE_STORAGE_KEY, JSON.stringify(nextBundle))
    window.localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  function showQuestOverview() {
    commit((draft) => {
      draft.selectedTab = "quests"
      draft.selectedView = "overview"
      draft.selectedStepId = null
      draft.selectedStandaloneQuestKey = null
    })
  }

  function selectAdventure(runId: string | null = state.selectedAdventureRunId || null) {
    commit((draft) => {
      draft.selectedTab = "quests"
      draft.selectedView = "adventure"
      draft.selectedAdventureRunId = runId
      draft.selectedStandaloneQuestKey = null
      draft.selectedStepId = null
    })
  }

  function selectAdventureStep(runId: string | null, stepId: string | null) {
    commit((draft) => {
      draft.selectedTab = "quests"
      draft.selectedView = "adventure"
      draft.selectedAdventureRunId = runId
      draft.selectedStepId = stepId
      draft.selectedStandaloneQuestKey = null
    })
  }

  function selectStandaloneQuest(questKey: string) {
    commit((draft) => {
      draft.selectedTab = "quests"
      draft.selectedView = "standalone"
      draft.selectedStepId = null
      draft.selectedStandaloneQuestKey = questKey
    })
  }

  function updateRecurrenceRule(questKey: string, patch: any) {
    commit((draft) => {
      draft.recurrenceRules = {
        ...(draft.recurrenceRules || {}),
        [questKey]: {
          ...recurrenceRuleForQuest(draft, questKey),
          ...patch
        }
      }
    })
  }

  function setRecurrenceWeekday(questKey: string, weekday: number, enabled: boolean) {
    const rule = recurrenceRuleForQuest(state, questKey)
    const weekdays = new Set<number>(rule.weekdays || [])
    if (enabled) weekdays.add(weekday)
    if (!enabled && weekdays.size > 1) weekdays.delete(weekday)
    updateRecurrenceRule(questKey, { weekdays: Array.from(weekdays).sort((a, b) => a - b) })
  }

  function setRecurrenceUntil(questKey: string, until: string) {
    updateRecurrenceRule(questKey, { until: until || null })
  }

  function acceptStep(actorId: string, stepId: string) {
    commit((draft) => {
      const step = getStep(stepId)
      let activeAdventureRun = adventureRun(draft)
      const joinableRun = activeAdventureRun ? joinableRunForStep(draft, actorId, step, activeAdventureRun.id) : null
      if (
        !step ||
        !isStudent(actorId) ||
        findRun(draft, actorId, stepId) ||
        (activeAdventureRun && !joinableRun && capacityReached(draft, step, activeAdventureRun.id))
      ) return

      if (!activeAdventureRun) {
        activeAdventureRun = createAdventureRun(draft, actorId)
      }

      const quest = getQuestForStep(step)
      const schedule = stepSchedule(step)
      if (joinableRun) {
        addRunParticipant(joinableRun, actorId)
        joinableRun.status = "accepted"
        addParticipantToAdventureRun(activeAdventureRun, actorId)
        addEvent(draft, `${personName(actorId)} macht in ${activeAdventureRun.title} bei "${quest.title}" mit.`, {
          scopes: ["adventure", "questRun"],
          adventureRunId: activeAdventureRun.id,
          questRunId: joinableRun.id,
          personId: actorId
        })
        return
      }

      const run = {
        id: `quest-run:${slug(activeAdventureRun.id)}-${slug(step.id)}-${draft.runs.length + 1}`,
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
      draft.runs.push(run)
      addEvent(draft, `${personName(actorId)} hat in ${activeAdventureRun.title} die Aufgabe "${quest.title}" übernommen.`, {
        scopes: ["adventure", "questRun"],
        adventureRunId: activeAdventureRun.id,
        questRunId: run.id,
        personId: actorId
      })
    })
  }

  function completeStep(actorId: string, stepId: string) {
    commit((draft) => {
      const step = getStep(stepId)
      const run = findRun(draft, actorId, stepId)
      const policy = participationPolicyForStep(step)
      if (
        !step ||
        !run ||
        run.status !== "accepted" ||
        !runHasEnoughParticipants(run, policy) ||
        !dependenciesMet(draft, stepId) ||
        !runHasParticipant(run, actorId) ||
        !runWindowStarted(run)
      ) return

      run.status = "completed"
      run.completedAt = Date.now()
      markRunParticipants(run, "completed")
      const evidenceRefs = draft.evidence
        .filter((item: any) => item.subjectId === run.id)
        .map((item: any) => item.id)
      run.completion = { claim: completionClaim(step.questKey), evidenceRefs }
      addEvent(draft, `${personName(actorId)} hat die Aufgabe "${getQuestForStep(step).title}" fertig gemeldet.`, {
        scopes: ["adventure", "questRun"],
        adventureRunId: run.adventureRunId,
        questRunId: run.id,
        personId: actorId
      })
    })
  }

  function acceptStandaloneQuest(actorId: string, questKey: string, runId: string | null = null) {
    commit((draft) => {
      const quest = getQuest(questKey)
      const offer = getStandaloneOffer(questKey)
      const selectedOpenRun = runId ? standaloneRunOption(draft, questKey, runId) : nextOpenStandaloneRun(draft, questKey)
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
        (!allowsMultipleStandaloneRuns(questKey) && findStandaloneRun(draft, actorId, questKey)) ||
        (runId && !canUseSelectedRun) ||
        (!canUseSelectedRun && isScheduledStandaloneQuest(questKey)) ||
        (!canUseSelectedRun && standaloneCapacityReached(draft, questKey))
      ) return

      const run = canUseSelectedRun
        ? (selectedOpenRun.virtual ? materializeStandaloneRun(selectedOpenRun) : selectedOpenRun)
        : createStandaloneRun(draft, actorId, questKey)
      addRunParticipant(run, actorId)
      run.status = "accepted"
      if (!canUseSelectedRun || selectedOpenRun?.virtual) draft.runs.push(run)
      addEvent(draft, `${personName(actorId)} hat die Aufgabe "${quest.title}"${run.startsAt ? ` für ${formatScheduleDate(run)} ${formatScheduleTime(run)}` : ""} übernommen.`, {
        scopes: ["global", "questRun"],
        questRunId: run.id,
        personId: actorId
      })
    })
  }

  function completeStandaloneQuest(actorId: string, questKey: string, runId: string | null = null) {
    commit((draft) => {
      const quest = getQuest(questKey)
      const run = runId ? getRun(draft, runId) : findStandaloneRun(draft, actorId, questKey)
      if (!quest || !run || run.status !== "accepted" || !runHasParticipant(run, actorId) || !runWindowStarted(run)) return

      run.status = "completed"
      run.completedAt = Date.now()
      markRunParticipants(run, "completed")
      const evidenceRefs = draft.evidence
        .filter((item: any) => item.subjectId === run.id)
        .map((item: any) => item.id)
      run.completion = { claim: completionClaim(questKey), evidenceRefs }
      addEvent(draft, `${personName(actorId)} hat die Aufgabe "${quest.title}" fertig gemeldet.`, {
        scopes: ["global", "questRun"],
        questRunId: run.id,
        personId: actorId
      })
    })
  }

  function postFramePhoto(actorId: string) {
    commit((draft) => {
      const activeAdventureRun = adventureRun(draft)
      if (!activeAdventureRun) return
      const run = findRun(draft, actorId, "rel:schoolyard-raised-bed-documentation") ||
        findRun(draft, actorId, "documentation")
      const targetRunId = run?.id || activeAdventureRun.id
      const evidence = {
        id: `evidence:frame-photo:${actorId}:${Date.now()}`,
        type: "photo",
        createdBy: actorId,
        subjectId: targetRunId,
        caption: "Foto vom verschraubten Rahmen.",
        createdAt: Date.now()
      }
      draft.evidence.push(evidence)
      addEvent(draft, `${personName(actorId)} hat ein Foto gepostet.`, {
        scopes: ["adventure", "questRun"],
        adventureRunId: activeAdventureRun.id,
        questRunId: targetRunId,
        personId: actorId
      })
    })
  }

  function postRunPhoto(actorId: string, runId: string) {
    commit((draft) => {
      const run = getRun(draft, runId)
      if (!run || !runHasParticipant(run, actorId)) return
      const evidence = {
        id: `evidence:run-photo:${slug(runId)}:${actorId}:${Date.now()}`,
        type: "photo",
        createdBy: actorId,
        subjectId: run.id,
        caption: `Foto zu "${runTitle(run)}".`,
        createdAt: Date.now()
      }
      draft.evidence.push(evidence)
      addEvent(draft, `${personName(actorId)} hat ein Foto zu "${runTitle(run)}" gepostet.`, {
        scopes: run.adventureRunId ? ["adventure", "questRun"] : ["global", "questRun"],
        adventureRunId: run.adventureRunId,
        questRunId: run.id,
        personId: actorId
      })
    })
  }

  function confirmRun(runId: string, issuerId: string) {
    commit((draft) => {
      const run = getRun(draft, runId)
      if (!run || !canConfirm(issuerId) || run.status !== "completed" || hasConfirmation(draft, runId)) return

      run.status = "confirmed"
      run.confirmedAt = Date.now()
      markRunParticipants(run, "confirmed")
      const recipients = runParticipantIds(run)
      const confirmation = {
        id: `confirmation:${slug(runId)}:${Date.now()}`,
        subjectId: runId,
        subjectType: "questRun",
        issuerId,
        recipientIds: recipients,
        claim: confirmationClaim(run),
        createdAt: Date.now()
      }
      draft.confirmations.push(confirmation)
      addEvent(draft, `${personName(issuerId)} hat bestätigt: ${confirmation.claim}`, {
        scopes: run.adventureRunId ? ["global", "adventure", "questRun"] : ["global", "questRun"],
        adventureRunId: run.adventureRunId,
        questRunId: run.id,
        personId: issuerId,
        public: true
      })
    })
  }

  function resetScenario() {
    window.localStorage.removeItem(STORAGE_KEY)
    setState(normalizeState(clone(scenario.initialState)))
    setImportStatus("")
  }

  function resetImportedModel() {
    window.localStorage.removeItem(BUNDLE_STORAGE_KEY)
    window.localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  function exportJson(payload: any, filename: string) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  async function importSimulationFile(file: File) {
    try {
      const payload = JSON.parse(await file.text())
      if (payload?.schemaVersion?.startsWith?.("rlg-simulation-bundle")) {
        window.localStorage.setItem(BUNDLE_STORAGE_KEY, JSON.stringify(payload))
        window.localStorage.removeItem(STORAGE_KEY)
        setImportStatus("Datenmodell importiert. Die Simulation wird neu geladen.")
        window.setTimeout(() => window.location.reload(), 200)
        return
      }

      const importedState = payload?.state || payload
      setState(normalizeState(importedState))
      setImportStatus("Simulationsstand importiert.")
    } catch (error: any) {
      setImportStatus(error.message || "Import fehlgeschlagen.")
    }
  }

  const role = scenario.roles[state.selectedRole]

  return (
    <main className="app-shell">
      <header className="app-navbar">
        <div className="navbar-start">
          <details className="context-menu">
            <summary className="context-trigger" aria-label="Spiel auswählen">
              <span className="context-kicker">Spiel</span>
              <span className="context-title">{scenario.campaign?.title || scenario.title}</span>
              <span className="user-menu-caret" aria-hidden="true">v</span>
            </summary>
            <div className="context-menu-panel">
              <p className="menu-label">Kontext wechseln</p>
              <div className="context-switch-options">
                {Object.values(currentSimulationBundle()?.campaigns || {}).map((campaign: any) => (
                  <button
                    className={`context-switch-option ${campaign.id === scenario.campaign?.id ? "is-active" : ""}`}
                    type="button"
                    key={campaign.id}
                    onClick={() => selectCampaign(campaign.id)}
                  >
                    <span className="context-switch-title">{campaign.title}</span>
                    <span className="context-switch-meta">{currentSimulationBundle()?.gamePacks?.[campaign.gamePackId]?.title || "Game Pack"}</span>
                  </button>
                ))}
              </div>
            </div>
          </details>
        </div>

        <nav className="navbar-tabs" aria-label="Hauptnavigation">
          {MAIN_TABS.map((tab) => (
            <button
              className={`tab-button ${state.selectedTab === tab.id ? "is-active" : ""}`}
              type="button"
              key={tab.id}
              onClick={() => setMainTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="navbar-end">
          <details className="user-menu">
            <summary className="user-menu-trigger" aria-label="User wechseln">
              <UserAvatar personId={state.selectedRole} className="user-menu-avatar" />
              <span className="user-menu-copy">
                <span className="user-menu-name">{role.name}</span>
                <span className="user-menu-role">{role.perspective}</span>
              </span>
              <span className="user-menu-caret" aria-hidden="true">v</span>
            </summary>
            <div className="user-menu-panel">
              <p className="menu-label">User wechseln</p>
              <div className="user-switch-options">
                {Object.entries(scenario.roles).map(([roleId, item]: any) => (
                  <button
                    className={`user-switch-option ${roleId === state.selectedRole ? "is-active" : ""}`}
                    type="button"
                    key={roleId}
                    onClick={() => setRole(roleId)}
                  >
                    <UserAvatar personId={roleId} className="user-option-avatar" />
                    <span>
                      <span className="user-switch-name">{item.name}</span>
                      <span className="user-switch-role">{item.perspective}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </details>
        </div>
      </header>

      <div className="app-content">
        <section className="app-layout">
          <section className="workspace-column">
            <div className="surface-heading">
              <button className="surface-title-button" type="button" onClick={showQuestOverview}>
                {state.selectedView === "overview" ? "" : "← "}Aufgabenübersicht
              </button>
            </div>
            <section className="quest-column">
              <section className="quest-panel">
                <QuestSurface
                  state={state}
                  selectAdventure={selectAdventure}
                  selectAdventureStep={selectAdventureStep}
                  selectStandaloneQuest={selectStandaloneQuest}
                  acceptStep={acceptStep}
                  completeStep={completeStep}
                  acceptStandaloneQuest={acceptStandaloneQuest}
                  completeStandaloneQuest={completeStandaloneQuest}
                  postRunPhoto={postRunPhoto}
                  postFramePhoto={postFramePhoto}
                  confirmRun={confirmRun}
                  setRecurrenceWeekday={setRecurrenceWeekday}
                  setRecurrenceUntil={setRecurrenceUntil}
                />
              </section>
            </section>
          </section>

          <aside className="profile-panel" aria-label="Profil">
            <ProfilePanel state={state} selectAdventure={selectAdventure} selectStandaloneQuest={selectStandaloneQuest} />
          </aside>
        </section>

        <section className="debug-layout">
          <button
            className="debug-toggle"
            type="button"
            aria-expanded={debugVisible}
            onClick={() => setDebugVisible((value) => !value)}
          >
            Debug anzeigen
          </button>
          <section className={`panel debug-panel ${debugVisible ? "" : "is-hidden"}`}>
            <div className="panel-heading debug-heading">
              <div>
                <p className="eyebrow">World State</p>
                <h2>Gemeinsamer Zustand</h2>
              </div>
              <button className="ghost-button compact" type="button" onClick={resetScenario}>Zurücksetzen</button>
            </div>
            <WorldState state={state} />
            <div className="debug-divider" />
            <div className="panel-heading debug-heading">
              <div>
                <p className="eyebrow">Simulator</p>
                <h2>Datenmodell</h2>
              </div>
            </div>
            <ModelInfo />
            <div className="debug-actions">
              <button className="ghost-button compact" type="button" onClick={() => exportJson(currentSimulationBundle(), "macher-schule-hochbeet-bundle.json")}>Datenmodell exportieren</button>
              <button className="ghost-button compact" type="button" onClick={() => exportJson({ schemaVersion: "rlg-simulation-state@0.1", state }, "macher-schule-hochbeet-state.json")}>Stand exportieren</button>
              <button className="ghost-button compact" type="button" onClick={() => importInputRef.current?.click()}>Importieren</button>
              <button className="ghost-button compact" type="button" onClick={resetImportedModel}>Datenmodell zurücksetzen</button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                hidden
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0]
                  if (file) importSimulationFile(file)
                  event.currentTarget.value = ""
                }}
              />
            </div>
            <p className="debug-status" aria-live="polite">{importStatus}</p>
          </section>
        </section>
      </div>
    </main>
  )
}
