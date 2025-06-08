import { creerPlateau, CaseTock } from "./plateau";

/** Type pour un joueur */
export interface JoueurTock {
    id: number;
    couleur: string;
    pions: PionTock[];
}

/** Type pour un pion */
export interface PionTock {
    id: number;
    joueurId: number;
    couleur: string;
    positionCaseId: number; // id de la case où se trouve le pion
    estProtégé: boolean;
}

/**
 * Initialise les données de la partie : joueurs, pions, plateau.
 * @param nbJoueurs Nombre de joueurs
 * @param couleurs Tableau des couleurs choisies
 */
export function initialiserPartie(nbJoueurs: number, couleurs: string[]): { joueurs: JoueurTock[], plateau: CaseTock[] } {
    // Génère le plateau
    const plateau = creerPlateau(nbJoueurs);

    // Crée les joueurs et leurs pions, place chaque pion sur une case de départ
    const joueurs: JoueurTock[] = [];
    for (let j = 0; j < nbJoueurs; j++) {
        const joueurId = j + 1;
        const couleur = couleurs[j];
        // Récupère les 4 cases de départ du joueur
        const casesDepart = plateau.filter(c => c.type === "depart" && c.proprietaireJoueurId === joueurId);
        const pions: PionTock[] = [];
        for (let p = 0; p < 4; p++) {
            const pion: PionTock = {
                id: p + 1,
                joueurId,
                couleur,
                positionCaseId: casesDepart[p]?.id ?? -1,
                estProtégé: true
            };
            pions.push(pion);
            // Place le pion sur la case de départ correspondante
            if (casesDepart[p]) {
                casesDepart[p].pion = {
                    joueurId,
                    couleur,
                    estProtégé: true
                };
            }
        }
        joueurs.push({ id: joueurId, couleur, pions });
    }

    return { joueurs, plateau };
}