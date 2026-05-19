# Mechanik-Backlog

Dieses Repo sammelt Spielmechaniken, die auf dem Basisprotokoll aufbauen können, aber noch nicht Teil der interoperablen Mindestschicht sind.

## Gehört wahrscheinlich ins Game-Repo

| Mechanik | Kurzbeschreibung | Status |
|---|---|---|
| Game Pack | Wiederverwendbare Spielkonfiguration für Sprache, Entwicklungsfelder, Visuals und Beitragsspielrollen. | Arbeitsdefinition v0 |
| Adventures | Mehrere Quests werden zu einem Erlebnisbogen verbunden. | Arbeitsdefinition v0 |
| AdventureRuns | Konkrete Durchführung eines Adventures durch eine Person oder Gruppe. | Arbeitsdefinition v0 |
| Adventure-Steps | Semantische Adventure-Quest-Relationen mit required/order/role/capacity/dependsOn. | Arbeitsdefinition v0 |
| Multiplayer Adventures | Mehrere Menschen füllen unterschiedliche Adventure-Steps in einem gemeinsamen AdventureRun. | Arbeitsdefinition v0 |
| Multiplayer Quests | Eine einzelne Quest braucht mehrere Menschen zugleich oder in verschiedenen Quest-Rollen. | offen |
| Journeys | Persönliche oder gemeinsame Entwicklungsreisen. | offen |
| Campaigns | Zeitlich oder zielbezogen begrenzte Spielbewegungen. | Arbeitsdefinition v0 |
| Storylines | Narrative Rahmung realer Herausforderungen. | offen |
| Entwicklungskarte | Sichtbare Orientierung über bestätigte oder attestierte Erfahrungen, Beiträge und Entwicklungsfelder. | Arbeitsdefinition v0 |
| `developmentFields` | Quest-seitige Game-Erweiterung: welche Entwicklungsfelder eine gültige Quest-Completion berührt. | Arbeitsdefinition v0 |
| XP | Erfahrungspunkte als Fortschrittssignal. | zurückgestellt |
| Level | Stufenmodell für Spielprogression. | zurückgestellt |
| Avatar-Items | Symbolische oder spielerische Darstellungen von Badge-/Attestation-Views im Profil oder Avatar. | offen |
| Inventory | Sichtbare Sammlung von Ressourcen, Werkzeugen oder Symbolen. | offen |
| Game Modes | Unterschiedliche Spielarten, z.B. Festival, lokaler Kreis, Projekt, Lernreise. | offen |
| Roles | Spielerische Rollen wie Host, Scout, Steward, Dokumentar, Builder. | offen |
| Game Master Tools | Werkzeuge für Menschen, die Spielräume gestalten. | offen |
| AI Game Master | KI-Unterstützung für Questdesign und Spielleitung. | offen |
| World State | Berechneter Zustand einer Campaign aus sichtbaren Items, Relations, Confirmations und Attestations. | Arbeitsdefinition v0 |
| Balancing | Wie Anreize fair, leicht und nicht manipulativ bleiben. | offen |

## Gehört ins Basisprotokoll

Diese Begriffe bleiben im [real-life-org/real-life-network-protocol](https://github.com/real-life-org/real-life-network-protocol), weil sie für Interoperabilität gebraucht werden:

- Quest,
- Quest-Autor,
- Host,
- Sichtbarkeit,
- lokale Completion,
- Evidence,
- Confirmation Policy,
- Evidence Policy,
- Confirmation,
- Attestation als portable signierte Confirmation,
- Badge als Confirmation- oder Attestation-View,
- Safety Requirements,
- Quest-Fork,
- Ortsbezug,
- Zeitbezug,
- beteiligte Personen oder Gruppen.

## Badge zuerst, XP später

Für die Basis gilt:

```text
Badge = sichtbare Darstellung einer Confirmation oder Attestation.
```

XP und Level sind bewusst später. Die erste Fortschrittslogik ist die Entwicklungskarte.

Grund: XP und Level können stark beeinflussen, was Menschen tun und wie sie sich vergleichen. Die Entwicklungskarte soll zuerst nur sichtbar machen, welche realen, bestätigten Handlungen bestimmte Entwicklungsfelder berühren. Sie darf keine globale Bewertung eines Menschen werden.

## Mögliche erste Game-Slices

| Slice | Beschreibung |
|---|---|
| Festival-Modus | Menschen werden auf Pax/Festivals spielerisch eingeladen, Kontakte zu knüpfen, Quests zu erfüllen und Beiträge sichtbar zu machen. |
| Lokaler-Kreis-Modus | Eine bestehende Gruppe nutzt Quests, Events, Ressourcen und Badges, um regelmäßige Praxis aufzubauen. |
| Commons-Aufbau | Menschen bauen gemeinsam einen Garten, Raum, Werkstattbestand oder Ressourcenkreis auf. |
| Lernreise | Menschen lernen reale Fähigkeiten und bestätigen sich gegenseitig Fortschritte. |
| Abenteuerpfad | Gruppen erleben Wanderungen, Klettern, Radfahren, Naturtage oder Spiele als echte Abenteuer. |
| Projektspiel | Projektmanagement-Aufgaben werden zu Quests, Rollen und Fortschrittsanzeigen. |

## Designprinzip

Jede Spielmechanik muss die Realität stärken, nicht ersetzen.

Eine gute Mechanik führt zu:

- mehr Begegnung,
- mehr Eigenverantwortung,
- mehr geteilten Ressourcen,
- mehr sichtbaren Beiträgen,
- mehr Freude,
- mehr lokaler Resilienz,
- mehr Commons,
- mehr echter Handlung.

## Core-v0-Entscheidung

Für die erste Konzeptbasis werden keine XP, globalen Level, Loot-Mechaniken oder Rankings eingeführt.

Core v0 besteht aus:

- Game Pack,
- Entwicklungskarte,
- Adventure,
- AdventureRun,
- Campaign,
- World State.

Diese Mechaniken bauen auf RLNP-Quests, QuestRuns, Evidence, Confirmation Policies, Confirmations und Attestations auf. Sie erzeugen keine eigene Completion- oder Verifikationslogik.
