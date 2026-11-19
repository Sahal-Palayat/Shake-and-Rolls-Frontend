'use client';

import { useEffect, useRef, useState } from 'react';

/** `isRevealed` flips to true once, the first time the element is 25% visible. */
export function useRevealOnView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setIsRevealed(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, isRevealed };
}
