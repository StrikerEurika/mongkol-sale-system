import { ref, computed } from "vue";
import { getFontClass, getFontStyle } from "@/utils/fonts"; // path to helper above

export function useFont(defaultLocale = "en") {
  const currentLocale = ref(defaultLocale);

  // detect Khmer characters (optional; keeps previous detect logic)
  function detectLanguage(text: string | null | undefined) {
    if (!text) return "en";
    const khmerRegex = /[\u1780-\u17FF\u19E0-\u19FF]/;
    return khmerRegex.test(text) ? "kh" : "en";
  }

  // computed class for the whole app/body
  const fontClasses = computed(() => getFontClass(currentLocale.value, "body"));

  // computed inline style if you prefer style binding
  const fontStyles = computed(() => getFontStyle(currentLocale.value, "body"));

  function setLocale(locale: string) {
    currentLocale.value = locale;
  }

  // returns a class or style based on text content (auto detect)
  function classForText(text: string, variant: "body" | "header" = "body") {
    const lang = detectLanguage(text);
    return getFontClass(lang, variant);
  }

  function styleForText(text: string, variant: "body" | "header" = "body") {
    const lang = detectLanguage(text);
    return getFontStyle(lang, variant);
  }

  return {
    currentLocale,
    fontClasses,
    fontStyles,
    setLocale,
    detectLanguage,
    classForText,
    styleForText,
  };
}
