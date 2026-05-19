# Adventure

**Status:** Arbeitsdefinition v0

Ein Adventure ist die Vorlage eines Erlebnisbogens aus mehreren Quests.

Es gehört in das Real Life Game, weil es Quests spielerisch rahmt, ordnet und zu einem gemeinsamen Ergebnis verbindet. Die einzelnen Quests bleiben trotzdem Teil des Real Life Network Protocol.

```text
Quest = kleinste reale Einladung.
Adventure = Vorlage eines Erlebnisbogens aus mehreren Quests.
AdventureRun = konkrete Durchführung eines Adventures.
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
  status?: "draft" | "active" | "archived"
  gamePackId?: string

  game?: {
    developmentFields?: string[]
  }

  completionPolicy?: AdventureCompletionPolicy
}

type AdventureCompletionPolicy = {
  requiredQuestPredicate?: "containsQuest"
  requireAllRequiredQuests?: boolean
  completionConfirmationTemplate?: {
    claim: string
    badge?: {
      emoji?: string
      color?: string
      shape?: string
    }
  }
}

type AdventureRun = {
  id: string
  adventureId: string
  title?: string
  status: "draft" | "active" | "completed" | "archived"
  participantIds?: string[]
  campaignId?: string
  spaceId?: string
  visibility?: {
    mode: "private" | "space" | "campaign" | "public"
  }
}
```

Die Verbindung zu Quests liegt in semantischen Relations. Das ist keine reine Speicherentscheidung: Die konkrete Implementierung darf Relations als Kanten, Tabellen, JSON oder materialisierte Views ablegen. Fachlich ist aber wichtig, dass die Adventure-Quest-Verbindung eine eigene Bedeutung trägt und keine eingebettete Kopie der Quest ist.

```json
{
  "id": "rel:adventure-hochbeet-material",
  "from": "item:adventure:hochbeet-bauen",
  "predicate": "containsQuest",
  "target": "item:quest:material-besorgen",
  "meta": {
    "required": true,
    "phase": "vorbereitung",
    "order": 1,
    "roleId": "scout",
    "capacity": 1,
    "developmentFields": ["materialplanung", "teamarbeit"]
  }
}
```

`required` bedeutet: Diese Quest ist für das Adventure-Ziel erforderlich. Es ist keine moralische Pflicht und kein sozialer Druck.

Eine Adventure-Quest-Relation weist keine Person zu. Sie beschreibt einen offenen Schritt im Adventure. Die konkrete Person entsteht erst, wenn jemand diesen Schritt in einem `AdventureRun` übernimmt und dadurch ein `QuestRun` mit `actor` entsteht. `roleId` ist eine Beitragsspielrolle für Darstellung und Entwicklungskarte, kein vorab festgelegter Actor.

Nützliche `meta`-Felder auf einer `containsQuest`-Relation:

| Feld | Bedeutung |
|---|---|
| `required` | Dieser Schritt ist für den Abschluss eines AdventureRuns erforderlich. |
| `phase` | Grobe Phase im Erlebnisbogen, z.B. `vorbereitung`, `bau`, `nachklang`. |
| `order` | Sortierung für Darstellung und grobe Reihenfolge. |
| `roleId` | Beitragsspielrolle aus dem Game Pack, keine Berechtigung und kein Actor. |
| `capacity` | Wie viele QuestRuns diesen Schritt im selben AdventureRun gleichzeitig füllen können. |
| `dependsOn[]` | Andere Adventure-Quest-Relationen, die praktisch vorher erledigt sein müssen. |
| `developmentFields[]` | Kontext-spezifische Entwicklungsfelder für diesen Step. Fehlt das Feld, gelten die Quest-Defaults. |

`capacity` gilt nur im konkreten `AdventureRun`. Die Quest selbst bleibt wiederverwendbar und kann in anderen Kontexten weiterhin angenommen werden.

`dependsOn` beschreibt in v0 eine reale Durchführungsabhängigkeit, keine Bestätigungspflicht. Ein späterer Schritt darf also beginnen oder lokal abgeschlossen werden, sobald der vorgelagerte Step im AdventureRun lokal abgeschlossen oder bereits bestätigt ist. Die Confirmation kann später nachgezogen werden. Der Abschluss des ganzen AdventureRuns braucht trotzdem gültige Confirmations für die required Steps.

`developmentFields` auf der Relation beschreibt nicht die Quest global, sondern diesen kuratierten Adventure-Step. Dadurch kann dieselbe Quest in einem anderen Game Pack, einer anderen Campaign oder einem anderen Adventure andere Felder berühren, ohne die Quest selbst umzuschreiben.

## AdventureRun

Ein `AdventureRun` ist die konkrete Durchführung eines Adventures.

Beispiele:

```text
Adventure = "Hochbeet bauen"
AdventureRun = "Hochbeet-Gruppe A baut am 18. März das Schulhof-Hochbeet"
```

Ein `AdventureRun` instanziiert ein Adventure und wird durch QuestRuns gefüllt. Die Zuordnung bleibt relation-basiert:

```text
AdventureRun --instantiatesAdventure--> Adventure
QuestRun --partOfAdventureRun--> AdventureRun
QuestRun --runsQuest--> Quest
QuestRun --fillsAdventureStep--> containsQuest-Relation
QuestRun --actor--> Profile
```

`fillsAdventureStep` zeigt auf die konkrete `containsQuest`-Relation des Adventures. Wenn eine technische Implementierung Relations nicht direkt referenzieren kann, darf sie daraus eine stabile Step-View oder ein Step-Item ableiten. Fachlich bleibt der Step die Adventure-Quest-Verbindung.

Ein QuestRun MUSS nicht zu einem AdventureRun gehören. Standalone-QuestRuns bleiben gültig:

```text
Jonas macht die Quest "Baue ein Hochbeet zuhause" ohne Adventure.
```

## Completion

Ein Adventure bleibt die Vorlage. Abgeschlossen wird ein `AdventureRun`.

Ein AdventureRun gilt in v0 als abgeschlossen, wenn alle required Adventure-Quest-Relationen durch gültige Completion-Confirmations erfüllt sind. Für jede required Relation müssen im konkreten AdventureRun genügend QuestRuns existieren, die diese Relation füllen und zur Kapazitäts-/Abhängigkeitslogik passen.

Bei Gruppen-Adventures ist es normal, dass verschiedene Menschen unterschiedliche Quests beitragen:

```text
Person A besorgt Material.
Person B baut den Rahmen.
Person C füllt Erde ein.
Person D dokumentiert.
```

Alle können am Adventure beteiligt sein, ohne dass alle dieselben Einzelquests abgeschlossen haben.

Wenn eine Relation `capacity: 1` hat, kann im selben AdventureRun nur ein aktiver QuestRun diesen Schritt füllen. Jonas kann also im AdventureRun "Hochbeet-Gruppe A" den Schritt "Rahmen bauen" übernehmen; Mira kann dieselbe Quest weiterhin in einem anderen AdventureRun oder standalone machen, aber nicht denselben Schritt im selben Run füllen.

Zusätzlich kann es eine eigene AdventureRun-Abschluss-Confirmation geben:

```text
Team X hat Hochbeet Y gebaut.
```

Diese Abschluss-Confirmation kann aus den required Quest-Confirmations abgeleitet oder von einem Host, Mentor, Peer-Kreis, Agenten oder System bestätigt werden. Wer das darf und ob Evidence nötig ist, gehört zur Confirmation Policy im Real Life Network Protocol. Wenn die Abschluss-Confirmation portable sein soll, wird sie als signierte Attestation ausgestellt.

## Development Fields

Adventures dürfen eigene `developmentFields` haben.

Die Bedeutung ist anders als bei Quests:

| Ebene | Bedeutung |
|---|---|
| Quest `developmentFields` | Welche Entwicklungsfelder berührt diese Handlung als Default? |
| Adventure-Quest-Relation `meta.developmentFields` | Welche Entwicklungsfelder berührt dieser Step in diesem Adventure-Kontext? |
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
- Ein Adventure DARF Adventure-Quest-Relationen mit `phase`, `order`, `roleId`, `capacity`, `dependsOn` und `developmentFields` beschreiben.
- Ein AdventureRun MUSS eine konkrete Durchführung eines Adventures darstellen, nicht die Adventure-Vorlage selbst verändern.
- Ein QuestRun DARF standalone existieren oder per Relation Teil eines AdventureRuns sein.
- Ein QuestRun DARF per `fillsAdventureStep` auf die konkrete Adventure-Quest-Relation zeigen, die er in diesem AdventureRun füllt.
- Ein AdventureRun DARF eine eigene Abschluss-Confirmation haben.
- Ein Adventure DARF `developmentFields` tragen.
- Ein Adventure DARF keine Quest-Completion- oder Confirmation-Logik neu erfinden.
- Private QuestRuns oder Evidence DÜRFEN NICHT automatisch im Adventure sichtbar werden.
