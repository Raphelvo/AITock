/**
 * Démarre une partie de Tock :
 * - Efface tous les anciens PJ (Actors de type "character")
 * - Affiche un message dans le chat avec un bouton "Participer"
 */
export async function demarrerPartieTock() {
    const anciensPJ = game.actors?.filter((a: any) => a.type === "character") ?? [];
    for (const pj of anciensPJ) {
        await pj.delete();
    }

    const html = `
        <div>
            <strong>Démarrage de la partie de Tock !</strong><br>
            Cliquez sur <button data-action="participer-tock">Participer</button> pour rejoindre la partie.
        </div>
    `;
    ChatMessage.create({ content: html });
}

/**
 * Fonction appelée quand un joueur clique sur "Participer" dans le chat.
 */
export async function participerTock(userId: string) {
    const user = game.users?.get(userId);
    if (!user) return;
    const dejaPJ = game.actors?.find((a: any) => a.hasPlayerOwner && a.ownership[userId] === 3);
    if (dejaPJ) {
        ui.notifications?.info("Vous avez déjà un PJ pour cette partie.");
        return;
    }
    await Actor.create({
        name: `Joueur ${user.name}`,
        type: "character",
        ownership: { [userId]: 3 }
    });
    ui.notifications?.info("Votre PJ a été créé !");
}

// Rends les fonctions accessibles globalement
window.AITock = {
    ...window.AITock,
    demarrerPartieTock
};

// Utilise le nouveau hook pour le bouton "Participer"
Hooks.on("renderChatMessageHTML", (message: any, html: HTMLElement) => {
    const btn = html.querySelector('button[data-action="participer-tock"]');
    if (btn) {
        btn.addEventListener("click", () => {
            participerTock(game.userId);
        });
    }
});