import {EnvConfig} from "@smartchecker/config";
import svgLoader from "vite-svg-loader";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    css: ["assets/scss/main.scss"],
    modules: ["@pinia/nuxt"],
    ssr: false,
    runtimeConfig: {
        public: {
            apiBaseurl: EnvConfig.API_BASEURL,
            hCaptcha: EnvConfig.HCAPTCHA_SITEKEY,
        },
    },
    app: {
        head: {
            title: "SmartChecker",
            meta: [
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1, maximum-scale=1",
                },
            ],
        },
        pageTransition: {name: "page", mode: "out-in"},
        layoutTransition: {name: "layout", mode: "out-in"},
    },
    pinia: {
        autoImports: ["defineStore", "acceptHMRUpdate", "storeToRefs"],
    },
    imports: {
        dirs: ["stores"],
    },
    build: {
        transpile: ["primevue"],
    },
    vite: {
        plugins: [svgLoader({
            svgo: false
        })],
    },
    // devtools: { enabled: true }
});
