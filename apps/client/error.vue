<template>
  <div class="grid">
    <div class="col-12 min-h-screen auth-banner">
      <div
        class="flex flex-column justify-content-center align-items-center h-full"
      >
        <Card class="mt-4 w-full max-w-27rem p-2">
          <template #title>
            <div class="flex column-gap-2 align-items-center justify-content-center">
              <img
                class="select-none pointer-events-none"
                src="~/assets/images/logo.svg?url"
              />
              <img
                class="select-none pointer-events-none"
                src="~/assets/images/logo-name.svg?url"
              />
            </div>
          </template>
          <template #content>
            <p class="m-0 text-center text-lg">
              {{ error.statusCode }} - {{ error.message }}
            </p>
            <div v-if="error.statusCode == 404" class="flex justify-content-center mt-5">
              <Button @click="$router.push('/')" icon="bx bx-home" label="Go to dashboard" />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

useHead({
  title: `${props.error.statusCode} – SmartChecker`,
  link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
});
</script>
