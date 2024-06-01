export const useEventListener = (
  target: EventTarget,
  type: string,
  listener: EventListener | EventListenerObject,
  options?: boolean | AddEventListenerOptions
) => {
  onMounted(() => {
    target.addEventListener(type, listener, options);
  });

  onBeforeUnmount(() => {
    target.removeEventListener(type, listener, options);
  });
};
