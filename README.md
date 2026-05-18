# Real Life Game

Das Real Life Game ist ein kooperatives Spiel für das echte Leben. Es baut auf [Web of Trust](https://github.com/real-life-org/wot-spec), [Real Life Stack](https://github.com/real-life-org/real-life-stack) und [Real Life Network Protocol](https://github.com/real-life-org/real-life-network-protocol) auf.

Es hilft Menschen, reale Aufgaben, Begegnungen, Fähigkeiten, Orte, Projekte und Beiträge als gemeinsames Spielfeld zu erleben. Eine Aufgabe kann zur Quest werden. Mehrere Quests können ein [Adventure](docs/07-adventure.md) bilden. Viele Adventures, Orte und Gruppen können Teil einer [Campaign](docs/08-campaign-und-world-state.md) werden. Was dadurch in der Welt passiert, wird als [World State](docs/08-campaign-und-world-state.md#world-state) sichtbar.

Der Kern ist einfach:

```text
Menschen tun echte Dinge.
Andere Menschen oder Systeme bezeugen konkrete Beiträge.
Das Spiel macht diese Beiträge sichtbar, ohne sie in Punkte, Rankings oder Druck zu verwandeln.
```

## Warum es das gibt

Viele Menschen wollen etwas Reales tun:

- etwas bauen,
- etwas lernen,
- anderen helfen,
- Orte beleben,
- Ressourcen teilen,
- Gemeinschaft erleben,
- eigene Fähigkeiten entdecken,
- Projekte in die Welt bringen.

Oft fehlt nicht der Wille, sondern ein guter Rahmen. Es ist unklar, was der nächste Schritt ist, wer mitmacht, wie Beiträge sichtbar werden und wie aus einzelnen Handlungen eine gemeinsame Bewegung entsteht.

Das Real Life Game gibt dafür eine Form.

Es verwandelt reale Möglichkeiten in spielbare Einladungen, ohne die Realität durch ein künstliches Punktesystem zu ersetzen.

## Die Grundidee

Die Welt ist voller echter Herausforderungen. Das Real Life Game lädt Menschen ein, sie als gemeinsames Spiel zu begreifen: mit Rollen, Quests, Entwicklung, Begegnung und realer Wirkung.

Der Unterschied zu klassischer Gamification ist entscheidend:

```text
Nicht Punkte erzeugen Bedeutung.
Echte Bedeutung wird sichtbar gemacht.
```

Das Spiel soll Menschen nicht antreiben, vergleichen oder bewerten. Es soll Orientierung geben, Freude erzeugen und echte Beiträge sichtbar machen.

## Die Schichten

Das Real Life Game baut auf drei tieferen Schichten auf.

| Schicht | Aufgabe |
|---|---|
| [Web of Trust](https://github.com/real-life-org/wot-spec) | Identität, Kontakte, Verifikation und Attestations |
| [Real Life Stack](https://github.com/real-life-org/real-life-stack) | App-Basis, Spaces, Items, Karte, Kalender, Profile, Marktplatz |
| [Real Life Network Protocol](https://github.com/real-life-org/real-life-network-protocol) | Quests, QuestRuns, Evidence, Completion, Attestation Policy, Badges |
| [Real Life Game](.) | Game Packs, Entwicklungskarte, Adventures, Campaigns, World State |

Das Game erzeugt keine eigene Wahrheitsschicht. Es deutet und visualisiert das, was in den anderen Schichten sichtbar oder attestiert ist.

Für die Implementierung im Real Life Stack gibt es ein eigenes [RLNP- und Game-Integrationskonzept](https://github.com/real-life-org/real-life-stack/blob/master/docs/concepts/rlnp-game-integration.md). Dort ist beschrieben, wie RLS diese Semantik backend-agnostisch als Items, Relations, Confirmations und Views darstellbar macht, ohne sie selbst zu besitzen.

## Die Bausteine

### Quest

Eine Quest ist eine freiwillige Einladung zu einer realen Handlung.

Beispiele:

- "Besorge Material für ein Hochbeet."
- "Dokumentiere den Baufortschritt."
- "Hilf beim Aufbau der Küche."
- "Führe ein Gespräch mit einer Person, die du noch nicht kennst."
- "Erstelle ein Angebot im Marktplatz."

Quests gehören zuerst zum [Real Life Network Protocol](https://github.com/real-life-org/real-life-network-protocol/blob/main/05-quests/quest-mechanik.md). Sie müssen auch ohne vollständiges Spielsystem funktionieren. Die Trennung zwischen Quest und Game ist in der [sprachlichen Trennung](docs/01-sprachliche-trennung.md#quest) genauer beschrieben.

### Evidence und Attestation

Wenn jemand eine Quest erledigt, kann er oder sie eine Spur hinterlassen: ein Foto, eine Notiz, ein QR-Scan, ein Systemereignis oder eine kurze Dokumentation. Das ist Evidence. Die Completion-Logik liegt im [Real Life Network Protocol](https://github.com/real-life-org/real-life-network-protocol/blob/main/05-quests/quest-mechanik.md#10-completion-evidence-und-attestation).

Evidence ist noch kein portabler Beleg.

Ein Beitrag wird erst dann belegt, wenn eine Attestation entsteht. Eine Attestation ist eine signierte Aussage im Web of Trust, zum Beispiel:

```text
Mira hat beim Bau des Hochbeet-Rahmens mitgeholfen.
```

Oder:

```text
Team Gartenkreis hat Hochbeet 7 gebaut.
```

Diese Attestations sind die Wahrheitsschicht. Das Spiel kann sie sichtbar machen, aber nicht ersetzen.

### Badge

Ein Badge ist eine sichtbare Darstellung einer Attestation oder einer aus Attestations ableitbaren Anerkennung. Die Game-Seite betrachtet Badges vor allem als Darstellung und grenzt sie im [Mechanik-Backlog](docs/03-mechanik-backlog.md#badge-zuerst-xp-später) von XP und Leveln ab.

Ein Badge kann im Profil erscheinen, in einer Campaign sichtbar werden oder später als Avatar-Item dargestellt werden. Der Kern bleibt aber immer:

```text
Badge = sichtbare Anerkennung, die auf einer Attestation beruht.
```

### [Game Pack](docs/06-game-pack.md)

Ein Game Pack definiert die Sprache und Darstellung einer Spielwelt.

Es legt fest:

- welche Begriffe verwendet werden,
- welche Entwicklungsfelder es gibt,
- welche Farben oder Icons eine Spielwelt trägt,
- welche Beitragsspielrollen sichtbar werden können.

Ein Game Pack ist nicht die Campaign selbst. Eine Campaign nutzt ein Game Pack.

Beispiel:

```text
Game Pack: Commons Builder
Entwicklungsfelder: Handwerk, Garten, Teamarbeit, Dokumentation, Commons
Rollen: Scout, Builder, Dokumentar, Hüter
```

### [Entwicklungskarte](docs/05-entwicklungskarte.md)

Die Entwicklungskarte zeigt, welche [Development Fields](docs/06-game-pack.md#development-fields) durch attestierte Handlungen berührt wurden.

Sie sagt nicht:

```text
Diese Person ist gut in Holzarbeit.
```

Sie sagt:

```text
Es gibt attestierte Handlungen, die Holzarbeit berührt haben.
```

Das ist ein wichtiger Unterschied. Die Entwicklungskarte soll Orientierung geben, nicht Menschen bewerten.

### [Adventure](docs/07-adventure.md)

Ein Adventure ist ein Erlebnisbogen aus mehreren Quests.

Beispiel: "Hochbeet bauen"

Dazu können mehrere Quests gehören:

- Material besorgen,
- Rahmen bauen,
- Erde einfüllen,
- Pflanzen einsetzen,
- Bau dokumentieren,
- Nachklang teilen.

Einige Quests sind für das Ziel erforderlich. Andere sind optional. Die genaue Modellierung über Relations ist im Abschnitt [Adventure-Modellierung](docs/07-adventure.md#modellierung) beschrieben.

In Gruppen ist es normal, dass verschiedene Menschen unterschiedliche Quests übernehmen. Alle zusammen können das Adventure abschließen, ohne dass jede Person alles getan hat.

### [Campaign](docs/08-campaign-und-world-state.md)

Eine Campaign ist eine zeitlich oder zielbezogen begrenzte Spielbewegung.

Beispiele:

- "100 Hochbeete für die Nachbarschaft"
- "Ein Festival als lebendiges Dorf"
- "30 Tage lokale Begegnung"
- "Macher-Schule: vom Projekt zur echten Wirkung"
- "Commons Builder: Orte, Angebote und Events sichtbar machen"

Eine Campaign kann mehrere Spaces, Orte, Gruppen und Networks umfassen. Sie nutzt ein [Game Pack](docs/06-game-pack.md) und bündelt Quests und Adventures. Abgrenzung und Relations sind in [Campaign und World State](docs/08-campaign-und-world-state.md#abgrenzung) beschrieben.

### [World State](docs/08-campaign-und-world-state.md#world-state)

World State ist der sichtbare Zustand einer Campaign.

Er zeigt nicht, wer besser ist. Er zeigt, was gemeinsam in der Welt passiert.

Beispiele:

- 27 Hochbeete gebaut,
- 8 aktive Orte,
- 12 Events mit mindestens 3 attestierten Teilnehmenden,
- 50 Angebote im Marktplatz,
- 6 neue Schul-Garten-Verbindungen.

World State wird aus sichtbaren Items, Relations und Attestations berechnet. Die technische Arbeitsdefinition steht im Abschnitt [World-State-Metrik](docs/08-campaign-und-world-state.md#world-state-metrik).

Die wichtigste Regel:

```text
World State darf nicht mehr behaupten, als seine Grundlage trägt.
```

Wenn eine Metrik auf Items schaut, zeigt sie vorhandene sichtbare Dinge. Wenn sie auf Attestations schaut, zeigt sie bezeugte Aussagen. Wenn sie beides kombiniert, kann sie sichtbare Dinge mit bezeugten Bedingungen zählen. Die Source-Arten sind in [Items, Relations und Attestations](docs/08-campaign-und-world-state.md#source-arten) aufgeschlüsselt; Sichtbarkeitsregeln stehen unter [Sichtbarkeit und Schutz](docs/08-campaign-und-world-state.md#sichtbarkeit-und-schutz).

## Der Spielablauf

Ein typischer Ablauf sieht so aus:

1. Eine [Campaign](docs/08-campaign-und-world-state.md) lädt Menschen zu einem gemeinsamen Ziel ein.
2. Menschen entdecken Quests, Orte, Events, Angebote oder Adventures.
3. Sie wählen freiwillig aus, wobei sie mitmachen möchten.
4. Sie erledigen reale Aufgaben.
5. Sie reichen Evidence ein oder erzeugen sichtbare Spuren.
6. Andere Menschen, Hosts, Mentoren, Gruppen, Systeme oder Agenten attestieren konkrete Beiträge.
7. Badges und [Entwicklungskarte](docs/05-entwicklungskarte.md) machen diese Beiträge sichtbar.
8. [Adventures](docs/07-adventure.md#completion) werden abgeschlossen, wenn die erforderlichen Quests erfüllt und attestiert sind.
9. Der [World State](docs/08-campaign-und-world-state.md#world-state) der Campaign verändert sich.
10. Die Gruppe sieht, was gemeinsam in der Welt entstanden ist.

## Beispiel: [Hochbeet-Campaign](docs/09-beispiel-hochbeet-campaign.md)

Eine Nachbarschaft startet die Campaign:

```text
100 Hochbeete für die Nachbarschaft
```

Das Game Pack heißt "Commons Builder". Es kennt Entwicklungsfelder wie Garten, Handwerk, Teamarbeit, Dokumentation und Commons.

Ein Adventure heißt "Hochbeet bauen".

Dazu gehören Quests:

- Material besorgen,
- Rahmen bauen,
- Erde einfüllen,
- Pflanzen einsetzen,
- Bau dokumentieren.

Anton besorgt Material. Timo baut den Rahmen. Mira dokumentiert. Jede dieser Handlungen kann eine eigene Quest-Completion-Attestation bekommen.

Wenn die erforderlichen Quests erfüllt sind, kann zusätzlich attestiert werden:

```text
Team Gartenkreis hat Hochbeet 7 gebaut.
```

Der World State der Campaign kann dann zählen:

```text
Insgesamt wurden schon 53 Hochbeete in der Nachbarschaft gebaut.
```

Die Entwicklungskarte der Beteiligten kann zeigen, welche Entwicklungsfelder ihre attestierten Beiträge berührt haben. Sie behauptet aber nicht automatisch, dass jemand eine Fähigkeit vollständig beherrscht.

## Was es nicht ist

Das Real Life Game ist kein Social-Credit-System.

Es ist kein Schulnoten-System.

Es ist kein globales Ranking.

Es ist kein XP-System, in dem Menschen für alles Punkte sammeln.

Es ist kein Ersatz für echte Beziehungen, Vertrauen oder Verantwortung.

Es ist kein Mechanismus, um Menschen zu kontrollieren.

Die Spielmechaniken sollen echte Begegnung, freiwillige Handlung und gemeinsame Weltgestaltung unterstützen. Sobald eine Mechanik Druck, Vergleich oder Manipulation erzeugt, muss sie neu geprüft werden.

## Mögliche Spielvarianten

Das Grundkonzept soll viele Spielvarianten tragen.

### Macher-Schule

Eine pädagogische Variante, in der Jugendliche, Lehrkräfte, Mentor:innen und lokale Partner reale Projekte als Quests und Adventures gestalten.

Diese Variante braucht ein eigenes Schutz-, Rollen- und Begleitmodell für Minderjährige.

### Festival

Ein Festival kann als temporäre Campaign erlebt werden. Menschen helfen beim Aufbau, teilen Ressourcen, lernen sich kennen, dokumentieren Beiträge und machen das Festival als gemeinsames Dorf sichtbar.

### Lokaler Kreis

Eine Nachbarschaft, ein Dorf oder eine Initiative kann regelmäßige Quests, Events, Angebote und Orte sichtbar machen.

### Commons-Aufbau

Menschen bauen gemeinsam Gärten, Werkstätten, Räume, Materialpools, Lebensmittelkreisläufe oder lokale Infrastruktur auf.

### Lernreise

Menschen entwickeln reale Fähigkeiten durch konkrete Aufgaben, Reflexion, Begleitung und attestierte Beiträge.

## Vertiefende Dokumente

- [Sprachliche Trennung](docs/01-sprachliche-trennung.md)
- [Vision und Spielprinzip](docs/02-vision-und-spielprinzip.md)
- [Mechanik-Backlog](docs/03-mechanik-backlog.md)
- [Offene Designfragen](docs/04-offene-designfragen.md)
- [Entwicklungskarte](docs/05-entwicklungskarte.md)
- [Game Pack](docs/06-game-pack.md)
- [Adventure](docs/07-adventure.md)
- [Campaign und World State](docs/08-campaign-und-world-state.md)
- [Beispiel: Hochbeet-Campaign](docs/09-beispiel-hochbeet-campaign.md)
- [Octalysis und das Real Life Game](docs/10-octalysis-und-rlg.md)

## Offene nächste Schritte

Dieses Grundkonzept ist die gemeinsame Basis. Daraus können mehrere nächste Artefakte entstehen:

- der Abgleich mit dem bestehenden [RLS-Integrationskonzept](https://github.com/real-life-org/real-life-stack/blob/master/docs/concepts/rlnp-game-integration.md),
- ein Oberflächen-Prototyp,
- ein erstes vollständiges Referenzspiel,
- ein Macher-Schule-Konzept,
- ein Schutz- und Rollenmodell für Minderjährige,
- ein One-Pager für Partner,
- ein Spielhandbuch für Hosts und Mitspieler.

Die Reihenfolge sollte pragmatisch bleiben:

```text
erst verständliche Grundlage,
dann technische Integration,
dann Prototyp,
dann konkretes Spiel.
```
