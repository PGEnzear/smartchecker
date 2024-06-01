import { AxiosError, AxiosRequestConfig } from "axios";

export function useFileUpload(
  url: string,
  fileInputRef: Ref<HTMLInputElement | null>,
  debounceOptions: { enabled: boolean; delay: number } = {
    enabled: true,
    delay: 300,
  }
) {
  const progress = ref<number>(0);
  const loading = ref<boolean>(false); // Add the `loading` ref
  const api = useAxiosInstance();

  const uploadFileHandler = async (config?: AxiosRequestConfig) => {
    if (!fileInputRef.value) {
      return;
    }

    const file = fileInputRef.value.files?.[0]; // Get the selected file from the input

    if (!file) {
      return;
    }

    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("file", file);

    try {
      loading.value = true; // Set loading to true when starting the upload

      const response = await api.post(url, formData, {
        ...config,
        onUploadProgress: (progressEvent) => {
          // Calculate and set the progress percentage
          progress.value = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total!
          );
        },
      });

      // Reset progress and loading when the upload is complete
      progress.value = 0;
      loading.value = false;

      fileInputRef.value.value = '';

      // Handle the response data as needed
      return response.data;
    } catch (e) {
      // Reset progress and loading on error
      progress.value = 0;
      loading.value = false;
      throw e as AxiosError;
    }
  };

  const { debouncedFunction, pending } = useDebouncedFunction(
    uploadFileHandler,
    debounceOptions.delay
  );

  const uploadFile = (customConfig?: AxiosRequestConfig<any>) => {
    if (debounceOptions.enabled) {
      return debouncedFunction(customConfig);
    } else {
      return uploadFileHandler(customConfig);
    }
  };

  return {
    progress,
    loading: debounceOptions.enabled ? useIsLoading(pending, loading) : loading,
    uploadFile,
  };
}