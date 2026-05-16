# Sprachliche Trennung

**Status:** Arbeitsdefinition

Die Trennung zwischen `Quest` und `Game` ist sinnvoll, weil beide Begriffe verschiedene Ebenen beschreiben.

## Quest

Eine Quest ist eine freiwillige Einladung zu einer realen Handlung.

Sie gehört zum Real Life Network Protocol, weil sie interoperabel, schlicht und in vielen Kontexten verwendbar sein muss:

- in der App,
- auf Pax/Festivals,
- in lokalen Kreisen,
- in Projekten,
- in Commons,
- durch Menschen,
- durch Agenten,
- ohne vollständiges Spielsystem.

Eine Quest kann existieren, ohne dass jemand "ein Spiel spielt".

Beispiele:

- "Verifiziere eine reale Begegnung per QR."
- "Hilf beim Aufbau der Küche."
- "Bringe das Zelt trocken zurück."
- "Lade fünf Menschen zum Vollmondfeuer ein."
- "Dokumentiere den Fortschritt im Gemeinschaftsgarten."

## Game

Das Game ist die spielerische Gestaltungsschicht darüber.

Es verbindet Quests mit:

- Storylines,
- Rollen,
- Adventures,
- Spielmodi,
- Progression,
- Fähigkeiten,
- Ressourcen,
- Kartenlogik,
- Gruppenreisen,
- Kampagnen,
- Ästhetik,
- Spielleitung,
- KI-Unterstützung.

Das Game beantwortet nicht nur: "Was kann ich tun?", sondern auch:

- "Warum fühlt sich das wie ein Abenteuer an?"
- "Welche Rolle spiele ich gerade?"
- "Welche Geschichte entfaltet sich?"
- "Wie wird mein Beitrag sichtbar?"
- "Was ist der nächste stimmige Schritt?"

## Regel

```text
Eine Quest kann ohne Game existieren.
Das Game benutzt Quests als kleinste reale Handlungseinheit.
```

## Konsequenz für Sprache

Im [real-life-org/real-life-network-protocol](https://github.com/real-life-org/real-life-network-protocol) sollten wir sagen:

- Quest,
- lokale Completion,
- Evidence,
- Attestation Policy,
- Completion Attestation Template,
- Attestation,
- Badge als Attestation oder Attestation-View,
- Safety Requirements,
- Visibility,
- Host,
- Author,
- Fork.

Im [real-life-org/real-life-game](https://github.com/real-life-org/real-life-game) können wir zusätzlich sagen:

- Adventure,
- Journey,
- Campaign,
- Storyline,
- Game Pack,
- Player,
- Game Master,
- Progression,
- Entwicklungskarte,
- developmentFields,
- Avatar,
- Avatar-Item,
- Inventory,
- Game Mode,
- World State.

Damit bleibt das Basisprotokoll nüchtern und interoperabel, während dieses Repo die spielerische Tiefe erforschen kann.

## V0-Grenze

Für Core v0 gilt:

| Gehört zu RLNP | Gehört zum Real Life Game |
|---|---|
| Quest | Adventure |
| QuestRun | Campaign |
| lokale Completion | Game Pack |
| Evidence | Entwicklungskarte |
| Attestation Policy | World State |
| Completion Attestation Template | Avatar-Item-Darstellung |
| Badge als Attestation oder Attestation-View | spielerische Rollen |
| Safety Requirements | Sprache und Visuals |

Das Game darf auf diese RLNP-Bausteine verweisen und sie darstellen. Es darf sie nicht als eigene, parallele Wahrheits- oder Verifikationslogik neu erfinden.
