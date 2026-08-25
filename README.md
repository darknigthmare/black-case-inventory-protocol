# BLACK CASE — Inventory Protocol

Mini-jeu original de rangement tactique inspiré du principe de « mallette à grille » des survival-horror : déplacer, faire pivoter, charger, combiner et organiser des objets dans un espace limité.

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
- `R` : faire pivoter l’objet sélectionné ou l’objet actuellement déplacé.
- Flèches : déplacer l’objet sélectionné d’une case.
- `Espace` : transférer automatiquement entre coffre et mallette.
- `Entrée` : utiliser l’action contextuelle disponible.
- `Tab` / `Maj+Tab` : parcourir les objets.
- Double-clic ou clic droit : pivoter.

## Contenu

- 12 contrats de campagne progressifs.
- Contrats aléatoires.
- Bac à sable.
- Deux grilles : mallette et coffre de stockage.
- Rotation à 90°, collision et verrouillage sur grille.
- Chargement des armes, consommation de soins, combinaison de plantes et montage d’accessoires.
- Annulation, réinitialisation, rangement automatique, score, rang et sauvegarde locale.
- Interface responsive compatible souris, clavier et tactile.
- Sons procéduraux sans ressource externe.
- Fonctionnement hors ligne et manifeste PWA.

## Vérification

Le projet ne nécessite aucune dépendance d’exécution. Avec Node.js installé :

```bash
npm test
```

Ce contrôle valide la syntaxe JavaScript, les 12 contrats, les modes campagne/aléatoire/bac à sable, les fichiers du shell PWA et la protection contre le gel du générateur aléatoire.

## Publication

Le projet est prévu pour un hébergement statique. La configuration `vercel.json` force la revalidation du service worker afin que les nouvelles versions du jeu remplacent correctement l’ancien cache hors ligne.

Les informations de provenance et les contrôles de reprise sont conservés dans [`CODEX_HANDOFF.md`](CODEX_HANDOFF.md).

## Propriété intellectuelle

Ce projet n’emploie aucun logo, nom d’objet, image, son, personnage, décor ou fichier issu de *Resident Evil* ou de Capcom. Le code, l’interface, le titre et les ressources vectorielles sont originaux. Le principe général d’un inventaire spatial à grille est réinterprété sous une identité indépendante.
