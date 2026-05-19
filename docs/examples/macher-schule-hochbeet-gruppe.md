# Beispiel: Macher-Schule Hochbeet-Gruppe

**Status:** Beispiel, nicht normativ

Dieses Beispiel zeigt, wie ein Macher-Schule-inspirierter Pfad mit der Logik von Real Life Network Protocol, Real Life Game und Real Life Stack modelliert werden kann.

Es übernimmt nicht die Details des `macher-schule`-Repos. Das Repo ist Inspirationsmaterial für echte Situationen, Rollen und Sprache. Die technische und konzeptionelle Logik bleibt hier:

- Quest, QuestRun, Evidence, Completion und Confirmation Policy gehören ins Real Life Network Protocol.
- Game Pack, `developmentFields`, Adventure, Campaign, Beitragsspielrollen und World State gehören ins Real Life Game.
- Items, Relations, `ConfirmationView`, Trust-Level und UI-Views gehören in den Real Life Stack.

Das Beispiel nutzt Jonas als eine beteiligte Person, eine Schule in Gudensberg und ein Hochbeet, weil daran Werk, Begegnung, Mentoring, sparsame Dokumentation, Entwicklungskarte und World State konkret sichtbar werden.

## Kurzgeschichte

Jonas ist Schüler in einer Macher-Schule-Campaign. In einer FREI-DAY-Phase hilft er mit mehreren Mitschülern beim Bau eines Hochbeets für den Schulhof.

Jonas macht nicht alleine "ein Level". Die Gruppe erledigt reale Quests und die einzelnen Confirmations beschreiben konkrete Beiträge. In diesem Durchlauf verteilen sich die Beiträge so:

- Material prüfen,
- Jonas verschraubt einen Teil des Rahmens,
- Mira dokumentiert kurz, was die Gruppe gebaut hat,
- Sami füllt Erde ein,
- später jüngeren Schülern beim Reparatur-Café helfen.

Diese Verteilung ist nicht in den Quests fest verdrahtet. Jonas könnte dokumentieren, Mira könnte den Rahmen verschrauben. Die Quest ist das offene Angebot; die konkrete Person steht erst im QuestRun. Innerhalb dieses konkreten Hochbeet-Laufs kann aber ein Adventure-Step belegt sein: Wenn Jonas den Rahmen-Step übernimmt, kann Mira denselben Step in diesem AdventureRun nicht nochmal übernehmen.

Ein Mentor oder Host kann konkrete Beiträge bestätigen. Dafür muss nicht bei jedem Arbeitsschritt ein Foto entstehen und der Mentor muss nicht jedes Mal eine Notiz schreiben. Wenn ein beobachteter Beitrag erledigt ist, kann eine Completion-Confirmation reichen. Das Game macht sichtbar, welche Entwicklungsfelder durch diese bezeugten Handlungen berührt wurden.

## Game Pack

Das Game Pack beschreibt nur Sprache, Entwicklungsfelder, Visuals und Beitragsspielrollen. Es definiert keine Completion-Logik und keine Berechtigungen.

```ts
const gamePack = {
  id: "macher-schule-core",
  title: "Macher-Schule",
  version: "0.1.0",
  language: {
    developmentMap: "Entwicklungskarte",
    developmentField: "Entwicklungsfeld",
    adventure: "Werk-Abenteuer",
    campaign: "Macher-Campaign"
  },
  visuals: {
    color: "#2f7d5b",
    icon: "hammer"
  },
  developmentFields: [
    { id: "machen", label: "Machen" },
    { id: "holzarbeit", label: "Holzarbeit", parent: "machen" },
    { id: "werkzeugnutzung", label: "Werkzeugnutzung", parent: "machen" },
    { id: "materialplanung", label: "Materialplanung" },
    { id: "garten", label: "Garten" },
    { id: "teamarbeit", label: "Teamarbeit" },
    { id: "dokumentation", label: "Dokumentation" },
    { id: "mentoring", label: "Mentoring" }
  ],
  roles: [
    { id: "builder", label: "Builder" },
    { id: "documenter", label: "Dokumentar" },
    { id: "gardener", label: "Gärtner" },
    { id: "mentor", label: "Mentor" },
    { id: "host", label: "Host" }
  ]
}
```

Die Rollen sind Beitragsspielrollen. Sie sagen, wie jemand in diesem Beispiel sichtbar wird. Sie sagen nicht, wer im Space administrieren, bestätigen oder moderieren darf.

Katrin ist in diesem Beispiel der Adventure-Host des konkreten Hochbeet-Laufs. Das kann eine Lehrkraft, FREI-DAY-Koordinatorin, Projektbegleiterin oder Schulleitung sein. Für das Modell ist nur wichtig: Sie verantwortet den Gruppenlauf organisatorisch und darf den AdventureRun-Abschluss bestätigen.

## Campaign

Die Campaign bündelt eine konkrete Spielbewegung. Sie ist kein Space und kein Network.

```ts
const campaign = {
  id: "macher-schule-gudensberg-fruehling-2027",
  title: "Macher-Schule Gudensberg Frühling 2027",
  status: "active",
  startsAt: "2027-02-01",
  endsAt: "2027-07-31",
  visibility: {
    mode: "space"
  },
  reportingPolicy: {
    publicSummary: true,
    minGroupSize: 5,
    allowPersonMetrics: false
  },
  completionPolicy: {
    type: "manual"
  },
  worldState: [
    {
      id: "schoolyard-raised-beds-built",
      label: "Schulhof-Hochbeete gebaut",
      source: {
        type: "confirmations",
        schema: "rlg:adventure-completed",
        filter: {
          adventureType: "schoolyard-raised-bed",
          acceptedTrustLevels: ["server-confirmed", "signed-attested"]
        }
      },
      aggregation: {
        type: "count-distinct",
        field: "subjectId"
      },
      visibility: "space"
    },
    {
      id: "documented-works",
      label: "Dokumentierte Werke",
      source: {
        type: "items",
        itemType: "work-card",
        filter: {
          campaignId: "macher-schule-gudensberg-fruehling-2027",
          visibility: "space"
        }
      },
      aggregation: {
        type: "count"
      },
      visibility: "space"
    }
  ]
}
```

`source.type: "confirmations"` ist hier eine RLS-Projektion. Eine Implementierung, die nur portable signierte Belege zählen will, kann dieselbe Metrik enger als Attestation-Source oder mit `acceptedTrustLevels: ["signed-attested"]` ausdrücken.

Die öffentliche Zusammenfassung darf später zum Beispiel sagen:

```text
In der Macher-Schule Gudensberg wurden 3 Schulhof-Werke dokumentiert.
```

Sie darf nicht sagen:

```text
Jonas ist der beste Macher der Schule.
```

## Campaign-Relations

Campaign-Zugehörigkeit wird über Relations modelliert.

```json
[
  {
    "from": "item:campaign:macher-schule-gudensberg-fruehling-2027",
    "predicate": "usesGamePack",
    "target": "item:game-pack:macher-schule-core"
  },
  {
    "from": "item:campaign:macher-schule-gudensberg-fruehling-2027",
    "predicate": "includesSpace",
    "target": "space:gudensberg-school"
  },
  {
    "from": "item:campaign:macher-schule-gudensberg-fruehling-2027",
    "predicate": "includesAdventure",
    "target": "item:adventure:schoolyard-raised-bed"
  }
]
```

## Adventure

Das Adventure ist die Vorlage für den Erlebnisbogen "Schulhof-Hochbeet bauen". Es verbindet mehrere Quests, ohne sie einzubetten.

```ts
const raisedBedAdventure = {
  id: "schoolyard-raised-bed",
  title: "Schulhof-Hochbeet bauen",
  status: "active",
  gamePackId: "macher-schule-core",
  game: {
    developmentFields: [
      "holzarbeit",
      "garten",
      "teamarbeit"
    ]
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

## Adventure-Quest-Relations

```json
[
  {
    "id": "rel:schoolyard-raised-bed-material-check",
    "from": "item:adventure:schoolyard-raised-bed",
    "predicate": "containsQuest",
    "target": "item:quest:raised-bed-material-check",
    "meta": {
      "required": true,
      "phase": "vorbereitung",
      "order": 1,
      "roleId": "builder",
      "capacity": 1,
      "developmentFields": ["materialplanung", "teamarbeit"]
    }
  },
  {
    "id": "rel:schoolyard-raised-bed-frame-build",
    "from": "item:adventure:schoolyard-raised-bed",
    "predicate": "containsQuest",
    "target": "item:quest:raised-bed-frame-build",
    "meta": {
      "required": true,
      "phase": "bau",
      "order": 2,
      "roleId": "builder",
      "capacity": 1,
      "developmentFields": ["holzarbeit", "werkzeugnutzung", "teamarbeit"]
    }
  },
  {
    "id": "rel:schoolyard-raised-bed-soil-fill",
    "from": "item:adventure:schoolyard-raised-bed",
    "predicate": "containsQuest",
    "target": "item:quest:raised-bed-soil-fill",
    "meta": {
      "required": true,
      "phase": "bau",
      "order": 3,
      "roleId": "gardener",
      "capacity": 1,
      "dependsOn": [
        "rel:schoolyard-raised-bed-frame-build"
      ],
      "developmentFields": ["garten", "teamarbeit"]
    }
  },
  {
    "id": "rel:schoolyard-raised-bed-documentation",
    "from": "item:adventure:schoolyard-raised-bed",
    "predicate": "containsQuest",
    "target": "item:quest:raised-bed-documentation",
    "meta": {
      "required": false,
      "phase": "nachklang",
      "order": 4,
      "roleId": "documenter",
      "capacity": 1,
      "developmentFields": ["dokumentation", "teamarbeit"]
    }
  }
]
```

`required` bedeutet: Diese Quest ist für das Adventure-Ziel erforderlich. Es ist keine Pflicht für eine bestimmte Person. `roleId` beschreibt eine Beitragsspielrolle für Darstellung und Entwicklungskarte, keinen vorab zugewiesenen Actor. `capacity: 1` bedeutet hier: In einem konkreten AdventureRun kann nur ein aktiver QuestRun diesen Step füllen. `developmentFields` beschreibt hier den kuratierten Step im Hochbeet-Adventure; fehlt diese Angabe, gelten die Defaults der Quest. Die Quest selbst bleibt wiederverwendbar.

`dependsOn` beim Erde-Step bedeutet hier eine praktische Reihenfolge: Erde wird erst eingefüllt, wenn der Rahmen-Step lokal abgeschlossen oder bereits bestätigt ist. Es bedeutet nicht, dass Sami auf eine Mentor-Confirmation für den Rahmen warten muss.

## AdventureRun

Der AdventureRun ist die konkrete Durchführung des Adventures durch diese Gruppe.

```ts
const raisedBedAdventureRun = {
  id: "adventure-run:schoolyard-raised-bed-2027-03",
  adventureId: "schoolyard-raised-bed",
  title: "Schulhof-Hochbeet Gruppe A",
  status: "active",
  participantIds: [
    "profile:jonas",
    "profile:mira",
    "profile:sami"
  ],
  campaignId: "macher-schule-gudensberg-fruehling-2027",
  spaceId: "space:gudensberg-school",
  visibility: {
    mode: "space"
  }
}
```

Die Verbindung bleibt relation-basiert:

```json
[
  {
    "from": "item:adventure-run:schoolyard-raised-bed-2027-03",
    "predicate": "instantiatesAdventure",
    "target": "item:adventure:schoolyard-raised-bed"
  },
  {
    "from": "profile:jonas",
    "predicate": "participatesIn",
    "target": "item:adventure-run:schoolyard-raised-bed-2027-03"
  },
  {
    "from": "profile:mira",
    "predicate": "participatesIn",
    "target": "item:adventure-run:schoolyard-raised-bed-2027-03"
  },
  {
    "from": "profile:sami",
    "predicate": "participatesIn",
    "target": "item:adventure-run:schoolyard-raised-bed-2027-03"
  }
]
```

Der AdventureRun belegt nicht selbst die Steps. Die Steps werden durch QuestRuns gefüllt.

## Quests

Die Quests selbst gehören zum Real Life Network Protocol. Das Game ergänzt nur die spielerische Deutung.

```ts
const materialCheckQuest = {
  id: "raised-bed-material-check",
  title: "Material für das Schulhof-Hochbeet prüfen",
  data: {
    evidencePolicy: {
      required: false,
      acceptedTypes: ["text"]
    },
    confirmationPolicy: {
      allowedConfirmers: [
        { role: "host" },
        { role: "mentor" }
      ],
      acceptedTrustLevels: ["server-confirmed", "signed-attested"]
    }
  },
  game: {
    developmentFields: [
      "materialplanung",
      "teamarbeit"
    ]
  }
}

const frameBuildQuest = {
  id: "raised-bed-frame-build",
  title: "Rahmen für das Schulhof-Hochbeet verschrauben",
  data: {
    evidencePolicy: {
      required: false,
      acceptedTypes: ["photo", "video", "text"]
    },
    safetyRequirements: {
      requiresSupervision: true,
      requiredBriefings: ["tool-safety-basic"]
    },
    confirmationPolicy: {
      allowedConfirmers: [
        { role: "host" },
        { role: "mentor" }
      ],
      acceptedTrustLevels: ["server-confirmed", "signed-attested"]
    }
  },
  game: {
    developmentFields: [
      "holzarbeit",
      "werkzeugnutzung",
      "teamarbeit"
    ]
  }
}

const soilFillQuest = {
  id: "raised-bed-soil-fill",
  title: "Hochbeet mit Erde befüllen",
  data: {
    confirmationPolicy: {
      allowedConfirmers: [
        { role: "host" },
        { role: "mentor" }
      ],
      acceptedTrustLevels: ["server-confirmed", "signed-attested"]
    }
  },
  game: {
    developmentFields: [
      "garten",
      "teamarbeit"
    ]
  }
}

const documentationQuest = {
  id: "raised-bed-documentation",
  title: "Baufortschritt sparsam dokumentieren",
  data: {
    evidencePolicy: {
      required: false,
      acceptedTypes: ["photo", "video", "text"]
    },
    confirmationPolicy: {
      allowedConfirmers: [
        { role: "host" },
        { role: "peer", minCount: 1 },
        { role: "mentor" }
      ],
      acceptedTrustLevels: ["server-confirmed", "signed-attested"]
    }
  },
  game: {
    developmentFields: [
      "dokumentation",
      "teamarbeit"
    ]
  }
}
```

`evidencePolicy.required: false` bedeutet: Evidence ist erlaubt, aber keine Voraussetzung. Eine beobachtete Completion kann direkt durch eine passende Confirmation entstehen. Das ist wichtig, damit das Handy nicht zum Mittelpunkt der Real-Life-Erfahrung wird.

Die Safety-Angaben sind hier bewusst klein. Die verbindliche Sicherheitslogik gehört nicht ins Game Pack, sondern in die Quest-/Host-/Space-Regeln des konkreten Kontexts.

## QuestRun

Ein QuestRun ist die konkrete Durchführung einer Quest. In diesem Beispiel ist das Hochbeet das gemeinsame Werk, aber die einzelnen QuestRuns bleiben klein und beitragsbezogen. So bekommt nicht automatisch jede beteiligte Person dieselben Entwicklungsfelder.

Wichtig: Der `actorId` gehört zum QuestRun, nicht zur Quest. Eine Quest im Adventure ist zunächst ein offenes Angebot. Erst wenn Jonas, Mira oder Sami einen Adventure-Step übernimmt, entsteht ein persönlicher QuestRun. Ein QuestRun kann standalone sein; in diesem Beispiel hängt er zusätzlich an einem AdventureRun und an der konkreten `containsQuest`-Relation, die er füllt.

```ts
const jonasFrameBuildRun = {
  id: "quest-run:jonas-raised-bed-frame-build-2027-03-18",
  questId: "raised-bed-frame-build",
  status: "completed",
  actorId: "profile:jonas",
  adventureRunId: "adventure-run:schoolyard-raised-bed-2027-03",
  adventureStepRelationId: "rel:schoolyard-raised-bed-frame-build",
  spaceId: "space:gudensberg-school",
  campaignId: "macher-schule-gudensberg-fruehling-2027",
  startedAt: "2027-03-18T09:00:00+01:00",
  completedAt: "2027-03-18T10:30:00+01:00",
  completion: {
    claimedAt: "2027-03-18T10:31:00+01:00",
    claim: "Ich habe einen Teil des Hochbeet-Rahmens verschraubt.",
    evidenceRefs: [
      "item:evidence:mira-raised-bed-frame-photo"
    ]
  },
  visibility: {
    mode: "private"
  }
}

const miraDocumentationRun = {
  id: "quest-run:mira-raised-bed-documentation-2027-03-18",
  questId: "raised-bed-documentation",
  status: "completed",
  actorId: "profile:mira",
  adventureRunId: "adventure-run:schoolyard-raised-bed-2027-03",
  adventureStepRelationId: "rel:schoolyard-raised-bed-documentation",
  spaceId: "space:gudensberg-school",
  campaignId: "macher-schule-gudensberg-fruehling-2027",
  startedAt: "2027-03-18T10:20:00+01:00",
  completedAt: "2027-03-18T10:40:00+01:00",
  completion: {
    claimedAt: "2027-03-18T10:41:00+01:00",
    claim: "Ich habe den verschraubten Rahmen fotografiert.",
    evidenceRefs: [
      "item:evidence:mira-raised-bed-frame-photo"
    ]
  },
  visibility: {
    mode: "private"
  }
}

const samiSoilFillRun = {
  id: "quest-run:sami-raised-bed-soil-fill-2027-03-18",
  questId: "raised-bed-soil-fill",
  status: "completed",
  actorId: "profile:sami",
  adventureRunId: "adventure-run:schoolyard-raised-bed-2027-03",
  adventureStepRelationId: "rel:schoolyard-raised-bed-soil-fill",
  spaceId: "space:gudensberg-school",
  campaignId: "macher-schule-gudensberg-fruehling-2027",
  startedAt: "2027-03-18T10:40:00+01:00",
  completedAt: "2027-03-18T12:20:00+01:00",
  completion: {
    claimedAt: "2027-03-18T12:21:00+01:00",
    claim: "Ich habe Erde ins Hochbeet gefüllt.",
    evidenceRefs: []
  },
  visibility: {
    mode: "private"
  }
}
```

In einer RLS-Implementierung können `adventureRunId` und `adventureStepRelationId` als View-Felder erscheinen. Semantisch entsprechen sie diesen Relations:

```json
[
  {
    "from": "item:quest-run:jonas-raised-bed-frame-build-2027-03-18",
    "predicate": "partOfAdventureRun",
    "target": "item:adventure-run:schoolyard-raised-bed-2027-03"
  },
  {
    "from": "item:quest-run:jonas-raised-bed-frame-build-2027-03-18",
    "predicate": "fillsAdventureStep",
    "target": "rel:schoolyard-raised-bed-frame-build"
  }
]
```

`status: "completed"` ist hier Jonas', Miras oder Samis eigene Markierung: "Mein QuestRun ist abgeschlossen." Das ist keine Confirmation und keine Attestation. Wenn später eine gültige Confirmation existiert, kann dieselbe UI den Run als `confirmed` darstellen.

`visibility.mode: "private"` ist hier Absicht. Gerade bei Minderjährigen wird nicht automatisch sichtbar, was erledigt wurde. Eine spätere Darstellung in Space, Campaign oder öffentlicher Zusammenfassung braucht Zustimmung und passende Aggregation.

## Evidence

Evidence ist noch kein portabler Beleg. Es kann eine Confirmation vorbereiten, ist in diesem Beispiel aber bewusst optional. Wenn der Mentor den Beitrag selbst gesehen hat, darf die Confirmation ohne Foto und ohne Mentorennotiz entstehen.

Eine Spur muss nicht von derselben Person kommen, die den QuestRun abgeschlossen hat. Mira kann den verschraubten Rahmen fotografieren, auch wenn Jonas nicht auf dem Foto zu sehen ist. Das Foto zeigt dann zuerst das Ergebnis. Jonas' lokale Completion sagt, welchen eigenen Beitrag er dazu claimt.

```ts
const miraFramePhotoEvidence = {
  id: "item:evidence:mira-raised-bed-frame-photo",
  type: "evidence",
  createdAt: "2027-03-18T10:30:00+01:00",
  createdBy: "profile:mira",
  data: {
    evidenceType: "photo",
    subjectId: "item:adventure-run:schoolyard-raised-bed-2027-03",
    caption: "Der verschraubte Hochbeet-Rahmen",
    mediaRef: "media:private:mira-raised-bed-frame",
    supports: [
      {
        target: "quest-run:jonas-raised-bed-frame-build-2027-03-18",
        scope: "result-context"
      }
    ]
  },
  visibility: {
    mode: "private"
  }
}
```

## ConfirmationView

Im Real Life Stack erscheint eine bestätigte Aussage als `ConfirmationView`. Wenn ein Mentor, Host oder Peer einen QuestRun bestätigt, ist genau das fachlich die Erstellung einer Completion-Confirmation. Eine zusätzliche Mentorennotiz ist dafür nicht nötig.

Wenn der Mentor nicht persönlich anwesend war, darf die Confirmation nicht so tun, als sei das Foto allein der Beweis für Jonas' Beitrag. Die Grundlage ist dann Jonas' lokale Completion plus eine Spur im Werk-Kontext und die Entscheidung des Confirmers, dass diese Grundlage im Schulkontext reicht.

```ts
const frameBuildConfirmation = {
  id: "confirmation:jonas-raised-bed-frame-build",
  subjectId: "quest-run:jonas-raised-bed-frame-build-2027-03-18",
  issuerId: "profile:herr-lehmann",
  claim: "Jonas hat einen Teil des Hochbeet-Rahmens mitverschraubt.",
  schema: "rlnp:quest-completion",
  tags: [
    "quest-completion",
    "macher-schule",
    "holzarbeit",
    "werkzeugnutzung"
  ],
  relations: [
    {
      "predicate": "confirmsQuestRun",
      "target": "quest-run:jonas-raised-bed-frame-build-2027-03-18"
    },
    {
      "predicate": "considersEvidence",
      "target": "item:evidence:mira-raised-bed-frame-photo"
    },
    {
      "predicate": "withinCampaign",
      "target": "item:campaign:macher-schule-gudensberg-fruehling-2027"
    }
  ],
  createdAt: "2027-03-18T13:00:00+01:00",
  trustLevel: "server-confirmed",
  source: "school-space",
  isAccepted: true
}

const documentationConfirmation = {
  id: "confirmation:mira-raised-bed-documentation",
  subjectId: "quest-run:mira-raised-bed-documentation-2027-03-18",
  issuerId: "profile:adventure-host-katrin",
  claim: "Mira hat den Bau des Hochbeets für die Werk-Karte dokumentiert.",
  schema: "rlnp:quest-completion",
  tags: [
    "quest-completion",
    "macher-schule",
    "dokumentation"
  ],
  relations: [
    {
      "predicate": "confirmsQuestRun",
      "target": "quest-run:mira-raised-bed-documentation-2027-03-18"
    },
    {
      "predicate": "withinCampaign",
      "target": "item:campaign:macher-schule-gudensberg-fruehling-2027"
    }
  ],
  createdAt: "2027-03-18T13:02:00+01:00",
  trustLevel: "server-confirmed",
  source: "school-space",
  isAccepted: true
}

const soilFillConfirmation = {
  id: "confirmation:sami-raised-bed-soil-fill",
  subjectId: "quest-run:sami-raised-bed-soil-fill-2027-03-18",
  issuerId: "profile:herr-lehmann",
  claim: "Sami hat das Hochbeet mit Erde befüllt.",
  schema: "rlnp:quest-completion",
  tags: [
    "quest-completion",
    "macher-schule",
    "garten"
  ],
  relations: [
    {
      "predicate": "confirmsQuestRun",
      "target": "quest-run:sami-raised-bed-soil-fill-2027-03-18"
    },
    {
      "predicate": "withinCampaign",
      "target": "item:campaign:macher-schule-gudensberg-fruehling-2027"
    }
  ],
  createdAt: "2027-03-18T13:05:00+01:00",
  trustLevel: "server-confirmed",
  source: "school-space",
  isAccepted: true
}
```

Wenn dieselbe Aussage als signierte WoT-Attestation ausgestellt und verifizierbar ist, kann sie als stärkere Confirmation projiziert werden:

```ts
const signedFrameBuildConfirmation = {
  ...frameBuildConfirmation,
  id: "confirmation:signed-jonas-raised-bed-frame-build",
  trustLevel: "signed-attested",
  source: "wot-attestation"
}
```

Die UI darf diese beiden Stufen nicht gleich darstellen:

```text
server-confirmed != signed-attested
```

## Entwicklungskarte

Die Entwicklungskarte liest sichtbare oder freigegebene Confirmations und deutet deren `developmentFields`.

Aus Jonas' bestätigtem QuestRun können auf seiner privaten Entwicklungskarte sichtbar werden:

```ts
const developmentMapTouch = {
  subjectId: "profile:jonas",
  sourceConfirmationId: "confirmation:jonas-raised-bed-frame-build",
  trustLevel: "server-confirmed",
  developmentFields: [
    "holzarbeit",
    "werkzeugnutzung",
    "teamarbeit"
  ],
  visibility: {
    mode: "private"
  }
}
```

Das bedeutet nicht:

```text
Jonas ist gut in Holzarbeit.
```

Es bedeutet:

```text
Es gibt eine sichtbare oder freigegebene Confirmation, dass Jonas eine Handlung ausgeführt hat, die Holzarbeit, Werkzeugnutzung und Teamarbeit berührt.
```

Mira und Sami bekommen eigene Berührungen aus ihren eigenen Confirmations. Die gemeinsame Werk-Karte darf nicht automatisch alle Entwicklungsfelder auf alle Beteiligten verteilen.

## Werk-Karte

Eine Werk-Karte ist kein Core-Game-Objekt. Sie ist eine mögliche RLS-Item-Projektion für dokumentierte Werke.

```ts
const workCard = {
  id: "work-card:schoolyard-raised-bed-2027-03",
  type: "work-card",
  createdAt: "2027-03-20T10:00:00+01:00",
  createdBy: "profile:adventure-host-katrin",
  data: {
    title: "Schulhof-Hochbeet",
    summary: "Die Klasse hat ein Hochbeet für den Schulhof gebaut.",
    campaignId: "macher-schule-gudensberg-fruehling-2027",
    adventureId: "schoolyard-raised-bed",
    optionalMediaRef: "media:space:schoolyard-raised-bed",
    developmentFields: [
      "holzarbeit",
      "garten",
      "teamarbeit"
    ]
  },
  visibility: {
    mode: "space"
  },
  relations: [
    {
      "predicate": "documentsAdventureRun",
      "target": "item:adventure-run:schoolyard-raised-bed-2027-03"
    }
  ]
}
```

Eine Werk-Karte kann das gemeinsame Ergebnis zeigen, ohne alle individuellen QuestRuns öffentlich auszurollen. Sie kann mit Foto erscheinen, muss es aber nicht.

## Adventure-Abschluss

Wenn alle required Adventure-Steps im AdventureRun durch sichtbare oder freigegebene Confirmations erfüllt sind, kann ein Host eine Abschluss-Confirmation ausstellen. Dafür braucht es keine Fotosammlung und keine Mentorennotizen pro Arbeitsschritt.

```ts
const raisedBedCompleted = {
  id: "confirmation:schoolyard-raised-bed-completed",
  subjectId: "item:adventure-run:schoolyard-raised-bed-2027-03",
  issuerId: "profile:adventure-host-katrin",
  claim: "Die Klasse hat ein Schulhof-Hochbeet gebaut.",
  schema: "rlg:adventure-completed",
  tags: [
    "adventure-completed",
    "schoolyard-raised-bed"
  ],
  relations: [
    {
      "predicate": "confirmsAdventureRun",
      "target": "item:adventure-run:schoolyard-raised-bed-2027-03"
    },
    {
      "predicate": "withinCampaign",
      "target": "item:campaign:macher-schule-gudensberg-fruehling-2027"
    }
  ],
  createdAt: "2027-03-20T12:00:00+01:00",
  trustLevel: "server-confirmed",
  source: "school-space",
  isAccepted: true
}
```

Diese Confirmation kann den World State erhöhen:

```text
Schulhof-Hochbeete gebaut: 1
```

Sie muss nicht offenlegen, welche Minderjährigen welche Einzelschritte getan haben.

## Beitragsspielrollen

Die Beitragsspielrollen können aus Relations oder Confirmations sichtbar werden.

```json
[
  {
    "from": "profile:jonas",
    "predicate": "contributedAs",
    "target": "item:adventure-run:schoolyard-raised-bed-2027-03",
    "meta": {
      "roleId": "builder",
      "sourceConfirmationId": "confirmation:jonas-raised-bed-frame-build",
      "visibility": "private"
    }
  },
  {
    "from": "profile:mira",
    "predicate": "contributedAs",
    "target": "item:adventure-run:schoolyard-raised-bed-2027-03",
    "meta": {
      "roleId": "documenter",
      "sourceConfirmationId": "confirmation:mira-raised-bed-documentation",
      "visibility": "private"
    }
  },
  {
    "from": "profile:sami",
    "predicate": "contributedAs",
    "target": "item:adventure-run:schoolyard-raised-bed-2027-03",
    "meta": {
      "roleId": "gardener",
      "sourceConfirmationId": "confirmation:sami-raised-bed-soil-fill",
      "visibility": "private"
    }
  },
  {
    "from": "profile:herr-lehmann",
    "predicate": "contributedAs",
    "target": "item:adventure-run:schoolyard-raised-bed-2027-03",
    "meta": {
      "roleId": "mentor",
      "sourceConfirmationId": "confirmation:jonas-raised-bed-frame-build",
      "visibility": "space"
    }
  }
]
```

Rollen bleiben Darstellung. Sie ersetzen keine Confirmation Policy, keine Space-Rollen und keine Mentor-Zulassung.

## Schutzregeln im Beispiel

- QuestRuns von Minderjährigen sind standardmäßig privat.
- Eine lokale Completion ist ein Self-Claim des QuestRun-Akteurs, keine Confirmation und keine Attestation.
- Evidence ist optional, minimal und nicht automatisch öffentlich.
- Eine Confirmation kann ohne Foto und ohne Mentorennotiz als Completion zählen, wenn sie zur Confirmation Policy passt.
- Dokumentation ist ein eigener Beitrag, keine Pflicht bei jedem Arbeitsschritt.
- Handynutzung soll die reale Arbeit nicht unterbrechen.
- Eine Entwicklungskarte zeigt Berührungen, keine Bewertung.
- World State zählt gemeinsame Ergebnisse, nicht einzelne Personen.
- Public Summaries brauchen Aggregation und Mindestgrößen.
- Keine Rankings, keine Leaderboards, keine "beste Macher"-Logik.
- Sponsor- oder Markenlogik darf nicht in Profil, Entwicklungskarte oder private Evidence wandern.

## Was dieses Beispiel nicht festlegt

Dieses Dokument ist bewusst kein Schema-Standard.

Es legt nicht fest:

- das endgültige Quest-Schema des Real Life Network Protocol,
- das endgültige RLS-Item-Schema,
- die endgültigen Relation-Prädikate,
- die endgültige Safety-Policy für Schulen,
- die konkrete Macher-Schule-Produktlogik.

Es zeigt nur, wie die bestehenden Begriffe zusammenspielen können, wenn ein realer Macher-Schule-inspirierter Pfad nach der Logik des Real Life Game modelliert wird.
