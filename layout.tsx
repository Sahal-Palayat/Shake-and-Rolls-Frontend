import "./globals.css";
import {
  Pacifico,
  Londrina_Solid,
  Titan_One,
  Anton,
  Barlow_Condensed,
  Lilita_One,
} from "next/font/google";

const display = Londrina_Solid({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const chunky = Titan_One({ subsets: ["latin"], weight: "400", variable: "--font-chunky" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-condensed" });
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-body-condensed",
});
const lilita = Lilita_One({ subsets: ["latin"], weight: "400", variable: "--font-lilita" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400", variable: "--font-pacifico" });

const fontVars = [
  pacifico, display, chunky, anton, barlow, lilita,
].map((f) => f.variable).join(" ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}