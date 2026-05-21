const SIMULATION_BUNDLE_STORAGE_KEY = "rlg-macher-schule-hochbeet-bundle-v1"

const DEFAULT_SIMULATION_BUNDLE = {
  schemaVersion: "rlg-simulation-bundle@0.1",
  id: "simulation:macher-schule-hochbeet",
  title: "Macher Schule",
  activeCampaignId: "campaign:macher-schule-hochbeet",
  gamePacks: {
    "game-pack:macher-schule": {
      id: "game-pack:macher-schule",
      title: "Macher Schule",
      language: {
        developmentMap: "Entwicklungskarte",
        developmentField: "Feld",
        quest: "Aufgabe",
        questRun: "Aufgabe",
        adventure: "Adventure",
        adventureRun: "Adventure",
        campaign: "Kampagne",
        statusLabels: {
          default: {
            open: "offen",
            active: "aktiv",
            completed: "fertig",
            confirmed: "bestätigt",
            blocked: "blockiert"
          },
          adventureRun: {
            completed: "abgeschlossen",
            confirmed: "abgeschlossen"
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
        completedColor: "#3867a8",
        historyBackground: "#f7f3eb",
        statusVisuals: {
          open: { icon: "circle", color: "#9f9788", backgroundColor: "#eee8dd" },
          active: { icon: "play", color: "#b16222", backgroundColor: "#f4eadc" },
          completed: { icon: "check", color: "#3867a8", backgroundColor: "#e3ebf7" },
          confirmed: { icon: "check", color: "#2f7d5b", backgroundColor: "#e3efe8" }
        }
      },
      developmentFields: [
        "Holzarbeit",
        "Werkzeugnutzung",
        "Teamarbeit",
        "Dokumentation",
        "Garten",
        "Sorgfalt",
        "Verantwortung"
      ],
      contributionRoles: {
        builder: { label: "Bauen" },
        documenter: { label: "Dokumentieren" },
        gardener: { label: "Garten" }
      }
    }
  },
  campaignRoles: {
    student: {
      label: "Schüler",
      capabilities: ["questRun.accept", "questRun.complete", "evidence.create"]
    },
    mentor: {
      label: "Mentor",
      capabilities: ["quest.create", "quest.offer", "confirmation.create"]
    },
    visitor: {
      label: "öffentliche Sicht",
      capabilities: ["campaign.viewPublicSummary"]
    }
  },
  profiles: {
    jonas: {
      name: "Jonas",
      perspective: "Schüler",
      roleId: "student",
      avatar: "img/avatar-boy-kid-svgrepo-com.svg",
      summary: "Jonas wählt selbst aus den offenen Aufgaben des gemeinsamen Hochbeet-Adventures."
    },
    mira: {
      name: "Mira",
      perspective: "Schülerin",
      roleId: "student",
      avatar: "img/boy-indian-kid-svgrepo-com.svg",
      summary: "Mira sieht dieselben offenen Aufgaben wie Jonas und Sami. Sie kann dokumentieren, aber auch den Rahmen übernehmen."
    },
    sami: {
      name: "Sami",
      perspective: "Schüler",
      roleId: "student",
      avatar: "img/avatar-female-portrait-2-svgrepo-com.svg",
      summary: "Sami sieht dieselben offenen Aufgaben. Erde einfüllen kann er erst fertig melden, wenn die Rahmen-Aufgabe fertig ist."
    },
    mentor: {
      name: "Herr Lehmann",
      perspective: "Mentor",
      roleId: "mentor",
      avatar: "img/builder-helmet-worker-svgrepo-com.svg",
      summary: "Der Mentor sieht fertige, aber noch unbestätigte Beiträge und kann konkrete Aufgaben bestätigen."
    },
    visitor: {
      name: "Unbeteiligte Person",
      perspective: "öffentliche Sicht",
      roleId: "visitor",
      summary: "Eine unbeteiligte Person sieht nur freigegebene Ergebnisse und keine privaten Beiträge von Minderjährigen."
    }
  },
  campaigns: {
    "campaign:macher-schule-hochbeet": {
      id: "campaign:macher-schule-hochbeet",
      title: "Macher Schule",
      gamePackId: "game-pack:macher-schule",
      profileIds: ["jonas", "mira", "sami", "mentor", "visitor"],
      playerRoleIds: ["student"],
      confirmerRoleIds: ["mentor"],
      primaryAdventureId: "adventure:schoolyard-raised-bed",
      standaloneQuestOfferKeys: ["carrots", "watering"],
      locationId: "location:schoolyard-garden",
      worldState: {
        primaryMetricKey: "raisedBedsBuilt",
        metrics: {
          raisedBedsBuilt: {
            label: "Schulhof-Hochbeete gebaut",
            target: 5,
            value: 0
          }
        }
      }
    }
  },
  locations: {
    "location:schoolyard-garden": {
      id: "location:schoolyard-garden",
      label: "Schulgarten",
      address: "Macher-Schule, Schulhof",
      lat: 52.51808,
      lng: 13.37613,
      map: { x: 42, y: 54 }
    },
    "location:tool-shed": {
      id: "location:tool-shed",
      label: "Werkzeugschuppen",
      address: "Macher-Schule, Werkbereich",
      lat: 52.51822,
      lng: 13.37575,
      map: { x: 25, y: 39 }
    },
    "location:classroom-window": {
      id: "location:classroom-window",
      label: "Klassenraumfenster",
      address: "Macher-Schule, Raum 1",
      lat: 52.51791,
      lng: 13.37655,
      map: { x: 66, y: 31 }
    }
  },
  adventures: {
    "adventure:schoolyard-raised-bed": {
      id: "adventure:schoolyard-raised-bed",
      title: "Schulhof-Hochbeet bauen",
      runTitlePrefix: "Hochbeet-Gruppe",
      resultBadgeTitle: "Schulhof-Hochbeet gebaut",
      image: "img/gardener-work-svgrepo-com.svg",
      locationId: "location:schoolyard-garden"
    }
  },
  quests: {
    frame: {
      id: "quest:raised-bed-frame-build",
      title: "Rahmen verschrauben",
      image: "img/driller-drill-svgrepo-com.svg",
      developmentFields: ["Holzarbeit", "Werkzeugnutzung", "Teamarbeit"],
      completionClaim: "Ich habe einen Teil des Hochbeet-Rahmens verschraubt.",
      confirmationClaim: "{actor} hat einen Teil des Hochbeet-Rahmens verschraubt.",
      evidencePolicy: {
        required: false,
        acceptedTypes: ["photo", "video", "text"]
      },
      confirmationPolicy: {
        required: true
      }
    },
    documentation: {
      id: "quest:raised-bed-documentation",
      title: "Baufortschritt dokumentieren",
      image: "img/photo-camera-svgrepo-com.svg",
      developmentFields: ["Dokumentation", "Teamarbeit"],
      completionClaim: "Ich habe den Baufortschritt dokumentiert.",
      confirmationClaim: "{actor} hat den Bau des Hochbeets dokumentiert.",
      evidencePolicy: {
        required: false,
        acceptedTypes: ["photo", "video", "text"]
      },
      confirmationPolicy: {
        required: true
      }
    },
    soil: {
      id: "quest:raised-bed-soil-fill",
      title: "Erde einfüllen",
      image: "img/shovel-svgrepo-com.svg",
      developmentFields: ["Garten", "Teamarbeit"],
      completionClaim: "Ich habe Erde ins Hochbeet gefüllt.",
      confirmationClaim: "{actor} hat Erde ins Hochbeet gefüllt.",
      evidencePolicy: {
        required: false,
        acceptedTypes: ["photo", "video", "text"]
      },
      confirmationPolicy: {
        required: true
      }
    },
    carrots: {
      id: "quest:plant-carrots",
      title: "Karotten pflanzen",
      image: "img/carrot-salad-vegetables-svgrepo-com.svg",
      developmentFields: ["Garten", "Sorgfalt"],
      completionClaim: "Ich habe Karotten gepflanzt.",
      confirmationClaim: "{actor} hat Karotten gepflanzt.",
      evidencePolicy: {
        required: false,
        acceptedTypes: ["photo", "video", "text"]
      },
      confirmationPolicy: {
        required: true
      }
    },
    watering: {
      id: "quest:water-plants",
      title: "Gießen",
      image: "img/watering-can-svgrepo-com.svg",
      developmentFields: ["Garten", "Verantwortung"],
      runPolicy: {
        type: "scheduled",
        cadence: "school-daily"
      },
      completionClaim: "Ich habe gegossen.",
      confirmationClaim: "{actor} hat gegossen.",
      evidencePolicy: {
        required: false,
        acceptedTypes: ["photo", "video", "text"]
      },
      confirmationPolicy: {
        required: true
      }
    }
  },
  standaloneQuestOffers: {
    carrots: {
      questKey: "carrots",
      order: 1,
      repeatable: false,
      capacity: 1,
      runPolicy: {
        type: "single"
      },
      locationId: "location:schoolyard-garden",
      schedule: {
        startsAt: "2026-05-20T14:00:00+02:00",
        endsAt: "2026-05-20T15:00:00+02:00"
      }
    },
    watering: {
      questKey: "watering",
      order: 2,
      repeatable: true,
      cadence: "daily",
      capacity: 1,
      runPolicy: {
        type: "scheduled",
        cadence: "school-daily"
      },
      recurrenceRule: {
        frequency: "weekly",
        weekdays: [1, 2, 3, 4, 5],
        until: "2026-10-31",
        previewLimit: 10
      },
      locationId: "location:schoolyard-garden",
      schedule: {
        startsAt: "2026-05-20T08:30:00+02:00",
        endsAt: "2026-05-20T08:50:00+02:00"
      }
    }
  },
  adventureQuestRelations: {
    frame: {
      id: "rel:schoolyard-raised-bed-frame-build",
      from: "adventure:schoolyard-raised-bed",
      predicate: "containsQuest",
      target: "quest:raised-bed-frame-build",
      questKey: "frame",
      meta: {
        required: true,
        phase: "bau",
        order: 1,
        roleId: "builder",
        capacity: 1,
        developmentFields: ["Holzarbeit", "Werkzeugnutzung", "Teamarbeit"],
        locationId: "location:tool-shed",
        schedule: {
          startsAt: "2026-05-20T10:00:00+02:00",
          endsAt: "2026-05-20T10:45:00+02:00"
        }
      }
    },
    documentation: {
      id: "rel:schoolyard-raised-bed-documentation",
      from: "adventure:schoolyard-raised-bed",
      predicate: "containsQuest",
      target: "quest:raised-bed-documentation",
      questKey: "documentation",
      meta: {
        required: false,
        phase: "nachklang",
        order: 2,
        roleId: "documenter",
        capacity: 1,
        developmentFields: ["Dokumentation", "Teamarbeit"],
        locationId: "location:classroom-window",
        schedule: {
          startsAt: "2026-05-20T10:15:00+02:00",
          endsAt: "2026-05-20T11:30:00+02:00"
        }
      }
    },
    soil: {
      id: "rel:schoolyard-raised-bed-soil-fill",
      from: "adventure:schoolyard-raised-bed",
      predicate: "containsQuest",
      target: "quest:raised-bed-soil-fill",
      questKey: "soil",
      meta: {
        required: true,
        phase: "bau",
        order: 3,
        roleId: "gardener",
        capacity: 1,
        participationPolicy: {
          minParticipants: 2,
          maxParticipants: 4
        },
        dependsOn: ["rel:schoolyard-raised-bed-frame-build"],
        developmentFields: ["Garten", "Teamarbeit"],
        locationId: "location:schoolyard-garden",
        schedule: {
          startsAt: "2026-05-20T11:00:00+02:00",
          endsAt: "2026-05-20T11:45:00+02:00"
        }
      }
    }
  },
  initialState: {
    selectedRole: "jonas",
    selectedTab: "quests",
    selectedView: "overview",
    selectedStepId: null,
    selectedStandaloneQuestKey: null,
    adventureRun: null,
    adventureRuns: [],
    selectedAdventureRunId: null,
    runs: [
      {
        id: "quest-run:carrots-2026-05-20",
        questKey: "carrots",
        questId: "quest:plant-carrots",
        participants: [],
        adventureRunId: null,
        adventureStepRelationId: null,
        periodKey: "2026-05-20",
        status: "open",
        locationId: "location:schoolyard-garden",
        startsAt: "2026-05-20T14:00:00+02:00",
        endsAt: "2026-05-20T15:00:00+02:00",
        createdAt: "2026-05-20T08:00:00+02:00",
        completion: null
      }
    ],
    evidence: [],
    confirmations: [],
    recurrenceRules: {},
    adventureCompleted: false,
    worldState: {
      raisedBedsBuilt: 0
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
}

function storedSimulationBundle() {
  try {
    const stored = window.localStorage.getItem(SIMULATION_BUNDLE_STORAGE_KEY)
    if (!stored) return null

    const bundle = JSON.parse(stored)
    return bundle && typeof bundle === "object" ? bundle : null
  } catch {
    return null
  }
}

function activeCampaign(bundle) {
  return bundle.campaigns?.[bundle.activeCampaignId] || Object.values(bundle.campaigns || {})[0]
}

function activeAdventure(bundle, campaign) {
  return bundle.adventures?.[campaign?.primaryAdventureId] || Object.values(bundle.adventures || {})[0]
}

function activeGamePack(bundle, campaign) {
  return bundle.gamePacks?.[campaign?.gamePackId] || Object.values(bundle.gamePacks || {})[0] || {}
}

function roleCapabilities(bundle, roleId) {
  return bundle.campaignRoles?.[roleId]?.capabilities || []
}

function campaignProfiles(bundle, campaign) {
  const profileIds = campaign?.profileIds || Object.keys(bundle.profiles || {})

  return profileIds
    .map((profileId) => [profileId, bundle.profiles?.[profileId]])
    .filter(([, profile]) => Boolean(profile))
}

function toPrototypeScenario(bundle) {
  const campaign = activeCampaign(bundle)
  const adventure = activeAdventure(bundle, campaign)
  const gamePack = activeGamePack(bundle, campaign)
  if (!campaign || !adventure || !bundle.initialState) {
    throw new Error("SimulationBundle ist unvollständig.")
  }

  const profiles = campaignProfiles(bundle, campaign)
  const playerRoleIds = campaign?.playerRoleIds || ["student"]
  const confirmerRoleIds = campaign?.confirmerRoleIds || ["mentor"]
  const worldStateMetrics = campaign?.worldState?.metrics || {}
  const roles = Object.fromEntries(profiles.map(([profileId, profile]) => {
    const role = bundle.campaignRoles?.[profile.roleId] || {}

    return [profileId, {
      ...profile,
      perspective: profile.perspective || role.label || profile.roleId,
      capabilities: roleCapabilities(bundle, profile.roleId)
    }]
  }))
  const people = Object.fromEntries(profiles.map(([profileId, profile]) => [profileId, profile.name]))
  const students = profiles
    .filter(([, profile]) => playerRoleIds.includes(profile.roleId))
    .map(([profileId]) => profileId)
  const confirmers = profiles
    .filter(([, profile]) => confirmerRoleIds.includes(profile.roleId))
    .map(([profileId]) => profileId)

  return {
    schemaVersion: "rlg-prototype-scenario@0.1",
    bundleId: bundle.id,
    title: bundle.title,
    gamePack,
    campaign,
    campaignRoles: bundle.campaignRoles || {},
    roles,
    students,
    confirmers,
    people,
    adventure,
    quests: bundle.quests || {},
    locations: bundle.locations || {},
    standaloneQuestOffers: bundle.standaloneQuestOffers || {},
    adventureQuestRelations: bundle.adventureQuestRelations || {},
    worldStateMetrics,
    initialState: bundle.initialState
  }
}

function resolvedSimulationBundle() {
  const storedBundle = storedSimulationBundle()
  if (!storedBundle) return DEFAULT_SIMULATION_BUNDLE

  try {
    toPrototypeScenario(storedBundle)
    return storedBundle
  } catch {
    window.localStorage.removeItem(SIMULATION_BUNDLE_STORAGE_KEY)
    return DEFAULT_SIMULATION_BUNDLE
  }
}

window.SIMULATION_BUNDLE_STORAGE_KEY = SIMULATION_BUNDLE_STORAGE_KEY
window.DEFAULT_SIMULATION_BUNDLE = DEFAULT_SIMULATION_BUNDLE
window.SIMULATION_BUNDLE = resolvedSimulationBundle()
window.SCENARIO = toPrototypeScenario(window.SIMULATION_BUNDLE)
