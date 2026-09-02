(() => {
  "use strict";

  const CORE = globalThis.BlackCaseCore;
  if (!CORE) throw new Error("BlackCaseCore doit être chargé avant game.js");

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const dom = {
    gameMain: $("#gameMain"),
    startScreen: $("#startScreen"),
    contractsOverlay: $("#contractsOverlay"),
    helpOverlay: $("#helpOverlay"),
    resultOverlay: $("#resultOverlay"),
    caseBoard: $("#caseBoard"),
    storageBoard: $("#storageBoard"),
    dragGhost: $("#dragGhost"),
    placementPreview: $("#placementPreview"),
    toast: $("#toast"),
    missionTitle: $("#missionTitle"),
    timerValue: $("#timerValue"),
    scoreValue: $("#scoreValue"),
    movesValue: $("#movesValue"),
    objectiveText: $("#objectiveText"),
    objectiveProgress: $("#objectiveProgress"),
    objectiveChecklist: $("#objectiveChecklist"),
    healthValue: $("#healthValue"),
    healthBar: $("#healthBar"),
    caseDimensions: $("#caseDimensions"),
    caseUsage: $("#caseUsage"),
    storageDimensions: $("#storageDimensions"),
    storageCount: $("#storageCount"),
    emptyInspector: $("#emptyInspector"),
    itemInspector: $("#itemInspector"),
    selectionIndex: $("#selectionIndex"),
    inspectorArt: $("#inspectorArt"),
    inspectorCategory: $("#inspectorCategory"),
    inspectorName: $("#inspectorName"),
    inspectorDescription: $("#inspectorDescription"),
    inspectorSize: $("#inspectorSize"),
    inspectorState: $("#inspectorState"),
    inspectorPosition: $("#inspectorPosition"),
    rotateButton: $("#rotateButton"),
    transferButton: $("#transferButton"),
    specialButton: $("#specialButton"),
    contractsGrid: $("#contractsGrid"),
    undoButton: $("#undoButton"),
    autoSortButton: $("#autoSortButton"),
    validateButton: $("#validateButton"),
    soundButton: $("#soundButton"),
    continueButton: $("#continueButton"),
    continueLabel: $("#continueLabel"),
    resultSeal: $("#resultSeal"),
    resultTitle: $("#resultTitle"),
    resultSummary: $("#resultSummary"),
    resultScore: $("#resultScore"),
    resultTime: $("#resultTime"),
    resultMoves: $("#resultMoves"),
    resultFree: $("#resultFree"),
    nextButton: $("#nextButton"),
    connectionStatus: $("#connectionStatus"),
  };

  const CATEGORY_LABELS = {
    weapon: "ARME",
    ammo: "MUNITIONS",
    healing: "SOIN",
    explosive: "TACTIQUE",
    attachment: "ACCESSOIRE",
    equipment: "ÉQUIPEMENT",
    mission: "OBJET DE MISSION",
  };

  const ITEM_DEFS = {
    pistol: {
      name: "Pistolet V9", short: "V9", category: "weapon", color: "#c4b47d", w: 3, h: 2, icon: "pistol",
      description: "Arme de poing compacte. Fiable, légère et facile à loger dans une mallette étroite.",
      weapon: { ammoType: "9mm", capacity: 12, ammoLabel: "9 mm" },
    },
    magnum: {
      name: "Revolver M-66", short: "M-66", category: "weapon", color: "#b9a375", w: 4, h: 2, icon: "magnum",
      description: "Revolver lourd à forte puissance d’arrêt. Son barillet accepte six cartouches.",
      weapon: { ammoType: "magnum", capacity: 6, ammoLabel: ".44" },
    },
    shotgun: {
      name: "Fusil R-12", short: "R-12", category: "weapon", color: "#b79f69", w: 6, h: 2, icon: "shotgun",
      description: "Fusil à pompe de sécurité. Encombrant, mais extrêmement efficace à courte portée.",
      weapon: { ammoType: "shell", capacity: 6, ammoLabel: "Cal. 12" },
    },
    rifle: {
      name: "Carabine L-7", short: "L-7", category: "weapon", color: "#a9946c", w: 7, h: 2, icon: "rifle",
      description: "Carabine longue portée. Peut recevoir la lunette optique OX-2.",
      weapon: { ammoType: "rifle", capacity: 10, ammoLabel: "7,62" },
    },
    smg: {
      name: "PM Kestrel", short: "KESTREL", category: "weapon", color: "#9d9d87", w: 4, h: 2, icon: "smg",
      description: "Pistolet-mitrailleur compact à haute cadence. Consomme rapidement les munitions de 9 mm.",
      weapon: { ammoType: "9mm", capacity: 30, ammoLabel: "9 mm" },
    },
    knife: {
      name: "Couteau terrain", short: "COUTEAU", category: "equipment", color: "#9facad", w: 4, h: 1, icon: "knife",
      description: "Lame polyvalente pour l’exploration et les situations de dernier recours.",
    },
    ammo9: {
      name: "Munitions 9 mm", short: "9 MM", category: "ammo", color: "#d0b94e", w: 2, h: 1, icon: "ammo",
      description: "Boîte de cartouches compatible avec le V9 et le Kestrel.",
      ammo: { ammoType: "9mm", defaultQuantity: 15, label: "9 mm" },
    },
    shells: {
      name: "Cartouches calibre 12", short: "CAL. 12", category: "ammo", color: "#b95d4f", w: 2, h: 1, icon: "shells",
      description: "Cartouches renforcées pour le fusil R-12.",
      ammo: { ammoType: "shell", defaultQuantity: 6, label: "Cal. 12" },
    },
    rifleAmmo: {
      name: "Munitions 7,62", short: "7,62", category: "ammo", color: "#718f5e", w: 2, h: 1, icon: "ammoLong",
      description: "Cartouches haute vélocité pour la carabine L-7.",
      ammo: { ammoType: "rifle", defaultQuantity: 8, label: "7,62" },
    },
    magnumAmmo: {
      name: "Cartouches .44", short: ".44", category: "ammo", color: "#b08d4a", w: 2, h: 1, icon: "magnumAmmo",
      description: "Cartouches lourdes destinées au revolver M-66.",
      ammo: { ammoType: "magnum", defaultQuantity: 6, label: ".44" },
    },
    greenHerb: {
      name: "Herbe médicinale", short: "HERBE V", category: "healing", color: "#65a86c", w: 1, h: 2, icon: "herb",
      description: "Plante médicinale qui restaure une partie de l’état de l’opérateur.",
      healing: { amount: 35 }, combine: { with: "redHerb", result: "mixedHerb" },
    },
    redHerb: {
      name: "Catalyseur rouge", short: "HERBE R", category: "healing", color: "#b95c59", w: 1, h: 2, icon: "herb",
      description: "Catalyseur sans effet seul. Combiné à une herbe médicinale, il produit un soin complet.",
      combine: { with: "greenHerb", result: "mixedHerb" },
    },
    mixedHerb: {
      name: "Mélange régénérant", short: "MÉLANGE", category: "healing", color: "#d5a85f", w: 1, h: 2, icon: "mixedHerb",
      description: "Mélange concentré qui restaure intégralement l’état de l’opérateur.",
      healing: { amount: 100 },
    },
    spray: {
      name: "Spray de secours", short: "SPRAY", category: "healing", color: "#d5d8ce", w: 1, h: 3, icon: "spray",
      description: "Aérosol médical à action immédiate. Restaure entièrement l’état de l’opérateur.",
      healing: { amount: 100 },
    },
    ration: {
      name: "Ration compacte", short: "RATION", category: "healing", color: "#d3c6a2", w: 1, h: 1, icon: "ration",
      description: "Ration d’urgence. Restaure légèrement l’état de l’opérateur.",
      healing: { amount: 18 },
    },
    grenade: {
      name: "Grenade à fragmentation", short: "FRAG", category: "explosive", color: "#7d9b68", w: 2, h: 2, icon: "grenade",
      description: "Charge explosive défensive. Manipuler avec précaution.",
    },
    flash: {
      name: "Grenade aveuglante", short: "FLASH", category: "explosive", color: "#c7c5a7", w: 2, h: 2, icon: "flash",
      description: "Dispositif incapacitateur non létal à forte émission lumineuse.",
    },
    mine: {
      name: "Mine directionnelle", short: "MINE", category: "explosive", color: "#77917a", w: 3, h: 2, icon: "mine",
      description: "Charge directionnelle destinée à verrouiller un passage étroit.",
    },
    scope: {
      name: "Lunette OX-2", short: "OX-2", category: "attachment", color: "#7d9da0", w: 2, h: 1, icon: "scope",
      description: "Optique grossissante compatible avec la carabine L-7. Le montage libère son espace de rangement.",
      attachment: { target: "rifle", slot: "scope" },
    },
    armor: {
      name: "Plaques composites", short: "PLAQUES", category: "equipment", color: "#88919a", w: 3, h: 2, icon: "armor",
      description: "Jeu de plaques balistiques de remplacement pour une mission prolongée.",
    },
    battery: {
      name: "Bloc d’alimentation", short: "BATTERIE", category: "equipment", color: "#7da4a0", w: 2, h: 2, icon: "battery",
      description: "Batterie blindée pour l’équipement de terrain et les systèmes de communication.",
    },
    keycard: {
      name: "Carte d’accès Sigma", short: "SIGMA", category: "mission", color: "#71a5ad", w: 2, h: 1, icon: "keycard",
      description: "Identifiant chiffré nécessaire à l’ouverture du sas d’extraction.",
    },
    relic: {
      name: "Module scellé", short: "MODULE", category: "mission", color: "#b28dca", w: 3, h: 3, icon: "relic",
      description: "Artefact technique inconnu. Le conteneur ne doit subir aucun choc.",
    },
    sample: {
      name: "Échantillon cryogénique", short: "ÉCHANT.", category: "mission", color: "#7ec2b8", w: 2, h: 3, icon: "sample",
      description: "Tube cryogénique contenant un échantillon biologique prioritaire.",
    },
    radio: {
      name: "Radio tactique", short: "RADIO", category: "equipment", color: "#7a9276", w: 2, h: 2, icon: "radio",
      description: "Émetteur sécurisé à portée étendue avec antenne repliable.",
    },
    toolkit: {
      name: "Trousse technique", short: "OUTILS", category: "equipment", color: "#b07b59", w: 3, h: 2, icon: "toolkit",
      description: "Outils compacts pour les réparations et ouvertures d’urgence.",
    },
  };

  const I = (defId, options = {}) => ({ defId, ...options });

  const CAMPAIGN = [
    {
      id: "protocol-01", number: 1, title: "Contrôle", difficulty: "Initiation", case: [8, 5], storage: [10, 6], health: 100, par: 75,
      objective: "Transférez tout le matériel du coffre vers la mallette.",
      items: [I("pistol", { loaded: 6 }), I("knife"), I("ammo9", { quantity: 12 }), I("greenHerb"), I("grenade"), I("shotgun", { loaded: 2 }), I("shells", { quantity: 4 })],
    },
    {
      id: "protocol-02", number: 2, title: "Couloir B", difficulty: "Facile", case: [9, 5], storage: [11, 6], health: 100, par: 105,
      objective: "Organisez une charge mixte sans laisser d’objet dans la réserve.",
      items: [I("shotgun", { loaded: 3 }), I("pistol", { loaded: 8 }), I("knife"), I("ammo9", { quantity: 10 }), I("shells", { quantity: 5 }), I("flash"), I("greenHerb"), I("redHerb"), I("ration"), I("battery")],
    },
    {
      id: "protocol-03", number: 3, title: "Longue vue", difficulty: "Facile", case: [10, 6], storage: [12, 7], health: 100, par: 135,
      objective: "Préparez une configuration longue portée complète et montez l’optique OX-2.",
      conditions: { attachedScope: true },
      items: [I("rifle", { loaded: 4 }), I("scope"), I("pistol", { loaded: 9 }), I("knife"), I("ammo9", { quantity: 8 }), I("ammo9", { quantity: 10 }), I("rifleAmmo", { quantity: 6 }), I("rifleAmmo", { quantity: 7 }), I("grenade"), I("greenHerb"), I("spray"), I("armor")],
    },
    {
      id: "protocol-04", number: 4, title: "Opérateur blessé", difficulty: "Intermédiaire", case: [9, 6], storage: [12, 7], health: 42, par: 150,
      objective: "Restaurez l’état de l’opérateur à 100 %, puis sécurisez le matériel restant.",
      conditions: { minHealth: 100 },
      items: [I("shotgun", { loaded: 1 }), I("pistol", { loaded: 5 }), I("knife"), I("ammo9", { quantity: 11 }), I("shells", { quantity: 6 }), I("greenHerb"), I("redHerb"), I("spray"), I("ration"), I("grenade"), I("flash"), I("armor")],
    },
    {
      id: "protocol-05", number: 5, title: "Réserve saturée", difficulty: "Intermédiaire", case: [9, 6], storage: [13, 7], health: 82, par: 170,
      objective: "Chargez les armes et utilisez intelligemment les consommables pour conserver 4 cases libres.",
      conditions: { minFreeCells: 4 },
      items: [I("smg", { loaded: 4 }), I("pistol", { loaded: 2 }), I("shotgun", { loaded: 0 }), I("knife"), I("ammo9", { quantity: 8 }), I("ammo9", { quantity: 9 }), I("ammo9", { quantity: 10 }), I("ammo9", { quantity: 12 }), I("shells", { quantity: 3 }), I("shells", { quantity: 4 }), I("shells", { quantity: 5 }), I("grenade"), I("greenHerb"), I("battery")],
    },
    {
      id: "protocol-06", number: 6, title: "Module scellé", difficulty: "Intermédiaire", case: [10, 7], storage: [13, 8], health: 100, par: 190,
      objective: "Transportez le module scellé avec l’équipement d’escorte.",
      items: [I("relic"), I("rifle", { loaded: 5 }), I("shotgun", { loaded: 3 }), I("pistol", { loaded: 10 }), I("knife"), I("scope"), I("ammo9", { quantity: 10 }), I("shells", { quantity: 5 }), I("rifleAmmo", { quantity: 6 }), I("grenade"), I("flash"), I("greenHerb"), I("armor")],
    },
    {
      id: "protocol-07", number: 7, title: "Assemblage optique", difficulty: "Avancé", case: [10, 7], storage: [13, 8], health: 100, par: 200,
      objective: "Montez la lunette OX-2 sur la carabine avant de valider le chargement.",
      conditions: { attachedScope: true },
      items: [I("rifle", { loaded: 2 }), I("scope"), I("smg", { loaded: 16 }), I("pistol", { loaded: 7 }), I("knife"), I("ammo9", { quantity: 12 }), I("ammo9", { quantity: 15 }), I("rifleAmmo", { quantity: 8 }), I("grenade"), I("mine"), I("greenHerb"), I("spray"), I("radio"), I("keycard")],
    },
    {
      id: "protocol-08", number: 8, title: "Marge de sécurité", difficulty: "Avancé", case: [10, 8], storage: [14, 8], health: 76, par: 225,
      objective: "Sécurisez la cargaison en conservant au moins 16 cases libres.",
      conditions: { minFreeCells: 16 },
      items: [I("magnum", { loaded: 2 }), I("shotgun", { loaded: 4 }), I("pistol", { loaded: 9 }), I("knife"), I("magnumAmmo", { quantity: 4 }), I("shells", { quantity: 4 }), I("ammo9", { quantity: 9 }), I("greenHerb"), I("redHerb"), I("spray"), I("grenade"), I("flash"), I("armor"), I("battery"), I("toolkit"), I("keycard")],
    },
    {
      id: "protocol-09", number: 9, title: "Double doctrine", difficulty: "Avancé", case: [11, 7], storage: [14, 9], health: 100, par: 250,
      objective: "Rangez deux plateformes lourdes et leurs réserves de munitions.",
      items: [I("magnum", { loaded: 0 }), I("smg", { loaded: 8 }), I("shotgun", { loaded: 2 }), I("rifle", { loaded: 3 }), I("knife"), I("ammo9", { quantity: 18 }), I("ammo9", { quantity: 15 }), I("shells", { quantity: 6 }), I("shells", { quantity: 6 }), I("rifleAmmo", { quantity: 8 }), I("rifleAmmo", { quantity: 8 }), I("magnumAmmo", { quantity: 6 }), I("grenade"), I("greenHerb"), I("redHerb")],
    },
    {
      id: "protocol-10", number: 10, title: "Cryogénie", difficulty: "Expert", case: [11, 8], storage: [14, 9], health: 55, par: 285,
      objective: "Restaurez l’opérateur, montez l’optique et protégez l’échantillon cryogénique.",
      conditions: { minHealth: 100, attachedScope: true },
      items: [I("sample"), I("rifle", { loaded: 0 }), I("scope"), I("shotgun", { loaded: 2 }), I("smg", { loaded: 5 }), I("knife"), I("rifleAmmo", { quantity: 10 }), I("rifleAmmo", { quantity: 8 }), I("ammo9", { quantity: 20 }), I("ammo9", { quantity: 16 }), I("shells", { quantity: 6 }), I("greenHerb"), I("redHerb"), I("spray"), I("grenade"), I("mine"), I("radio"), I("toolkit")],
    },
    {
      id: "protocol-11", number: 11, title: "Zone rouge", difficulty: "Expert", case: [12, 8], storage: [15, 9], health: 68, par: 320,
      objective: "Préparez une extraction longue durée avec au moins 12 cases de réserve.",
      conditions: { minHealth: 100, minFreeCells: 12 },
      items: [I("relic"), I("magnum", { loaded: 1 }), I("smg", { loaded: 10 }), I("shotgun", { loaded: 1 }), I("rifle", { loaded: 1 }), I("pistol", { loaded: 4 }), I("knife"), I("scope"), I("ammo9", { quantity: 20 }), I("ammo9", { quantity: 18 }), I("shells", { quantity: 6 }), I("shells", { quantity: 4 }), I("rifleAmmo", { quantity: 10 }), I("magnumAmmo", { quantity: 5 }), I("greenHerb"), I("redHerb"), I("spray"), I("grenade"), I("flash"), I("battery"), I("keycard")],
    },
    {
      id: "protocol-12", number: 12, title: "Protocole noir", difficulty: "Maître", case: [12, 8], storage: [16, 10], health: 38, par: 390,
      objective: "Dernier contrôle : opérateur rétabli, optique montée, coffre vide et 8 cases libres.",
      conditions: { minHealth: 100, attachedScope: true, minFreeCells: 8 },
      items: [I("relic"), I("sample"), I("magnum", { loaded: 0 }), I("smg", { loaded: 0 }), I("shotgun", { loaded: 0 }), I("rifle", { loaded: 0 }), I("pistol", { loaded: 0 }), I("knife"), I("scope"), I("ammo9", { quantity: 30 }), I("ammo9", { quantity: 24 }), I("ammo9", { quantity: 18 }), I("shells", { quantity: 6 }), I("shells", { quantity: 6 }), I("rifleAmmo", { quantity: 10 }), I("rifleAmmo", { quantity: 10 }), I("magnumAmmo", { quantity: 6 }), I("greenHerb"), I("redHerb"), I("spray"), I("ration"), I("grenade"), I("flash")],
    },
  ];

  const LEGACY_PROGRESS_KEY = "blackCaseProgressV1";
  const PROGRESS_KEY = "blackCaseProgressV2";
  const SESSION_KEY = "blackCaseActiveSessionV2";
  const SAVE_SCHEMA = 2;
  const SCORE_VERSION = 2;
  let uidCounter = 0;
  let state = null;
  let drag = null;
  let dragFrame = 0;
  let toastTimer = 0;
  let audioContext = null;
  let muted = false;
  let resumableSession = null;
  let restoreFocusUid = null;
  let resetConfirmUntil = 0;
  let objectiveSignature = "";
  let autoSorting = false;
  let storageWarningShown = false;
  let lastOverlayTrigger = null;

  const progress = loadProgress();
  muted = progress.sound === false;

  function readStoredJson(key) {
    try {
      const source = localStorage.getItem(key);
      return source ? JSON.parse(source) : null;
    } catch (error) {
      console.warn(`Stockage illisible (${key})`, error);
      try { localStorage.removeItem(key); } catch { /* stockage entièrement indisponible */ }
      return null;
    }
  }

  function warnStorageFailure() {
    if (storageWarningShown) return;
    storageWarningShown = true;
    queueMicrotask(() => toast("Sauvegarde locale indisponible. La partie reste jouable dans cet onglet.", "error"));
  }

  function writeStoredJson(key, value, notify = true) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Échec de sauvegarde (${key})`, error);
      if (notify) warnStorageFailure();
      return false;
    }
  }

  function removeStoredValue(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Échec de suppression (${key})`, error);
      return false;
    }
  }

  function loadProgress() {
    const parsed = readStoredJson(PROGRESS_KEY) || readStoredJson(LEGACY_PROGRESS_KEY);
    const fallback = { schemaVersion: SAVE_SCHEMA, unlocked: 1, current: 0, best: {}, sound: true, campaignComplete: false };
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return fallback;

    const validIds = new Set(CAMPAIGN.map(level => level.id));
    const best = {};
    if (parsed.best && typeof parsed.best === "object" && !Array.isArray(parsed.best)) {
      for (const [levelId, record] of Object.entries(parsed.best)) {
        if (!validIds.has(levelId) || !record || typeof record !== "object") continue;
        const score = Number(record.score);
        const time = Number(record.time);
        const moves = Number(record.moves);
        const rank = ["S", "A", "B", "C"].includes(record.rank) ? record.rank : "C";
        if (!Number.isFinite(score) || score < 0 || !Number.isFinite(time) || time < 0 || !Number.isFinite(moves) || moves < 0) continue;
        best[levelId] = {
          score: Math.round(Math.min(999999, score)),
          rank,
          time: Math.round(Math.min(86400000, time)),
          moves: Math.trunc(Math.min(9999, moves)),
          scoreVersion: Number.isInteger(record.scoreVersion) ? record.scoreVersion : 1,
        };
      }
    }

    const unlocked = Math.max(1, Math.min(CAMPAIGN.length, Math.trunc(Number(parsed.unlocked) || 1)));
    const current = Math.max(0, Math.min(CAMPAIGN.length - 1, Math.trunc(Number(parsed.current) || 0)));
    return {
      schemaVersion: SAVE_SCHEMA,
      unlocked,
      current,
      best,
      sound: parsed.sound !== false,
      campaignComplete: parsed.campaignComplete === true,
    };
  }

  function saveProgress() {
    progress.schemaVersion = SAVE_SCHEMA;
    progress.sound = !muted;
    const saved = writeStoredJson(PROGRESS_KEY, progress);
    updateContinueButton();
    return saved;
  }

  function clone(value) {
    return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  }

  function boundedInteger(value, minimum, maximum, fallback = minimum) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(minimum, Math.min(maximum, Math.trunc(number)));
  }

  function sanitizeSavedItem(source) {
    if (!source || typeof source !== "object" || Array.isArray(source)) return null;
    const def = ITEM_DEFS[source.defId];
    if (!def || typeof source.uid !== "string" || !source.uid || !["case", "storage"].includes(source.container)) return null;
    const item = {
      uid: source.uid.slice(0, 96),
      defId: source.defId,
      container: source.container,
      x: Number(source.x),
      y: Number(source.y),
      rot: source.rot === 1 ? 1 : 0,
      quantity: def.ammo ? boundedInteger(source.quantity, 0, 9999, def.ammo.defaultQuantity) : null,
      loaded: def.weapon ? boundedInteger(source.loaded, 0, def.weapon.capacity, 0) : null,
      attachments: {},
    };
    if (!Number.isInteger(item.x) || !Number.isInteger(item.y)) return null;
    if (def.weapon && source.attachments?.scope === true && source.defId === "rifle") item.attachments.scope = true;
    return item;
  }

  function canonicalLevelItems(level) {
    return level.items.map((spec, index) => {
      const def = ITEM_DEFS[spec.defId];
      return {
        uid: `canonical-${index}`,
        defId: spec.defId,
        loaded: def.weapon ? boundedInteger(spec.loaded, 0, def.weapon.capacity, Math.min(3, def.weapon.capacity)) : null,
        quantity: def.ammo ? boundedInteger(spec.quantity, 0, 9999, def.ammo.defaultQuantity) : null,
        attachments: def.weapon && spec.attachments?.scope === true && spec.defId === "rifle" ? { scope: true } : {},
      };
    });
  }

  function countDefinitions(items) {
    const counts = new Map();
    for (const item of items) counts.set(item.defId, (counts.get(item.defId) || 0) + 1);
    return counts;
  }

  function ammoStateIsReachable(initialItems, items, ammoType) {
    const initialWeapons = initialItems.filter(item => ITEM_DEFS[item.defId].weapon?.ammoType === ammoType);
    const currentWeapons = items.filter(item => ITEM_DEFS[item.defId].weapon?.ammoType === ammoType);
    if (initialWeapons.length !== currentWeapons.length) return false;
    if (initialWeapons.some((weapon, index) => weapon.defId !== currentWeapons[index].defId)) return false;

    const targetLoads = currentWeapons.map(weapon => weapon.loaded);
    const targetBoxes = items
      .filter(item => ITEM_DEFS[item.defId].ammo?.ammoType === ammoType)
      .map(item => item.quantity)
      .sort((a, b) => a - b);
    const start = {
      loads: initialWeapons.map(weapon => weapon.loaded),
      boxes: initialItems
        .filter(item => ITEM_DEFS[item.defId].ammo?.ammoType === ammoType)
        .map(item => item.quantity)
        .sort((a, b) => a - b),
    };
    const keyOf = state => `${state.loads.join(",")}|${state.boxes.join(",")}`;
    const targetKey = `${targetLoads.join(",")}|${targetBoxes.join(",")}`;
    const queue = [start];
    const seen = new Set([keyOf(start)]);

    while (queue.length) {
      const current = queue.shift();
      if (keyOf(current) === targetKey) return true;
      let weaponIndex = -1;
      let largestGap = 0;
      for (let index = 0; index < initialWeapons.length; index++) {
        const gap = ITEM_DEFS[initialWeapons[index].defId].weapon.capacity - current.loads[index];
        if (gap > largestGap) {
          largestGap = gap;
          weaponIndex = index;
        }
      }
      if (weaponIndex < 0) continue;

      for (let boxIndex = 0; boxIndex < current.boxes.length; boxIndex++) {
        if (boxIndex > 0 && current.boxes[boxIndex] === current.boxes[boxIndex - 1]) continue;
        const loaded = Math.min(largestGap, current.boxes[boxIndex]);
        const nextLoads = current.loads.slice();
        const nextBoxes = current.boxes.slice();
        nextLoads[weaponIndex] += loaded;
        nextBoxes[boxIndex] -= loaded;
        if (nextBoxes[boxIndex] === 0) nextBoxes.splice(boxIndex, 1);
        nextBoxes.sort((a, b) => a - b);
        const next = { loads: nextLoads, boxes: nextBoxes };
        const key = keyOf(next);
        if (!seen.has(key)) {
          seen.add(key);
          queue.push(next);
        }
      }
    }
    return false;
  }

  function healingTuple(items, health) {
    const counts = countDefinitions(items);
    return {
      health,
      green: counts.get("greenHerb") || 0,
      red: counts.get("redHerb") || 0,
      mixed: counts.get("mixedHerb") || 0,
      spray: counts.get("spray") || 0,
      ration: counts.get("ration") || 0,
    };
  }

  function healingTupleKey(tuple) {
    return [tuple.health, tuple.green, tuple.red, tuple.mixed, tuple.spray, tuple.ration].join(":");
  }

  function healingStateIsReachable(initialItems, initialHealth, items, health) {
    const targetKey = healingTupleKey(healingTuple(items, health));
    const start = healingTuple(initialItems, initialHealth);
    const queue = [start];
    const seen = new Set([healingTupleKey(start)]);

    while (queue.length) {
      const current = queue.shift();
      if (healingTupleKey(current) === targetKey) return true;
      const nextStates = [];
      if (current.green > 0 && current.red > 0) {
        nextStates.push({ ...current, green: current.green - 1, red: current.red - 1, mixed: current.mixed + 1 });
      }
      if (current.health < 100) {
        for (const [kind, amount] of [["green", 35], ["mixed", 100], ["spray", 100], ["ration", 18]]) {
          if (current[kind] > 0) nextStates.push({ ...current, [kind]: current[kind] - 1, health: Math.min(100, current.health + amount) });
        }
      }
      for (const next of nextStates) {
        const key = healingTupleKey(next);
        if (!seen.has(key)) {
          seen.add(key);
          queue.push(next);
        }
      }
    }
    return false;
  }

  function snapshotInventoryIsReachable(items, level, health) {
    if (!items.length) return false;
    const initial = canonicalLevelItems(level);
    const initialCounts = countDefinitions(initial);
    const currentCounts = countDefinitions(items);
    const allowed = new Set(initial.map(item => item.defId));
    if ((initialCounts.get("greenHerb") || 0) > 0 && (initialCounts.get("redHerb") || 0) > 0) allowed.add("mixedHerb");
    if (items.some(item => !allowed.has(item.defId))) return false;

    for (const [defId, count] of initialCounts) {
      const def = ITEM_DEFS[defId];
      if (["weapon", "equipment", "explosive", "mission"].includes(def.category) && currentCounts.get(defId) !== count) return false;
      if (def.ammo && (currentCounts.get(defId) || 0) > count) return false;
    }
    if (items.some(item => ITEM_DEFS[item.defId].ammo && item.quantity <= 0)) return false;

    const ammoTypes = new Set(initial.flatMap(item => {
      const def = ITEM_DEFS[item.defId];
      return [def.weapon?.ammoType || def.ammo?.ammoType].filter(Boolean);
    }));
    if ([...ammoTypes].some(type => !ammoStateIsReachable(initial, items, type))) return false;

    const initialAttached = initial.filter(item => item.defId === "rifle" && item.attachments?.scope).length;
    const currentAttached = items.filter(item => item.defId === "rifle" && item.attachments?.scope).length;
    const initialScopes = (initialCounts.get("scope") || 0) + initialAttached;
    const currentScopes = (currentCounts.get("scope") || 0) + currentAttached;
    if (currentScopes !== initialScopes || currentAttached < initialAttached) return false;

    return healingStateIsReachable(initial, level.health ?? 100, items, health);
  }

  function resolveSavedLevel(snapshot) {
    if (snapshot.mode === "campaign") {
      const index = CAMPAIGN.findIndex(level => level.id === snapshot.levelId);
      return index >= 0 ? { level: CAMPAIGN[index], index } : null;
    }
    if (snapshot.mode === "sandbox") return { level: createSandboxLevel(), index: -1 };
    if (snapshot.mode === "random" && Number.isFinite(Number(snapshot.seed))) {
      return { level: createRandomLevel(CORE.toUint32(snapshot.seed)), index: -1 };
    }
    return null;
  }

  function normalizeHistoryEntry(source, level) {
    if (!source || typeof source !== "object" || !Array.isArray(source.items)) return null;
    const items = source.items.map(sanitizeSavedItem);
    if (items.some(item => !item)) return null;
    const health = boundedInteger(source.health, 0, 100, level.health ?? 100);
    if (!CORE.validateLayout(items, level, ITEM_DEFS).valid || !snapshotInventoryIsReachable(items, level, health)) return null;
    const selectedUid = items.some(item => item.uid === source.selectedUid) ? source.selectedUid : null;
    return {
      items,
      health,
      moves: boundedInteger(source.moves, 0, 99999, 0),
      rotations: boundedInteger(source.rotations, 0, 99999, 0),
      actions: boundedInteger(source.actions, 0, 99999, 0),
      autoSortUsed: boundedInteger(source.autoSortUsed, 0, 999, 0),
      selectedUid,
    };
  }

  function normalizeActiveSession(snapshot) {
    if (!snapshot || typeof snapshot !== "object" || snapshot.schemaVersion !== SAVE_SCHEMA) return null;
    if (!["campaign", "random", "sandbox"].includes(snapshot.mode)) return null;
    const resolved = resolveSavedLevel(snapshot);
    if (!resolved || !Array.isArray(snapshot.items)) return null;
    const items = snapshot.items.map(sanitizeSavedItem);
    if (items.some(item => !item)) return null;
    const health = boundedInteger(snapshot.health, 0, 100, resolved.level.health ?? 100);
    const layout = CORE.validateLayout(items, resolved.level, ITEM_DEFS);
    if (!layout.valid || !snapshotInventoryIsReachable(items, resolved.level, health)) {
      console.warn("Sauvegarde de partie rejetée", layout.errors);
      return null;
    }
    const history = Array.isArray(snapshot.history)
      ? snapshot.history.slice(-45).map(entry => normalizeHistoryEntry(entry, resolved.level)).filter(Boolean)
      : [];
    const selectedUid = items.some(item => item.uid === snapshot.selectedUid) ? snapshot.selectedUid : null;
    return {
      level: clone(resolved.level),
      mode: snapshot.mode,
      levelIndex: resolved.index,
      items,
      selectedUid,
      health,
      moves: boundedInteger(snapshot.moves, 0, 99999, 0),
      rotations: boundedInteger(snapshot.rotations, 0, 99999, 0),
      actions: boundedInteger(snapshot.actions, 0, 99999, 0),
      autoSortUsed: boundedInteger(snapshot.autoSortUsed, 0, 999, 0),
      elapsed: Math.max(0, Math.min(86400000, Number(snapshot.elapsed) || 0)),
      history,
      completed: false,
      playing: true,
      initialStorageCount: resolved.level.items.filter(spec => (spec.container || "storage") === "storage").length,
      initialResourceValue: calculateResourceValue(canonicalLevelItems(resolved.level), resolved.level.health ?? 100),
    };
  }

  function loadActiveSession() {
    const raw = readStoredJson(SESSION_KEY);
    if (!raw) return null;
    const normalized = normalizeActiveSession(raw);
    if (!normalized) removeStoredValue(SESSION_KEY);
    return normalized ? raw : null;
  }

  function activeSessionSnapshot() {
    if (!state || state.completed || !state.playing) return null;
    return {
      schemaVersion: SAVE_SCHEMA,
      savedAt: Date.now(),
      mode: state.mode,
      levelId: state.level.id,
      seed: state.level.seed ?? null,
      items: clone(state.items),
      selectedUid: state.selectedUid,
      health: state.health,
      moves: state.moves,
      rotations: state.rotations,
      actions: state.actions,
      autoSortUsed: state.autoSortUsed,
      elapsed: Math.round(state.elapsed),
      initialStorageCount: state.initialStorageCount,
      initialResourceValue: state.initialResourceValue,
      history: clone(state.history.slice(-45)),
    };
  }

  function saveActiveSession() {
    const snapshot = activeSessionSnapshot();
    if (!snapshot) return false;
    resumableSession = snapshot;
    const saved = writeStoredJson(SESSION_KEY, snapshot);
    updateContinueButton();
    return saved;
  }

  function clearActiveSession() {
    resumableSession = null;
    removeStoredValue(SESSION_KEY);
    updateContinueButton();
  }

  function focusGameplay() {
    requestAnimationFrame(() => {
      const selected = state?.selectedUid
        ? document.querySelector(`.item[data-uid="${CSS.escape(state.selectedUid)}"]`)
        : null;
      (selected || dom.gameMain).focus({ preventScroll: true });
    });
  }

  function resumeActiveSession() {
    if (state && !state.completed && resumableSession) {
      hideAllOverlays();
      render(true);
      focusGameplay();
      toast("Partie en cours reprise.", "success");
      return true;
    }
    const restored = normalizeActiveSession(resumableSession);
    if (!restored) {
      clearActiveSession();
      return false;
    }
    state = restored;
    hideAllOverlays();
    restoreFocusUid = state.selectedUid;
    render(true);
    focusGameplay();
    sound("start");
    toast("Sauvegarde reprise exactement.", "success");
    return true;
  }

  function createItem(spec, container = "storage") {
    const def = ITEM_DEFS[spec.defId];
    if (!def) throw new Error(`Objet inconnu : ${spec.defId}`);
    return {
      uid: `item-${Date.now().toString(36)}-${uidCounter++}`,
      defId: spec.defId,
      container: spec.container || container,
      x: Number.isFinite(spec.x) ? spec.x : -1,
      y: Number.isFinite(spec.y) ? spec.y : -1,
      rot: spec.rot ? 1 : 0,
      quantity: Number.isFinite(spec.quantity) ? spec.quantity : (def.ammo ? def.ammo.defaultQuantity : null),
      loaded: Number.isFinite(spec.loaded) ? spec.loaded : (def.weapon ? Math.min(3, def.weapon.capacity) : null),
      attachments: spec.attachments ? clone(spec.attachments) : {},
    };
  }

  function getDef(item) {
    return ITEM_DEFS[item.defId];
  }

  function getDims(item, rotation = item.rot) {
    const def = getDef(item);
    return rotation % 2 ? [def.h, def.w] : [def.w, def.h];
  }

  function getArea(item) {
    const def = getDef(item);
    return def.w * def.h;
  }

  function boardDims(container) {
    return container === "case" ? state.level.case : state.level.storage;
  }

  function boardElement(container) {
    return container === "case" ? dom.caseBoard : dom.storageBoard;
  }

  function containerLabel(container) {
    return container === "case" ? "Mallette" : "Coffre";
  }

  function startLevel(level, mode = "campaign", index = 0) {
    const items = level.items.map(spec => createItem(spec, "storage"));
    const nextState = {
      level: clone(level),
      mode,
      levelIndex: index,
      items,
      selectedUid: null,
      health: level.health ?? 100,
      moves: 0,
      rotations: 0,
      actions: 0,
      autoSortUsed: 0,
      elapsed: 0,
      history: [],
      completed: false,
      playing: true,
      initialStorageCount: items.filter(item => item.container === "storage").length,
      initialResourceValue: calculateResourceValue(items, level.health ?? 100),
    };

    state = nextState;
    const seed = CORE.toUint32(level.seed ?? (index * 997 + 17));
    const placed = placeInitialItems("case", seed) && placeInitialItems("storage", seed + 24);
    const layout = placed ? CORE.validateLayout(state.items, state.level, ITEM_DEFS) : { valid: false, errors: ["placement initial impossible"] };
    if (!layout.valid) {
      console.error("Contrat invalide", level.id, layout.errors);
      state = null;
      showStartScreen();
      toast("Ce contrat ne peut pas être généré sans collision. Une nouvelle cargaison est requise.", "error");
      return false;
    }
    hideAllOverlays();
    render(true);
    focusGameplay();
    sound("start");
    return true;
  }

  function placeInitialItems(container, seed) {
    const items = state.items.filter(item => item.container === container);
    if (!items.length) return true;
    const [cols, rows] = boardDims(container);
    const occupied = Array.from({ length: rows }, () => Array(cols).fill(false));

    for (const item of items) {
      if (Number.isFinite(item.x) && Number.isFinite(item.y) && item.x >= 0 && item.y >= 0) {
        const [w, h] = getDims(item);
        if (canOccupyArray(occupied, item.x, item.y, w, h)) {
          markArray(occupied, item.x, item.y, w, h, true);
          continue;
        }
      }
      item.x = -1;
      item.y = -1;
    }

    let pending = items.filter(item => item.x < 0 || item.y < 0);
    const rng = mulberry32(seed + pending.length * 31);
    pending = CORE.shuffleDeterministic(pending, rng);

    for (const item of pending) {
      const rotations = getDef(item).w === getDef(item).h ? [item.rot] : (rng() > .5 ? [1, 0] : [0, 1]);
      const candidates = [];
      for (const rot of rotations) {
        const [w, h] = getDims(item, rot);
        for (let y = 0; y <= rows - h; y++) {
          for (let x = 0; x <= cols - w; x++) {
            if (canOccupyArray(occupied, x, y, w, h)) candidates.push({ x, y, rot, score: rng() + y * .08 + x * .02 });
          }
        }
      }
      candidates.sort((a, b) => a.score - b.score);
      const spot = candidates[0];
      if (!spot) {
        const exact = CORE.solvePacking(items, cols, rows, ITEM_DEFS, { timeLimitMs: Infinity, maxNodes: 450000 });
        if (!exact) {
          console.warn(`Impossible de placer ${item.defId} dans ${container}`);
          return false;
        }
        for (const placement of exact) {
          const placedItem = items.find(entry => entry.uid === placement.uid);
          placedItem.x = placement.x;
          placedItem.y = placement.y;
          placedItem.rot = placement.rot;
        }
        return true;
      }
      item.x = spot.x;
      item.y = spot.y;
      item.rot = spot.rot;
      const [w, h] = getDims(item);
      markArray(occupied, item.x, item.y, w, h, true);
    }
    return true;
  }

  function canOccupyArray(grid, x, y, w, h) {
    if (x < 0 || y < 0 || y + h > grid.length || x + w > grid[0].length) return false;
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) if (grid[yy][xx]) return false;
    }
    return true;
  }

  function markArray(grid, x, y, w, h, value) {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) grid[yy][xx] = value;
    }
  }

  function canPlace(uid, container, x, y, rotation) {
    const item = state.items.find(entry => entry.uid === uid);
    if (!item) return false;
    const [cols, rows] = boardDims(container);
    const [w, h] = getDims(item, rotation);
    if (x < 0 || y < 0 || x + w > cols || y + h > rows) return false;

    return !state.items.some(other => {
      if (other.uid === uid || other.container !== container) return false;
      const [ow, oh] = getDims(other);
      return x < other.x + ow && x + w > other.x && y < other.y + oh && y + h > other.y;
    });
  }

  function findFirstFit(item, container, preferredRot = item.rot) {
    const [cols, rows] = boardDims(container);
    const rotations = getDef(item).w === getDef(item).h ? [preferredRot] : [preferredRot, preferredRot ? 0 : 1];
    for (const rot of rotations) {
      const [w, h] = getDims(item, rot);
      for (let y = 0; y <= rows - h; y++) {
        for (let x = 0; x <= cols - w; x++) {
          if (canPlace(item.uid, container, x, y, rot)) return { x, y, rot };
        }
      }
    }
    return null;
  }

  function pushHistory() {
    if (!state || state.completed) return;
    state.history.push({
      items: clone(state.items),
      health: state.health,
      moves: state.moves,
      rotations: state.rotations,
      actions: state.actions,
      autoSortUsed: state.autoSortUsed,
      selectedUid: state.selectedUid,
    });
    if (state.history.length > 45) state.history.shift();
  }

  function undo() {
    if (!state?.history.length || state.completed) {
      sound("error");
      toast("Aucune action à annuler.", "error");
      return;
    }
    const snapshot = state.history.pop();
    state.items = snapshot.items;
    state.health = snapshot.health;
    state.moves = snapshot.moves;
    state.rotations = snapshot.rotations;
    state.actions = snapshot.actions;
    state.autoSortUsed = snapshot.autoSortUsed;
    state.selectedUid = state.items.some(item => item.uid === snapshot.selectedUid) ? snapshot.selectedUid : null;
    sound("undo");
    render();
  }

  function rotateSelected() {
    if (!state || state.completed) return;
    const item = selectedItem();
    if (!item) {
      toast("Sélectionnez d’abord un objet.", "error");
      sound("error");
      return;
    }
    const nextRot = item.rot ? 0 : 1;
    if (!canPlace(item.uid, item.container, item.x, item.y, nextRot)) {
      toast("Rotation impossible ici : libérez les cases voisines.", "error");
      sound("error");
      pulseItem(item.uid);
      return;
    }
    pushHistory();
    item.rot = nextRot;
    state.rotations++;
    restoreFocusUid = item.uid;
    sound("rotate");
    render();
  }

  function transferSelected() {
    if (!state || state.completed) return;
    const item = selectedItem();
    if (!item) {
      toast("Sélectionnez d’abord un objet.", "error");
      sound("error");
      return;
    }
    const target = item.container === "case" ? "storage" : "case";
    const spot = findFirstFit(item, target);
    if (!spot) {
      toast(`Aucune place disponible dans ${target === "case" ? "la mallette" : "le coffre"}.`, "error");
      sound("error");
      pulseItem(item.uid);
      return;
    }
    pushHistory();
    item.container = target;
    item.x = spot.x;
    item.y = spot.y;
    item.rot = spot.rot;
    state.moves++;
    restoreFocusUid = item.uid;
    sound("move");
    render();
  }

  function moveSelected(dx, dy) {
    const item = selectedItem();
    if (!item || state.completed) return;
    const nx = item.x + dx;
    const ny = item.y + dy;
    if (!canPlace(item.uid, item.container, nx, ny, item.rot)) {
      sound("error");
      return;
    }
    pushHistory();
    item.x = nx;
    item.y = ny;
    state.moves++;
    restoreFocusUid = item.uid;
    sound("moveSoft");
    render();
  }

  function getSpecialAction(item) {
    if (!item) return null;
    const def = getDef(item);

    if (def.ammo) {
      const weapon = findCompatibleWeapon(item);
      return weapon ? { type: "load", label: `Charger ${getDef(weapon).short}`, icon: "＋" } : null;
    }

    if (def.combine) {
      const partner = state.items.find(other => other.uid !== item.uid && other.defId === def.combine.with);
      if (partner) return { type: "combine", label: "Combiner les plantes", icon: "✚", partnerUid: partner.uid };
    }

    if (def.healing && state.health < 100) {
      return { type: "heal", label: `Utiliser (+${Math.min(def.healing.amount, 100 - state.health)} %)`, icon: "✚" };
    }

    if (def.attachment) {
      const target = state.items.find(other => other.defId === def.attachment.target && !other.attachments?.[def.attachment.slot]);
      if (target) return { type: "attach", label: `Monter sur ${getDef(target).short}`, icon: "⌁", targetUid: target.uid };
    }

    return null;
  }

  function findCompatibleWeapon(ammoItem) {
    const ammoDef = getDef(ammoItem);
    const candidates = state.items.filter(item => {
      const def = getDef(item);
      return def.weapon && def.weapon.ammoType === ammoDef.ammo.ammoType && item.loaded < def.weapon.capacity;
    });
    candidates.sort((a, b) => {
      const da = getDef(a).weapon.capacity - a.loaded;
      const db = getDef(b).weapon.capacity - b.loaded;
      return db - da;
    });
    return candidates[0] || null;
  }

  function performSpecial() {
    const item = selectedItem();
    const action = getSpecialAction(item);
    if (!item || !action || state.completed) {
      toast("Aucune action contextuelle disponible.", "error");
      sound("error");
      return;
    }

    pushHistory();
    const def = getDef(item);

    if (action.type === "load") {
      const weapon = findCompatibleWeapon(item);
      if (!weapon) return;
      const weaponDef = getDef(weapon);
      const missing = weaponDef.weapon.capacity - weapon.loaded;
      const loaded = Math.min(missing, item.quantity);
      weapon.loaded += loaded;
      item.quantity -= loaded;
      state.actions++;
      if (item.quantity <= 0) removeItem(item.uid, weapon.uid);
      restoreFocusUid = state.selectedUid;
      toast(`${loaded} cartouche${loaded > 1 ? "s" : ""} chargée${loaded > 1 ? "s" : ""} dans ${weaponDef.name}.`, "success");
      sound("load");
    }

    if (action.type === "combine") {
      const partner = state.items.find(entry => entry.uid === action.partnerUid);
      if (!partner) return;
      const resultDefId = def.combine.result;
      const result = createItem({ defId: resultDefId, rot: item.rot }, item.container);
      result.x = item.x;
      result.y = item.y;
      result.container = item.container;
      const fallbackContainer = partner.container;
      state.items = state.items.filter(entry => entry.uid !== item.uid && entry.uid !== partner.uid);
      state.items.push(result);
      if (!isPlacementValidWithoutSelf(result)) {
        const spot = findFirstFit(result, fallbackContainer) || findFirstFit(result, result.container);
        if (spot) {
          result.container = fallbackContainer;
          result.x = spot.x;
          result.y = spot.y;
          result.rot = spot.rot;
        }
      }
      state.selectedUid = result.uid;
      restoreFocusUid = result.uid;
      state.actions++;
      toast("Mélange régénérant préparé.", "success");
      sound("combine");
    }

    if (action.type === "heal") {
      const gain = Math.min(def.healing.amount, 100 - state.health);
      state.health = Math.min(100, state.health + def.healing.amount);
      state.actions++;
      removeItem(item.uid);
      restoreFocusUid = null;
      toast(`État restauré de ${gain} %.`, "success");
      sound("heal");
    }

    if (action.type === "attach") {
      const target = state.items.find(entry => entry.uid === action.targetUid);
      if (!target) return;
      target.attachments ||= {};
      target.attachments[def.attachment.slot] = true;
      state.actions++;
      removeItem(item.uid, target.uid);
      restoreFocusUid = target.uid;
      toast(`${def.name} montée sur ${getDef(target).name}.`, "success");
      sound("combine");
    }

    render();
  }

  function isPlacementValidWithoutSelf(item) {
    return canPlace(item.uid, item.container, item.x, item.y, item.rot);
  }

  function removeItem(uid, newSelection = null) {
    state.items = state.items.filter(item => item.uid !== uid);
    state.selectedUid = newSelection && state.items.some(item => item.uid === newSelection) ? newSelection : null;
  }

  function autoSortCase() {
    if (!state || state.completed || autoSorting) return;
    const items = state.items.filter(item => item.container === "case");
    if (!items.length) {
      toast("La mallette est vide.", "error");
      sound("error");
      return;
    }

    const expectedState = state;
    autoSorting = true;
    dom.autoSortButton.setAttribute("aria-busy", "true");
    updateControls();
    toast("Analyse du rangement en cours…");

    setTimeout(() => {
      if (state !== expectedState) {
        autoSorting = false;
        dom.autoSortButton.removeAttribute("aria-busy");
        updateControls();
        return;
      }
      const solution = solvePacking(items, state.level.case[0], state.level.case[1], 180);
      autoSorting = false;
      dom.autoSortButton.removeAttribute("aria-busy");
      if (!solution) {
        toast("Aucun rangement automatique trouvé dans le budget mobile.", "error");
        sound("error");
        updateControls();
        return;
      }

      pushHistory();
      for (const placement of solution) {
        const item = state.items.find(entry => entry.uid === placement.uid);
        item.x = placement.x;
        item.y = placement.y;
        item.rot = placement.rot;
      }
      state.autoSortUsed++;
      state.moves++;
      toast("Mallette réorganisée. Pénalité de score appliquée.", "success");
      sound("sort");
      render();
    }, 32);
  }

  function solvePacking(sourceItems, cols, rows, timeLimitMs = 500) {
    return CORE.solvePacking(sourceItems, cols, rows, ITEM_DEFS, {
      timeLimitMs,
      maxNodes: 220000,
    });
  }

  function resetLevel() {
    if (!state) return;
    const hasChanges = state.moves + state.rotations + state.actions + state.autoSortUsed > 0;
    if (hasChanges && Date.now() > resetConfirmUntil) {
      resetConfirmUntil = Date.now() + 3500;
      toast("Appuyez de nouveau sur Réinitialiser pour confirmer.", "error");
      return;
    }
    resetConfirmUntil = 0;
    const level = state.level;
    const mode = state.mode;
    const index = state.levelIndex;
    startLevel(level, mode, index);
    toast("Contrat réinitialisé.");
  }

  function validateLevel() {
    if (!state || state.completed) return;
    const layout = CORE.validateLayout(state.items, state.level, ITEM_DEFS);
    if (!layout.valid) {
      console.error("État de grille invalide", layout.errors);
      toast("Validation impossible : collision ou objet hors grille détecté.", "error");
      sound("error");
      return;
    }
    if (state.mode === "sandbox") {
      toast("Bac à sable : aucun contrôle de mission.", "success");
      sound("success");
      return;
    }

    const storageItems = state.items.filter(item => item.container === "storage");
    if (storageItems.length) {
      toast(`${storageItems.length} objet${storageItems.length > 1 ? "s restent" : " reste"} dans le coffre.`, "error");
      sound("error");
      highlightBoard("storage");
      return;
    }

    const conditions = state.level.conditions || {};
    if (conditions.minHealth && state.health < conditions.minHealth) {
      toast(`État opérateur insuffisant : ${state.health} / ${conditions.minHealth} %.`, "error");
      sound("error");
      return;
    }
    if (conditions.attachedScope) {
      const scopedRifle = state.items.some(item => item.defId === "rifle" && item.attachments?.scope);
      if (!scopedRifle) {
        toast("La lunette OX-2 doit être montée sur la carabine.", "error");
        sound("error");
        return;
      }
    }
    if (conditions.minFreeCells) {
      const free = getFreeCells();
      if (free < conditions.minFreeCells) {
        toast(`Il faut ${conditions.minFreeCells} cases libres ; il n’en reste que ${free}.`, "error");
        sound("error");
        return;
      }
    }

    completeLevel();
  }

  function completeLevel() {
    state.completed = true;
    const score = calculateScore();
    const rank = rankForScore(score);
    const free = getFreeCells();
    const levelId = state.level.id;

    let progressionSaved = true;
    if (state.mode === "campaign") {
      const previous = progress.best[levelId];
      if (!previous || previous.scoreVersion !== SCORE_VERSION || score > previous.score) {
        progress.best[levelId] = { score, rank, time: Math.round(state.elapsed), moves: state.moves, scoreVersion: SCORE_VERSION };
      }
      progress.unlocked = Math.max(progress.unlocked, Math.min(CAMPAIGN.length, state.levelIndex + 2));
      progress.current = Math.max(progress.current, Math.min(CAMPAIGN.length - 1, state.levelIndex + 1));
      progress.campaignComplete ||= state.levelIndex >= CAMPAIGN.length - 1;
      progressionSaved = saveProgress();
    }
    if (state.mode !== "campaign" || progressionSaved) clearActiveSession();

    dom.resultSeal.textContent = rank;
    dom.resultTitle.textContent = rank === "S" ? "Chargement exemplaire" : rank === "A" ? "Chargement approuvé" : rank === "B" ? "Mission accomplie" : "Chargement acceptable";
    dom.resultSummary.textContent = progress.campaignComplete && state.levelIndex >= CAMPAIGN.length - 1
      ? "Campagne terminée. Le Protocole noir est maîtrisé."
      : state.autoSortUsed ? "Contrat validé avec assistance de rangement." : "Tout le matériel a été sécurisé selon le protocole.";
    if (!progressionSaved) dom.resultSummary.textContent += " Progression non enregistrée sur cet appareil.";
    dom.resultScore.textContent = String(score).padStart(6, "0");
    dom.resultTime.textContent = formatTime(state.elapsed);
    dom.resultMoves.textContent = String(state.moves).padStart(2, "0");
    dom.resultFree.textContent = String(free).padStart(2, "0");
    dom.nextButton.hidden = state.mode !== "campaign" || state.levelIndex >= CAMPAIGN.length - 1;
    openOverlay(dom.resultOverlay, dom.validateButton);
    sound("complete");
  }

  function calculateResourceValue(items = state?.items || [], health = state?.health || 0) {
    let green = 0;
    let red = 0;
    const base = items.reduce((total, item) => {
      const def = getDef(item);
      if (def.weapon) return total + (item.loaded || 0);
      if (def.ammo) return total + (item.quantity || 0);
      if (item.defId === "greenHerb") { green++; return total; }
      if (item.defId === "redHerb") { red++; return total; }
      if (def.healing) return total + def.healing.amount;
      return total;
    }, Math.max(0, Number(health) || 0));
    const pairs = Math.min(green, red);
    return base + pairs * 100 + (green - pairs) * ITEM_DEFS.greenHerb.healing.amount;
  }

  function calculateScore() {
    if (!state) return 0;
    const seconds = state.elapsed / 1000;
    const par = Math.max(30, Number(state.level.par) || 180);
    const timePenalty = Math.min(4500, Math.round((seconds / par) * 2500));
    const movePenalty = state.moves * 8;
    const rotationPenalty = state.rotations * 3;
    const assistPenalty = state.autoSortUsed * 900;
    const resources = calculateResourceValue();
    const wastePenalty = Math.max(0, Math.round((state.initialResourceValue - resources) * 4));
    return Math.max(0, Math.round(10000 - timePenalty - movePenalty - rotationPenalty - assistPenalty - wastePenalty));
  }

  function rankForScore(score) {
    if (score >= 8500) return "S";
    if (score >= 7000) return "A";
    if (score >= 5400) return "B";
    return "C";
  }

  function getFreeCells() {
    if (!state) return 0;
    const total = state.level.case[0] * state.level.case[1];
    const used = state.items.filter(item => item.container === "case").reduce((sum, item) => sum + getArea(item), 0);
    return total - used;
  }

  function selectedItem() {
    return state?.items.find(item => item.uid === state.selectedUid) || null;
  }

  function selectItem(uid) {
    if (!state) return;
    state.selectedUid = uid;
    sound("select");
    render();
  }

  function cycleSelection(direction = 1) {
    if (!state?.items.length) return;
    const index = state.items.findIndex(item => item.uid === state.selectedUid);
    const next = index < 0 ? 0 : (index + direction + state.items.length) % state.items.length;
    state.selectedUid = state.items[next].uid;
    sound("select");
    render();
  }

  function render(full = false) {
    if (!state) return;
    const activeUid = document.activeElement?.dataset?.uid || null;
    configureBoard(dom.caseBoard, state.level.case);
    configureBoard(dom.storageBoard, state.level.storage);

    renderBoard("case");
    renderBoard("storage");
    updateHUD();
    updateInspector();
    updateControls();
    if (full) renderContracts();
    const focusUid = restoreFocusUid || activeUid;
    restoreFocusUid = null;
    if (focusUid) {
      const target = document.querySelector(`.item[data-uid="${CSS.escape(focusUid)}"]`);
      target?.focus({ preventScroll: true });
    }
    saveActiveSession();
  }

  function configureBoard(element, dims) {
    element.style.setProperty("--cols", dims[0]);
    element.style.setProperty("--rows", dims[1]);
    element.dataset.cols = dims[0];
    element.dataset.rows = dims[1];
    element.setAttribute("aria-description", `${dims[0]} colonnes par ${dims[1]} lignes`);
  }

  function renderBoard(container) {
    const board = boardElement(container);
    board.replaceChildren();
    const fragment = document.createDocumentFragment();
    const items = state.items.filter(item => item.container === container);
    items.forEach((item, index) => {
      const def = getDef(item);
      const [w, h] = getDims(item);
      const element = document.createElement("button");
      element.type = "button";
      element.className = `item${item.uid === state.selectedUid ? " is-selected" : ""}`;
      element.dataset.uid = item.uid;
      const itemState = def.weapon ? `, ${item.loaded} sur ${def.weapon.capacity} chargées`
        : def.ammo ? `, ${item.quantity} cartouches` : "";
      element.setAttribute("aria-label", `${def.name}, ${containerLabel(container)}, colonne ${item.x + 1}, ligne ${item.y + 1}, ${w} par ${h} cases${itemState}`);
      element.setAttribute("aria-pressed", item.uid === state.selectedUid ? "true" : "false");
      element.setAttribute("aria-keyshortcuts", "R Space ArrowLeft ArrowRight ArrowUp ArrowDown Enter");
      element.style.setProperty("--x", item.x);
      element.style.setProperty("--y", item.y);
      element.style.setProperty("--w", w);
      element.style.setProperty("--h", h);
      element.style.setProperty("--item-accent", def.color);
      element.innerHTML = itemVisualHtml(item);
      element.dataset.index = String(index + 1);
      fragment.appendChild(element);
    });
    board.appendChild(fragment);
  }

  function itemVisualHtml(item) {
    const def = getDef(item);
    const rotation = item.rot ? 90 : 0;
    const quantity = def.ammo ? `<span class="item-quantity">${item.quantity}</span>` : "";
    const ammo = def.weapon ? `<span class="item-ammo">${item.loaded}/${def.weapon.capacity}${item.attachments?.scope ? " · OX" : ""}</span>` : "";
    return `<div class="item-shell">
      <div class="item-art" style="transform:rotate(${rotation}deg)">${iconSvg(def.icon)}</div>
      <span class="item-label">${def.short}</span>${quantity}${ammo}
    </div>`;
  }

  function iconSvg(type) {
    const common = `viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"`;
    const stroke = `fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"`;
    switch (type) {
      case "pistol": return `<svg ${common}><g ${stroke}><path d="M18 24h62l13 9-22 7H49l-7 22H27l4-24H18z"/><path d="M77 25v9M34 38h18"/></g></svg>`;
      case "magnum": return `<svg ${common}><g ${stroke}><path d="M13 26h70l20 9-29 6H48L39 62H23l7-23H13z"/><circle cx="58" cy="36" r="8"/><path d="M83 28v10"/></g></svg>`;
      case "shotgun": return `<svg ${common}><g ${stroke}><path d="M8 31h74l27 7-27 7H8l9-7z"/><path d="M34 45l-8 14H14l5-16M73 30l10-13h16l-7 16"/></g></svg>`;
      case "rifle": return `<svg ${common}><g ${stroke}><path d="M5 31h82l27 7-27 7H5l11-7z"/><path d="M44 45l-8 15H22l7-15M78 31l8-13h17l-6 15"/><rect x="55" y="21" width="27" height="8" rx="3"/></g></svg>`;
      case "smg": return `<svg ${common}><g ${stroke}><path d="M16 24h70l18 12-25 8H44L31 61H18l8-21H16z"/><path d="M51 44v17h14l-3-17M75 24v-9h15v10"/></g></svg>`;
      case "knife": return `<svg ${common}><g ${stroke}><path d="M8 38l76-15 24 10-26 12z"/><path d="M12 38l-2 12h28l8-10"/></g></svg>`;
      case "ammo": return `<svg ${common}><g ${stroke}><rect x="16" y="17" width="88" height="40" rx="3"/><path d="M30 45V29m15 16V25m15 20V29m15 16V25m15 20V29"/></g></svg>`;
      case "ammoLong": return `<svg ${common}><g ${stroke}><rect x="12" y="18" width="96" height="39" rx="3"/><path d="M27 48l4-22h7l4 22m13 0l4-22h7l4 22m13 0l4-22h7l4 22"/></g></svg>`;
      case "shells": return `<svg ${common}><g ${stroke}><rect x="15" y="18" width="90" height="38" rx="3"/><path d="M30 46V26h11v20zm24 0V26h11v20zm24 0V26h11v20"/></g></svg>`;
      case "magnumAmmo": return `<svg ${common}><g ${stroke}><rect x="15" y="19" width="90" height="37" rx="3"/><circle cx="35" cy="37" r="9"/><circle cx="60" cy="37" r="9"/><circle cx="85" cy="37" r="9"/></g></svg>`;
      case "herb": return `<svg ${common}><g ${stroke}><path d="M60 62V30M58 41C39 39 31 28 28 13c18 1 29 10 30 28zm4 2c18-2 28-12 30-28-17 1-28 11-30 28zM58 53C44 52 37 44 35 33c13 1 21 7 23 20z"/></g></svg>`;
      case "mixedHerb": return `<svg ${common}><g ${stroke}><path d="M60 62V30M58 41C39 39 31 28 28 13c18 1 29 10 30 28zm4 2c18-2 28-12 30-28-17 1-28 11-30 28z"/><circle cx="60" cy="38" r="25" stroke-dasharray="7 7"/></g></svg>`;
      case "spray": return `<svg ${common}><g ${stroke}><path d="M43 16h34v45H43zM49 9h22v7H49zM77 24h13"/><path d="M55 34h10m-5-5v10"/></g></svg>`;
      case "ration": return `<svg ${common}><g ${stroke}><path d="M24 21h72l8 15-8 16H24L16 36z"/><path d="M41 28h38M41 36h31M41 44h25"/></g></svg>`;
      case "grenade": return `<svg ${common}><g ${stroke}><path d="M43 25h34l8 12-5 24H40l-5-24z"/><path d="M50 25v-9h22v9M72 17l12-7 8 8-12 7"/><path d="M46 38h28M45 49h30"/></g></svg>`;
      case "flash": return `<svg ${common}><g ${stroke}><rect x="37" y="17" width="46" height="45" rx="5"/><path d="M48 17V9h24v8M46 30h28M46 41h28M46 52h28"/></g></svg>`;
      case "mine": return `<svg ${common}><g ${stroke}><path d="M14 47l12-27h68l12 27z"/><path d="M27 33h66M45 20v27M75 20v27"/><circle cx="60" cy="34" r="7"/></g></svg>`;
      case "scope": return `<svg ${common}><g ${stroke}><path d="M12 37h96M29 27h62l8 10-8 10H29l-8-10z"/><path d="M40 27v20M80 27v20"/></g></svg>`;
      case "armor": return `<svg ${common}><g ${stroke}><path d="M28 14l32 10 32-10 10 17-16 31H34L18 31z"/><path d="M60 24v38M29 36h62"/></g></svg>`;
      case "battery": return `<svg ${common}><g ${stroke}><rect x="24" y="17" width="72" height="43" rx="4"/><path d="M42 17V10h14v7m9 0V10h14v7M41 38h15m-8-7v14M68 38h14"/></g></svg>`;
      case "keycard": return `<svg ${common}><g ${stroke}><rect x="12" y="16" width="96" height="44" rx="5"/><circle cx="36" cy="38" r="10"/><path d="M55 28h38M55 38h28M55 48h34"/></g></svg>`;
      case "relic": return `<svg ${common}><g ${stroke}><path d="M60 8l35 20v28L60 67 25 56V28z"/><path d="M60 8v59M25 28l35 19 35-19M39 20l42 23"/></g></svg>`;
      case "sample": return `<svg ${common}><g ${stroke}><path d="M43 10h34v11l-5 5v33H48V26l-5-5z"/><path d="M49 39h22M52 49h16"/><circle cx="60" cy="33" r="4"/></g></svg>`;
      case "radio": return `<svg ${common}><g ${stroke}><rect x="31" y="19" width="58" height="43" rx="4"/><path d="M43 19V7M42 32h36M43 43h18M75 44v7"/><circle cx="75" cy="52" r="5"/></g></svg>`;
      case "toolkit": return `<svg ${common}><g ${stroke}><rect x="16" y="24" width="88" height="38" rx="4"/><path d="M42 24v-9h36v9M16 39h88M53 35h14v9H53z"/></g></svg>`;
      default: return `<svg ${common}><rect x="18" y="14" width="84" height="46" rx="6" ${stroke}/></svg>`;
    }
  }

  function objectiveChecks() {
    if (!state) return [];
    const conditions = state.level.conditions || {};
    const storageCount = state.items.filter(item => item.container === "storage").length;
    const checks = [{ done: storageCount === 0, label: storageCount === 0 ? "Coffre vidé" : `Coffre : ${storageCount} objet${storageCount > 1 ? "s" : ""} restant${storageCount > 1 ? "s" : ""}` }];
    if (conditions.minHealth) checks.push({ done: state.health >= conditions.minHealth, label: `État opérateur : ${state.health} / ${conditions.minHealth} %` });
    if (conditions.attachedScope) {
      const done = state.items.some(item => item.defId === "rifle" && item.attachments?.scope);
      checks.push({ done, label: done ? "Optique OX-2 montée" : "Monter l’optique OX-2" });
    }
    if (conditions.minFreeCells) {
      const free = getFreeCells();
      checks.push({ done: free >= conditions.minFreeCells, label: `Cases libres : ${free} / ${conditions.minFreeCells}` });
    }
    const layout = CORE.validateLayout(state.items, state.level, ITEM_DEFS);
    checks.push({ done: layout.valid, label: layout.valid ? "Disposition sans collision" : "Corriger la disposition" });
    return checks;
  }

  function updateHUD() {
    if (!state) return;
    dom.missionTitle.textContent = state.mode === "campaign"
      ? `PROTOCOLE ${String(state.level.number).padStart(2, "0")} — ${state.level.title.toUpperCase()}`
      : state.level.title.toUpperCase();
    dom.timerValue.textContent = formatTime(state.elapsed);
    dom.scoreValue.textContent = String(calculateScore()).padStart(6, "0");
    dom.movesValue.textContent = String(state.moves).padStart(2, "0");
    dom.objectiveText.textContent = state.level.objective;
    dom.healthValue.textContent = `${state.health}%`;
    dom.healthBar.style.width = `${state.health}%`;
    dom.healthBar.classList.toggle("is-low", state.health < 45);

    const storageCount = state.items.filter(item => item.container === "storage").length;
    const checks = objectiveChecks();
    const completedChecks = checks.filter(check => check.done).length;
    const progressPercent = checks.length ? Math.round((completedChecks / checks.length) * 100) : 100;
    dom.objectiveProgress.style.width = `${progressPercent}%`;
    dom.objectiveProgress.parentElement?.setAttribute("aria-valuenow", progressPercent);
    dom.healthBar.parentElement?.setAttribute("aria-valuenow", state.health);
    const nextSignature = checks.map(check => `${check.done ? 1 : 0}:${check.label}`).join("|");
    if (dom.objectiveChecklist && nextSignature !== objectiveSignature) {
      objectiveSignature = nextSignature;
      dom.objectiveChecklist.replaceChildren(...checks.map(check => {
        const entry = document.createElement("li");
        entry.className = check.done ? "is-complete" : "";
        entry.innerHTML = `<span aria-hidden="true">${check.done ? "✓" : "○"}</span><span>${check.label}</span>`;
        return entry;
      }));
    }

    const used = state.items.filter(item => item.container === "case").reduce((sum, item) => sum + getArea(item), 0);
    const total = state.level.case[0] * state.level.case[1];
    dom.caseDimensions.textContent = `${state.level.case[0]} × ${state.level.case[1]}`;
    dom.caseUsage.textContent = `${used} / ${total} CASES`;
    dom.storageDimensions.textContent = `${state.level.storage[0]} × ${state.level.storage[1]}`;
    dom.storageCount.textContent = `${storageCount} OBJET${storageCount > 1 ? "S" : ""}`;
  }

  function updateInspector() {
    const item = selectedItem();
    dom.emptyInspector.hidden = Boolean(item);
    dom.itemInspector.hidden = !item;
    if (!item) {
      dom.selectionIndex.textContent = "—";
      return;
    }

    const def = getDef(item);
    const [w, h] = getDims(item);
    const ordered = state.items.filter(entry => entry.container === item.container);
    const index = ordered.findIndex(entry => entry.uid === item.uid) + 1;
    dom.selectionIndex.textContent = `${String(index).padStart(2, "0")} / ${String(ordered.length).padStart(2, "0")}`;
    dom.inspectorArt.innerHTML = iconSvg(def.icon);
    dom.inspectorArt.style.color = def.color;
    dom.inspectorCategory.textContent = CATEGORY_LABELS[def.category] || "OBJET";
    dom.inspectorName.textContent = def.name;
    dom.inspectorDescription.textContent = def.description;
    dom.inspectorSize.textContent = `${w} × ${h} cases`;
    dom.inspectorPosition.textContent = `${containerLabel(item.container)} · ${String.fromCharCode(65 + item.x)}${item.y + 1}`;

    if (def.weapon) {
      dom.inspectorState.textContent = `${item.loaded}/${def.weapon.capacity} ${def.weapon.ammoLabel}${item.attachments?.scope ? " · OX-2 montée" : ""}`;
    } else if (def.ammo) {
      dom.inspectorState.textContent = `${item.quantity} cartouche${item.quantity > 1 ? "s" : ""}`;
    } else if (def.healing) {
      dom.inspectorState.textContent = `Soin +${def.healing.amount} %`;
    } else if (def.combine) {
      dom.inspectorState.textContent = "Combinable";
    } else {
      dom.inspectorState.textContent = "Intact";
    }

    const special = getSpecialAction(item);
    dom.specialButton.hidden = !special;
    if (special) {
      dom.specialButton.innerHTML = `<span aria-hidden="true">${special.icon}</span> ${special.label}`;
    }
  }

  function updateControls() {
    const hasSelection = Boolean(selectedItem());
    const locked = state.completed || autoSorting;
    dom.rotateButton.disabled = !hasSelection || locked;
    dom.transferButton.disabled = !hasSelection || locked;
    dom.specialButton.disabled = !hasSelection || locked;
    dom.undoButton.disabled = !state.history.length || locked;
    dom.autoSortButton.disabled = locked || !state.items.some(item => item.container === "case");
    dom.validateButton.disabled = locked;
  }

  function renderContracts() {
    dom.contractsGrid.replaceChildren();
    const fragment = document.createDocumentFragment();
    for (const level of CAMPAIGN) {
      const unlocked = level.number <= progress.unlocked;
      const best = progress.best[level.id];
      const button = document.createElement("button");
      button.type = "button";
      button.className = `contract-card${state?.mode === "campaign" && state.level.id === level.id ? " is-current" : ""}`;
      button.dataset.number = String(level.number).padStart(2, "0");
      button.disabled = !unlocked;
      button.dataset.levelIndex = String(level.number - 1);
      button.innerHTML = `${best ? `<span class="contract-rank">${best.rank}</span>` : ""}
        <span class="eyebrow">PROTOCOLE ${String(level.number).padStart(2, "0")}</span>
        <h3>${unlocked ? level.title.toUpperCase() : "ACCÈS VERROUILLÉ"}</h3>
        <p>${unlocked ? level.objective : "Validez le contrat précédent pour déverrouiller ce protocole."}</p>
        <div class="contract-meta"><span>${level.case[0]}×${level.case[1]}</span><span>${level.difficulty}</span>${best ? `<span>${String(best.score).padStart(6, "0")}</span>` : ""}</div>`;
      fragment.appendChild(button);
    }
    dom.contractsGrid.appendChild(fragment);
  }

  function formatTime(ms) {
    const totalTenths = Math.floor(ms / 100);
    const minutes = Math.floor(totalTenths / 600);
    const seconds = Math.floor((totalTenths % 600) / 10);
    const tenths = totalTenths % 10;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
  }

  function toast(message, type = "") {
    clearTimeout(toastTimer);
    dom.toast.textContent = message;
    dom.toast.className = `toast show${type ? ` ${type}` : ""}`;
    toastTimer = setTimeout(() => { dom.toast.className = "toast"; }, 2600);
  }

  function pulseItem(uid) {
    const element = document.querySelector(`.item[data-uid="${CSS.escape(uid)}"]`);
    if (!element) return;
    element.classList.remove("is-pulse");
    void element.offsetWidth;
    element.classList.add("is-pulse");
  }

  function highlightBoard(container) {
    const board = boardElement(container);
    board.classList.add("is-target");
    setTimeout(() => board.classList.remove("is-target"), 900);
  }

  function sound(type) {
    if (muted) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") audioContext.resume();
      const now = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      const settings = {
        select: [520, .025, "square", .025],
        moveSoft: [250, .03, "sine", .02],
        move: [320, .05, "triangle", .035],
        rotate: [410, .06, "square", .025],
        load: [180, .09, "square", .04],
        heal: [620, .22, "sine", .04],
        combine: [440, .16, "triangle", .04],
        sort: [330, .18, "triangle", .035],
        undo: [280, .08, "sine", .03],
        error: [105, .12, "sawtooth", .04],
        success: [680, .18, "sine", .035],
        start: [240, .18, "triangle", .035],
        complete: [520, .42, "triangle", .05],
      }[type] || [300, .05, "sine", .025];
      oscillator.type = settings[2];
      oscillator.frequency.setValueAtTime(settings[0], now);
      if (type === "complete") oscillator.frequency.exponentialRampToValueAtTime(920, now + settings[1]);
      if (type === "error") oscillator.frequency.exponentialRampToValueAtTime(70, now + settings[1]);
      if (type === "heal") oscillator.frequency.exponentialRampToValueAtTime(880, now + settings[1]);
      gain.gain.setValueAtTime(settings[3], now);
      gain.gain.exponentialRampToValueAtTime(.0001, now + settings[1]);
      oscillator.start(now);
      oscillator.stop(now + settings[1] + .02);
    } catch (error) {
      console.warn("Audio indisponible", error);
    }
  }

  function beginDrag(event) {
    if (!state || state.completed || autoSorting || event.button > 0) return;
    const itemElement = event.target.closest(".item");
    if (!itemElement) return;
    const item = state.items.find(entry => entry.uid === itemElement.dataset.uid);
    if (!item) return;

    event.preventDefault();
    itemElement.focus({ preventScroll: true });
    state.selectedUid = item.uid;
    updateInspector();
    updateControls();
    $$(".item.is-selected").forEach(element => element.classList.toggle("is-selected", element.dataset.uid === item.uid));

    const rect = itemElement.getBoundingClientRect();
    drag = {
      pointerId: event.pointerId,
      uid: item.uid,
      element: itemElement,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      grabX: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      grabY: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
      origin: { container: item.container, x: item.x, y: item.y, rot: item.rot },
      rot: item.rot,
      moved: false,
      target: null,
    };
    itemElement.setPointerCapture?.(event.pointerId);
  }

  function updateDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (!drag.moved && distance < 5) return;

    if (!drag.moved) {
      drag.moved = true;
      drag.element.classList.add("is-dragging");
      const item = state.items.find(entry => entry.uid === drag.uid);
      const ghostItem = { ...item, rot: drag.rot };
      dom.dragGhost.innerHTML = itemVisualHtml(ghostItem);
      dom.dragGhost.style.setProperty("--item-accent", getDef(item).color);
      dom.dragGhost.hidden = false;
    }

    event.preventDefault();
    if (!dragFrame) {
      dragFrame = requestAnimationFrame(() => {
        dragFrame = 0;
        positionDragVisual();
      });
    }
  }

  function positionDragVisual() {
    if (!drag?.moved) return;
    const item = state.items.find(entry => entry.uid === drag.uid);
    if (!item) return;
    const [w, h] = getDims(item, drag.rot);
    const boards = [dom.caseBoard, dom.storageBoard];
    let targetBoard = null;
    for (const board of boards) {
      const rect = board.getBoundingClientRect();
      if (drag.lastX >= rect.left && drag.lastX <= rect.right && drag.lastY >= rect.top && drag.lastY <= rect.bottom) {
        targetBoard = board;
        break;
      }
    }

    $$(".board.is-target").forEach(board => board.classList.remove("is-target"));
    const originBoard = boardElement(item.container);
    const originRect = originBoard.getBoundingClientRect();
    let cell = originRect.width / Number(originBoard.dataset.cols);

    if (targetBoard) {
      const rect = targetBoard.getBoundingClientRect();
      const container = targetBoard.dataset.board;
      cell = rect.width / Number(targetBoard.dataset.cols);
      const x = Math.floor((drag.lastX - rect.left) / cell - drag.grabX * w);
      const y = Math.floor((drag.lastY - rect.top) / cell - drag.grabY * h);
      const valid = canPlace(item.uid, container, x, y, drag.rot);
      drag.target = { container, x, y, rot: drag.rot, valid };
      targetBoard.classList.add("is-target");
      dom.placementPreview.hidden = false;
      dom.placementPreview.classList.toggle("invalid", !valid);
      dom.placementPreview.style.setProperty("--preview-cell", `${cell}px`);
      dom.placementPreview.style.setProperty("--w", w);
      dom.placementPreview.style.setProperty("--h", h);
      dom.placementPreview.style.left = `${rect.left + x * cell}px`;
      dom.placementPreview.style.top = `${rect.top + y * cell}px`;
    } else {
      drag.target = null;
      dom.placementPreview.hidden = true;
    }

    dom.dragGhost.style.setProperty("--ghost-cell", `${cell}px`);
    dom.dragGhost.style.setProperty("--w", w);
    dom.dragGhost.style.setProperty("--h", h);
    dom.dragGhost.style.left = `${drag.lastX - drag.grabX * w * cell}px`;
    dom.dragGhost.style.top = `${drag.lastY - drag.grabY * h * cell}px`;
    const art = $(".item-art", dom.dragGhost);
    if (art) art.style.transform = `rotate(${drag.rot ? 90 : 0}deg)`;
  }

  function endDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const current = drag;
    drag = null;
    if (dragFrame) cancelAnimationFrame(dragFrame);
    dragFrame = 0;

    current.element.classList.remove("is-dragging");
    dom.dragGhost.hidden = true;
    dom.placementPreview.hidden = true;
    $$(".board.is-target").forEach(board => board.classList.remove("is-target"));

    const item = state.items.find(entry => entry.uid === current.uid);
    if (!item) return;

    if (!current.moved) {
      sound("select");
      render();
      return;
    }

    if (current.target?.valid) {
      const changedPosition = current.target.container !== current.origin.container || current.target.x !== current.origin.x || current.target.y !== current.origin.y;
      const changedRotation = current.target.rot !== current.origin.rot;
      if (changedPosition || changedRotation) {
        pushHistory();
        item.container = current.target.container;
        item.x = current.target.x;
        item.y = current.target.y;
        item.rot = current.target.rot;
        if (changedPosition) state.moves++;
        if (changedRotation) state.rotations++;
        sound(changedRotation && !changedPosition ? "rotate" : "move");
      }
    } else {
      sound("error");
      toast("Placement impossible.", "error");
    }
    render();
  }

  function rotateDuringDrag() {
    if (!drag?.moved) return false;
    drag.rot = drag.rot ? 0 : 1;
    const item = state.items.find(entry => entry.uid === drag.uid);
    const ghostItem = { ...item, rot: drag.rot };
    dom.dragGhost.innerHTML = itemVisualHtml(ghostItem);
    sound("rotate");
    positionDragVisual();
    return true;
  }

  function handleKeyboard(event) {
    const overlay = topVisibleOverlay();
    if (overlay) {
      if (event.key === "Tab") trapOverlayFocus(event, overlay);
      if (event.key === "Escape") closeTopOverlay();
      return;
    }
    if (!state || autoSorting) return;
    const itemElement = event.target.closest?.(".item");
    if (!itemElement) {
      if (event.key === "Escape" && state.selectedUid) {
        state.selectedUid = null;
        render();
      }
      return;
    }
    if (state.selectedUid !== itemElement.dataset.uid) state.selectedUid = itemElement.dataset.uid;

    if (event.key === "r" || event.key === "R") {
      event.preventDefault();
      if (!rotateDuringDrag()) rotateSelected();
    } else if (event.key === " ") {
      event.preventDefault();
      transferSelected();
    } else if (event.key === "ArrowLeft") { event.preventDefault(); moveSelected(-1, 0); }
    else if (event.key === "ArrowRight") { event.preventDefault(); moveSelected(1, 0); }
    else if (event.key === "ArrowUp") { event.preventDefault(); moveSelected(0, -1); }
    else if (event.key === "ArrowDown") { event.preventDefault(); moveSelected(0, 1); }
    else if (event.key === "Enter") {
      event.preventDefault();
      const item = selectedItem();
      if (item && getSpecialAction(item)) performSpecial();
    } else if (event.key === "Escape") {
      state.selectedUid = null;
      render();
    }
  }

  function topVisibleOverlay() {
    return [dom.resultOverlay, dom.helpOverlay, dom.contractsOverlay, dom.startScreen].find(overlay => overlay && !overlay.hidden) || null;
  }

  function focusableElements(root) {
    return $$('button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])', root).filter(element => !element.hidden && element.getClientRects().length);
  }

  function trapOverlayFocus(event, overlay) {
    const focusables = focusableElements(overlay);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function syncInertState() {
    const overlay = topVisibleOverlay();
    const layers = [$(".topbar"), $(".game-shell"), dom.startScreen, dom.contractsOverlay, dom.helpOverlay, dom.resultOverlay].filter(Boolean);
    layers.forEach(layer => { layer.inert = Boolean(overlay && layer !== overlay); });
  }

  function openOverlay(overlay, trigger = document.activeElement) {
    if (!overlay) return;
    lastOverlayTrigger = trigger instanceof HTMLElement ? trigger : null;
    overlay.hidden = false;
    syncInertState();
    requestAnimationFrame(() => {
      const target = focusableElements(overlay)[0] || overlay;
      target.focus?.({ preventScroll: true });
    });
  }

  function closeOverlay(overlay) {
    if (!overlay || overlay === dom.resultOverlay) return;
    overlay.hidden = true;
    syncInertState();
    if (!topVisibleOverlay()) lastOverlayTrigger?.focus?.({ preventScroll: true });
  }

  function closeTopOverlay() {
    if (!dom.resultOverlay.hidden) return;
    if (!dom.helpOverlay.hidden) closeOverlay(dom.helpOverlay);
    else if (!dom.contractsOverlay.hidden) closeOverlay(dom.contractsOverlay);
    else if (!dom.startScreen.hidden && state) closeOverlay(dom.startScreen);
  }

  function hideAllOverlays() {
    dom.startScreen.hidden = true;
    dom.contractsOverlay.hidden = true;
    dom.helpOverlay.hidden = true;
    dom.resultOverlay.hidden = true;
    syncInertState();
  }

  function showStartScreen() {
    dom.contractsOverlay.hidden = true;
    dom.helpOverlay.hidden = true;
    dom.resultOverlay.hidden = true;
    updateContinueButton();
    openOverlay(dom.startScreen, document.activeElement);
  }

  function updateContinueButton() {
    const hasProgress = progress.unlocked > 1 || Object.keys(progress.best).length > 0;
    const hasResume = Boolean(resumableSession);
    dom.continueButton.disabled = !hasResume && !hasProgress;
    const level = CAMPAIGN[Math.min(progress.current, progress.unlocked - 1)] || CAMPAIGN[0];
    dom.continueLabel.textContent = hasResume
      ? `Reprendre ${resumableSession.mode === "campaign" ? resumableSession.levelId?.replace("protocol-", "protocole ") : resumableSession.mode === "random" ? "le contrat aléatoire" : "le bac à sable"}`
      : progress.campaignComplete ? "Campagne terminée — revoir le Protocole noir"
        : hasProgress ? `Poursuivre au protocole ${String(level.number).padStart(2, "0")} — ${level.title}` : "Aucune progression";
    dom.soundButton.classList.toggle("is-muted", muted);
    dom.soundButton.textContent = muted ? "×" : "♪";
    dom.soundButton.setAttribute("aria-pressed", muted ? "false" : "true");
    dom.soundButton.setAttribute("aria-label", muted ? "Activer le son" : "Couper le son");
    dom.soundButton.title = muted ? "Activer le son" : "Couper le son";
  }

  function updateConnectionStatus() {
    const offline = navigator.onLine === false;
    document.documentElement.classList.toggle("is-offline", offline);
    if (!dom.connectionStatus) return;
    dom.connectionStatus.hidden = !offline;
    dom.connectionStatus.textContent = offline ? "MODE HORS LIGNE — progression conservée sur cet appareil" : "";
  }

  function randomSeed() {
    if (globalThis.crypto?.getRandomValues) {
      const buffer = new Uint32Array(1);
      globalThis.crypto.getRandomValues(buffer);
      return buffer[0];
    }
    return CORE.toUint32(Date.now());
  }

  function specsArea(specs) {
    return specs.reduce((sum, spec) => sum + ITEM_DEFS[spec.defId].w * ITEM_DEFS[spec.defId].h, 0);
  }

  function specsArePackable(specs, dims) {
    const items = specs.map((spec, index) => ({ uid: `generated-${index}`, defId: spec.defId, rot: 0 }));
    return Boolean(CORE.solvePacking(items, dims[0], dims[1], ITEM_DEFS, { timeLimitMs: Infinity, maxNodes: 180000 }));
  }

  function createRandomLevel(seedInput = randomSeed()) {
    const seed = CORE.toUint32(seedInput);
    const rng = CORE.mulberry32(seed);
    const caseDims = rng() > .55 ? [11, 8] : [10, 7];
    const maxArea = Math.floor(caseDims[0] * caseDims[1] * .76);
    const targetCount = 12 + Math.floor(rng() * 6);
    const ammoSpec = (defId, factor = 1) => I(defId, { quantity: Math.max(3, Math.floor(ITEM_DEFS[defId].ammo.defaultQuantity * factor)) });
    const weaponSpec = defId => I(defId, { loaded: Math.floor(rng() * Math.max(1, ITEM_DEFS[defId].weapon.capacity * .65)) });
    const combatKits = CORE.shuffleDeterministic([
      [weaponSpec("pistol"), ammoSpec("ammo9", .8 + rng() * .7)],
      [weaponSpec("shotgun"), ammoSpec("shells", .8 + rng() * .5)],
      [weaponSpec("rifle"), ammoSpec("rifleAmmo", .8 + rng() * .5), I("scope")],
      [weaponSpec("smg"), ammoSpec("ammo9", 1 + rng() * .8)],
      [weaponSpec("magnum"), ammoSpec("magnumAmmo", .7 + rng() * .5)],
    ], rng);
    const bundles = [[I("knife")], combatKits[0], combatKits[1]];
    if (caseDims[0] > 10 && rng() > .45) bundles.push(combatKits[2]);

    const supportBundles = CORE.shuffleDeterministic([
      [I("greenHerb"), I("redHerb")],
      [I("spray")],
      [I("ration"), I("greenHerb")],
    ], rng);
    bundles.push(supportBundles[0]);

    const fillerPool = CORE.shuffleDeterministic([
      "grenade", "flash", "mine", "armor", "battery", "radio", "toolkit", "keycard", "ration", "greenHerb",
    ], rng);
    let fillerIndex = 0;
    while (bundles.flat().length < targetCount && fillerIndex < fillerPool.length * 3) {
      const defId = fillerPool[fillerIndex % fillerPool.length];
      fillerIndex++;
      const candidate = [...bundles.flat(), I(defId)];
      if (specsArea(candidate) <= maxArea) bundles.push([I(defId)]);
    }

    let specs = bundles.flat();
    while (bundles.length > 3 && !specsArePackable(specs, caseDims)) {
      bundles.pop();
      specs = bundles.flat();
    }
    if (!specsArePackable(specs, caseDims)) {
      specs = [I("pistol", { loaded: 4 }), I("ammo9", { quantity: 12 }), I("knife"), I("greenHerb"), I("grenade"), I("radio")];
    }

    const code = seed.toString(16).toUpperCase().padStart(8, "0");
    return {
      id: `random-${code}`, number: 0, title: "Contrat aléatoire", difficulty: "Variable", case: caseDims, storage: [14, 9],
      health: 55 + Math.floor(rng() * 46), par: 240,
      objective: `Videz le coffre et optimisez la cargaison ${code}. Cette graine est rejouable.`,
      items: specs,
      seed,
    };
  }

  function createSandboxLevel() {
    return {
      id: "sandbox", number: 0, title: "Bac à sable", difficulty: "Libre", case: [14, 9], storage: [18, 10], health: 65, par: 9999,
      objective: "Expérimentez librement : déplacez, chargez, combinez et organisez sans condition de victoire.",
      items: [
        I("pistol", { loaded: 2 }), I("magnum", { loaded: 1 }), I("shotgun", { loaded: 0 }), I("rifle", { loaded: 3 }), I("smg", { loaded: 12 }), I("knife"),
        I("ammo9", { quantity: 30 }), I("ammo9", { quantity: 18 }), I("shells", { quantity: 6 }), I("shells", { quantity: 5 }), I("rifleAmmo", { quantity: 10 }), I("magnumAmmo", { quantity: 6 }),
        I("greenHerb"), I("redHerb"), I("spray"), I("ration"), I("grenade"), I("flash"), I("mine"), I("scope"), I("armor"), I("battery"), I("radio"), I("toolkit"), I("keycard"), I("relic"), I("sample"),
      ],
    };
  }

  function mulberry32(seed) {
    return CORE.mulberry32(seed);
  }

  function bindEvents() {
    document.addEventListener("pointerdown", event => {
      if (event.target.closest(".board")) beginDrag(event);
    });
    document.addEventListener("pointermove", updateDrag, { passive: false });
    document.addEventListener("pointerup", endDrag);
    document.addEventListener("pointercancel", endDrag);
    document.addEventListener("keydown", handleKeyboard);
    document.addEventListener("focusin", event => {
      const item = event.target.closest?.(".item");
      if (!item || !state || state.selectedUid === item.dataset.uid) return;
      state.selectedUid = item.dataset.uid;
      $$(".item").forEach(element => {
        const selected = element.dataset.uid === state.selectedUid;
        element.classList.toggle("is-selected", selected);
        element.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      updateInspector();
      updateControls();
    });

    document.addEventListener("dblclick", event => {
      const item = event.target.closest(".item");
      if (!item) return;
      state.selectedUid = item.dataset.uid;
      rotateSelected();
    });

    document.addEventListener("contextmenu", event => {
      const item = event.target.closest(".item");
      if (!item) return;
      event.preventDefault();
      state.selectedUid = item.dataset.uid;
      rotateSelected();
    });

    $("#newCampaignButton").addEventListener("click", () => {
      progress.current = 0;
      progress.campaignComplete = false;
      saveProgress();
      startLevel(CAMPAIGN[0], "campaign", 0);
    });
    dom.continueButton.addEventListener("click", () => {
      if (resumableSession && resumeActiveSession()) return;
      const index = Math.min(progress.current, progress.unlocked - 1);
      startLevel(CAMPAIGN[index], "campaign", index);
    });
    $("#randomButton").addEventListener("click", () => startLevel(createRandomLevel(), "random", -1));
    $("#sandboxButton").addEventListener("click", () => startLevel(createSandboxLevel(), "sandbox", -1));
    $("#brandButton").addEventListener("click", () => {
      saveActiveSession();
      showStartScreen();
    });
    $("#helpButton").addEventListener("click", event => openOverlay(dom.helpOverlay, event.currentTarget));
    $("#contractsButton").addEventListener("click", event => {
      renderContracts();
      openOverlay(dom.contractsOverlay, event.currentTarget);
    });
    $("#undoButton").addEventListener("click", undo);
    $("#autoSortButton").addEventListener("click", autoSortCase);
    $("#resetButton").addEventListener("click", resetLevel);
    dom.validateButton.addEventListener("click", validateLevel);
    dom.rotateButton.addEventListener("click", rotateSelected);
    dom.transferButton.addEventListener("click", transferSelected);
    dom.specialButton.addEventListener("click", performSpecial);
    $("#replayButton").addEventListener("click", () => startLevel(state.level, state.mode, state.levelIndex));
    dom.nextButton.addEventListener("click", () => {
      const nextIndex = Math.min(CAMPAIGN.length - 1, state.levelIndex + 1);
      startLevel(CAMPAIGN[nextIndex], "campaign", nextIndex);
    });
    dom.soundButton.addEventListener("click", () => {
      muted = !muted;
      saveProgress();
      updateContinueButton();
      if (!muted) sound("select");
    });
    $("#fullscreenButton").addEventListener("click", async () => {
      try {
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
        else await document.exitFullscreen();
      } catch {
        toast("Le plein écran n’est pas disponible sur cet appareil.", "error");
      }
    });

    $$('[data-close]').forEach(button => button.addEventListener("click", () => {
      const overlay = document.getElementById(button.dataset.close);
      closeOverlay(overlay);
    }));

    dom.contractsGrid.addEventListener("click", event => {
      const card = event.target.closest(".contract-card");
      if (!card || card.disabled) return;
      const index = Number(card.dataset.levelIndex);
      startLevel(CAMPAIGN[index], "campaign", index);
    });

    [dom.contractsOverlay, dom.helpOverlay].forEach(overlay => overlay.addEventListener("pointerdown", event => {
      if (event.target === overlay) closeOverlay(overlay);
    }));

    window.addEventListener("resize", () => {
      if (drag?.moved) positionDragVisual();
    });
    window.addEventListener("online", updateConnectionStatus);
    window.addEventListener("offline", updateConnectionStatus);
    window.addEventListener("pagehide", saveActiveSession);
    document.addEventListener("visibilitychange", () => {
      lastTick = performance.now();
      if (document.hidden) saveActiveSession();
    });
  }

  let lastTick = performance.now();
  setInterval(() => {
    const now = performance.now();
    const delta = now - lastTick;
    lastTick = now;
    if (!state?.playing || state.completed) return;
    const overlayOpen = Boolean(topVisibleOverlay());
    if (!overlayOpen && !document.hidden) {
      state.elapsed += delta;
      updateHUD();
    }
  }, 100);

  setInterval(() => {
    if (state?.playing && !state.completed && !document.hidden) saveActiveSession();
  }, 5000);

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("./service-worker.js");
        registration.update().catch(() => {});
      } catch (error) {
        console.warn("Service worker indisponible", error);
      }
    });
  }

  Object.defineProperty(globalThis, "__BLACK_CASE_QA__", {
    configurable: false,
    value: Object.freeze({
      campaign: CAMPAIGN.map(level => clone(level)),
      createRandomLevel: seed => clone(createRandomLevel(seed)),
      validateSpecs: (specs, dims) => specsArePackable(clone(specs), clone(dims)),
      solveSpecs: (specs, dims) => clone(CORE.solvePacking(
        clone(specs).map((spec, index) => ({ ...spec, uid: spec.uid || `qa-${index}` })),
        dims[0],
        dims[1],
        ITEM_DEFS,
        { timeLimitMs: Infinity, maxNodes: 600000 },
      )),
      validateActiveSnapshot: snapshot => Boolean(normalizeActiveSession(clone(snapshot))),
      scoreVersion: SCORE_VERSION,
    }),
  });

  resumableSession = loadActiveSession();
  bindEvents();
  updateConnectionStatus();
  updateContinueButton();
  renderContracts();
  showStartScreen();
})();
