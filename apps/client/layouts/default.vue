<template>
  <div class="flex max-h-screen">
    <DashboardSidebar />
    <div class="xl:flex overflow-auto w-full mt-6 xl:mt-0">
      <div class="container p-3 relative">
        <div class="xl:flex justify-content-end mb-4 absolute w-full hidden">
          <MiniProfile />
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>
