export type HeroHeadlineProps = {
  eyebrow: string;
  titleLead: string;
  titleHighlight: string;
  titleTrail: string;
  body: string;
};

export function HeroHeadline(p: HeroHeadlineProps) {
  return (
    <div className="font-[family-name:var(--font-pacifico)] text-[var(--lp-ink)]">
      <p className="text-[clamp(14px,1.6vw,24px)] text-[var(--lp-orange)]">{p.eyebrow}</p>
      <h1 className="text-[clamp(40px,6vw,96px)] leading-[1.05]">
        {p.titleLead} <span className="text-[var(--lp-red)]">{p.titleHighlight}</span> {p.titleTrail}
      </h1>
      <p className="mt-4 text-[clamp(14px,1.3vw,20px)] leading-snug">{p.body}</p>
    </div>
  );
}
