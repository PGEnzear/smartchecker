import PrimeVue from "primevue/config";
import Button from "primevue/button";
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Sidebar from 'primevue/sidebar';
import Tag from 'primevue/tag';
import Timeline from 'primevue/timeline';
import Avatar from 'primevue/avatar';
import Dvider from 'primevue/divider';
import Message from 'primevue/message';
import Paginator from 'primevue/paginator';
import Skeleton from 'primevue/skeleton';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import ProgressBar from 'primevue/progressbar';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
import Textarea from 'primevue/textarea';
import SplitButton from 'primevue/splitbutton';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true });
  nuxtApp.vueApp.use(ToastService);
  nuxtApp.vueApp.component("Toast", Toast);
  nuxtApp.vueApp.component("Button", Button);
  nuxtApp.vueApp.component("Card", Card);
  nuxtApp.vueApp.component("InputText", InputText);
  nuxtApp.vueApp.component("Sidebar", Sidebar);
  nuxtApp.vueApp.component("Tag", Tag);
  nuxtApp.vueApp.component("Timeline", Timeline);
  nuxtApp.vueApp.component("Avatar", Avatar);
  nuxtApp.vueApp.component("Dvider", Dvider);
  nuxtApp.vueApp.component("Message", Message);
  nuxtApp.vueApp.component("Paginator", Paginator);
  nuxtApp.vueApp.component("Skeleton", Skeleton);
  nuxtApp.vueApp.component("TabView", TabView);
  nuxtApp.vueApp.component("TabPanel", TabPanel);
  nuxtApp.vueApp.component("ProgressBar", ProgressBar);
  nuxtApp.vueApp.component("Textarea", Textarea);
  nuxtApp.vueApp.component("SplitButton", SplitButton);

  // return {
  //   provide: {
  //     $toast: nuxtApp.vueApp.config.globalProperties.$toast as any,
  //   },
  // };
});
