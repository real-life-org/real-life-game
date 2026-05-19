# Campaign und World State

**Status:** Arbeitsdefinition v0

Eine Campaign ist eine zeitlich oder zielbezogen begrenzte Spielbewegung.

Sie nutzt ein Game Pack, kann mehrere Spaces oder Networks umfassen und macht über World State sichtbar, was in der Welt passiert.

```text
Campaign = konkrete Spielbewegung.
World State = berechneter Zustand dieser Spielbewegung.
```

## Abgrenzung

Eine Campaign ist nicht dasselbe wie ein Space, Network oder Game Pack.

| Begriff | Bedeutung |
|---|---|
| Space | konkrete Gruppe, Daten- und Sichtbarkeitsraum im Real Life Stack |
| Network | dauerhafter Verbund mehrerer Spaces mit Identität, Governance und Discovery |
| Label / WhiteLabel | App-, Marken- oder Distributionsebene |
| Game Pack | wiederverwendbare Spielkonfiguration |
| Campaign | zeitlich oder zielbezogen begrenzte Spielbewegung |

Eine Campaign kann:

- ein bestehendes Game Pack nutzen,
- ein eigenes Game Pack erstellen oder forken,
- mehrere Spaces einschließen,
- mehrere Networks berühren,
- Quests und Adventures bündeln,
- automatisch enden, wenn ein Ziel erreicht ist.

## Relations

Campaign-Zugehörigkeit sollte über Relations modelliert werden.

Mögliche Relation-Prädikate:

```text
usesGamePack
includesSpace
partOfNetwork
includesQuest
includesAdventure
includesAdventureRun
```

Diese Namen sind v0-Vorschläge und noch nicht final normiert.

## Datenmodell

```ts
type Campaign = {
  id: string
  title: string
  description?: string
  status: "draft" | "active" | "paused" | "completed" | "archived"

  startsAt?: string
  endsAt?: string

  visibility?: {
    mode: "private" | "space" | "campaign" | "public"
  }

  completionPolicy?: CampaignCompletionPolicy
  worldState?: WorldStateMetric[]
  reportingPolicy?: ReportingPolicy
}

type CampaignCompletionPolicy =
  | { type: "manual" }
  | { type: "time"; endsAt: string }
  | { type: "world-state-target"; metricId: string; target: number }

type ReportingPolicy = {
  publicSummary?: boolean
  minGroupSize?: number
  allowPersonMetrics?: boolean
}
```

## World State

World State ist der berechnete Kampagnenzustand.

Er speichert nicht einfach manuell: "27 Hochbeete gebaut". Er beschreibt, worauf geschaut wird und wie daraus ein Wert berechnet wird.

```text
source = worauf schaut die Metrik?
aggregation = wie wird daraus ein Wert?
```

Die wichtigste Regel:

```text
Eine World-State-Metrik darf nicht mehr behaupten, als ihre Source trägt.
```

In RLS-Views können bezeugte Quellen als `ConfirmationView` erscheinen. Eine signierte Attestation ist dort eine Confirmation mit `trustLevel: "signed-attested"`. Wenn eine World-State-Metrik auch `server-confirmed`, `local` oder `demo` akzeptiert, muss die UI diese schwächere Grundlage sichtbar machen.

## World-State-Metrik

```ts
type WorldStateMetric = {
  id: string
  label: string
  description?: string

  source: WorldStateSource
  aggregation: WorldStateAggregation

  target?: number
  visibility?: "private" | "space" | "campaign" | "public"
}

type WorldStateSource =
  | ItemSource
  | RelationSource
  | ConfirmationSource

type ItemSource = {
  type: "items"
  itemType: string
  filter?: Record<string, unknown>
  requires?: SourceCondition[]
}

type RelationSource = {
  type: "relations"
  predicate: string
  filter?: Record<string, unknown>
  requires?: SourceCondition[]
}

type ConfirmationSource = {
  type: "confirmations"
  claim: string
  acceptedTrustLevels?: ("demo" | "local" | "server-confirmed" | "signed-attested")[]
  filter?: Record<string, unknown>
}

type SourceCondition =
  | {
      type: "confirmation-count"
      claim: string
      acceptedTrustLevels?: ("demo" | "local" | "server-confirmed" | "signed-attested")[]
      subjectRelation: string
      min: number
    }
  | {
      type: "relation-count"
      predicate: string
      min: number
    }

type WorldStateAggregation =
  | { type: "count" }
  | { type: "count-distinct"; field: string }
  | { type: "sum"; field: string; unit?: string }
  | { type: "latest"; field?: string }
  | { type: "manual" }
```

## Source-Arten

### Items

Items zeigen, was im Real Life Stack sichtbar vorhanden ist.

```json
{
  "id": "community-gardens-on-map",
  "label": "Gemeinschaftsgärten auf der Karte",
  "source": {
    "type": "items",
    "itemType": "community-garden",
    "filter": {
      "hasLocation": true,
      "visibility": "public"
    }
  },
  "aggregation": {
    "type": "count"
  },
  "target": 25
}
```

Diese Metrik sagt:

```text
Es gibt 25 sichtbare Gemeinschaftsgarten-Items auf der Karte.
```

Sie sagt nicht:

```text
25 Gemeinschaftsgärten wurden verifiziert.
```

### Relations

Relations zeigen, was im Netzwerk miteinander verbunden ist.

```json
{
  "id": "school-garden-connections",
  "label": "Schul-Garten-Verbindungen",
  "source": {
    "type": "relations",
    "predicate": "supports",
    "filter": {
      "fromType": "school",
      "toType": "community-garden"
    }
  },
  "aggregation": {
    "type": "count"
  }
}
```

Diese Metrik sagt:

```text
Es gibt deklarierte Verbindungen zwischen Schulen und Gemeinschaftsgärten.
```

Sie sagt nicht automatisch, dass diese Kooperationen praktisch erfüllt wurden.

### Confirmations

Confirmations zeigen, was bezeugt wurde. Wenn nur portable, signierte Belege zählen sollen, setzt die Metrik `acceptedTrustLevels: ["signed-attested"]`.

```json
{
  "id": "raised-beds-built",
  "label": "Gebaute Hochbeete",
  "source": {
    "type": "confirmations",
    "claim": "adventure.completed",
    "acceptedTrustLevels": ["server-confirmed", "signed-attested"],
    "filter": {
      "adventureType": "raised-bed"
    }
  },
  "aggregation": {
    "type": "count-distinct",
    "field": "subjectId"
  },
  "target": 100
}
```

Diese Metrik sagt:

```text
Es gibt 100 eindeutig abgeschlossene Hochbeet-AdventureRuns.
```

`count-distinct` ist hier wichtig, weil derselbe AdventureRun mehrere Confirmations haben kann.

## Kombinierte Sources

Ein Item kann zusätzliche bezeugte Bedingungen brauchen.

Beispiel: "Events mit mindestens 3 bestätigten Teilnehmenden".

```json
{
  "id": "events-with-confirmed-participants",
  "label": "Events mit mindestens 3 bestätigten Teilnehmenden",
  "source": {
    "type": "items",
    "itemType": "event",
    "filter": {
      "status": "past",
      "visibility": "campaign"
    },
    "requires": [
      {
        "type": "confirmation-count",
        "claim": "event.participated",
        "subjectRelation": "confirmation.subject == item.id",
        "min": 3
      }
    ]
  },
  "aggregation": {
    "type": "count"
  },
  "target": 10
}
```

Diese Metrik sagt:

```text
Es gab 10 Event-Items, für die jeweils mindestens 3 Teilnahme-Confirmations sichtbar sind.
```

## Sichtbarkeit und Schutz

World State darf nur Daten auswerten, die für die Campaign sichtbar oder freigegeben sind.

Er darf nicht heimlich private Profile, private QuestRuns, private Evidence oder private Confirmations auswerten.

Öffentliche World-State-Metriken sollten bevorzugt Dinge, Orte, Events, Adventures und sichtbare Ergebnisse zählen. Personenbezogene Auswertungen brauchen besondere Vorsicht, Zustimmung und sinnvolle Mindestgrößen.

```text
Gute öffentliche Metrik:
27 Hochbeete gebaut.

Riskante öffentliche Metrik:
Person X hat am meisten beigetragen.
```

## Normen

- Eine Campaign MUSS ein Game Pack nutzen oder ein eigenes Game Pack definieren.
- Eine Campaign DARF mehrere Spaces und Networks umfassen.
- Eine Campaign DARF per Zeit, manuell oder per World-State-Ziel enden.
- World State MUSS aus sichtbaren Items, Relations, Confirmations oder Attestations berechnet werden.
- World State DARF keine neue Wahrheitsschicht sein.
- World State DARF keine privaten Daten ohne Freigabe auswerten.
- Öffentliche World-State-Metriken SOLLTEN keine Menschen ranken.
