// src/main.ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

import "./assets/css/tailwind.css";
import "./assets/css/fonts.css";

import { createI18n } from "vue-i18n";

import en from "./locales/en.json";
import kh from "./locales/kh.json";

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

const i18n = createI18n({
  legacy: false, // set `false`, to use Composition API
  locale: localStorage.getItem("locale") || "kh", // default locale
  fallbackLocale: "en",
  messages: {
    en,
    kh,
  },
});

const vuetify = createVuetify({
  components,
  directives,
})

// create app
createApp(App).use(vuetify).use(createPinia()).use(router).use(i18n).mount("#app");
