import type { ReactNode, Ref } from 'react';

export type PickCardProps = {
  label: string;
  /** null renders the striped placeholder. */
  imageSrc: string | null;
  slotRef: Ref<HTMLDivElement>;
  innerRef: Ref<HTMLDivElement>;
  /** Optional overlay, e.g. the Waiter sticker. */
  children?: ReactNode;
};

export function PickCard(p: PickCardProps) {
  return (
    <div className="sr-pickwrap">
      <div ref={p.slotRef} className="sr-pick">
        <div ref={p.innerRef} className="sr-pick__inner">
          {p.imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.imageSrc} alt={p.label} draggable={false} />
          ) : (
            <div className="sr-pick__ph">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <circle cx="12" cy="12" r="3.5" />
                <path d="M8 5l1.2-2h5.6L16 5" />
              </svg>
              {p.label}
            </div>
          )}
        </div>
      </div>
      {p.children}
    </div>
  );
}
