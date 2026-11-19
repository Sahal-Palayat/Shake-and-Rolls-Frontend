export type HeroActionsProps = {
  label: string;
  onClick: () => void;
};

export function HeroActions(p: HeroActionsProps) {
  return (
    <button
      type="button"
      onClick={p.onClick}
      className="rounded-3xl bg-[var(--lp-wave-orange)] px-6 py-3 font-[family-name:var(--font-pacifico)] text-[clamp(16px,2vw,28px)] transition duration-300 hover:scale-105"
    >
      {p.label}
    </button>
  );
}
