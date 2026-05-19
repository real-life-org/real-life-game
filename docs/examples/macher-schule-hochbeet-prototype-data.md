# Beispiel: Macher-Schule Hochbeet als Datenmodell

**Status:** Datenmodell-Test, nicht normativ

Dieses Dokument bildet das klickbare Hochbeet-Prototyp-Szenario als strukturierte Daten nach. Es ist kein neues Schema. Es testet nur, ob die bestehenden Begriffe aus Real Life Network Protocol, Real Life Game und Real Life Stack das Szenario tragen:

- Game Pack für Sprache, Statusbegriffe, Visual-Tokens, Entwicklungsfelder und Beitragsspielrollen,
- Campaign für konkrete Rollenfähigkeiten, sichtbare Quest-Angebote, Adventure-Angebote und World State,
- Adventure als Vorlage,
- Adventure-Quest-Relations als Steps,
- Quests als RLNP-nahe Einladungen,
- QuestRuns, Evidence und Confirmations als später entstehender Zustand.

Konkrete Adventures und Quests sind hier **nicht Teil des Game Packs**. Sie gehören zur Campaign bzw. zu den kuratierten Angeboten, die das Game Pack nutzen.

Der klickbare Prototyp lädt diese Logik inzwischen als exportierbares `SimulationBundle` aus [`prototype/macher-schule-hochbeet/scenario.js`](../../prototype/macher-schule-hochbeet/scenario.js). Das Bundle ist ein Simulator-Format, nicht die normative Spezifikation.

## Game Pack

```ts
const gamePack = {
  id: "game-pack:macher-schule",
  title: "Macher-Schule",
  version: "0.1.0",
  language: {
    quest: "Aufgabe",
    questRun: "Aufgabe",
    adventure: "Adventure",
    adventureRun: "Adventure",
    campaign: "Kampagne",
    developmentMap: "Entwicklungskarte",
    developmentField: "Feld",
    statusLabels: {
      default: {
        open: "offen",
        active: "aktiv",
        completed: "fertig",
        confirmed: "bestätigt",
        archived: "archiviert"
      },
      adventureRun: {
        open: "offen",
        active: "aktiv",
        completed: "abgeschlossen",
        confirmed: "bestätigt",
        archived: "archiviert"
      }
    },
    actionLabels: {
      start: "Starten",
      join: "Mitmachen",
      continue: "Weitermachen",
      acceptQuest: "Aufgabe übernehmen",
      completeQuest: "Fertig melden",
      postPhoto: "Foto posten",
      confirm: "Bestätigen"
    }
  },
  visuals: {
    primaryColor: "#2f7d5b",
    accentColor: "#b16222",
    icon: "hammer",
    statusVisuals: {
      open: {
        color: "#5d5548",
        backgroundColor: "#eee8dd",
        icon: "circle",
        shape: "pill"
      },
      active: {
        color: "#b16222",
        backgroundColor: "#f4eadc",
        icon: "play",
        shape: "pill"
      },
      completed: {
        color: "#3867a8",
        backgroundColor: "#e3ebf7",
        icon: "check-circle",
        shape: "pill"
      },
      confirmed: {
        color: "#2f7d5b",
        backgroundColor: "#e3efe8",
        icon: "check-circle",
        shape: "pill"
      }
    }
  },
  developmentFields: [
    { id: "machen", label: "Machen" },
    { id: "holzarbeit", label: "Holzarbeit", parent: "machen" },
    { id: "werkzeugnutzung", label: "Werkzeugnutzung", parent: "machen" },
    { id: "garten", label: "Garten" },
    { id: "sorgfalt", label: "Sorgfalt" },
    { id: "verantwortung", label: "Verantwortung" },
    { id: "teamarbeit", label: "Teamarbeit" },
    { id: "dokumentation", label: "Dokumentation" },
    { id: "mentoring", label: "Mentoring" }
  ],
  roles: [
    { id: "builder", label: "Builder", icon: "drill" },
    { id: "documenter", label: "Dokumentar", icon: "camera" },
    { id: "gardener", label: "Gärtner", icon: "shovel" },
    { id: "mentor", label: "Mentor", icon: "helmet" }
  ]
}
```

Die Rollen im Game Pack sind Beitragsspielrollen. Sie sagen, wie ein Beitrag spielerisch sichtbar werden kann. Sie geben keine Berechtigungen.

## Campaign-Rollen und Fähigkeiten

Die konkrete Macher-Schule-Campaign definiert, welche Menschen welche Handlungen ausführen dürfen. Diese Rollen sind nicht dasselbe wie Game-Pack-Beitragsspielrollen.

```ts
const campaignRoles = [
  {
    id: "student",
    label: "Schüler:in",
    capabilities: [
      "questRun.accept",
      "questRun.complete",
      "evidence.create"
    ]
  },
  {
    id: "mentor",
    label: "Mentor:in",
    capabilities: [
      "quest.create",
      "quest.offer",
      "confirmation.create"
    ]
  },
  {
    id: "visitor",
    label: "Öffentliche Sicht",
    capabilities: [
      "campaign.viewPublicSummary"
    ]
  }
]
```

In einem anderen Spiel können dieselben Fähigkeiten anders verteilt sein. Ein Peer-Spiel könnte z.B. `confirmation.create` auch Spieler:innen erlauben. Eine offene Community könnte `quest.create` für alle Mitglieder öffnen.

## Profile

```ts
const profiles = [
  {
    id: "profile:jonas",
    name: "Jonas",
    campaignRoleId: "student",
    avatar: "img/avatar-boy-kid-svgrepo-com.svg"
  },
  {
    id: "profile:mira",
    name: "Mira",
    campaignRoleId: "student",
    avatar: "img/boy-indian-kid-svgrepo-com.svg"
  },
  {
    id: "profile:sami",
    name: "Sami",
    campaignRoleId: "student",
    avatar: "img/avatar-female-portrait-2-svgrepo-com.svg"
  },
  {
    id: "profile:herr-lehmann",
    name: "Herr Lehmann",
    campaignRoleId: "mentor",
    avatar: "img/builder-helmet-worker-svgrepo-com.svg"
  }
]
```

Die unbeteiligte Person im Prototyp ist keine notwendige Spielfigur. Sie ist eine View-Perspektive auf freigegebene Campaign-Daten.

## Campaign

```ts
const campaign = {
  id: "campaign:macher-schule-hochbeet",
  title: "Macher-Schule Hochbeet",
  status: "active",
  gamePackId: "game-pack:macher-schule",
  spaceId: "space:macher-schule-demo",
  visibility: {
    mode: "space"
  },
  roleDefinitions: campaignRoles,
  worldState: [
    {
      id: "schoolyard-raised-beds-built",
      label: "Schulhof-Hochbeete gebaut",
      source: {
        type: "confirmations",
        schema: "rlg:adventure-completed",
        filter: {
          adventureId: "adventure:schoolyard-raised-bed",
          acceptedTrustLevels: ["server-confirmed", "signed-attested"]
        }
      },
      aggregation: {
        type: "count-distinct",
        field: "subjectId"
      },
      visibility: "space"
    }
  ]
}
```

## Quests

Die Quests bleiben RLNP-nahe Einladungen. Das Game ergänzt nur `game.developmentFields` und die spätere Darstellung.

```ts
const quests = [
  {
    id: "quest:raised-bed-frame-build",
    title: "Rahmen verschrauben",
    image: "img/driller-drill-svgrepo-com.svg",
    data: {
      evidencePolicy: {
        required: false,
        acceptedTypes: ["photo", "video", "text"]
      },
      confirmationPolicy: {
        allowedConfirmers: [
          { campaignRoleId: "mentor" }
        ],
        acceptedTrustLevels: ["server-confirmed", "signed-attested"]
      }
    },
    game: {
      developmentFields: ["holzarbeit", "werkzeugnutzung", "teamarbeit"]
    }
  },
  {
    id: "quest:raised-bed-documentation",
    title: "Baufortschritt dokumentieren",
    image: "img/photo-camera-svgrepo-com.svg",
    data: {
      evidencePolicy: {
        required: false,
        acceptedTypes: ["photo", "video", "text"]
      },
      confirmationPolicy: {
        allowedConfirmers: [
          { campaignRoleId: "mentor" }
        ],
        acceptedTrustLevels: ["server-confirmed", "signed-attested"]
      }
    },
    game: {
      developmentFields: ["dokumentation", "teamarbeit"]
    }
  },
  {
    id: "quest:raised-bed-soil-fill",
    title: "Erde einfüllen",
    image: "img/shovel-svgrepo-com.svg",
    data: {
      evidencePolicy: {
        required: false,
        acceptedTypes: ["photo", "video", "text"]
      },
      confirmationPolicy: {
        allowedConfirmers: [
          { campaignRoleId: "mentor" }
        ],
        acceptedTrustLevels: ["server-confirmed", "signed-attested"]
      }
    },
    game: {
      developmentFields: ["garten", "teamarbeit"]
    }
  },
  {
    id: "quest:plant-carrots",
    title: "Karotten pflanzen",
    image: "img/carrot-salad-vegetables-svgrepo-com.svg",
    data: {
      evidencePolicy: {
        required: false,
        acceptedTypes: ["photo", "video", "text"]
      },
      confirmationPolicy: {
        allowedConfirmers: [
          { campaignRoleId: "mentor" }
        ],
        acceptedTrustLevels: ["server-confirmed", "signed-attested"]
      }
    },
    game: {
      developmentFields: ["garten", "sorgfalt"]
    }
  },
  {
    id: "quest:water-plants",
    title: "Gießen",
    image: "img/watering-can-svgrepo-com.svg",
    data: {
      evidencePolicy: {
        required: false,
        acceptedTypes: ["photo", "video", "text"]
      },
      confirmationPolicy: {
        allowedConfirmers: [
          { campaignRoleId: "mentor" }
        ],
        acceptedTrustLevels: ["server-confirmed", "signed-attested"]
      }
    },
    game: {
      developmentFields: ["garten", "verantwortung"]
    }
  }
]
```

## Standalone-Quest-Angebote

Karotten pflanzen und Gießen sind in diesem Szenario keine Adventure-Steps. Die Campaign bietet sie als eigenständige Quest-Angebote an.

```ts
const questOffers = [
  {
    id: "quest-offer:plant-carrots-once",
    campaignId: "campaign:macher-schule-hochbeet",
    questId: "quest:plant-carrots",
    mode: "standalone",
    order: 1,
    repeatable: false,
    capacity: 1
  },
  {
    id: "quest-offer:water-plants-daily",
    campaignId: "campaign:macher-schule-hochbeet",
    questId: "quest:water-plants",
    mode: "standalone",
    order: 2,
    repeatable: true,
    cadence: "daily",
    capacity: 1
  }
]
```

## Adventure

```ts
const adventure = {
  id: "adventure:schoolyard-raised-bed",
  title: "Schulhof-Hochbeet bauen",
  status: "active",
  gamePackId: "game-pack:macher-schule",
  image: "img/gardener-work-svgrepo-com.svg",
  game: {
    developmentFields: ["holzarbeit", "garten", "teamarbeit"]
  },
  completionPolicy: {
    requiredQuestPredicate: "containsQuest",
    requireAllRequiredQuests: true,
    completionConfirmationTemplate: {
      claim: "adventure.completed",
      badge: {
        color: "green",
        shape: "circle"
      }
    }
  }
}
```

Dieses Dokument legt nicht fest, ob die Adventure-Abschluss-Confirmation automatisch, durch einen Mentor, durch einen Peer-Kreis oder durch ein System erzeugt wird. Der Prototyp darf damit weiter experimentieren.

## Adventure-Quest-Relations

Die Relations definieren die Steps des Adventures. Sie weisen keine Personen zu.

```ts
const adventureQuestRelations = [
  {
    id: "rel:schoolyard-raised-bed-frame-build",
    from: "adventure:schoolyard-raised-bed",
    predicate: "containsQuest",
    target: "quest:raised-bed-frame-build",
    meta: {
      required: true,
      phase: "bau",
      order: 1,
      roleId: "builder",
      capacity: 1,
      developmentFields: ["holzarbeit", "werkzeugnutzung", "teamarbeit"]
    }
  },
  {
    id: "rel:schoolyard-raised-bed-documentation",
    from: "adventure:schoolyard-raised-bed",
    predicate: "containsQuest",
    target: "quest:raised-bed-documentation",
    meta: {
      required: false,
      phase: "nachklang",
      order: 2,
      roleId: "documenter",
      capacity: 1,
      developmentFields: ["dokumentation", "teamarbeit"]
    }
  },
  {
    id: "rel:schoolyard-raised-bed-soil-fill",
    from: "adventure:schoolyard-raised-bed",
    predicate: "containsQuest",
    target: "quest:raised-bed-soil-fill",
    meta: {
      required: true,
      phase: "bau",
      order: 3,
      roleId: "gardener",
      capacity: 1,
      dependsOn: [
        "rel:schoolyard-raised-bed-frame-build"
      ],
      developmentFields: ["garten", "teamarbeit"]
    }
  }
]
```

`dependsOn` bedeutet hier praktische Reihenfolge. Erde einfüllen darf beginnen oder fertig gemeldet werden, sobald der Rahmen-Step im selben AdventureRun lokal fertig oder bestätigt ist. Es bedeutet nicht, dass zuerst eine Mentor-Confirmation vorliegen muss.

## Campaign-Relations

```ts
const relations = [
  {
    from: "campaign:macher-schule-hochbeet",
    predicate: "usesGamePack",
    target: "game-pack:macher-schule"
  },
  {
    from: "campaign:macher-schule-hochbeet",
    predicate: "includesAdventure",
    target: "adventure:schoolyard-raised-bed"
  },
  {
    from: "campaign:macher-schule-hochbeet",
    predicate: "offersQuest",
    target: "quest-offer:plant-carrots-once"
  },
  {
    from: "campaign:macher-schule-hochbeet",
    predicate: "offersQuest",
    target: "quest-offer:water-plants-daily"
  },
  ...adventureQuestRelations
]
```

## Initialer Prototyp-Zustand

Der initiale Zustand ist absichtlich fast leer. Es gibt eine Campaign, ein Game Pack, eine Adventure-Vorlage und sichtbare Quest-Angebote. AdventureRuns und QuestRuns entstehen erst durch Handlungen.

```ts
const initialState = {
  selectedProfileId: "profile:jonas",
  selectedView: "overview",
  selectedAdventureRunId: null,
  adventureRuns: [],
  questRuns: [],
  evidence: [],
  confirmations: [],
  worldState: {
    "schoolyard-raised-beds-built": 0
  },
  timeline: [
    {
      id: "event:initial-template-visible",
      text: "Die Macher-Schule sieht die Hochbeet-Adventure-Vorlage. Noch kein Adventure ist gestartet.",
      scopes: ["global"],
      public: false
    }
  ]
}
```

## Entstehender Zustand

Wenn ein Schüler im Prototyp den ersten Adventure-Step übernimmt, entsteht kein leerer AdventureRun im Voraus. Erst die Step-Übernahme erzeugt den konkreten Lauf:

```ts
const exampleAdventureRun = {
  id: "adventure-run:schoolyard-raised-bed-group-a",
  adventureId: "adventure:schoolyard-raised-bed",
  title: "Hochbeet-Gruppe A",
  status: "active",
  participantIds: ["profile:jonas"],
  campaignId: "campaign:macher-schule-hochbeet",
  spaceId: "space:macher-schule-demo",
  visibility: {
    mode: "space"
  }
}

const exampleQuestRun = {
  id: "quest-run:jonas-group-a-frame-build",
  questId: "quest:raised-bed-frame-build",
  actorId: "profile:jonas",
  adventureRunId: "adventure-run:schoolyard-raised-bed-group-a",
  adventureStepRelationId: "rel:schoolyard-raised-bed-frame-build",
  status: "active",
  createdAt: "2027-03-18T09:00:00+01:00",
  completion: null,
  visibility: {
    mode: "private"
  }
}
```

Wenn Jonas fertig meldet, ist das ein Self-Claim des QuestRun-Akteurs:

```ts
const completedQuestRunPatch = {
  status: "completed",
  completedAt: "2027-03-18T10:30:00+01:00",
  completion: {
    claimedAt: "2027-03-18T10:31:00+01:00",
    claim: "Ich habe einen Teil des Hochbeet-Rahmens verschraubt.",
    evidenceRefs: []
  }
}
```

Das ist noch keine Confirmation und keine Attestation. Erst eine passende Confirmation bestätigt den Beitrag:

```ts
const exampleConfirmation = {
  id: "confirmation:jonas-group-a-frame-build",
  subjectId: "quest-run:jonas-group-a-frame-build",
  issuerId: "profile:herr-lehmann",
  claim: "Jonas hat einen Teil des Hochbeet-Rahmens verschraubt.",
  schema: "rlnp:quest-completion",
  trustLevel: "server-confirmed",
  relations: [
    {
      predicate: "confirmsQuestRun",
      target: "quest-run:jonas-group-a-frame-build"
    },
    {
      predicate: "withinCampaign",
      target: "campaign:macher-schule-hochbeet"
    }
  ]
}
```

## Was der Datenmodell-Test zeigt

- Das Game Pack kann Wording und Visual-Tokens liefern, ohne konkrete Quests oder Adventures zu besitzen.
- Campaign-Rollen und Game-Pack-Beitragsspielrollen müssen getrennt bleiben.
- Die Hochbeet-Bauaufgaben sind nur im Adventure-Kontext startbar.
- Karotten pflanzen und Gießen sind eigenständige Quest-Angebote derselben Campaign.
- Ein AdventureRun entsteht erst durch die erste Step-Übernahme.
- Evidence, Completion und Confirmation bleiben RLNP-nahe Begriffe.
- Die Entwicklungskarte kann aus den späteren Confirmations abgeleitet werden.
