# AITock — Plateau Tock circulaire pour FoundryVTT

Ce module génère automatiquement un plateau de Tock **circulaire** pour FoundryVTT, prêt pour **4 ou 6 joueurs**.  
Les couleurs sont synchronisées avec les joueurs connectés (mise à jour dynamique si changement de couleur).

## Fonctionnalités

- Plateau circulaire généré sans image, purement avec les outils natifs de Foundry.
- Cases de parcours, de base et de maison pour chaque couleur/joueur.
- Jetons de départ générés pour chaque joueur connecté, posés sur leur base.
- Changement de couleur dynamique si un joueur modifie la sienne sur Foundry.
- Prêt pour 4 ou 6 joueurs (modifier simplement la ligne `const TOCK_PLAYER_COUNT = 4;` ou `6` dans `scripts/main.js`).

## Installation

1. Téléchargez ou clonez ce dépôt dans votre dossier de modules FoundryVTT.
2. Activez le module dans votre monde Foundry.
3. Le plateau se génère automatiquement à chaque lancement de la partie.

## Personnalisation

- Pour choisir entre plateau 4 ou 6 joueurs, éditez la constante :

  ```js
  const TOCK_PLAYER_COUNT = 4; // ou 6
  ```

  dans `scripts/main.js`.

- Pour changer les couleurs par défaut, modifiez :

  ```js
  const PLAYER_DEFAULT_COLORS = [ ... ];
  ```

## Licence

MIT

## Auteur

Raphelvo & Copilot