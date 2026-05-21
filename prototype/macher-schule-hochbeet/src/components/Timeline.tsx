import * as domain from "../domain"
import type { Model } from "../domain"
import { AvatarGroup, FieldChips, ItemImage, RequirementTag, StatusBadge, StatusMarker, UserAvatar } from "../ui/primitives"

const {
  relativeTime
} = domain

export function TimelineBlock({ events, emptyText }: { events: any[], emptyText: string }) {
  return (
    <details className="timeline-block collapse-panel">
      <summary className="collapse-summary">
        <span className="eyebrow">Timeline</span>
        <span className="collapse-count">{events.length} {events.length === 1 ? "Eintrag" : "Einträge"}</span>
      </summary>
      {events.length ? (
        <ol className="timeline">
          {events.map((event) => <TimelineEvent event={event} key={event.id} />)}
        </ol>
      ) : <p className="meta">{emptyText}</p>}
    </details>
  )
}

export function TimelineEvent({ event }: { event: any }) {
  return (
    <li className={`timeline-event ${event.personId ? "" : "is-system"}`}>
      <span className="timeline-avatar-slot">
        {event.personId ? <UserAvatar personId={event.personId} className="timeline-avatar" /> : <span className="timeline-system-marker" aria-hidden="true" />}
      </span>
      <span className="timeline-event-body">
        <span className="timeline-event-copy">{event.text}</span>
        <span className="timeline-event-time">{relativeTime(event.createdAt)}</span>
      </span>
    </li>
  )
}
