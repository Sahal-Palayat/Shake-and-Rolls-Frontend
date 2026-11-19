// components/Hero/HeroHeadline.tsx
export default function HeroHeadline() {
  return (
    <div className="font-[family-name:var(--font-pacifico)] text-[#2B1A0E]">
      <p className="text-[clamp(14px,1.6vw,24px)] text-orange-500">
        Smashed fresh daily
      </p>

      <h1 className="text-[clamp(40px,6vw,96px)] leading-[1.05]">
        The <span className="text-[#F91A17]">Burger</span> you crave
      </h1>

      <p className="mt-4 text-[clamp(14px,1.3vw,20px)] leading-snug">
        Smashed hot on the flat top, our prime patties lock in ultimate
        juiciness under a caramelized crust.
      </p>
    </div>
  );
}