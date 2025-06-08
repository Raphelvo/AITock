# Documentation du développement de AITock

Ce dossier contient la documentation détaillée des étapes de développement du module AITock pour Foundry VTT.

## Historique des tâches effectuées

- [x] Création de la structure du projet
- [x] Rédaction de la documentation initiale

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
