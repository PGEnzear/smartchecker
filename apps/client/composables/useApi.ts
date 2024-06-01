import { AxiosError, AxiosRequestConfig, Method } from "axios";

// Define a custom type for the response data
type ApiResponse<T> = {
  data: Ref<T | null>;
  loading: Ref<boolean>;
  error: Ref<AxiosError | null>;
  execute: (customUrlOrConfig?: string | AxiosRequestConfig<any>, customConfig?: AxiosRequestConfig<any>) => Promise<T | undefined>;
};

export function useApi<T>(
  url: string,
  method: Method = "get",
  config?: AxiosRequestConfig<any>,
  immediately = true,
  debounceOptions: { enabled: boolean; delay: number } = {
    enabled: true,
    delay: 300,
  }
): ApiResponse<T> {
  const data = ref(null);
  const loading = ref(false);
  const error = ref<any>(null); // Added error ref
  const api = useAxiosInstance();

  const fetchData = async (
    customUrlOrConfig?: string | AxiosRequestConfig<any>,
    customConfig?: AxiosRequestConfig<any>
  ) => {
    let finalUrl = url;
    let finalConfig = config || {};

    if (typeof customUrlOrConfig === "string") {
      finalUrl = customUrlOrConfig;
    } else if (typeof customUrlOrConfig === "object") {
      finalConfig = customUrlOrConfig;
    }

    if (customConfig) {
      finalConfig = { ...finalConfig, ...customConfig };
    }

    loading.value = true;
    try {
      const response = await api.request({
        url: finalUrl,
        method,
        ...finalConfig,
      });

      data.value = response.data;
      error.value = null;
      return response.data
    } catch (e) {
      console.error("Error fetching data:", e);
      error.value = e;
    } finally {
      loading.value = false;
    }
  };

  const { debouncedFunction, pending } = useDebouncedFunction(
    fetchData,
    debounceOptions.delay
  );

  const execute = (customUrlOrConfig?: string | AxiosRequestConfig<any>, customConfig?: AxiosRequestConfig<any>) => {
    if (debounceOptions.enabled) {
      return debouncedFunction(customUrlOrConfig, customConfig);
    } else {
      return fetchData(customUrlOrConfig, customConfig);
    }
  };

  if (immediately) {
    execute();
  }

  return {
    data,
    loading: debounceOptions.enabled ? useIsLoading(pending, loading) : loading,
    error, // Expose error ref
    execute,
  };
}