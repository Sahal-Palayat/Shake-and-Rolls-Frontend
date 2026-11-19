// Copy, asset paths and tuning numbers for the landing page. No styling here.

export const CANVAS = { w: 1699, h: 926 };
export const HERO_VIEWBOX = '0 0 1917 1045';

export const HERO_IMAGE = {
  src: '/hero/hero-character3.png',
  alt: 'A wrap character in a beret sipping a milkshake and looking around',
};

export const NAV = {
  logoSrc: '/logo/Shake & Rolls-03.png',
  logoAlt: 'Shake & Rolls logo',
  findUsLabel: 'Find us',
  menuLabel: 'Menu',
};

export const HERO_COPY = {
  ariaLabel: 'Shake&Rolls',
  heading: 'Wraps & Shakes. Rolled fresh. Freshly made. Seriously loaded.',
  badgeLabel: 'FRESH • ROLLED • DAILY •',
};

export const CTA_COPY = {
  ariaLabel: 'Order',
  title: 'Our picks',
  buttonLabel: 'Order now',
  waiterSrc: '/sticker/waiter.png',
};

export const PICKS: { id: string; label: string; imageSrc: string | null; rotation: number }[] = [
  { id: 'pick-1', label: 'Image 1', imageSrc: '/CTA/1.jpg', rotation: -4 },
  { id: 'pick-2', label: 'Image 2', imageSrc: '/CTA/2.jpg', rotation: 2 },
  { id: 'pick-3', label: 'Image 3', imageSrc: '/CTA/3.jpg', rotation: 5 },
];

/** Where the menu lives. The order menu is the site's main page. */
export const MENU_ROUTE = '/';

// Coordinates are in the 1699 x 926 canvas of the hero image.
export const LOOK_CONFIG = {
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

// Hero art layout (1917 x 1045 space).
export const SUNBURST = { cx: 1000, cy: 560, rays: 28, radius: 1700 };
export const GIANT_WORDS = [
  { id: 'wraps', text: 'WRAPS', x: 48, width: 650, delay: 0.1 },
  { id: 'shakes', text: 'SHAKES', x: 1340, width: 530, delay: 0.3 },
];
export const STICKERS = [
  { id: 'rolled-fresh', x: 330, y: 295, rotate: -11, delay: 0.7, size: 62, leading: 0.88, lines: ['ROLLED', 'FRESH'] },
  { id: 'thick-loaded', x: 1700, y: 705, rotate: 8, delay: 0.9, size: 62, leading: 0.88, lines: ['THICK &', 'LOADED'] },
];
export const BADGE = { x: 620, y: 140, radius: 84, delay: 1.1 };
export const SPARKLES = [
  { id: 'sparkle-1', x: 705, y: 700, size: 26, rotate: -8, delay: 0 },
  { id: 'sparkle-2', x: 1560, y: 760, size: 30, rotate: 10, delay: 1.2 },
];

// CTA wave: one entry per control point.
export const WAVE = {
  width: 1440,
  height: 160,
  points: [
    { base: 56, amp: 26, speed: 0.55, phase: 0.0 },
    { base: 34, amp: 18, speed: 0.8, phase: 1.7 },
    { base: 108, amp: 34, speed: 0.48, phase: 3.1 },
    { base: 44, amp: 22, speed: 0.72, phase: 4.6 },
    { base: 86, amp: 28, speed: 0.61, phase: 2.2 },
    { base: 38, amp: 20, speed: 0.9, phase: 5.4 },
  ],
};
