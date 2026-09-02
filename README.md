# BLACK CASE — Inventory Protocol

Jeu original de rangement tactique inspiré du principe de « mallette à grille » des survival-horror : déplacer, faire pivoter, charger, combiner et organiser des objets dans un espace limité au fil d’une campagne complète.

## Lancer le jeu

### Méthode la plus simple

Ouvrir `index.html` dans un navigateur moderne.

### Mode recommandé (PWA et cache hors ligne)

Dans ce dossier :

```bash
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

## Commandes

- Souris / tactile : glisser-déposer les objets.
- `Tab` / `Maj+Tab` : suivre le parcours de focus standard de l’interface.
- Sur un objet focalisé, `R` le fait pivoter et les flèches le déplacent d’une case.
- Sur un objet focalisé, `Espace` le transfère automatiquement entre coffre et mallette.
- Sur un objet focalisé, `Entrée` utilise l’action contextuelle disponible.
- Double-clic ou clic droit : pivoter.

## Contenu

- 12 contrats de campagne progressifs.
- Contrats aléatoires cohérents et reproductibles grâce à leur graine affichée.
- Bac à sable.
- Deux grilles : mallette et coffre de stockage.
- Rotation à 90°, limites, collisions et superpositions contrôlées par un noyau déterministe testé.
- Chargement des armes, consommation de soins, combinaison de plantes et montage d’accessoires.
- Annulation complète, réinitialisation confirmée, rangement automatique borné, score versionné et rang.
- Sauvegarde locale exacte de la partie active : positions, rotation, santé, temps, compteurs, sélection et historique d’annulation.
- Progression de campagne non régressive, records par contrat et état de campagne terminée.
- Interface responsive compatible souris, clavier et tactile, avec dialogues modaux, focus restauré et objectifs détaillés.
- Sons procéduraux sans ressource externe.
- Fonctionnement hors ligne et manifeste PWA.

## Vérification

Le projet ne nécessite aucune dépendance d’exécution. Avec Node.js installé :

```bash
npm test
npm run build
```

Ces contrôles valident la syntaxe JavaScript, le noyau de placement, les rotations, limites, collisions, superpositions, le solveur, les 12 contrats, les trois modes, la sauvegarde V2 et le shell PWA. La release est ensuite contrôlée dans un vrai navigateur sur desktop et mobile, y compris hors ligne.

## Publication

Le projet est prévu pour un hébergement statique. La configuration `vercel.json` force la revalidation du service worker afin que les nouvelles versions du jeu remplacent correctement l’ancien cache hors ligne.

- Jeu en production : [black-case-inventory-protocol.vercel.app](https://black-case-inventory-protocol.vercel.app)
- Dépôt public : [darknigthmare/black-case-inventory-protocol](https://github.com/darknigthmare/black-case-inventory-protocol)

Les informations de provenance et les contrôles de reprise sont conservés dans [`CODEX_HANDOFF.md`](CODEX_HANDOFF.md).

## Propriété intellectuelle

Ce projet n’emploie aucun logo, nom d’objet, image, son, personnage, décor ou fichier issu de *Resident Evil* ou de Capcom. Le code, l’interface, le titre et les ressources vectorielles sont originaux. Le principe général d’un inventaire spatial à grille est réinterprété sous une identité indépendante.
