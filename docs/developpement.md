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

**Dernière mise à jour : juin 2025**
