import * as domain from "../domain"
import type { Model } from "../domain"
import { AvatarGroup, FieldChips, ItemImage, RequirementTag, StatusBadge, StatusMarker, UserAvatar } from "../ui/primitives"

const {
  visualStatus,
  formatDateOnly,
  formatScheduleTime,
  scheduleItems,
  groupItemsByLocation,
  groupItemsByDay,
  dominantStatus
} = domain

export function MapView(props: any) {
  const { state } = props
  const locatedItems = scheduleItems(state).filter((item) => item.location)
  const groups = groupItemsByLocation(locatedItems)

  return (
    <div className="stack">
      <section className="panel">
        <div className="view-heading">
          <div>
            <p className="eyebrow">Karte</p>
            <h2>Orte der Aufgaben</h2>
          </div>
        </div>
        <div className="map-layout">
          <div className="map-canvas" aria-label="Prototypische Karte">
            <div className="map-grid-lines" aria-hidden="true" />
            {groups.map((group) => <MapMarker key={group.location.id} group={group} {...props} />)}
          </div>
          <div className="map-side-list">
            {locatedItems.map((item) => <ScheduleItem key={item.id} item={item} {...props} />)}
          </div>
        </div>
      </section>
    </div>
  )
}

export function MapMarker(props: any) {
  const { group } = props
  const location = group.location
  const firstItem = group.items[0]
  const x = Number.isFinite(location.map?.x) ? location.map.x : 50
  const y = Number.isFinite(location.map?.y) ? location.map.y : 50
  const status = dominantStatus(group.items.map((item: any) => item.status))

  return (
    <button className={`map-marker status-${visualStatus(status)}`} type="button" style={{ left: `${x}%`, top: `${y}%` }} onClick={() => openScheduleItem(firstItem, props)}>
      <StatusMarker status={status} />
      <span>
        <strong>{location.label}</strong>
        <small>{group.items.length} Aufgaben</small>
      </span>
    </button>
  )
}

export function CalendarView(props: any) {
  const { state } = props
  const groups = groupItemsByDay(scheduleItems(state).filter((item) => item.schedule))

  return (
    <div className="stack">
      <section className="panel">
        <div className="view-heading">
          <div>
            <p className="eyebrow">Kalender</p>
            <h2>Termine</h2>
          </div>
        </div>
        <div className="calendar-days">
          {groups.map((group) => <CalendarDay key={group.key} group={group} {...props} />)}
        </div>
      </section>
    </div>
  )
}

export function CalendarDay(props: any) {
  const { group } = props
  const label = group.key === "unscheduled"
    ? "Ohne Datum"
    : formatDateOnly(group.key)

  return (
    <section className="calendar-day">
      <h3>{label}</h3>
      <div className="calendar-item-list">
        {group.items.map((item: any) => <ScheduleItem key={item.id} item={item} {...props} />)}
      </div>
    </section>
  )
}

export function ScheduleItem(props: any) {
  const { item } = props
  return (
    <button className="schedule-item" type="button" onClick={() => openScheduleItem(item, props)}>
      <span className="schedule-time">{item.schedule ? formatScheduleTime(item.schedule) : "jederzeit"}</span>
      <span className="schedule-main">
        <strong>{item.title}</strong>
        <span>{item.parentTitle}</span>
        <small>{item.location?.label || "ortsunabhängig"}</small>
      </span>
      <span className="schedule-side">
        <StatusBadge status={item.status} />
      </span>
    </button>
  )
}

export function openScheduleItem(item: any, props: any) {
  if (item.action.kind === "standalone") {
    props.selectStandaloneQuest(item.action.questKey)
    return
  }

  props.selectAdventureStep(item.action.runId, item.action.stepId)
}
