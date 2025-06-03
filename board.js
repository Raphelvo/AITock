await canvas.drawings.create({
  shape: { type: "ellipse", width: CASE_SIZE, height: CASE_SIZE },
  x, y,
  fillColor: colors[c],
  fillAlpha: 0.85,
  strokeColor: "#222",
  strokeWidth: 4,
  flags: { [MODULE_NAME]: { type: "base", color: colors[c], index: c, order: i } }
});