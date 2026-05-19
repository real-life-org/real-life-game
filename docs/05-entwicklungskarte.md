# Entwicklungskarte

**Status:** Arbeitsdefinition

Die Entwicklungskarte ist die erste Fortschritts- und Orientierungsschicht des Real Life Game.

Sie ersetzt für Core v0 klassische Baum-, XP- und Level-Logik. Sie bewertet keine Menschen und behauptet kein Können aus sich heraus. Sie zeigt, welche realen, bestätigten oder attestierten Handlungen bestimmte Entwicklungsfelder berühren.

## Grundsatz

```text
Confirmation = bestätigte Grundlage.
Attestation = portable, signierte Confirmation.
Entwicklungskarte = Deutungs- und Orientierungsschicht.
```

Eine Quest kann `developmentFields` tragen. Diese Felder beschreiben als Default, welche Entwicklungsfelder durch eine gültige Completion-Confirmation sichtbar werden.

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
Es gibt eine bestätigte Quest-Completion, die Holzarbeit, Werkzeugnutzung und Teamarbeit berührt.
```

## Verhältnis zu RLNP

Die Quest selbst bleibt Teil des Real Life Network Protocols.

RLNP trägt:

- Quest und QuestRun,
- lokale Completion,
- Evidence,
- Confirmation Policy,
- Evidence Policy,
- Completion Confirmation Template,
- Safety Requirements,
- Confirmation,
- Badge als Confirmation- oder Attestation-View.

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

Praktisch gibt es damit drei Ebenen:

| Ebene | Bedeutung |
|---|---|
| Game Pack | Definiert das Vokabular der Entwicklungsfelder. |
| Quest | Kann Default-`developmentFields` für die Quest tragen. |
| Kuratierter Kontext | Kann `developmentFields` auf einer Quest-View, Adventure-Quest-Relation oder Step-View verfeinern oder überschreiben. |

Die Entwicklungskarte liest die Felder aus der konkreten bestätigten Handlung. Bei einem QuestRun in einem AdventureRun ist das also zuerst der kuratierte Adventure-Step, falls dort Felder gesetzt sind, sonst der Quest-Default.

## RLS-Projektion

Im Real Life Stack wird diese Grundlage backend-agnostisch als `ConfirmationView` sichtbar.

Eine signierte WoT-Attestation ist dort eine Confirmation mit `trustLevel: "signed-attested"`. Andere Backends können schwächere Grundlagen liefern, zum Beispiel `server-confirmed`, `local` oder `demo`.

Eine Entwicklungskarte darf solche Confirmations anzeigen, muss die Trust-Stufe aber ehrlich behandeln. Eine serverseitige Bestätigung ist keine portable Attestation.

## Normen

- `developmentFields` DÜRFEN keine globale Bewertung eines Menschen erzeugen.
- `developmentFields` DÜRFEN keine portable Anerkennung ersetzen.
- Eine Entwicklungskarte MUSS auf sichtbaren oder freigegebenen Attestations oder Confirmations mit expliziter Trust-Stufe beruhen.
- Private QuestRuns, Evidence, Confirmations oder Attestations DÜRFEN NICHT ohne Zustimmung auf einer Entwicklungskarte sichtbar werden.
- XP, Level und Rankings DÜRFEN NICHT aus `developmentFields` abgeleitet werden, solange sie nicht gesondert konzipiert und geprüft sind.
