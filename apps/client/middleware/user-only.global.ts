export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith("/auth")) abortNavigation();
  else {
    const pinia = usePinia();
    const { user, isLoading, subscribed, sessionConfirmed } = storeToRefs(
      useAuthStore(pinia)
    );

    if (!isLoading.value) {
      if (!user.value || !subscribed.value || !sessionConfirmed.value)
        return navigateTo("/auth");
    }
  }
});
