import { MenuIcon } from "lucide-react";
import Image from "next/image";

function RollingText({ children }: { children: string }) {
  return (
    <span className="relative inline-block overflow-hidden">
      {/* original text: slides up and out */}
      <span className="block py-1 transition-transform duration-300 ease-in-out group-hover:-translate-y-full">
        {children}
      </span>
      {/* copy: waits below, pops in from the bottom */}
      <span
        aria-hidden="true"
        className="absolute inset-0 block translate-y-full py-1 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}

const base =
  "group flex items-center gap-2 border-[3px] border-black px-6 py-2.5 " +
  "font-[family-name:var(--font-lilita)] text-2xl uppercase leading-none tracking-wider text-black " +
  "shadow-[4px_4px_0_0_#000] transition-all duration-200 " +
  "hover:translate-x-[2px] hover:translate-y-[2px] hover:rotate-0 hover:scale-105 hover:shadow-[2px_2px_0_0_#000] " +
  "active:translate-x-[4px] active:translate-y-[4px] active:shadow-[0_0_0_0_#000]";

export default function Navbar() {
  return (
    <nav className="fixed top-[15px] left-0 z-10 w-full">
      <div className="flex items-center justify-between">
        <div>
          <Image
            src="/logo/Shake & Rolls-03.png"
            alt="Shake & Rolls logo"
            width={200}
            height={150}
          />
        </div>

        <div className="mr-16 flex items-center gap-6">
          <button
            className={`${base} -rotate-1 rounded-[26px_14px_28px_16px] bg-[#F4E7D2] hover:bg-[#FF5A01]`}
          >
            <RollingText>Find us</RollingText>
          </button>

          <button
            className={`${base} rotate-[1.5deg] rounded-[16px_28px_14px_30px] bg-[#FF5A01] hover:bg-[#F4E7D2]`}
          >
            <RollingText>Menu</RollingText>
            <MenuIcon size={32} strokeWidth={3} />
          </button>
        </div>
      </div>
    </nav>
  );
}