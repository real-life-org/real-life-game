import * as domain from "../domain"
import type { Model } from "../domain"
import { ItemImage, StatusMarker, UserAvatar } from "../ui/primitives"
import { OverviewLenses } from "./QuestSurface"

const {
  scenario,
  relativeTime,
  getQuest,
  fieldCountsForPerson,
  badgesForPerson,
  questRunTimestamp,
  sortedQuestRunsForPerson,
  runTitle,
  runSubtitle,
  activeActionRun
} = domain

export function RightRail({
  state,
  setMainTab,
  selectAdventure,
  selectStandaloneQuest
}: any) {
  const showCurrentWork = state.selectedTab && state.selectedTab !== "quests"

  return (
    <div className="lens-rail">
      {showCurrentWork ? (
        <CurrentWorkPanel
          state={state}
          selectAdventure={selectAdventure}
          selectStandaloneQuest={selectStandaloneQuest}
        />
      ) : null}
      <OverviewLenses
        state={state}
        setMainTab={setMainTab}
        selectAdventure={selectAdventure}
        selectStandaloneQuest={selectStandaloneQuest}
      />
    </div>
  )
}

export function ProfilePage({ state, selectAdventure, selectStandaloneQuest }: any) {
  const role = scenario.roles[state.selectedRole]
  const badges = badgesForPerson(state, state.selectedRole)
  const fieldCounts = fieldCountsForPerson(state, state.selectedRole)
  const questLog = sortedQuestRunsForPerson(state, state.selectedRole)
  const openRuns = activeActionRun(state, state.selectedRole)

  return (
    <div className="profile-page">
      <section className="panel profile-hero">
        <div className="profile-hero-main">
          <UserAvatar personId={state.selectedRole} className="profile-page-avatar" />
          <div className="profile-hero-copy">
            <p className="eyebrow">Profil</p>
            <h1>{role.name}</h1>
            <p className="meta">{role.perspective}</p>
            <p className="profile-privacy">Profildaten sind privat. Mentorinnen und Mentoren sehen nur das, was für Begleitung und Attestierung relevant ist.</p>
          </div>
        </div>
        <span className="status accepted">{role.perspective}</span>
        <div className="profile-stats profile-stats-wide">
          <div><strong>{questLog.length}</strong><span>Aufgaben</span></div>
          <div><strong>{badges.length}</strong><span>Badges</span></div>
          <div><strong>{fieldCounts.length}</strong><span>Felder</span></div>
        </div>
      </section>

      <div className="profile-page-grid">
        <div className="profile-page-column">
          <section className="panel profile-page-card">
            <ProfileSectionHeading title="Aktuelle Aufgaben" count={openRuns.length} />
            {openRuns.length ? (
              <OpenWorkList
                state={state}
                runs={openRuns}
                selectAdventure={selectAdventure}
                selectStandaloneQuest={selectStandaloneQuest}
              />
            ) : (
              <p className="meta">Keine aktiven Aufgaben.</p>
            )}
          </section>

          <section className="panel profile-page-card">
            <ProfileSectionHeading title="Aufgabenlog" count={questLog.length} />
            {questLog.length ? (
              <ol className="timeline quest-log">
                {questLog.map((run: any) => <QuestLogItem key={run.id} state={state} run={run} />)}
              </ol>
            ) : <p className="meta">Noch keine Aufgaben.</p>}
          </section>
        </div>

        <div className="profile-page-column">
          <section className="panel profile-page-card">
            <ProfileSectionHeading title="Badges" count={badges.length} />
            {badges.length ? <BadgeGrid badges={badges} /> : <p className="meta">Noch keine Badges.</p>}
          </section>

          <section className="panel profile-page-card">
            <ProfileSectionHeading title="Entwicklungskarte" count={fieldCounts.length} />
            {fieldCounts.length ? <DevelopmentMap fields={fieldCounts} /> : <p className="meta">Noch keine bestätigten Feld-Berührungen.</p>}
          </section>
        </div>
      </div>
    </div>
  )
}

function ProfileSectionHeading({ title, count }: { title: string, count: number }) {
  return (
    <div className="profile-section-heading">
      <h2>{title}</h2>
      <span>{count}</span>
    </div>
  )
}

export function BadgeGrid({ badges }: { badges: any[] }) {
  return (
    <div className="badge-grid">
      {badges.map((badge) => (
        <span className="profile-badge" key={badge.questKey}>
          <span className="badge-image-wrap">
            <ItemImage src={badge.image} label={badge.title} className="badge-image" />
            {badge.count > 1 ? <span className="badge-count">{badge.count}</span> : null}
          </span>
          <span className="badge-title">{badge.title}</span>
        </span>
      ))}
    </div>
  )
}

export function DevelopmentMap({ fields }: { fields: any[] }) {
  return (
    <div className="field-list">
      {fields.map(({ field, count }) => (
        <span className="field field-with-count" key={field}>
          {field}
          {count > 1 ? <span className="field-count">{count}</span> : null}
        </span>
      ))}
    </div>
  )
}

export function QuestLogItem({ state, run }: any) {
  return (
    <li className="timeline-event">
      <span className="timeline-avatar-slot">
        <StatusMarker status={run.status} />
      </span>
      <span className="timeline-event-body quest-log-body">
        <span className="timeline-event-copy">{runTitle(run)} · {runSubtitle(state, run)}</span>
        <span className="timeline-event-time">{relativeTime(questRunTimestamp(run))}</span>
      </span>
    </li>
  )
}

export function CurrentWorkPanel({ state, selectAdventure, selectStandaloneQuest }: any) {
  const openRuns = activeActionRun(state, state.selectedRole)
  if (!openRuns.length) return null
  const label = openRuns.length === 1 ? "Aktuelle Aufgabe" : "Aktuelle Aufgaben"

  return (
    <section className="current-work-region">
      <p className="eyebrow">{label}</p>
      <section className="panel current-work-panel">
        <OpenWorkList
          state={state}
          runs={openRuns}
          selectAdventure={selectAdventure}
          selectStandaloneQuest={selectStandaloneQuest}
        />
      </section>
    </section>
  )
}

function OpenWorkList({ state, runs, selectAdventure, selectStandaloneQuest }: {
  state: Model,
  runs: any[],
  selectAdventure: (runId: string) => void,
  selectStandaloneQuest: (questKey: string) => void
}) {
  return (
    <div className="open-work-list">
      {runs.map((run: any) => (
        <button
          className="open-work-item"
          type="button"
          key={run.id}
          onClick={() => run.adventureRunId ? selectAdventure(run.adventureRunId) : selectStandaloneQuest(run.questKey)}
        >
          <span className="open-work-main">
            <ItemImage src={getQuest(run.questKey).image} label={runTitle(run)} className="open-work-image" />
            <span className="open-work-copy">
              <strong>{runTitle(run)}</strong>
              <span>{runSubtitle(state, run)}</span>
            </span>
          </span>
          <span className="open-work-actions">
            <span className="action-button open-work-cta">Weitermachen</span>
          </span>
        </button>
      ))}
    </div>
  )
}
