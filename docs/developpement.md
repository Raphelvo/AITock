# Documentation du développement de AITock

## Structure des fichiers du module

| Fichier                | Rôle                                                                 | Fonctions accessibles de l’extérieur                |
|------------------------|----------------------------------------------------------------------|-----------------------------------------------------|
| `src/main.ts`          | Point d’entrée du module. Initialise le module, expose l’API globale | `window.AITock.demarrerPartieTock()`, `window.AITock.participerTock()` |
| `src/config.ts`        | Déclaration et enregistrement des paramètres configurables du module | (aucune fonction globale, tout est interne)         |
| `src/init_board.ts`    | Création et gestion du plateau de jeu (cases, liens, mémoire)        | `creerPlateau()`                                    |
| `src/init_partie.ts`   | Orchestration Foundry : gestion des PJ, chat, démarrage de partie    | `demarrerPartieTock()`, `participerTock()`          |
| `src/gestion_partie.ts`| Gestion des joueurs, pions, logique d’initialisation de partie       | `initialiserPartie()`                               |
| `src/global.d.ts`      | Déclaration de l’extension de l’objet global `window`                | (déclaration de type, pas de fonction)              |
| `dist/main.js`         | Fichier JavaScript généré, chargé par Foundry                        | `window.AITock.demarrerPartieTock()`                |
| `lang/fr.json`         | Fichier de traduction française                                      | (utilisé par Foundry pour l’internationalisation)   |
| `lang/en.json`         | Fichier de traduction anglaise                                       | (utilisé par Foundry pour l’internationalisation)   |
| `module.json`          | Manifest du module pour Foundry VTT                                  | (décrit les scripts, styles, langues, etc.)         |

---

## État d’avancement

- [x] Génération dynamique du plateau avec embranchements (cases suivantes/précédentes)
- [x] Gestion des cases de départ, parcours, arrivée pour chaque joueur
- [x] Connexions spéciales (départ vers 18e case adverse, 16e vers arrivée, etc.)
- [x] Affichage du choix des places dans le chat avec couleurs par défaut par joueur
- [x] Gestion du mode équipes (affichage du numéro d’équipe)
- [x] Attribution d’une couleur par défaut à chaque place (modifiable par le joueur Foundry)
- [x] Création automatique du PJ à la prise de place
- [x] Exposition des fonctions principales sur `window.AITock`
- [x] Utilisation du hook moderne `renderChatMessageHTML` (compatible Foundry v13+)
- [x] Paramétrage dynamique via `game.settings`
- [ ] Gestion complète du tour de jeu et des déplacements
- [ ] Gestion des effets spéciaux et règles avancées
- [ ] Interface graphique avancée (tableau, pions, etc.)
- [ ] Tests et corrections multi-utilisateurs

---

## Fonctionnalités implémentées (mise à jour juin 2025)

- Attribution dynamique des places et couleurs par joueur
- Affichage interactif des places dans le chat (prise, libération, couleurs dynamiques)
- Création automatique d’un PJ associé à l’utilisateur (nom = nom utilisateur + numéro de joueur)
- Suppression automatique du PJ associé quand le joueur quitte la partie (ownership correct)
- Sauvegarde dans l’Actor : couleur, numéro, équipe, partenaires
- Génération dynamique du plateau avec connexions précédentes/suivantes pour chaque case (structure circulaire correcte, la précédente de la toute première case pointe bien vers la dernière case du dernier joueur)
- Ajout systématique des propriétés `joueur` et `numeroCase` à chaque case du plateau
- Affichage toujours synchronisé avec la couleur de l’utilisateur Foundry
- Rafraîchissement automatique de la liste si un joueur change sa couleur
- Gestion du mode équipe (affichage, partenaires, numéro d’équipe)
- Paramétrage dynamique via `game.settings` (nombre de joueurs, type d’Actor, etc.)
- Menu déroulant pour choisir le type d’Actor à créer, adapté au système utilisé
- Compilation TypeScript/JS fonctionnelle (`npx vite build`)

## Comportement actuel

- Lorsqu’un joueur prend une place, un acteur est créé avec son nom et son numéro de joueur, et il en devient propriétaire.
- Lorsqu’un joueur quitte la partie, l’acteur associé est supprimé automatiquement.
- Le module est système-agnostique : il s’adapte à la liste des types d’Actor du système Foundry utilisé.
- L’affichage des places dans le chat est mis à jour en temps réel si un joueur change sa couleur.

---

## Prochaine étape : Création automatique des tokens sur les cases de départ

- Lorsqu’un joueur prend une place, 4 tokens doivent être créés automatiquement sur la scène active, positionnés sur les cases de départ correspondant à ce joueur.
- Chaque token doit être associé à l’acteur du joueur.
- Les coordonnées doivent correspondre aux cases de départ du plateau pour ce joueur.
- Les tokens doivent être colorés selon la couleur du joueur.
- Les tokens doivent porter une information permettant d’identifier à quel joueur et à quel pion ils appartiennent.
- Prévoir la suppression automatique des tokens associés quand le joueur quitte la partie.

---

**Prêt pour commit & push !**
