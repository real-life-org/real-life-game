# Real Life Game

**Status:** Entwurf
**Zuletzt aktualisiert:** 2026-05-16

Das Real Life Game ist die spielerische Gestaltungsschicht auf WoT, Real Life Stack und Real Life Network.

Es begreift die reale Welt und das eigene Leben als kooperatives Spielfeld: Menschen entdecken echte Fähigkeiten, teilen reale Ressourcen, verwandeln Aufgaben in Quests, Probleme in Rätsel und Projekte in gemeinsame Abenteuer.

Ziel ist nicht, ein klassisches Spiel zu gewinnen. Ziel ist WinWinWin:

- **Win für dich:** Menschen entfalten ihre Potenziale und kommen in ihre eigene Kraft.
- **Win für uns:** Beziehungen, Gemeinschaften und Projekte werden lebendiger.
- **Win für die Welt:** Orte, Commons, Ökosysteme und lokale Kreisläufe werden gestärkt.

## Verhältnis zu anderen Repos

| Ebene | Repo | Aufgabe |
|---|---|---|
| Identität und Vertrauen | [real-life-org/wot-spec](https://github.com/real-life-org/wot-spec) | DIDs, QR-Verifikation, Kontakte, Attestations |
| App- und Datenbasis | [real-life-org/real-life-stack](https://github.com/real-life-org/real-life-stack) | Spaces, generische Items, Profile, Karte, Kalender, Feed |
| Netzwerkprotokoll | [real-life-org/real-life-network-protocol](https://github.com/real-life-org/real-life-network-protocol) | soziale Operationen, Quests als reale Einladungen, Badges als Attestations |
| Spielgestaltung | [real-life-org/real-life-game](https://github.com/real-life-org/real-life-game) | Storylines, Entwicklungskarten, Spielmodi, Adventures, Campaigns, Rollen, Balancing, UI-Gefühl |

Eine Quest gehört sprachlich und technisch zuerst zum Real Life Network Protocol. Das Game benutzt Quests, rahmt sie aber zusätzlich durch Spielmechaniken.

Kurz:

```text
Quest = kleinste interoperable reale Einladung.
Game  = spielerischer Rahmen, der Quests, Orte, Ressourcen, Rollen und Geschichten verbindet.
```

## Dokumente

- [Sprachliche Trennung](docs/01-sprachliche-trennung.md)
- [Vision und Spielprinzip](docs/02-vision-und-spielprinzip.md)
- [Mechanik-Backlog](docs/03-mechanik-backlog.md)
- [Offene Designfragen](docs/04-offene-designfragen.md)
- [Entwicklungskarte](docs/05-entwicklungskarte.md)
- [Game Pack](docs/06-game-pack.md)
- [Adventure](docs/07-adventure.md)
- [Campaign und World State](docs/08-campaign-und-world-state.md)
- [Beispiel: Hochbeet-Campaign](docs/09-beispiel-hochbeet-campaign.md)

## Core v0

Die erste stabile Konzeptbasis besteht aus fünf Bausteinen:

| Baustein | Aufgabe |
|---|---|
| Game Pack | Sprache, Entwicklungsfelder, minimale Visuals und optionale Beitragsspielrollen |
| Entwicklungskarte | Orientierung über attestierte Handlungen und berührte Entwicklungsfelder |
| Adventure | Erlebnisbogen aus mehreren Quests |
| Campaign | zeitlich oder zielbezogen begrenzte Spielbewegung |
| World State | berechneter Zustand einer Campaign aus Items, Relations und Attestations |

Diese Bausteine erzeugen keine eigene Wahrheitsschicht. Sie deuten und visualisieren sichtbare RLS-Items, Relations und WoT/RLNP-Attestations.

## Leitplanken

Das Real Life Game soll sich leicht, einladend und lebendig anfühlen.

Es soll nicht:

- Menschen bewerten,
- sozialen Druck erzeugen,
- globale Rankings einführen,
- Verantwortung durch Punkte ersetzen,
- gefährliche Challenges fördern,
- private Entwicklung ohne Zustimmung sichtbar machen.

Die erste Zielgruppe sind Erwachsene. Anwendungen für Kinder und Jugendliche brauchen später ein eigenes Schutz- und Begleitmodell.
