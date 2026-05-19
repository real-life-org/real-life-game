# Game Pack

**Status:** Arbeitsdefinition v0

Ein Game Pack ist die wiederverwendbare Spielkonfiguration für eine bestimmte Spielwelt oder Spielsprache.

Es definiert nicht die technische App, nicht das Netzwerk und nicht die konkrete Campaign. Es beschreibt, wie reale Quests, Adventures und Campaigns spielerisch gedeutet und dargestellt werden.

```text
Game Pack = Sprache, Statusbegriffe, Entwicklungsfelder, Visual-Tokens und optionale Beitragsspielrollen.
Campaign = konkrete Spielbewegung, die ein Game Pack nutzt.
Network = dauerhafter Verbund von Spaces mit Identität und Governance.
```

## Zweck

Ein Game Pack beantwortet:

- Wie heißen die zentralen Spielbegriffe in dieser Welt?
- Welche Status- und Aktionsbegriffe passen zu dieser Welt?
- Welche Entwicklungsfelder gibt es?
- Wie werden sie grob visuell markiert?
- Welche Beitragsspielrollen können sichtbar werden?
- Von welchem Game Pack wurde es abgeleitet?

Ein Game Pack beantwortet nicht:

- Wer darf Quest-Completion bestätigen?
- Welche Spuren können für eine Quest hilfreich oder erforderlich sein?
- Welche Personen haben welche Berechtigungen in einem Space?
- Welche konkreten Quests, Adventures oder Campaigns laufen gerade?

Diese Fragen gehören in das Real Life Network Protocol, den Real Life Stack oder die konkrete Campaign.

## Datenmodell

```ts
type GamePack = {
  id: string
  title: string
  description?: string
  version: string
  license?: string

  language?: GamePackLanguage
  visuals?: GamePackVisuals

  developmentFields: DevelopmentField[]
  roles?: GameRole[]
}

type GamePackLanguage = {
  developmentMap?: string
  developmentField?: string
  quest?: string
  questRun?: string
  adventure?: string
  adventureRun?: string
  campaign?: string
  statusLabels?: {
    default?: Partial<Record<GameStatus, string>>
    questRun?: Partial<Record<GameStatus, string>>
    adventureRun?: Partial<Record<GameStatus, string>>
  }
  actionLabels?: Record<string, string>
}

type GamePackVisuals = {
  primaryColor?: string
  accentColor?: string
  icon?: string
  statusVisuals?: Partial<Record<GameStatus, VisualToken>>
  fieldVisuals?: Record<string, VisualToken>
  roleVisuals?: Record<string, VisualToken>
}

type GameStatus =
  | "open"
  | "active"
  | "completed"
  | "confirmed"
  | "archived"

type VisualToken = {
  color?: string
  backgroundColor?: string
  icon?: string
  shape?: "circle" | "pill" | "square"
}

type DevelopmentField = {
  id: string
  label: string
  description?: string
  parent?: string
  icon?: string
}

type GameRole = {
  id: string
  label: string
  description?: string
  icon?: string
}
```

## Development Fields

`developmentFields` sind die Felder, die auf der Entwicklungskarte sichtbar werden können.

Sie behaupten kein Können aus sich heraus. Sie sagen nur: Eine sichtbare, gültige Confirmation berührt dieses Entwicklungsfeld.

`parent` ist optional und erlaubt eine flexible Baumstruktur:

```ts
const fields: DevelopmentField[] = [
  { id: "machen", label: "Machen" },
  { id: "handwerk", label: "Handwerk", parent: "machen" },
  { id: "holzarbeit", label: "Holzarbeit", parent: "handwerk" },
  { id: "teamarbeit", label: "Teamarbeit" },
  { id: "dokumentation", label: "Dokumentation" }
]
```

Querverbindungen werden in v0 nicht als eigenes Feld modelliert. Sie entstehen dadurch, dass Quests und Adventures mehrere Entwicklungsfelder zugleich berühren.

## Rollen

Game-Pack-Rollen sind Beitragsspielrollen. Sie sind Vokabular und Darstellung, keine Berechtigung.

Beispiele:

- Builder
- Dokumentar
- Scout
- Hüter
- Gastgeber

Diese Rollen dürfen nicht mit anderen Rollentypen vermischt werden:

| Ebene | Rolle |
|---|---|
| Game Pack | Beitragsspielrolle |
| RLNP | Confirmer-Rolle in einer `confirmationPolicy` |
| Real Life Stack | Admin-, Host- oder Moderationsrolle in Space oder Network |

Eine Campaign oder ein Space kann Fähigkeiten an Rollen knüpfen, zum Beispiel wer Quests erstellen oder Confirmations ausstellen darf. Diese Fähigkeiten entstehen aber nicht automatisch aus der Game-Pack-Rolle. Das Game Pack liefert nur die spielerische Sprache und Darstellung.

## Sprache und Visuals

Ein Game Pack darf UI-nahe Begriffe und Darstellungs-Tokens liefern, ohne damit die konkrete App festzulegen.

Beispiele:

- `quest: "Aufgabe"` statt `Quest`,
- `completed: "fertig"` statt `completed`,
- `confirmed: "bestätigt"` statt `confirmed`,
- Primärfarbe, Statusfarbe oder Icon für eine Spielwelt,
- Icons für Entwicklungsfelder oder Beitragsspielrollen.

Diese Tokens sind Hinweise für Oberflächen und Game-Views. Sie sind keine Protokollzustände. Interoperabel bleiben die fachlichen Statuswerte und Relations; das Game Pack übersetzt sie nur in eine passende Spielsprache.

Ein Game Pack enthält keinen konkreten Quest- oder Adventure-Katalog. Solche Inhalte gehören in eine Campaign, ein kuratiertes Beispiel, ein Template-Pack oder ein konkretes Netzwerk/Space-Setup, das ein Game Pack nutzt.

## Forks und Varianten

Ein Game Pack kann von einem anderen Game Pack abgeleitet werden.

Diese Beziehung sollte als Relation modelliert werden, nicht als eingebettete Kopie:

```json
{
  "predicate": "forkedFrom",
  "target": "item:game-pack:real-life-game-core"
}
```

Ob ein Fork erlaubt ist, hängt nicht nur technisch, sondern auch von Lizenz und Governance ab.

## Normen

- Ein Game Pack DARF keine Quest-Completion-Logik duplizieren.
- Ein Game Pack DARF keine Confirmation Policy ersetzen.
- Ein Game Pack DARF keine Space- oder Network-Berechtigungen definieren.
- Ein Game Pack DARF Entwicklungsfelder, Statusbegriffe, Visual-Tokens und Beitragsspielrollen definieren.
- Ein Game Pack DARF fachliche Statuswerte nicht durch rein visuelle Labels ersetzen.
- Ein Game Pack DARF keinen konkreten Quest-, Adventure- oder Campaign-Katalog vorschreiben.
- Eine Campaign SOLL genau ein primäres Game Pack nutzen.
- Ein Network DARF ein Default Game Pack empfehlen, besitzt es aber nicht automatisch.
