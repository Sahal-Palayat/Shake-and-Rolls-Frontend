import Image from 'next/image';
import type { Ref } from 'react';

export type LookingWrapEye = {
  cx: number;
  cy: number;
  clipRadius: number;
  pupilRx: number;
  pupilRy: number;
  glintX: number;
  glintY: number;
};

export type LookingWrapProps = {
  src: string;
  alt: string;
  priority: boolean;
  canvasWidth: number;
  canvasHeight: number;
  viewBox: string;
  eyeLeft: LookingWrapEye;
  eyeRight: LookingWrapEye;
  /** Refs are filled by the feature layer, which animates them. */
  fxRef: Ref<SVGSVGElement>;
  pupilLeftRef: Ref<SVGGElement>;
  pupilRightRef: Ref<SVGGElement>;
  sightLinesLeftRef: Ref<SVGGElement>;
  sightLinesRightRef: Ref<SVGGElement>;
};

const lineProps = { stroke: 'var(--lp-blue)', strokeWidth: 6, strokeLinecap: 'round' as const };

function Pupil({ eye, groupRef, clipId }: { eye: LookingWrapEye; groupRef: Ref<SVGGElement>; clipId: string }) {
  return (
    <g clipPath={`url(#${clipId})`}>
      <g ref={groupRef}>
        <ellipse rx={eye.pupilRx} ry={eye.pupilRy} fill="var(--lp-pupil)" />
        <circle cx={eye.glintX} cy={eye.glintY} r="7" fill="var(--lp-white)" />
      </g>
    </g>
  );
}

export function LookingWrap(p: LookingWrapProps) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Image
        src={p.src}
        alt={p.alt}
        width={p.canvasWidth}
        height={p.canvasHeight}
        priority={p.priority}
        sizes="(max-width: 1040px) 1040px, 100vw"
        draggable={false}
        style={{ display: 'block', width: '100%', height: 'auto', userSelect: 'none' }}
      />
      <svg
        ref={p.fxRef}
        viewBox={p.viewBox}
        aria-hidden="true"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
      >
        <defs>
          <clipPath id="lw-eye-l">
            <circle cx={p.eyeLeft.cx} cy={p.eyeLeft.cy} r={p.eyeLeft.clipRadius} />
          </clipPath>
          <clipPath id="lw-eye-r">
            <circle cx={p.eyeRight.cx} cy={p.eyeRight.cy} r={p.eyeRight.clipRadius} />
          </clipPath>
        </defs>

        <g ref={p.sightLinesLeftRef}>
          <line {...lineProps} />
          <line {...lineProps} />
          <line {...lineProps} />
        </g>
        <g ref={p.sightLinesRightRef} opacity="0">
          <line {...lineProps} />
          <line {...lineProps} />
          <line {...lineProps} />
        </g>

        <Pupil eye={p.eyeLeft} groupRef={p.pupilLeftRef} clipId="lw-eye-l" />
        <Pupil eye={p.eyeRight} groupRef={p.pupilRightRef} clipId="lw-eye-r" />
      </svg>
    </div>
  );
}
