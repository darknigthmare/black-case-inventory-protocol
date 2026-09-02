# Handoff Codex

## Source

- Conversation ChatGPT : `6a88e68b-eb4c-83eb-9bbd-d6ecb48e418f`
- Archive d’origine : `black-case-inventory-protocol.zip`
- SHA-256 de l’archive : `F9068A508F772DD42E6CE3CCBC7B85F9B0EEA11AB966F10149101AB042D64A80`

## Surface livrée

- Campagne de 12 contrats progressifs.
- Contrat aléatoire et bac à sable.
- Déplacement, rotation, transfert, chargement, soin, combinaison et accessoires.
- Sauvegarde exacte de la partie active et de son historique, score V2, rang, progression non régressive, interface responsive et PWA hors ligne.
- Générateur aléatoire déterministe à kits cohérents, avec graine rejouable.
- Objectifs multi-conditions visibles, fin de campagne et protections contre les états de grille ou d’inventaire impossibles.

## Garde-fous de publication

- `npm test` exécute les tests unitaires du noyau puis vérifie la syntaxe, les 12 contrats, les trois modes, la sauvegarde V2 et le shell PWA.
- `npm run build` rejoue la gate statique complète destinée à l’hébergement sans bundler.
- Le générateur et les placements de repli utilisent un budget de nœuds fixe : une graine identique produit la même cargaison, indépendamment de la vitesse de l’appareil.
- Les reprises sont rejetées si elles contiennent une limite dépassée, une collision, une superposition ou un inventaire non atteignable par les actions du jeu.
- Toute modification de `game.js`, `styles.css` ou du shell doit incrémenter la constante `CACHE` de `service-worker.js`.
- Le service worker est publié avec revalidation obligatoire sur Vercel.

## QA navigateur du 26 août 2026

Baseline historique de la version 1.0.2 :

- Desktop : menu, campagne, sélecteur de 12 contrats, progression verrouillée et contrat aléatoire.
- Mobile 390 × 844 : bac à sable, transfert coffre vers mallette, inspecteur et aide, sans débordement horizontal.
- Manifeste et service worker enregistrés ; aucune erreur JavaScript observée.

## QA de release 1.1.0 du 30 août 2026

- `npm test` : 10/10 tests du noyau, puis vérification statique complète.
- `npm run build` : gate de build statique validée.
- Fuzz navigateur : 3 000 graines, 0 cargaison non packable, 0 dépendance orpheline et 0 divergence déterministe ; la graine de régression 1783 démarre avec ses 12 objets.
- Sauvegarde : transfert et rotation repris à l’identique avec sélection et historique ; JSON cassé, grille vide, chevauchement et fusion impossible de boîtes de munitions rejetés.
- Campagne : ancien contrat sans régression de progression, Protocole noir terminé avec état final persistant, puis nouvelle campagne sans perte de records.
- Échec de quota simulé : résultat affiché sans effacer la dernière reprise valide.
- Desktop 1440 × 900, mobile 390 × 844 et paysage 844 × 390 : parcours menu/jeu/modales/actions, focus clavier et absence de débordement de page.
- Audit axe WCAG 2 A/AA : 0 violation après correction des objets spatiaux interactifs ; contrastes sur dégradés inspectés visuellement.
- PWA : cache `black-case-v4` complet, service worker contrôleur, rechargement et reprise réussis serveur réellement arrêté ; une ressource non cachée échoue bien hors réseau.
- Web Vitals locaux : TTFB 2 ms, FCP/LCP 124 ms et CLS 0 dans le navigateur QA.
