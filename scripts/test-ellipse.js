Hooks.once("ready", async () => {
  const scene = game.scenes.active;
  await scene.createEmbeddedDocuments("Drawing", [{
    type: "ellipse",
    x: 500,
    y: 500,
    width: 200,
    height: 150,
    fillColor: "#ff0000",
    fillAlpha: 0.5,
    strokeColor: "#000000",
    strokeWidth: 2,
    flags: { AITock: { test: true } }
  }]);
});