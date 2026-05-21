import * as domain from "../domain"
import type { Model } from "../domain"
import { AvatarGroup, FieldChips, ItemImage, RequirementTag, StatusBadge, StatusMarker, UserAvatar } from "../ui/primitives"

const {
  scenario,
  PRIMARY_WORLD_METRIC_KEY,
  WORLD_TARGET,
  stepEntries,
  adventureRuns
} = domain

export function WorldState({ state }: { state: Model }) {
  const metric = scenario.worldStateMetrics?.[PRIMARY_WORLD_METRIC_KEY] || {}
  const value = state.worldState?.[PRIMARY_WORLD_METRIC_KEY] || 0
  const percent = Math.min(100, Math.round((value / WORLD_TARGET) * 100))

  return (
    <div className="stack">
      <div className="world-meter">
        <h3>{metric.label || PRIMARY_WORLD_METRIC_KEY}: {value} / {WORLD_TARGET}</h3>
        <div className="meter-track" aria-hidden="true"><div className="meter-fill" style={{ width: `${percent}%` }} /></div>
        <p className="meta">Ein Hochbeet zählt erst, wenn alle Pflichtaufgaben im jeweiligen Adventure mindestens einen bestätigten Beitrag haben.</p>
      </div>
      <div className="flow">
        <div className="node"><strong>Adventure wählen</strong><StatusBadge status={adventureRuns(state).length ? "accepted" : "suggested"} /></div>
        <div className="node"><strong>World State</strong><StatusBadge status={value > 0 ? "accepted" : "suggested"} /></div>
      </div>
    </div>
  )
}

export function ModelInfo() {
  return (
    <div className="debug-model-info">
      <div><strong>{window.SIMULATION_BUNDLE?.title || scenario.title}</strong><span>SimulationBundle</span></div>
      <div><strong>{scenario.campaign?.title}</strong><span>Kampagne</span></div>
      <div><strong>{scenario.gamePack?.title}</strong><span>Game Pack</span></div>
      <div><strong>{Object.keys(scenario.quests || {}).length} Aufgaben · {stepEntries().length} Adventure-Aufgaben</strong><span>Datenumfang</span></div>
    </div>
  )
}
