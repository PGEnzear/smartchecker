export const useIsLoading = (...args: Ref<boolean>[]) => {
  return computed(() => {
    return args.some((ref) => ref.value); // Use `some` instead of `every`
  });
};