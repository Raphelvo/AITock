/**
 * Démarre une partie de Tock :
 * - Efface tous les anciens PJ (Actors de type "character")
 * - Réinitialise les places disponibles
 * - Affiche un message dans le chat avec les places à prendre
 */
const couleursJoueurs = [
    "#e74c3c", // Joueur 1 - Rouge
    "#3498db", // Joueur 2 - Bleu
    "#27ae60", // Joueur 3 - Vert
    "#f1c40f", // Joueur 4 - Jaune
    "#9b59b6", // Joueur 5 - Violet
    "#e67e22"  // Joueur 6 - Orange
];

export async function demarrerPartieTock() {
    const anciensPJ = game.actors?.filter((a: any) => a.type === "character") ?? [];
    for (const pj of anciensPJ) {
        await pj.delete();
    }

    const nbJoueurs = parseInt(game.settings.get("aitock", "nombreJoueurs") ?? "4");
    // Réinitialise les places (tableau d'userId ou null)
    const places = Array(nbJoueurs).fill(null);
    await game.settings.set("aitock", "placesTock", places);

    afficherChoixPlacesTock();
}

/**
 * Affiche le message de choix de place dans le chat.
 */
function afficherChoixPlacesTock() {
    const nbJoueurs = parseInt(game.settings.get("aitock", "nombreJoueurs") ?? "4");
    const places: (string|null)[] = game.settings.get("aitock", "placesTock") ?? Array(nbJoueurs).fill(null);
    const modeEquipes = game.settings.get("aitock", "modeEquipes") ?? false;

    // Calcul dynamique du nombre d'équipes
    let joueursParEquipe = 2;
    if (nbJoueurs === 6) {
        joueursParEquipe = parseInt(game.settings.get("aitock", "joueursParEquipe6") ?? "2");
    }
    const nbEquipes = Math.floor(nbJoueurs / joueursParEquipe);

    let boutons = "";
    for (let i = 0; i < nbJoueurs; i++) {
        const userId = places[i];
        let equipeStr = "";
        if (modeEquipes) {
            const numEquipe = (i % nbEquipes) + 1;
            equipeStr = ` <span style="font-size:0.9em; color:#888;">[Équipe${numEquipe}]</span>`;
        }
        let couleur = couleursJoueurs[i % couleursJoueurs.length];
        let name = "Pris";
        if (userId) {
            const user = game.users?.get(userId);
            name = user?.name ?? "Pris";
            // Cherche l'Actor associé à ce joueur
            const actor = game.actors?.find((a: any) => a.hasPlayerOwner && a.ownership[userId] === 3);
            // Prend la couleur du flag si présente, sinon celle du user, sinon couleur par défaut
            couleur = actor?.getFlag("aitock", "couleurJoueur") || user?.color || couleur;
            boutons += `<span style="font-weight:bold;">J${i + 1} : <span style="color:${couleur};">${name}</span>${equipeStr}</span> `;
            if (userId === game.userId) {
                boutons += `<button data-action="quitter-tock" data-joueur="${i+1}" style="margin-left:0.5em;">Quitter</button> `;
            }
        } else {
            boutons += `<button data-action="participer-tock" data-joueur="${i+1}"><span style="color:${couleur};">Joueur${i+1}</span>${equipeStr}</button> `;
        }
    }

    const html = `
        <div>
            <strong>Démarrage de la partie de Tock !</strong><br>
            Place libre dans la partie, cliquez sur celle que vous voulez prendre :<br>
            ${boutons}
        </div>
    `;
    ChatMessage.create({ content: html });
}

// Hook pour gérer le clic sur un bouton de place
Hooks.on("renderChatMessageHTML", (message: any, html: HTMLElement) => {
    html.querySelectorAll('button[data-action="participer-tock"]').forEach(btn => {
        btn.addEventListener("click", () => {
            const joueurNum = (btn as HTMLButtonElement).dataset.joueur;
            participerTock(game.userId, joueurNum ? parseInt(joueurNum) : undefined, message.id);
        });
    });
    html.querySelectorAll('button[data-action="quitter-tock"]').forEach(btn => {
        btn.addEventListener("click", () => {
            const joueurNum = (btn as HTMLButtonElement).dataset.joueur;
            quitterTock(game.userId, joueurNum ? parseInt(joueurNum) : undefined);
        });
    });
});

/**
 * Fonction appelée quand un joueur clique sur "Participer" dans le chat.
 */
export async function participerTock(userId: string, joueurNum?: number, chatMessageId?: string) {
    if (!joueurNum) return;
    const nbJoueurs = parseInt(game.settings.get("aitock", "nombreJoueurs") ?? "4");
    let places: (string|null)[] = game.settings.get("aitock", "placesTock") ?? Array(nbJoueurs).fill(null);

    // Calcul dynamique du nombre d'équipes
    let joueursParEquipe = 2;
    if (nbJoueurs === 6) {
        joueursParEquipe = parseInt(game.settings.get("aitock", "joueursParEquipe6") ?? "2");
    }
    const nbEquipes = Math.floor(nbJoueurs / joueursParEquipe);
    const numEquipe = (joueurNum - 1) % nbEquipes + 1;

    // Vérifie si la place est déjà prise
    if (places[joueurNum - 1]) {
        ui.notifications?.warn("Désolé, la place est déjà prise.");
        return;
    }
    if (places.includes(userId)) {
        ui.notifications?.info("Vous avez déjà choisi une place.");
        return;
    }

    // Attribue la place au joueur
    places[joueurNum - 1] = userId;
    await game.settings.set("aitock", "placesTock", places);

    const nom = `Joueur${joueurNum}`;
    const couleurJoueur = couleursJoueurs[(joueurNum - 1) % couleursJoueurs.length];

    // Recherche des partenaires d'équipe (hors soi-même)
    let partenaires: number[] = [];
    if (nbEquipes > 1) {
        for (let i = 1; i <= nbJoueurs; i++) {
            if (i !== joueurNum && ((i - 1) % nbEquipes + 1) === numEquipe) {
                partenaires.push(i);
            }
        }
    }

    const actorType = game.settings.get("aitock", "actorType") ?? "character";
    const userObj = game.users?.get(userId);
    const nomActeur = userObj ? `${userObj.name} (${joueurNum})` : `Joueur${joueurNum}`;
    await Actor.create({
        name: nomActeur,
        type: actorType,
        ownership: { [userId]: 3, default: 0 }, // <--- Ajoute default: 0 pour forcer la propriété
        flags: {
            aitock: {
                couleurJoueur,
                numeroJoueur: joueurNum,
                equipe: numEquipe,
                partenaires
            }
        }
    });
    ui.notifications?.info(`Votre PJ "${nom}" a été créé !`);

    // Met à jour la couleur de l'utilisateur Foundry si différente
    const user = game.users?.get(userId);
    if (user && user.color !== couleurJoueur) {
        await user.update({ color: couleurJoueur });
    }

    afficherChoixPlacesTock();
}

/**
 * Fonction appelée quand un joueur clique sur "Quitter" dans le chat.
 */
export async function quitterTock(userId: string, joueurNum?: number) {
    if (!joueurNum) return;
    const nbJoueurs = parseInt(game.settings.get("aitock", "nombreJoueurs") ?? "4");
    let places: (string|null)[] = game.settings.get("aitock", "placesTock") ?? Array(nbJoueurs).fill(null);

    // Retire la place si c'est bien le joueur courant
    if (places[joueurNum - 1] === userId) {
        places[joueurNum - 1] = null;
        await game.settings.set("aitock", "placesTock", places);

        console.log("[AITock] Recherche suppression :",
    game.actors?.map((a: any) => ({
        name: a.name,
        type: a.type,
        hasPlayerOwner: a.hasPlayerOwner,
        ownership: a.ownership[userId],
        numeroJoueur: a.getFlag("aitock", "numeroJoueur")
    }))
);

        // Supprime le PJ associé à ce joueur (créé par le module)
        const actorType = game.settings.get("aitock", "actorType") ?? "character";
        const actor = game.actors?.find((a: any) =>
            a.type === actorType &&
            a.ownership && a.ownership[userId] === 3 &&
            String(a.getFlag("aitock", "numeroJoueur")) === String(joueurNum)
        );
        if (actor) {
            await actor.delete();
        } else {
            console.warn("[AITock] Aucun acteur trouvé à supprimer pour userId", userId, "num", joueurNum);
        }

        ui.notifications?.info("Vous avez quitté la place.");
        afficherChoixPlacesTock();
    }
}

// Met à jour l'affichage des places si la couleur de l'utilisateur change
Hooks.on("updateUser", async (user: any, data: any) => {
    if (data.color) {
        afficherChoixPlacesTock();
    }
});





