export const FONTS = {
  kh: {
    header: { fontFamily: "Siemreap, sans-serif", className: "siemreap-header" },
    body: { fontFamily: "Kantumruy Pro, sans-serif", className: "kantumruy-body" },
  },
  en: {
    header: { fontFamily: "Playfair Display, serif", className: "playfair-header" },
    body: { fontFamily: "Rubik, sans-serif", className: "rubik-regular" },
  },
};


// returns the font class name based on locale and variant
export function getFontClass(locale: string, variant: 'header' | 'body') {
    const key = (locale || 'en').toLowerCase().startsWith('kh') ? 'kh' : 'en';
    return (FONTS[key] && FONTS[key][variant].className) || FONTS.en.body.className;
}

// return inline font style
export function getFontStyle(locale: string, variant: "body" | "header" = "body") {
  const key = (locale || "en").toLowerCase().startsWith("kh") ? "kh" : "en";
  return { fontFamily: (FONTS[key] && FONTS[key][variant].fontFamily) || FONTS.en.body.fontFamily };
}