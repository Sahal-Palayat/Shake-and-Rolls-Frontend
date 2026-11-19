import { Anton, Inter, Barlow_Condensed, Lilita_One, Londrina_Solid, Pacifico, Titan_One } from 'next/font/google';

const display = Londrina_Solid({ subsets: ['latin'], weight: '400', variable: '--font-display' });
const chunky = Titan_One({ subsets: ['latin'], weight: '400', variable: '--font-chunky' });
const condensed = Anton({ subsets: ['latin'], weight: '400', variable: '--font-condensed' });
const bodyCondensed = Barlow_Condensed({ subsets: ['latin'], weight: ['800', '900'], variable: '--font-body-condensed' });
const lilita = Lilita_One({ subsets: ['latin'], weight: '400', variable: '--font-lilita' });
const inter = Inter({ subsets: ['latin'], variable: '--font-body-face' });
const pacifico = Pacifico({ subsets: ['latin'], weight: '400', variable: '--font-pacifico' });

/** className for <html> that exposes every font as a CSS variable. */
export const fontVariables = [inter, pacifico, display, chunky, condensed, bodyCondensed, lilita]
  .map((f) => f.variable)
  .join(' ');
