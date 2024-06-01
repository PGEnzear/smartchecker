export default defineNuxtRouteMiddleware(async (to) => {
  const pinia = usePinia();
  const { user, isLoading, subscribed, sessionConfirmed } = storeToRefs(
      useAuthStore(pinia)
  );

  const authRoutes = [
    "/auth",
  ];

  if (authRoutes.some(route => to.path.startsWith(route))) {
    if (!isLoading.value) {
      if (user.value && subscribed.value && sessionConfirmed.value)
        return navigateTo("/");
    }
  } else {
    abortNavigation();
  }
});
