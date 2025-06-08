# Documentation du développement de AITock

Ce dossier contient la documentation détaillée des étapes de développement du module AITock pour Foundry VTT.

## Historique des tâches effectuées

- [x] Création de la structure du projet
- [x] Rédaction de la documentation initiale
- [x] Compilation TypeScript/JS fonctionnelle (dist/main.js généré sans erreur)
- [x] Exposition d'une fonction globale (window.AITock) pour macros/utilisateurs

## Structure des fichiers du module

| Fichier                | Rôle                                                                 | Fonctions accessibles de l’extérieur                |
|------------------------|----------------------------------------------------------------------|-----------------------------------------------------|
| `src/main.ts`          | Point d’entrée du module. Initialise le module, expose l’API globale | `window.AITock.exampleFunction()`                   |
| `src/config.ts`        | Déclaration et enregistrement des paramètres configurables du module | (aucune fonction globale, tout est interne)         |
| `src/init_board.ts`    | Création et gestion du plateau de jeu (cases, liens, mémoire)        | `creerPlateau()`                                    |
| `src/init_partie.ts`   | Orchestration Foundry : gestion des PJ, chat, démarrage de partie    | `demarrerPartieTock()`, `participerTock()`          |
| `src/gestion_partie.ts`| Gestion des joueurs, pions, logique d’initialisation de partie       | `initialiserPartie()`                               |
| `src/global.d.ts`      | Déclaration de l’extension de l’objet global `window`                | (déclaration de type, pas de fonction)              |
| `dist/main.js`         | Fichier JavaScript généré, chargé par Foundry                        | `window.AITock.exampleFunction()`, `window.AITock.demarrerPartieTock()` |
| `lang/fr.json`         | Fichier de traduction française                                      | (utilisé par Foundry pour l’internationalisation)   |
| `lang/en.json`         | Fichier de traduction anglaise                                       | (utilisé par Foundry pour l’internationalisation)   |
| `module.json`          | Manifest du module pour Foundry VTT                                  | (décrit les scripts, styles, langues, etc.)         |

### Fonctions accessibles globalement

- **`window.AITock.exampleFunction()`**  
  Fonction d’exemple accessible depuis la console ou une macro utilisateur.
- **`window.AITock.demarrerPartieTock()`**  
  Lance la séquence de démarrage de partie (suppression des anciens PJ, message de participation dans le chat).
- **`window.AITock.participerTock()`**  
  Création d’un PJ pour le joueur qui clique sur “Participer” dans le chat.

---

## Actions

- [ ] Configuration des règles (options paramétrées dans le jeu)
- [ ] Création du plateau de jeu
- [ ] Gestion des pions
- [ ] Déplacement des pions sans gamemaster
- [ ] Ajout des cartes et gestion des cas particuliers

---

## Détails des étapes

### 1. Configuration des règles
- Définir les options paramétrées (nombre de joueurs, équipes ou non, variantes de règles, etc.)
- Ajouter une interface de configuration dans Foundry VTT
- Stocker les paramètres dans les settings du module

### 2. Création du plateau de jeu
- Représenter graphiquement le plateau de tock
- Adapter le plateau selon le nombre de joueurs
- Placer le plateau sur la scène Foundry VTT

### 3. Gestion des pions
- Créer les pions pour chaque joueur
- Associer chaque pion à un joueur et à une couleur
- Placer les pions sur le plateau au début de la partie

### 4. Déplacement des pions sans gamemaster
- Permettre aux joueurs de déplacer leurs pions
- Gérer les collisions, les retours à la base, et les déplacements spéciaux
- Automatiser les actions sans intervention du gamemaster

### 5. Ajout des cartes et cas particuliers
- Ajouter la pioche et la gestion des cartes
- Implémenter les effets spéciaux de chaque carte
- Gérer les cas particuliers et les règles avancées

---

Chaque étape fera l'objet d'un suivi dans ce fichier.
