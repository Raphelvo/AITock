/**
 * Demande le déplacement d'un pion (token) via socket.
 * Si l'utilisateur courant est owner du token, il le déplace directement.
 * Sinon, il envoie la demande via socket au owner.
 * @param tokenId ID du token à déplacer
 * @param x Nouvelle coordonnée X
 * @param y Nouvelle coordonnée Y
 * @param sceneId ID de la scène (optionnel, défaut = scène courante)
 */
export async function demanderDeplacementJeton(tokenId: string, x: number, y: number, sceneId?: string) {
    sceneId = sceneId || canvas.scene.id;
    const scene = game.scenes.get(sceneId);
    if (!scene) return;
    const token = scene.tokens.get(tokenId);
    if (token && token.isOwner) {
        await token.update({ x, y });
    } else {
        game.socket.emit("module.aitock", {
            action: "moveToken",
            data: { tokenId, sceneId, x, y }
        });
    }
}

// Handler côté client : effectue le déplacement si on est owner du token
Hooks.once("ready", () => {
    game.socket.on("module.aitock", async (msg) => {
        if (!msg || msg.action !== "moveToken") return;
        const { tokenId, sceneId, x, y } = msg.data;
        const scene = game.scenes.get(sceneId);
        if (!scene) return;
        const token = scene.tokens.get(tokenId);
        if (!token) return;
        if (!token.isOwner) return;
        await token.update({ x, y });
    });
});