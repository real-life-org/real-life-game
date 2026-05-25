import { useLayoutEffect, useRef, useState } from "react"
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

export function FieldChips({ fields, limit, adaptive = false }: { fields: string[], limit?: number, adaptive?: boolean }) {
  if (adaptive) return <AdaptiveFieldChips fields={fields} />

  const visibleFields = limit ? fields.slice(0, limit) : fields
  const remaining = limit ? fields.length - visibleFields.length : 0

  return (
    <>
      {visibleFields.map((field) => <span className="field" key={field}>{field}</span>)}
      {remaining > 0 ? <span className="field field-more">+{remaining}</span> : null}
    </>
  )
}

export function AdaptiveFieldChips({ fields }: { fields: string[] }) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [visibleCount, setVisibleCount] = useState(fields.length)

  useLayoutEffect(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure) return

    function updateVisibleCount() {
      const availableWidth = container.getBoundingClientRect().width
      const chips = Array.from(measure.querySelectorAll<HTMLElement>("[data-chip]"))
      const more = measure.querySelector<HTMLElement>("[data-more]")
      const moreWidth = more?.getBoundingClientRect().width || 0
      const gap = 6

      if (!availableWidth || !chips.length) {
        setVisibleCount(fields.length)
        return
      }

      let usedWidth = 0
      let nextCount = 0

      chips.forEach((chip, index) => {
        if (nextCount !== index) return
        const chipWidth = chip.getBoundingClientRect().width
        const nextUsedWidth = usedWidth + (nextCount ? gap : 0) + chipWidth
        const remainingAfterChip = fields.length - index - 1
        const reserveWidth = remainingAfterChip > 0 ? gap + moreWidth : 0

        if (nextUsedWidth + reserveWidth <= availableWidth) {
          usedWidth = nextUsedWidth
          nextCount = index + 1
        }
      })

      setVisibleCount(Math.max(1, nextCount))
    }

    updateVisibleCount()
    const observer = new ResizeObserver(updateVisibleCount)
    observer.observe(container)
    return () => observer.disconnect()
  }, [fields])

  const visibleFields = fields.slice(0, visibleCount)
  const remaining = fields.length - visibleFields.length

  return (
    <span className="field-chip-adaptive" ref={containerRef}>
      {visibleFields.map((field) => <span className="field" key={field}>{field}</span>)}
      {remaining > 0 ? <span className="field field-more">+{remaining}</span> : null}
      <span className="field-chip-measurer" ref={measureRef} aria-hidden="true">
        {fields.map((field) => <span className="field" data-chip key={field}>{field}</span>)}
        <span className="field field-more" data-more>+{fields.length}</span>
      </span>
    </span>
  )
}

export function RequirementTag({ step }: { step: any }) {
  return (
    <span className={`requirement-tag ${step.meta.required ? "is-required" : "is-optional"}`}>
      {step.meta.required ? "Pflicht" : "Extra"}
    </span>
  )
}
