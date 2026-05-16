# Game Pack

**Status:** Arbeitsdefinition v0

Ein Game Pack ist die wiederverwendbare Spielkonfiguration für eine bestimmte Spielwelt oder Spielsprache.

Es definiert nicht die technische App, nicht das Netzwerk und nicht die konkrete Campaign. Es beschreibt, wie reale Quests, Adventures und Campaigns spielerisch gedeutet und dargestellt werden.

```text
Game Pack = Sprache, Entwicklungsfelder, minimale Visuals und optionale Beitragsspielrollen.
Campaign = konkrete Spielbewegung, die ein Game Pack nutzt.
Network = dauerhafter Verbund von Spaces mit Identität und Governance.
```

## Zweck

Ein Game Pack beantwortet:

- Wie heißen die zentralen Spielbegriffe in dieser Welt?
- Welche Entwicklungsfelder gibt es?
- Wie werden sie grob visuell markiert?
- Welche Beitragsspielrollen können sichtbar werden?
- Von welchem Game Pack wurde es abgeleitet?

Ein Game Pack beantwortet nicht:

- Wer darf Quest-Completion attestieren?
- Welche Evidence ist für eine Quest nötig?
- Welche Personen haben welche Berechtigungen in einem Space?
- Welche konkrete Campaign läuft gerade?

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
  adventure?: string
  campaign?: string
}

type GamePackVisuals = {
  color?: string
  icon?: string
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

Sie behaupten kein Können aus sich heraus. Sie sagen nur: Eine sichtbare, gültige Attestation berührt dieses Entwicklungsfeld.

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
| RLNP | Attester-Rolle in einer `attestationPolicy` |
| Real Life Stack | Admin-, Host- oder Moderationsrolle in Space oder Network |

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
- Ein Game Pack DARF keine Attestation Policy ersetzen.
- Ein Game Pack DARF keine Space- oder Network-Berechtigungen definieren.
- Ein Game Pack DARF Entwicklungsfelder und Beitragsspielrollen definieren.
- Eine Campaign SOLL genau ein primäres Game Pack nutzen.
- Ein Network DARF ein Default Game Pack empfehlen, besitzt es aber nicht automatisch.
