export function useVModel<T>(
  props: { [key: string]: T },
  key: string,
  emit: (event: any, ...args: any[]) => void
): Ref<T> {
  const modelValue = ref(props[key] as T) as Ref<T>;

  // Watch for changes to the v-model prop
  watch(
    () => props[key],
    (newValue: T) => {
      modelValue.value = newValue;
    }
  );

  const updateValue = (value: T) => {
    modelValue.value = value;
    emit(`update:${key}`, value);
  };

  return computed({
    get: () => modelValue.value,
    set: updateValue,
  }) as Ref<T>;
}