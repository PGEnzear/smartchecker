<template>
  <div class="grid">
    <div class="xl:col-6 col-12">
      <div class="flex flex-column justify-content-center align-items-center h-screen">
        <div class="flex column-gap-2 align-items-center">
          <img
            class="select-none pointer-events-none"
            src="~/assets/images/logo.svg?url"
          />
          <img
            class="select-none pointer-events-none"
            src="~/assets/images/logo-name.svg?url"
          />
        </div>

        <Card class="mt-4 w-full max-w-27rem p-2">
          <template #title>
            <h2 class="text-2xl font-normal text-center m-0">
              Authorization on the platform
            </h2>
          </template>
          <template #content>
            <form @submit.prevent="loginExec">
              <InputText
                size="large"
                class="w-full"
                placeholder="Enter your UUID"
                v-model.trim="$v.uuid.$model"
              />
              <p
                class="text-red-500 mt-2 text-sm"
                v-for="error in $v.uuid.$errors"
                :key="error.$uid"
              >
                {{ error.$message }}
              </p>
              <Button
                :disabled="isLoading || $v.$invalid"
                type="submit"
                size="large"
                class="w-full mt-4 flex justify-content-center"
              >
                <i
                  v-if="isLoading"
                  class="bx bx-loader-alt bx-spin absolute left-0 ml-3 text-2xl"
                ></i>
                <span>Enter</span>
              </Button>
              <vue-hcaptcha
                @verify="debounceLogin"
                @closed="hcaptchaOpened = false"
                :sitekey="config.hCaptcha"
                theme="dark"
                size="invisible"
                ref="invisibleHcaptcha"
              ></vue-hcaptcha>
            </form>
          </template>
        </Card>
      </div>
    </div>
    <div class="col-6 min-h-screen auth-banner hidden xl:block"></div>
    <ModalConfirm v-model:modal-active="showModal" />
  </div>
</template>

<script setup lang="ts">
import VueHcaptcha from "@hcaptcha/vue3-hcaptcha";
import { uuid } from "~/validators";
import { useVuelidate } from "@vuelidate/core";
import { helpers } from "@vuelidate/validators";
import { useToast } from "primevue/usetoast";
import { computed, reactive, ref } from "vue";
import { AxiosError } from "axios";

definePageMeta({
  layout: "auth",
});

const toast = useToast();

const { public: config } = useRuntimeConfig();
const { login: loginStore } = useAuthStore();
const { sessionConfirmed, loggedIn, isLoading: authLoading } = storeToRefs(useAuthStore());
const showModal = computed(() => !sessionConfirmed.value && loggedIn.value);
const invisibleHcaptcha = ref<VueHcaptcha | null>(null);
const hcaptchaOpened = ref(false);

const state = reactive({
  uuid: null as string | null,
});

const rules = {
  uuid: {
    uuid: helpers.withMessage("UUID invalid", uuid),
  },
};

const $v = useVuelidate(rules, state);

const loginHandler = async (token: string) => {
  hcaptchaOpened.value = false
  try {
    await loginStore(state.uuid!, token);
  } catch (error) {
    const e = error as AxiosError<any>
    if (e.response?.status === 404) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "User not found",
        life: 3000,
      });
    } else if (e.response?.data?.message === "SUBSCRIPTION_EXPIRED") {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Subscription expired",
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "An unexpected error occurred",
        life: 3000,
      });
    }
  }
};

const { debouncedFunction: debounceLogin, pending: debouncing } = useDebouncedFunction(
  (token: string) => loginHandler(token),
  100
);

const loginExec = async () => {
  const correct = await $v.value.$validate();
  if (!correct) return;
  hcaptchaOpened.value = true
  invisibleHcaptcha.value?.execute();
};

const isLoading = useIsLoading(hcaptchaOpened, authLoading, debouncing);
</script>
