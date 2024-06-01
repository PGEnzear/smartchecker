export function useDebouncedFunction<T extends (...args: any[]) => ReturnType<T>>(
  func: T,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout | null = null;
  const pending = ref(false);

  const debouncedFunction = (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    pending.value = true;

    return new Promise<ReturnType<T>>((resolve) => {
      timeoutId = setTimeout(() => {
        pending.value = false;
        resolve(func(...args));
      }, delay);
    });
  };

  const stopDebounce = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      pending.value = false;
    }
  };

  const startDebounce = () => {
    if (timeoutId === null) {
      pending.value = true;
      timeoutId = setTimeout(() => {
        pending.value = false;
      }, delay);
    }
  };

  return { debouncedFunction, pending, stopDebounce, startDebounce };
}