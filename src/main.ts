// Fonction principale du module AITock

export const exampleFunction = () => {
    console.log("Ceci est une fonction exemple du module AITock.");
};

// Affiche une notification traduite à l'ouverture du monde
// @ts-ignore
Hooks.once('ready', () => {
    // @ts-ignore
    const bienvenue = game.i18n.localize("BIENVENUE");
    // @ts-ignore
    ui.notifications?.info(bienvenue);
});
