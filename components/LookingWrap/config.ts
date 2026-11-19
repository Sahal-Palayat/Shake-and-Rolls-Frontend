// All coordinates are in the 1699 x 926 canvas of the hero image.
// If your image canvas changes or the character moves, update these numbers.
export const CANVAS = { w: 1699, h: 926 };

export const LOOK_CONFIG = {
  // cx, cy, r  = eye circle (the white of the eye, inside the dark outline)
  // rx, ry     = pupil size (it is slightly oval in this image)
  // rest       = where the pupil sits before the cursor moves
  eyes: [
    { cx: 823, cy: 401, r: 58, rx: 27, ry: 33, rest: { x: 791, y: 415 } },
    { cx: 1022, cy: 455, r: 60, rx: 28, ry: 34, rest: { x: 985, y: 462 } },
  ],
  head: { x: 990, y: 420 },
  sides: {
    left: { x: 610, y: 330, dir: -1, yClamp: [-90, 90] as [number, number] },
    right: { x: 1380, y: 500, dir: 1, yClamp: [-60, 60] as [number, number] },
  },
  lineOffsets: [
    { dx: 14, dy: -60 },
    { dx: -5, dy: 0 },
    { dx: -7, dy: 64 },
  ],
  lineLen: 52,
  idleAfterMs: 3500,
  idleTargets: [
    { x: 740, y: 700 },
    { x: 1250, y: 300 },
    { x: 520, y: 330 },
    { x: 1000, y: 760 },
    { x: 1100, y: 200 },
  ],
};