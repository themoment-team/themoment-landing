/* Shared geometry for the shattered-glass treatment, which the hero wordmark
   is now the only thing to use. It works in its own SVG viewBox, so the grid
   is generated in the unit square and the caller scales it. */

export function rnd(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* Triangles tiling the unit square. Interior vertices are jittered so the
   facets are irregular — an even grid reads as a waffle, not a fracture — but
   the outer edge is left alone. Move the edge and the triangles stop tiling
   the square exactly, which shows up as holes in whatever is being faceted. */
export function buildFacetGrid({ cols, rows, jitter = 0.55, seed = 0 }) {
  const grid = [];
  for (let j = 0; j <= rows; j++) {
    grid[j] = [];
    for (let i = 0; i <= cols; i++) {
      const onEdgeX = i === 0 || i === cols;
      const onEdgeY = j === 0 || j === rows;
      grid[j][i] = {
        x:
          i / cols +
          (onEdgeX
            ? 0
            : ((rnd(seed + i * 31 + j * 7) - 0.5) * jitter) / cols),
        y:
          j / rows +
          (onEdgeY
            ? 0
            : ((rnd(seed + i * 13 + j * 71) - 0.5) * jitter) / rows),
      };
    }
  }

  const triangles = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = grid[j][i];
      const b = grid[j][i + 1];
      const c = grid[j + 1][i + 1];
      const d = grid[j + 1][i];
      // alternate the split so the facets do not all lean the same way
      const pair =
        (i + j) % 2 === 0
          ? [
              [a, b, c],
              [a, c, d],
            ]
          : [
              [a, b, d],
              [b, c, d],
            ];
      triangles.push(...pair);
    }
  }

  return triangles.map((points) => ({
    points,
    cx: (points[0].x + points[1].x + points[2].x) / 3,
    cy: (points[0].y + points[1].y + points[2].y) / 3,
  }));
}

/* Neighbouring clips share an edge, and two antialiased edges butted together
   leave a hairline of background showing between them. Push a vertex away
   from its centroid so the facets overlap instead; they carry identical
   content once resolved, so the overlap is invisible. */
export function bleedVertex(p, cx, cy, amount) {
  const dx = p.x - cx;
  const dy = p.y - cy;
  const len = Math.hypot(dx, dy) || 1;
  return { x: p.x + (dx / len) * amount, y: p.y + (dy / len) * amount };
}
