# Adventure

**Status:** Arbeitsdefinition v0

Ein Adventure ist ein konkreter Erlebnisbogen aus mehreren Quests.

Es gehört in das Real Life Game, weil es Quests spielerisch rahmt, ordnet und zu einem gemeinsamen Ergebnis verbindet. Die einzelnen Quests bleiben trotzdem Teil des Real Life Network Protocol.

```text
Quest = kleinste reale Einladung.
Adventure = Erlebnisbogen aus mehreren Quests.
```

## Beispiel

Das Adventure "Hochbeet bauen" kann aus mehreren Quests bestehen:

- Material besorgen
- Rahmen bauen
- Erde einfüllen
- Pflanzen einsetzen
- Dokumentation erstellen
- Nachklang teilen

Einige Quests können für das Adventure-Ziel erforderlich sein. Andere können optional sein.

```text
Material besorgen, Rahmen bauen und Erde einfüllen = erforderlich.
Dokumentation und Nachklang = optional.
```

## Modellierung

Ein Adventure ist ein eigenes Game-Objekt. Es verweist nicht über eingebettete `questRefs` auf Quests, sondern über Relations.

```ts
type Adventure = {
  id: string
  title: string
  description?: string
  status?: "draft" | "active" | "completed" | "archived"
  gamePackId?: string

  game?: {
    developmentFields?: string[]
  }

  completionPolicy?: AdventureCompletionPolicy
}

type AdventureCompletionPolicy = {
  requiredQuestPredicate?: "containsQuest"
  requireAllRequiredQuests?: boolean
  completionAttestationTemplate?: {
    claim: string
    badge?: {
      emoji?: string
      color?: string
      shape?: string
    }
  }
}
```

Die Verbindung zu Quests liegt in Relations:

```json
{
  "predicate": "containsQuest",
  "target": "item:quest:material-besorgen",
  "meta": {
    "required": true,
    "phase": "vorbereitung",
    "order": 1,
    "roleId": "scout"
  }
}
```

`required` bedeutet: Diese Quest ist für das Adventure-Ziel erforderlich. Es ist keine moralische Pflicht und kein sozialer Druck.

## Completion

Ein Adventure gilt in v0 als abgeschlossen, wenn alle required Quest-Relations durch gültige Completion-Attestations erfüllt sind.

Bei Gruppen-Adventures ist es normal, dass verschiedene Menschen unterschiedliche Quests beitragen:

```text
Person A besorgt Material.
Person B baut den Rahmen.
Person C füllt Erde ein.
Person D dokumentiert.
```

Alle können am Adventure beteiligt sein, ohne dass alle dieselben Einzelquests abgeschlossen haben.

Zusätzlich kann es eine eigene Adventure-Abschluss-Attestation geben:

```text
Team X hat Hochbeet Y gebaut.
```

Diese Abschluss-Attestation kann aus den required Quest-Attestations abgeleitet oder von einem Host, Mentor, Peer-Kreis, Agenten oder System attestiert werden. Wer das darf und welche Evidence nötig ist, gehört zur Attestation Policy im Real Life Network Protocol.

## Development Fields

Adventures dürfen eigene `developmentFields` haben.

Die Bedeutung ist anders als bei Quests:

| Ebene | Bedeutung |
|---|---|
| Quest `developmentFields` | Welche Entwicklungsfelder berührt diese konkrete Handlung? |
| Adventure `developmentFields` | Welche Entwicklungsfelder berührt der gesamte Erlebnisbogen oder das Ergebnis? |

Beispiel:

```ts
const raisedBedAdventure = {
  title: "Hochbeet bauen",
  game: {
    developmentFields: [
      "garten",
      "handwerk",
      "teamarbeit",
      "commons"
    ]
  }
}
```

## Normen

- Ein Adventure MUSS Quests über Relations verbinden, nicht über eingebettete Kopien.
- Ein Adventure DARF required und optionale Quests unterscheiden.
- Ein Adventure DARF eine eigene Abschluss-Attestation haben.
- Ein Adventure DARF `developmentFields` tragen.
- Ein Adventure DARF keine Quest-Completion- oder Attestation-Logik neu erfinden.
- Private QuestRuns oder Evidence DÜRFEN NICHT automatisch im Adventure sichtbar werden.
