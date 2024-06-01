import type { Emitter } from "mitt";
// import { ToastServiceMethods } from "primevue/toastservice";

declare module "*.svg" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent;
  export default component;
}

interface PluginsInjections {
  // $toast: ToastServiceMethods,
  $events: {
    $on: Emitter<Events>["on"],
    $off: Emitter<Events>["off"],
    $emit: Emitter<Events>["emit"]
  }
}

declare module '#app' {
  interface NuxtApp extends PluginsInjections {}
}

declare module 'nuxt/dist/app/nuxt' {
  interface NuxtApp extends PluginsInjections {}
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties extends PluginsInjections {}
}
