# Target style: "Gap"

Hidden ground truth for evaluation. Demo corrections apply these rules; validators and the judge measure against them.

## Canvas and strokes

1. The root is `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">`.
2. Child elements do not override `stroke`, `stroke-width`, `stroke-linecap` or `stroke-linejoin`.
3. Keep all geometry inside the safe zone from 3 to 21 on both axes: 3 units of padding on every side.
4. Use at most two decimal places in any coordinate.

## Geometry

5. Use only straight lines and circular arcs: `path` with `M L H V A Z` commands, `line`, `polyline`, `polygon`, `circle` and `rect`. No Bézier curves (`C S Q T`).
6. Use at most five stroked elements.
7. No text, letters or numerals.

## Signature

8. The main outline is never closed: leave a gap of roughly a quarter turn or one corner, usually at the top right.
9. Every icon has exactly one accent: `<circle class="accent" r="1.5" fill="currentColor" stroke="none" .../>`, placed in the gap of the main outline. The app colours it with CSS.

## Feel

10. Draw the object itself as its simplest recognisable silhouette, not a scene or a metaphor of a metaphor.
11. Keep detail low: generous negative space, no hatching, no small decorations.
12. Balance the visual mass around the centre; the accent is the only solid shape.
