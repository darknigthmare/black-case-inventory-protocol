import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "index.html",
  "styles.css",
  "game.js",
  "icon.svg",
  "manifest.webmanifest",
  "service-worker.js",
];

await Promise.all(requiredFiles.map(file => access(file)));

const [html, styles, game, serviceWorker, manifestSource] = await Promise.all([
  readFile("index.html", "utf8"),
  readFile("styles.css", "utf8"),
  readFile("game.js", "utf8"),
  readFile("service-worker.js", "utf8"),
  readFile("manifest.webmanifest", "utf8"),
]);

const manifest = JSON.parse(manifestSource);
const contracts = [...game.matchAll(/id: "protocol-(\d{2})"/g)].map(match => match[1]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(html.includes('<script src="game.js"></script>'), "game.js doit être chargé par index.html");
assert(html.includes('rel="manifest"'), "Le manifeste PWA doit être lié");
assert(styles.includes("[hidden] { display: none !important; }"), "Les états hidden doivent rester invisibles");
assert(manifest.name === "BLACK CASE — Inventory Protocol", "Nom du manifeste inattendu");
assert(manifest.display === "standalone", "La PWA doit utiliser le mode standalone");
assert(contracts.length === 12, `12 contrats attendus, ${contracts.length} trouvés`);
assert(new Set(contracts).size === 12, "Les identifiants de contrats doivent être uniques");
assert(game.includes('title: "Contrat aléatoire"'), "Le mode aléatoire est absent");
assert(game.includes('title: "Bac à sable"'), "Le bac à sable est absent");
assert(game.includes("remainingSlots * minItemArea"), "La protection anti-boucle du générateur aléatoire est absente");
assert(serviceWorker.includes('const CACHE = "black-case-v3"'), "Version de cache PWA inattendue");

for (const file of requiredFiles) {
  if (file === "service-worker.js") continue;
  const cachePath = file === "index.html" ? '"./index.html"' : `"./${file}"`;
  assert(serviceWorker.includes(cachePath), `${file} doit être précaché`);
}

console.log("VERIFY_OK: 12 contrats, 3 modes, shell PWA et garde anti-boucle validés.");
