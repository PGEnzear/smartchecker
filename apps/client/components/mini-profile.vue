<template>
  <div class="flex align-items-center column-gap-3">
    <Tasks />
    <NuxtLink v-if="user" :href="'tg://user?id=' + user.id" target="_blank">
      <Avatar
        :image="url || '/images/avatar.svg'"
        size="large"
        shape="circle"
      />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { url } = useImage("bot/avatar");
const { user } = storeToRefs(useAuthStore());
</script>
