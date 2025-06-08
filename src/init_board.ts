export type TypeCase = "normale" | "depart" | "arrivee";

export interface CaseTock {
    id: number;
    type: TypeCase;
    proprietaireJoueurId?: number;
    suivantes: number[];    // Tableau d'id des cases suivantes possibles
    precedentes: number[];  // Tableau d'id des cases précédentes possibles
    effetSpecial?: string;
    pion?: {
        joueurId: number;
        couleur: string;
        estProtégé: boolean;
    } | null;
}

/**
 * Génère le plateau de Tock selon les règles (18 cases de parcours, 4 départs, 4 arrivées par joueur).
 * Les connexions spéciales sont respectées.
 * @param nbJoueurs Nombre de joueurs (2 à 6)
 */
export function creerPlateau(nbJoueurs: number): CaseTock[] {
    const cases: CaseTock[] = [];
    const casesParJoueur = 18;
    const nbDeparts = 4;
    const nbArrivees = 4;
    let id = 0;

    // Pour chaque joueur, on stocke les ids des cases importantes
    const departIds: number[][] = [];
    const arriveeIds: number[][] = [];
    const parcoursIds: number[][] = [];

    // Création des cases de chaque joueur
    for (let joueur = 1; joueur <= nbJoueurs; joueur++) {
        departIds[joueur] = [];
        arriveeIds[joueur] = [];
        parcoursIds[joueur] = [];

        // Cases de départ
        for (let d = 0; d < nbDeparts; d++) {
            cases.push({
                id,
                type: "depart",
                proprietaireJoueurId: joueur,
                suivantes: [],
                precedentes: []
            });
            departIds[joueur].push(id);
            id++;
        }

        // Cases du parcours principal
        for (let p = 0; p < casesParJoueur; p++) {
            cases.push({
                id,
                type: "normale",
                proprietaireJoueurId: joueur,
                suivantes: [],
                precedentes: []
            });
            parcoursIds[joueur].push(id);
            id++;
        }

        // Cases d'arrivée
        for (let a = 0; a < nbArrivees; a++) {
            cases.push({
                id,
                type: "arrivee",
                proprietaireJoueurId: joueur,
                suivantes: [],
                precedentes: []
            });
            arriveeIds[joueur].push(id);
            id++;
        }
    }

    // Relier les cases du parcours principal en cercle
    for (let joueur = 1; joueur <= nbJoueurs; joueur++) {
        for (let p = 0; p < casesParJoueur; p++) {
            const currentId = parcoursIds[joueur][p];
            let nextJoueur = joueur;
            let nextP = p + 1;
            if (nextP >= casesParJoueur) {
                nextJoueur = joueur % nbJoueurs + 1;
                nextP = 0;
            }
            const nextId = parcoursIds[nextJoueur][nextP];
            cases[currentId].suivantes.push(nextId);
            cases[nextId].precedentes.push(currentId);
        }
    }

    // Relier les cases de départ à la 18e case du joueur précédent
    for (let joueur = 1; joueur <= nbJoueurs; joueur++) {
        const prevJoueur = joueur === 1 ? nbJoueurs : joueur - 1;
        const cibleId = parcoursIds[prevJoueur][casesParJoueur - 1];
        for (const departId of departIds[joueur]) {
            cases[departId].suivantes.push(cibleId);
            cases[cibleId].precedentes.push(departId);
        }
    }

    // Relier la 16e case du joueur précédent à la 1ère case d'arrivée du joueur courant
    for (let joueur = 1; joueur <= nbJoueurs; joueur++) {
        const prevJoueur = joueur === 1 ? nbJoueurs : joueur - 1;
        const case16Id = parcoursIds[prevJoueur][15]; // 16e case (index 15)
        const arrivee1Id = arriveeIds[joueur][0];
        // Ici, la 16e case a deux suites possibles : la suite du parcours ET la 1ère arrivée
        cases[case16Id].suivantes.push(arrivee1Id);
        cases[arrivee1Id].precedentes.push(case16Id);

        // Relier les cases d'arrivée entre elles
        for (let a = 0; a < nbArrivees - 1; a++) {
            cases[arriveeIds[joueur][a]].suivantes.push(arriveeIds[joueur][a + 1]);
            cases[arriveeIds[joueur][a + 1]].precedentes.push(arriveeIds[joueur][a]);
        }
        // La dernière case d'arrivée n'a pas de suivante
    }

    return cases;
}