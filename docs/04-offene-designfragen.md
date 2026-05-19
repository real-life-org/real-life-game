# Offene Designfragen

## Quest und Game

- Wann bleibt eine Quest schlichtes Netzwerkprotokoll?
- Wann wird aus einer Quest ein Spielelement?
- Wie werden Quest-Forks spielerisch sichtbar?
- Wie modellieren wir später echte Multiplayer Quests, bei denen eine einzelne Quest mehrere Menschen gleichzeitig oder in unterschiedlichen Quest-Rollen braucht?

## Entwicklungskarte

- Welche Entwicklungsfelder definiert ein Game Pack?
- Sind `developmentFields` einfache IDs oder brauchen sie Labels aus dem Game Pack?
- Wie zeigt die Entwicklungskarte Berührungen, ohne Können oder Wert zu behaupten?
- Wie unterscheiden wir Erfahrung, Fähigkeit und Beitrag in der Entwicklungskarte?
- Wie werden Gruppen- und Individual-Confirmations unterschiedlich sichtbar?

## Badges, XP und Fortschritt

- Wann wäre XP hilfreich und wann würde es falsche Anreize setzen?
- Was bedeutet Leveln, ohne Menschen zu ranken?
- Sind Avatar-Items rein spielerisch, symbolisch oder an reale Beiträge gekoppelt?

## Confirmations, Attestations und Darstellung

- Wie übernimmt das Game Badge-Views aus RLNP/WoT, ohne Badge-Logik zu duplizieren?
- Wann wird aus einer Badge-View optional eine Avatar-Item-Darstellung?
- Welche System- oder Agenten-Identität darf automatische Attestations signieren?

## Story und Welt

- Welche erste Storyline eignet sich für Pax/Festivals?
- Welche Storyline eignet sich für lokale Kreise?
- Wie bleibt Storytelling offen und einladend, ohne ideologische Verpflichtung?
- Wie kann die reale Erde, ihre Krisen und Potenziale sichtbar werden, ohne Schwere zu erzeugen?

## Rollen

- Welche Rollen entstehen organisch im Netzwerk?
- Welche Rollen sollten spielerisch sichtbar werden?
- Wie unterscheiden wir Rolle, Fähigkeit, Beitrag und Verantwortung?
- Wie vermeiden wir, dass Rollen zu Statussymbolen oder Hierarchien werden?

## Game Pack

- Welche Relation-Namen werden für Forks, Nutzung und Ableitung final verwendet?
- Wie streng soll Versionierung in v0 sein?
- Wann braucht ein Network ein empfohlenes Default Game Pack?
- Wie werden Lizenzbedingungen für Game-Pack-Forks sichtbar?

## Adventure

- Welche Relation-Namen werden für Adventure-Quest-Verknüpfungen final verwendet?
- Wann reicht eine referenzierbare `containsQuest`-Relation als Adventure-Step, und wann braucht eine Implementierung ein materialisiertes Step-Item oder eine Step-View?
- Wie streng soll `capacity` in v0 durchgesetzt werden, z.B. nur gegen aktive QuestRuns oder auch gegen abgebrochene und archivierte Runs?
- Brauchen `dependsOn`-Relationen später strengere Modi, z.B. lokal abgeschlossen reicht vs. explizit bestätigt erforderlich?
- Wie entsteht eine AdventureRun-Abschluss-Confirmation praktisch aus mehreren Quest-Confirmations?
- Wie werden Team-Beiträge und individuelle Beiträge in der UI nebeneinander sichtbar?
- Wann braucht ein Adventure eigene `developmentFields`, statt nur die Felder seiner Quests zu erben?

## Campaign und World State

- Welche Source-Filter sind für v0 technisch realistisch?
- Welche Aggregationsarten brauchen wir zuerst?
- Wann darf eine Campaign automatisch enden?
- Welche öffentlichen Metriken brauchen Mindestgrößen oder Zustimmung?
- Wie unterscheiden wir World State, Report und Abschluss-Confirmation einer Campaign?

## KI-Agenten

- Wann ist ein Agent Spielleiter, wann Assistent, wann Mitspieler?
- Welche Handlungen darf ein Agent eigenständig ausführen?
- Welche Handlungen brauchen menschliche Zustimmung?
- Wie werden Agenten-Beiträge bestätigt oder attestiert?

## Endgame und spielerische Reife

Siehe auch [Octalysis und das Real Life Game](10-octalysis-und-rlg.md#spielphasen-denken). Das RLG-Konzept beschreibt heute vor allem die Mitte einer Spielerreise. Was an deren Ende steht, ist offen.

- Was machen Menschen, die schon an vielen Adventures beteiligt waren?
- Welche Rollen entstehen mit Erfahrung: Mentor, Pack-Author, Host, Crafter, Hüter?
- Wie werden diese Rollen in der Entwicklungskarte sichtbar, ohne ein Level-System zu werden?
- Wann darf ein Mensch ein eigenes Game Pack veröffentlichen, wann eine eigene Campaign tragen?
- Wie verhindern wir, dass erfahrene Menschen routinemäßig weitermachen, was ursprünglich Bedeutung hatte?
- Welche Endgame-Mechaniken laden ein, statt zu binden?

## Spielphasen und Onboarding

- Wie sieht die Discovery-Phase aus, bevor jemand überhaupt eine Quest sieht?
- Welche Form von Echo bekommt der erste Beitrag einer neuen Person (Beginner's Luck)?
- Wie unterscheidet sich Onboarding von späterem Scaffolding mechanisch?
- Welche Mechaniken passen zu lokalen Kreisen, welche zu Festivals, welche zu Lernreisen?

## Schutz und Grenzen

- Welche Mechaniken sind nur für Erwachsene geeignet?
- Welche zusätzlichen Regeln braucht es für Kinder und Jugendliche?
- Wie verhindert man gefährliche Challenges?
- Wie erkennt man, wenn Einladung zu Druck wird?
- Wie bleibt das Spiel freiwillig, leicht und beziehungsorientiert?
