import { Inter, Montserrat, Roboto, Oswald, Anton, Bebas_Neue } from "next/font/google";

/**
 * We export both:
 * - .variable: to apply globally (for consistent rendering)
 * - .style.fontFamily: the actual font-family string to use in Canvas ctx.font
 */
export const fontInter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const fontMontserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-montserrat",
});

export const fontRoboto = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
  variable: "--font-roboto",
});

export const fontOswald = Oswald({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-oswald",
});

export const fontAnton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-anton",
});

export const fontBebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-bebas",
});

export const THUMB_FONT_OPTIONS: { label: string; value: string }[] = [
  { label: "Inter", value: fontInter.style.fontFamily },
  { label: "Montserrat", value: fontMontserrat.style.fontFamily },
  { label: "Roboto", value: fontRoboto.style.fontFamily },
  { label: "Oswald", value: fontOswald.style.fontFamily },
  { label: "Anton", value: fontAnton.style.fontFamily },
  { label: "Bebas Neue", value: fontBebas.style.fontFamily },
  { label: "Impact", value: "Impact, Arial Black, Arial, sans-serif" },
  { label: "Arial Black", value: '"Arial Black", Arial, sans-serif' },
];
