# Entwicklungskarte

**Status:** Arbeitsdefinition

Die Entwicklungskarte ist die erste Fortschritts- und Orientierungsschicht des Real Life Game.

Sie ersetzt für Core v0 klassische Baum-, XP- und Level-Logik. Sie bewertet keine Menschen und behauptet kein Können aus sich heraus. Sie zeigt, welche realen, attestierten Handlungen bestimmte Entwicklungsfelder berühren.

## Grundsatz

```text
Attestation = Wahrheitsschicht.
Entwicklungskarte = Deutungs- und Orientierungsschicht.
```

Eine Quest kann `developmentFields` tragen. Diese Felder beschreiben, welche Entwicklungsfelder durch eine gültige Completion-Attestation sichtbar werden.

Beispiel:

```json
{
  "game": {
    "developmentFields": [
      "holzarbeit",
      "werkzeugnutzung",
      "teamarbeit"
    ]
  }
}
```

Das bedeutet nicht:

```text
Diese Person kann Holzarbeit.
```

Sondern:

```text
Es gibt eine attestierte Quest-Completion, die Holzarbeit, Werkzeugnutzung und Teamarbeit berührt.
```

## Verhältnis zu RLNP

Die Quest selbst bleibt Teil des Real Life Network Protocols.

RLNP trägt:

- Quest und QuestRun,
- lokale Completion,
- Evidence,
- Attestation Policy,
- Completion Attestation Template,
- Safety Requirements,
- Badge als WoT-Attestation oder Attestation-View.

Das Game ergänzt nur:

- `developmentFields`
- die Darstellung dieser Felder auf der Entwicklungskarte.

## Game Pack

Ein Game Pack definiert, welche Entwicklungsfelder existieren und wie sie dargestellt werden.

Beispiel Macher:

```text
holzarbeit
werkzeugnutzung
garten
materialplanung
dokumentation
teamarbeit
```

Beispiel Pax:

```text
begegnung
kreis
frieden
versorgung
dokumentation
nachklang
```

Dieselbe Quest kann in verschiedenen Game Packs andere Entwicklungsfelder berühren. Die konkrete Zuordnung sollte dort entstehen, wo Quests für eine Campaign oder ein Adventure kuratiert werden.

## Normen

- `developmentFields` DÜRFEN keine globale Bewertung eines Menschen erzeugen.
- `developmentFields` DÜRFEN keine portable Anerkennung ersetzen.
- Eine Entwicklungskarte MUSS auf sichtbaren oder freigegebenen Attestations beruhen.
- Private QuestRuns, Evidence oder Attestations DÜRFEN NICHT ohne Zustimmung auf einer Entwicklungskarte sichtbar werden.
- XP, Level und Rankings DÜRFEN NICHT aus `developmentFields` abgeleitet werden, solange sie nicht gesondert konzipiert und geprüft sind.
