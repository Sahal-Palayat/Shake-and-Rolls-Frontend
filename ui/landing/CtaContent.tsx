import type { ReactNode, Ref } from 'react';
import { ctaContentCss } from './ctaContentStyles';

export type CtaContentProps = {
  title: string;
  ctaLabel: string;
  onCtaClick: () => void;
  galleryRef: Ref<HTMLDivElement>;
  isGalleryRevealed: boolean;
  /** The pick cards (rendered by the feature layer). */
  children?: ReactNode;
};

export function CtaContent(p: CtaContentProps) {
  return (
    <div className="sr-ctac">
      <style dangerouslySetInnerHTML={{ __html: ctaContentCss }} />
      <h2 className="sr-ctac__title">{p.title}</h2>
      <button type="button" className="sr-ctac__btn" onClick={p.onCtaClick}>{p.ctaLabel}</button>
      <div ref={p.galleryRef} className={p.isGalleryRevealed ? 'sr-ctac__gallery is-in' : 'sr-ctac__gallery'}>
        {p.children}
      </div>
    </div>
  );
}
