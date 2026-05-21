import * as domain from "../domain"
import type { Model } from "../domain"
import { AvatarGroup, FieldChips, ItemImage, RequirementTag, StatusBadge, StatusMarker, UserAvatar } from "../ui/primitives"

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

export function ProfilePanel({ state, selectAdventure, selectStandaloneQuest }: any) {
  const role = scenario.roles[state.selectedRole]
  const badges = badgesForPerson(state, state.selectedRole)
  const fieldCounts = fieldCountsForPerson(state, state.selectedRole)
  const questLog = sortedQuestRunsForPerson(state, state.selectedRole)

  return (
    <>
      <section className="profile-region">
        <p className="eyebrow">Profil</p>
        <section className="panel profile-frame">
          <article className="profile-card">
            <div className="profile-top">
              <div className="profile-identity">
                <UserAvatar personId={state.selectedRole} />
                <div>
                  <h3>{role.name}</h3>
                  <p className="meta">{role.perspective}</p>
                </div>
              </div>
              <span className="status accepted">{role.perspective}</span>
            </div>
            <div className="profile-stats">
              <div><strong>{questLog.length}</strong><span>Aufgaben</span></div>
              <div><strong>{badges.length}</strong><span>Badges</span></div>
              <div><strong>{fieldCounts.length}</strong><span>Felder</span></div>
            </div>
            <div className="profile-section">
              <h4>Badges</h4>
              {badges.length ? <BadgeGrid badges={badges} /> : <p className="meta">Noch keine Badges.</p>}
            </div>
            <div className="profile-section">
              <h4>Entwicklungskarte</h4>
              {fieldCounts.length ? <DevelopmentMap fields={fieldCounts} /> : <p className="meta">Noch keine bestätigten Feld-Berührungen.</p>}
            </div>
            <div className="profile-section">
              <details className="collapse-panel quest-log-panel">
                <summary className="collapse-summary">
                  <span className="collapse-title">Aufgabenlog</span>
                  <span className="collapse-count">{questLog.length} Einträge</span>
                </summary>
                {questLog.length ? (
                  <ol className="timeline quest-log">
                    {questLog.map((run: any) => <QuestLogItem key={run.id} state={state} run={run} />)}
                  </ol>
                ) : <p className="meta">Noch keine Aufgaben.</p>}
              </details>
            </div>
          </article>
        </section>
      </section>
      <CurrentWorkPanel state={state} selectAdventure={selectAdventure} selectStandaloneQuest={selectStandaloneQuest} />
    </>
  )
}

export function BadgeGrid({ badges }: { badges: any[] }) {
  return (
    <div className="badge-grid">
      {badges.map((badge) => (
        <span className="badge-item" key={badge.questKey}>
          <span className="badge-icon-wrap">
            <ItemImage src={badge.image} label={badge.title} />
            {badge.count > 1 ? <span className="badge-count">{badge.count}</span> : null}
          </span>
          <span>{badge.title}</span>
        </span>
      ))}
    </div>
  )
}

export function DevelopmentMap({ fields }: { fields: any[] }) {
  return (
    <div className="field-list">
      {fields.map(({ field, count }) => (
        <span className="field field-count" key={field}>
          {field}
          {count > 1 ? <span className="badge-count">{count}</span> : null}
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
        <div className="open-work-list">
          {openRuns.map((run: any) => (
            <button
              className="open-work-item"
              type="button"
              key={run.id}
              onClick={() => run.adventureRunId ? selectAdventure(run.adventureRunId) : selectStandaloneQuest(run.questKey)}
            >
              <ItemImage src={getQuest(run.questKey).image} label={runTitle(run)} />
              <span>
                <strong>{runTitle(run)}</strong>
                <span>{runSubtitle(state, run)}</span>
              </span>
              <span>Weitermachen</span>
            </button>
          ))}
        </div>
      </section>
    </section>
  )
}
