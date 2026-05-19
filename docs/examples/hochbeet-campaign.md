# Beispiel: Hochbeet-Campaign

**Status:** Beispiel, nicht normativ

Dieses Beispiel zeigt, wie Game Pack, Quests, Adventure, Campaign und World State zusammenwirken können.

Es ist keine Macher-Schule-Speziallogik. Das Beispiel nutzt nur Hochbeete, weil daran Gruppenarbeit, Material, Orte, Dokumentation und bezeugte Ergebnisse gut sichtbar werden.

## Game Pack

```ts
const gamePack = {
  id: "commons-builder",
  title: "Commons Builder",
  version: "0.1.0",
  language: {
    developmentMap: "Entwicklungskarte",
    developmentField: "Entwicklungsfeld",
    adventure: "Adventure",
    campaign: "Campaign"
  },
  visuals: {
    color: "#4f8f5b",
    icon: "sprout"
  },
  developmentFields: [
    { id: "machen", label: "Machen" },
    { id: "handwerk", label: "Handwerk", parent: "machen" },
    { id: "holzarbeit", label: "Holzarbeit", parent: "handwerk" },
    { id: "werkzeugnutzung", label: "Werkzeugnutzung", parent: "handwerk" },
    { id: "garten", label: "Garten" },
    { id: "materialplanung", label: "Materialplanung" },
    { id: "teamarbeit", label: "Teamarbeit" },
    { id: "dokumentation", label: "Dokumentation" },
    { id: "commons", label: "Commons" }
  ],
  roles: [
    { id: "scout", label: "Scout" },
    { id: "builder", label: "Builder" },
    { id: "documenter", label: "Dokumentar" },
    { id: "steward", label: "Hüter" }
  ]
}
```

## Quests

Die Quests selbst gehören zum Real Life Network Protocol.

Das Game ergänzt nur `developmentFields`.

```ts
const materialQuest = {
  title: "Material für ein Hochbeet besorgen",
  game: {
    developmentFields: [
      "materialplanung",
      "teamarbeit",
      "commons"
    ]
  },
  data: {
    evidencePolicy: {
      required: false,
      acceptedTypes: ["photo", "text"]
    },
    confirmationPolicy: {
      allowedConfirmers: [
        { role: "quest-host" },
        { role: "peer" },
        { role: "system" }
      ],
      acceptedTrustLevels: ["server-confirmed", "signed-attested"]
    }
  }
}

const buildFrameQuest = {
  title: "Rahmen bauen",
  game: {
    developmentFields: [
      "holzarbeit",
      "werkzeugnutzung",
      "teamarbeit"
    ]
  }
}

const documentationQuest = {
  title: "Bau dokumentieren",
  game: {
    developmentFields: [
      "dokumentation",
      "teamarbeit"
    ]
  }
}
```

Eine gültige Quest-Completion wird durch eine Confirmation belegt. Portable Completion braucht eine signierte Attestation. Evidence ist nur eine mögliche Grundlage für diese Confirmation.

## Adventure

Das Adventure ist die Vorlage und verbindet die Quests über Relations.

```ts
const raisedBedAdventure = {
  id: "raised-bed-adventure",
  title: "Hochbeet bauen",
  gamePackId: "commons-builder",
  game: {
    developmentFields: [
      "garten",
      "handwerk",
      "teamarbeit",
      "commons"
    ]
  },
  completionPolicy: {
    requiredQuestPredicate: "containsQuest",
    requireAllRequiredQuests: true,
    completionConfirmationTemplate: {
      claim: "adventure.completed",
      badge: {
        emoji: "🌱",
        color: "green",
        shape: "circle"
      }
    }
  }
}
```

Relations:

```json
[
  {
    "id": "rel:raised-bed-material",
    "from": "item:adventure:raised-bed-adventure",
    "predicate": "containsQuest",
    "target": "item:quest:material-besorgen",
    "meta": {
      "required": true,
      "phase": "vorbereitung",
      "order": 1,
      "roleId": "scout",
      "capacity": 1
    }
  },
  {
    "id": "rel:raised-bed-frame",
    "from": "item:adventure:raised-bed-adventure",
    "predicate": "containsQuest",
    "target": "item:quest:rahmen-bauen",
    "meta": {
      "required": true,
      "phase": "bau",
      "order": 2,
      "roleId": "builder",
      "capacity": 1
    }
  },
  {
    "id": "rel:raised-bed-documentation",
    "from": "item:adventure:raised-bed-adventure",
    "predicate": "containsQuest",
    "target": "item:quest:dokumentation",
    "meta": {
      "required": false,
      "phase": "nachklang",
      "order": 3,
      "roleId": "documenter",
      "capacity": 1
    }
  }
]
```

## Gruppenlogik

Verschiedene Menschen können unterschiedliche Einzelquests erledigen.

Die Quests sind dabei offene Angebote. Die konkrete Person wird nicht an der Quest festgelegt, sondern entsteht erst im QuestRun.

Die Koordination passiert im konkreten `AdventureRun`. Dort füllt ein QuestRun eine bestimmte Adventure-Quest-Relation:

```text
QuestRun "Timo baut den Rahmen"
  runsQuest -> item:quest:rahmen-bauen
  partOfAdventureRun -> item:adventure-run:hochbeet-7
  fillsAdventureStep -> rel:raised-bed-frame
```

Wenn `rel:raised-bed-frame` im Adventure `capacity: 1` hat, kann dieser Schritt in `adventure-run:hochbeet-7` nur von einem aktiven QuestRun gefüllt werden. Dieselbe Quest kann in einem anderen AdventureRun wieder offen sein.

```text
Ein möglicher Durchlauf:
Anton besorgt Material.
Timo baut den Rahmen.
Mira dokumentiert.
```

Die einzelnen Beiträge werden durch Quest-Completion-Confirmations belegt.

Der AdventureRun kann zusätzlich eine gemeinsame Abschluss-Confirmation erhalten:

```text
Team Gartenkreis hat Hochbeet 7 gebaut.
```

Dadurch kann der World State später ein Hochbeet zählen, ohne alle Einzelbeiträge öffentlich auszurollen.

## Campaign

```ts
const campaign = {
  id: "hundert-hochbeete",
  title: "100 Hochbeete für die Nachbarschaft",
  status: "active",
  startsAt: "2026-05-01",
  endsAt: "2026-10-31",
  completionPolicy: {
    type: "world-state-target",
    metricId: "raised-beds-built",
    target: 100
  },
  worldState: [
    {
      id: "raised-beds-built",
      label: "Gebaute Hochbeete",
      source: {
        type: "confirmations",
        claim: "adventure.completed",
        acceptedTrustLevels: ["server-confirmed", "signed-attested"],
        filter: {
          adventureType: "raised-bed"
        }
      },
      aggregation: {
        type: "count-distinct",
        field: "subjectId"
      },
      target: 100,
      visibility: "public"
    },
    {
      id: "community-gardens-on-map",
      label: "Gemeinschaftsgärten auf der Karte",
      source: {
        type: "items",
        itemType: "community-garden",
        filter: {
          hasLocation: true,
          visibility: "public"
        }
      },
      aggregation: {
        type: "count"
      },
      visibility: "public"
    },
    {
      id: "events-with-confirmed-participants",
      label: "Events mit mindestens 3 bestätigten Teilnehmenden",
      source: {
        type: "items",
        itemType: "event",
        filter: {
          status: "past",
          visibility: "campaign"
        },
        requires: [
          {
            type: "confirmation-count",
            claim: "event.participated",
            subjectRelation: "confirmation.subject == item.id",
            min: 3
          }
        ]
      },
      aggregation: {
        type: "count"
      },
      visibility: "campaign"
    },
    {
      id: "marketplace-offers",
      label: "Aktive Angebote im Marktplatz",
      source: {
        type: "items",
        itemType: "marketplace-offer",
        filter: {
          status: "active",
          visibility: "campaign"
        }
      },
      aggregation: {
        type: "count"
      },
      visibility: "campaign"
    }
  ]
}
```

## Wichtige Unterscheidungen

| Metrik | Aussage |
|---|---|
| Hochbeete gebaut | bezeugte Adventure-Abschlüsse |
| Gemeinschaftsgärten auf der Karte | sichtbare RLS-Items |
| Events mit 3 Teilnehmenden | Event-Items mit zusätzlicher Confirmation-Bedingung |
| Angebote im Marktplatz | sichtbare aktive RLS-Items |

Keine dieser Metriken rankt Menschen. Sie zeigen, was in der Campaign als gemeinsamer Weltzustand sichtbar wird.
