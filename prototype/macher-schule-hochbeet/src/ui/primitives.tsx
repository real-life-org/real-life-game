import { personName, scenario, statusLabel, visualStatus } from "../domain"

export function StatusMarker({ status, small = false }: { status: string, small?: boolean }) {
  return <span className={`status-marker status-${visualStatus(status)} ${small ? "is-small" : ""}`} aria-hidden="true" />
}

export function StatusBadge({ status, context = "task", className = "" }: { status: string, context?: string, className?: string }) {
  const visual = context === "adventure" && status === "completed" ? "confirmed" : visualStatus(status)

  return (
    <span className={`status status-badge status-${visual} ${status} ${className}`}>
      <span className={`status-marker status-${visual} status-badge-icon`} aria-hidden="true" />
      <span>{statusLabel(status, context)}</span>
    </span>
  )
}

export function ItemImage({ src, label, className = "item-image" }: { src?: string, label: string, className?: string }) {
  if (!src) return null
  return <img className={className} src={src} alt="" aria-hidden="true" title={label} />
}

export function Initials({ name, className }: { name: string, className: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
  return <span className={className} aria-hidden="true">{initials}</span>
}

export function TinyAvatar({ personId }: { personId: string }) {
  const role = scenario.roles[personId]
  if (!role) return null
  if (role.avatar) return <img className="tiny-avatar" src={role.avatar} alt="" aria-hidden="true" />
  return <Initials name={role.name} className="tiny-avatar tiny-avatar-fallback" />
}

export function AvatarGroup({ personIds }: { personIds: string[] }) {
  if (!personIds.length) return null
  return (
    <span className="avatar-group" aria-label={personIds.map(personName).join(", ")}>
      {personIds.map((personId) => <TinyAvatar key={personId} personId={personId} />)}
    </span>
  )
}

export function UserAvatar({ personId, className = "profile-avatar" }: { personId: string, className?: string }) {
  const role = scenario.roles[personId]
  if (!role) return null
  if (role.avatar) return <img className={className} src={role.avatar} alt="" aria-hidden="true" />
  return <Initials name={role.name} className={`${className} ${className}-fallback`} />
}

export function FieldChips({ fields, limit }: { fields: string[], limit?: number }) {
  const visibleFields = limit ? fields.slice(0, limit) : fields
  const remaining = limit ? fields.length - visibleFields.length : 0

  return (
    <>
      {visibleFields.map((field) => <span className="field" key={field}>{field}</span>)}
      {remaining > 0 ? <span className="field field-more">+{remaining}</span> : null}
    </>
  )
}

export function RequirementTag({ step }: { step: any }) {
  return (
    <span className={`requirement-tag ${step.meta.required ? "is-required" : "is-optional"}`}>
      {step.meta.required ? "Pflicht" : "Extra"}
    </span>
  )
}
