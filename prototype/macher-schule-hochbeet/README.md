# Macher-Schule Hochbeet Prototype

**Status:** klickbarer Szenario-Prototyp, nicht normativ

Dieser Prototyp spielt das Beispiel [Macher-Schule Hochbeet-Gruppe](../../docs/examples/macher-schule-hochbeet-gruppe.md) interaktiv durch.

Ziel ist nicht Produkt-UI, sondern ein Konsistenztest:

- Jonas, Mira, Sami, Mentor, Host und eine unbeteiligte Person schauen auf denselben Zustand.
- Das Adventure ist die Vorlage; AdventureRuns sind konkrete Hochbeet-Gruppen wie `Hochbeet-Gruppe A` oder `Hochbeet-Gruppe B`.
- Initial ist kein AdventureRun aktiv. Die Übersicht zeigt zuerst die Adventure-Vorlage; ein neuer Hochbeet-Run entsteht erst, wenn ein Schüler den ersten Step übernimmt.
- Sobald es aktive AdventureRuns gibt, kann ein Spieler einen bestehenden Run öffnen und dort einen freien Step übernehmen, statt durch die erste Step-Übernahme einen neuen Run anzulegen.
- Adventure-Quest-Relationen sind Steps mit `capacity`, `required` und `dependsOn`.
- Die einzelnen Hochbeet-Bauquests sind hier keine frei startbaren Top-Level-Quests, sondern nur im Adventure-Kontext ausführbare Steps.
- Daneben gibt es unabhängige Einzelquests ohne AdventureRun: Karotten pflanzen ist einmalig, Gießen ist täglich wiederholbar. Beide Einzelquests haben eigene Detailseiten.
- Der `actor` entsteht erst, wenn im aktiven AdventureRun jemand einen Step übernimmt und dadurch ein persönlicher QuestRun entsteht.
- Ein Klick auf eine Unterquest öffnet keine eigene Step-Seite mehr, sondern fokussiert den Step in der Adventure-Detailseite.
- Ein Schüler kann in diesem Prototyp nur einen noch nicht lokal abgeschlossenen Step gleichzeitig übernehmen.
- Jeder Schüler kann freie Steps selbst übernehmen: Mira kann den Rahmen verschrauben, Jonas kann dokumentieren.
- Wenn ein Step mit `capacity: 1` im AdventureRun belegt ist, können andere ihn dort nicht nochmal übernehmen.
- Lokale Completion ist ein Self-Claim.
- Evidence ist optional und kann von anderen Personen stammen.
- Confirmations machen QuestRuns sichtbar bestätigbar.
- World State ändert sich erst durch bestätigte Ergebnisse.
- QuestRuns füllen optional einen Adventure-Step und werden erst danach lokal abgeschlossen.
- Sami kann den Erde-Step erst abschließen, wenn der Rahmen-Step lokal abgeschlossen ist; bestätigt werden können die Beiträge später.
- Jede Perspektive beginnt mit einem Profil. Schülerprofile zeigen Quest Log, Badges und Entwicklungskarte. Im Prototyp werden bestätigte QuestRuns als Badge-Quellen visualisiert; fachlich bleibt ein Badge an eine konkrete Attestation gebunden.
- Die Mentor-Perspektive bestätigt Beiträge direkt in der Questansicht, nicht in einer getrennten Confirmation-Ansicht.
- Desktop-Layout: links Übersicht oder Adventure-Detail, rechts das Profil der aktiven Perspektive. Die globale Timeline hängt an der Übersicht; die lokale Timeline hängt an der Adventure-Detailansicht. Der World State liegt darunter.
- Profile können Avatarbilder aus `img/` anzeigen. Fehlt ein Bild, nutzt der Prototyp Initialen als Fallback.
- Adventure und Quests können Itembilder aus `img/` anzeigen. Die Zuordnung liegt in `scenario.js`.
- Aktive Questkarten zeigen unten links den Actor mit kleinem Avatar.

Öffnen:

```text
prototype/macher-schule-hochbeet/index.html
```
