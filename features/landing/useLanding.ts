'use client';

import { useRouter } from 'next/navigation';
import type { LandingPageProps } from '@/ui/landing/LandingPage';
import type { LookingWrapEye } from '@/ui/landing/LookingWrap';
import {
  BADGE, CANVAS, CTA_COPY, GIANT_WORDS, HERO_COPY, HERO_IMAGE, HERO_VIEWBOX, LOOK_CONFIG,
  MENU_ROUTE, NAV, SPARKLES, STICKERS, SUNBURST, WAVE,
} from './content';
import { ringPath, sparklePath, stickerLines, sunburstPath, wavePathAt } from './geometry';
import { useLookingEyes } from './useLookingEyes';
import { useRevealOnView } from './useRevealOnView';
import { useWaveAnimation } from './useWaveAnimation';

const toEye = (e: (typeof LOOK_CONFIG.eyes)[number]): LookingWrapEye => ({
  cx: e.cx,
  cy: e.cy,
  clipRadius: e.r - 2,
  pupilRx: e.rx,
  pupilRy: e.ry,
  glintX: -e.rx * 0.4,
  glintY: -e.ry * 0.4,
});

// Static art: built once, not per render.
const SUNBURST_PROPS = {
  cx: SUNBURST.cx,
  cy: SUNBURST.cy,
  transformOrigin: `${SUNBURST.cx}px ${SUNBURST.cy}px`,
  path: sunburstPath(),
};
const INITIAL_WAVE_PATH = wavePathAt(0);
const BADGE_INNER = BADGE.radius - 24;

/** Everything the landing page UI needs, minus the pick cards (they own their own hooks). */
export function useLanding(): Omit<LandingPageProps, 'picks'> {
  const router = useRouter();
  const eyes = useLookingEyes();
  const wave = useWaveAnimation();
  const gallery = useRevealOnView<HTMLDivElement>();

  const goToMenu = () => router.push(MENU_ROUTE);

  return {
    hero: {
      ariaLabel: HERO_COPY.ariaLabel,
      navbar: { ...NAV, onFindUs: () => {}, onMenu: goToMenu },
      lookingWrap: {
        src: HERO_IMAGE.src,
        alt: HERO_IMAGE.alt,
        priority: true,
        canvasWidth: CANVAS.w,
        canvasHeight: CANVAS.h,
        viewBox: `0 0 ${CANVAS.w} ${CANVAS.h}`,
        eyeLeft: toEye(LOOK_CONFIG.eyes[0]),
        eyeRight: toEye(LOOK_CONFIG.eyes[1]),
        ...eyes,
      },
      textsBack: { viewBox: HERO_VIEWBOX, sunburst: SUNBURST_PROPS, words: GIANT_WORDS },
      textsFront: {
        viewBox: HERO_VIEWBOX,
        heading: HERO_COPY.heading,
        stickers: STICKERS.map((s) => ({
          id: s.id, x: s.x, y: s.y, rotate: s.rotate, delay: s.delay, fontSize: s.size,
          lines: stickerLines(s.lines, s.size, s.leading),
        })),
        badge: {
          x: BADGE.x,
          y: BADGE.y,
          radius: BADGE.radius,
          innerRadius: BADGE.radius - 6,
          delay: BADGE.delay,
          label: HERO_COPY.badgeLabel,
          ringPath: ringPath(BADGE_INNER),
          ringTextLength: 2 * Math.PI * BADGE_INNER - 6,
          sparklePath: sparklePath(26),
        },
        sparkles: SPARKLES.map((s) => ({
          id: s.id, x: s.x, y: s.y, rotate: s.rotate, delay: s.delay, path: sparklePath(s.size),
        })),
      },
    },
    ctaSection: {
      ariaLabel: CTA_COPY.ariaLabel,
      sectionRef: wave.sectionRef,
      pathRef: wave.pathRef,
      wavePath: INITIAL_WAVE_PATH,
      waveViewBox: `0 0 ${WAVE.width} ${WAVE.height}`,
    },
    ctaContent: {
      title: CTA_COPY.title,
      ctaLabel: CTA_COPY.buttonLabel,
      onCtaClick: goToMenu,
      galleryRef: gallery.ref,
      isGalleryRevealed: gallery.isRevealed,
    },
  };
}
