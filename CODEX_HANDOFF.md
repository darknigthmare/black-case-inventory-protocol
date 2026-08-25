# Handoff Codex

## Source

- Conversation ChatGPT : `6a88e68b-eb4c-83eb-9bbd-d6ecb48e418f`
- Archive d’origine : `black-case-inventory-protocol.zip`
- SHA-256 de l’archive : `F9068A508F772DD42E6CE3CCBC7B85F9B0EEA11AB966F10149101AB042D64A80`

## Surface livrée

- Campagne de 12 contrats progressifs.
- Contrat aléatoire et bac à sable.
- Déplacement, rotation, transfert, chargement, soin, combinaison et accessoires.
- Sauvegarde locale, score, rang, interface responsive et PWA hors ligne.

## Garde-fous de publication

- `npm test` vérifie la syntaxe, les 12 contrats, les trois modes et le shell PWA.
- Le générateur aléatoire réserve la capacité minimale des objets restants afin de ne jamais boucler indéfiniment.
- Toute modification de `game.js`, `styles.css` ou du shell doit incrémenter la constante `CACHE` de `service-worker.js`.
- Le service worker est publié avec revalidation obligatoire sur Vercel.

## QA navigateur du 26 août 2026

- Desktop : menu, campagne, sélecteur de 12 contrats, progression verrouillée et contrat aléatoire.
- Mobile 390 × 844 : bac à sable, transfert coffre vers mallette, inspecteur et aide, sans débordement horizontal.
- Manifeste et service worker enregistrés ; aucune erreur JavaScript observée.
