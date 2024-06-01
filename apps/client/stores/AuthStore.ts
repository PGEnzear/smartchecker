import { AxiosError } from "axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isLoading: true,
    sessionConfirmed: false,
    subscribed: false,
    user: null as any | null,
    loggedIn: false,
  }),
  actions: {
    async fetch() {
      try {
        const res = await useAxiosInstance().get("/auth/me");
        const data = res.data;
        this.user = data;
        this.loggedIn = true;
        this.sessionConfirmed = true;
        this.subscribed = true;
      } catch (e) {
        const error = e as AxiosError<any>;
        if (error.response?.status === 429) {
          showError({ statusCode: 429, message: "Rate Limit Exceeded" });
        } else if (error.response?.data?.message == "SESSION_NOT_CONFIRMED") {
          this.sessionConfirmed = false;
          this.loggedIn = true;
          this.subscribed = false;
        }
        else if (error.response?.data?.message === "SUBSCRIPTION_EXPIRED") {
          this.sessionConfirmed = true;
          this.loggedIn = true;
          this.subscribed = false;
        }
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      try {
        await useAxiosInstance().get("/auth/logout");
      } finally {
        this.user = null;
        this.loggedIn = false;
        this.sessionConfirmed = false;
        this.subscribed = false;
        localStorage.removeItem("access_token");

        const { $events, $router } = useNuxtApp() as any;
        $events.$emit("reconnect_socket");
        $router.push("/auth");
      }
    },

    async login(uuid: string, hcaptcha: string) {
      try {
        this.isLoading = true;
        const res = await useAxiosInstance().post(
          "/auth/login",
          { uuid },
          { headers: { hcaptcha } }
        );
        const data = res.data;
        this.sessionConfirmed = false;
        this.loggedIn = true;
        this.subscribed = true;
        this.user = data.user;
        localStorage.setItem("access_token", data.accessToken);

        const { $events } = useNuxtApp() as any;
        $events.$emit("reconnect_socket");
      } finally {
        this.isLoading = false;
      }
    },
  },
});
