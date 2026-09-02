import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "index.html",
  "styles.css",
  "game-core.js",
  "game.js",
  "icon.svg",
  "manifest.webmanifest",
  "service-worker.js",
  "vercel.json",
];

await Promise.all(requiredFiles.map(file => access(file)));

const [html, styles, core, game, serviceWorker, manifestSource, vercelSource] = await Promise.all([
  readFile("index.html", "utf8"),
  readFile("styles.css", "utf8"),
  readFile("game-core.js", "utf8"),
  readFile("game.js", "utf8"),
  readFile("service-worker.js", "utf8"),
  readFile("manifest.webmanifest", "utf8"),
  readFile("vercel.json", "utf8"),
]);

const manifest = JSON.parse(manifestSource);
const vercel = JSON.parse(vercelSource);
const contracts = [...game.matchAll(/id: "protocol-(\d{2})"/g)].map(match => match[1]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const coreScriptIndex = html.indexOf('<script src="game-core.js"></script>');
const gameScriptIndex = html.indexOf('<script src="game.js"></script>');
assert(coreScriptIndex >= 0 && gameScriptIndex > coreScriptIndex, "game-core.js doit être chargé avant game.js");
assert(html.includes('rel="manifest"'), "Le manifeste PWA doit être lié");
assert(!/<(?:div|main)[^>]+id="app"[^>]+aria-live=/i.test(html), "Le conteneur global ne doit pas être une région live");
assert((html.match(/role="group" aria-label="Objets d/g) || []).length === 2, "Les deux plateaux doivent exposer des groupes d’objets nommés");
for (const id of ["startScreen", "contractsOverlay", "helpOverlay", "resultOverlay"]) {
  const tag = html.match(new RegExp(`<section[^>]+id="${id}"[^>]*>`, "i"))?.[0] || "";
  assert(tag.includes('role="dialog"') && tag.includes('aria-modal="true"'), `${id} doit être un dialogue modal`);
}
assert(styles.includes("[hidden] { display: none !important; }"), "Les états hidden doivent rester invisibles");
assert(styles.includes("prefers-reduced-motion"), "La réduction des animations doit être respectée");

assert(core.includes("validateLayout") && core.includes("solvePacking"), "Le noyau doit exposer validation et solveur");
assert(game.includes('const SAVE_SCHEMA = 2'), "Le schéma de sauvegarde V2 est absent");
assert(game.includes('blackCaseProgressV2') && game.includes('blackCaseActiveSessionV2'), "Les clés de sauvegarde V2 sont absentes");
assert(game.includes("createRandomLevel(seedInput") && game.includes("CORE.solvePacking"), "Le générateur déterministe est absent");
assert(game.includes("validateActiveSnapshot"), "L’API de QA des sauvegardes est absente");
assert(game.includes("solveSpecs"), "Le solveur de QA des contrats est absent");
assert(game.includes('document.createElement("button")') && game.includes('aria-pressed'), "Les objets spatiaux doivent rester de vrais boutons accessibles");
assert(contracts.length === 12, `12 contrats attendus, ${contracts.length} trouvés`);
assert(new Set(contracts).size === 12, "Les identifiants de contrats doivent être uniques");
assert(game.includes('title: "Contrat aléatoire"'), "Le mode aléatoire est absent");
assert(game.includes('title: "Bac à sable"'), "Le bac à sable est absent");

assert(manifest.id === "./" && manifest.scope === "./" && manifest.start_url === "./", "Identité, portée ou démarrage PWA inattendu");
assert(manifest.name === "BLACK CASE — Inventory Protocol", "Nom du manifeste inattendu");
assert(manifest.display === "standalone", "La PWA doit utiliser le mode standalone");
assert(Array.isArray(manifest.icons) && manifest.icons.some(icon => icon.purpose === "any"), "Une icône PWA standard est requise");

assert(serviceWorker.includes('const CACHE = "black-case-v4"'), "Version de cache PWA inattendue");
assert(serviceWorker.includes("self.skipWaiting()") && serviceWorker.includes("self.clients.claim()"), "Le cycle de mise à jour du service worker est incomplet");
assert(serviceWorker.includes('request.mode === "navigate"'), "Le repli de navigation hors ligne est absent");
for (const file of requiredFiles.filter(file => !["service-worker.js", "vercel.json"].includes(file))) {
  const cachePath = file === "index.html" ? '"./index.html"' : `"./${file}"`;
  assert(serviceWorker.includes(cachePath), `${file} doit être précaché`);
}

const headers = JSON.stringify(vercel.headers || []);
assert(headers.includes("/service-worker.js") && headers.includes("must-revalidate"), "Le service worker doit être revalidé");
assert(headers.includes("/manifest.webmanifest") && headers.includes("application/manifest+json"), "Le manifeste doit recevoir son type MIME");
assert(headers.includes("X-Frame-Options") && headers.includes("Permissions-Policy"), "Les en-têtes de sécurité attendus sont absents");

console.log("VERIFY_OK: noyau, 12 contrats, 3 modes, sauvegarde V2 et shell PWA v4 validés.");
