<template>
  <div
    class="absolute top-0 w-full sidebar bg-card z-1 flex align-items-center xl:relative xl:w-16rem sidebar xl:p-3 xl:min-h-screen xl:flex-column xl:gap-2"
  >
    <NuxtLink to="/" class="xl:w-full text-white p-2 cursor-pointer">
      <div class="flex align-items-center gap-2">
        <div
          class="sidebar-icon flex align-items-center justify-content-center border-round-md"
        >
          <i class="bx bxs-dashboard"></i>
        </div>
        <span class="hidden xl:block">Dashboard</span>
      </div>
    </NuxtLink>
    <NuxtLink to="/settings" class="xl:w-full text-white p-2 cursor-pointer">
      <div class="flex align-items-center gap-2">
        <div
          class="sidebar-icon flex align-items-center justify-content-center border-round-md"
        >
          <i class="bx bx-cog"></i>
        </div>
        <span class="hidden xl:block">Settings</span>
      </div>
    </NuxtLink>
    <NuxtLink to="/clipper" class="xl:w-full text-white p-2 cursor-pointer">
      <div class="flex align-items-center gap-2">
        <div
            class="sidebar-icon flex align-items-center justify-content-center border-round-md"
        >
        </div>
        <span class="hidden xl:block">Clipper</span>
      </div>
    </NuxtLink>
    <div class="xl:hidden flex-1"><Tasks /></div>
    <Button
      @click="logout"
      severity="danger"
      text
      class="xl:w-full text-white flex align-items-center gap-2 xl:mt-auto p-2 mr-4 ml-3 xl:m-0"
    >
      <div
        class="sidebar-icon flex align-items-center justify-content-center border-round-md"
      >
        <i class="bx bx-log-out"></i>
      </div>
      <span class="hidden xl:block">End Session</span>
    </Button>
  </div>
</template>

<script setup lang="ts">
const { logout } = useAuthStore();
const { url } = useImage("bot/avatar");
</script>
