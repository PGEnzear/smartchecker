import { AxiosError } from "axios";

export interface PaginationMeta {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedData<DataT> {
  data: DataT[];
  meta: PaginationMeta;
}

export interface PrimeVuePaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string[];
  sortOrder?: number[];
  filters?: Record<string, any>;
  search?: string; // Add search property to the config
}

export function usePagination<DataT>(
  initialUrl: string,
  config_: PrimeVuePaginationQuery = {},
  debounceOptions: { enabled: boolean; delay: number } = {
    enabled: true,
    delay: 300,
  }
) {
  const config = reactive(config_);
  const data = ref<DataT[]>([]) as Ref<DataT[]>;
  const meta = ref<PaginationMeta>({
    itemCount: 0,
    totalItems: 0,
    itemsPerPage: 0,
    totalPages: 0,
    currentPage: 1,
  });
  const error = ref<AxiosError | null>(null);
  const loading = ref(false);

  const api = useAxiosInstance();

  const fetchData = async () => {
    loading.value = true;
    try {
      const params = { ...config };
      const response = await api.get<PaginatedData<DataT>>(initialUrl, {
        params,
      });
      data.value = response.data.data;
      meta.value = response.data.meta;
      // Reset error when a successful response is received
      error.value = null;
    } catch (e) {
      error.value = e as AxiosError;
    } finally {
      loading.value = false;
    }
  };

  const { debouncedFunction, pending } = useDebouncedFunction(
    fetchData,
    debounceOptions.delay
  );

  const refresh = () => {
    if (debounceOptions.enabled) {
      debouncedFunction();
    } else {
      fetchData();
    }
  };

  const setPage = (page: number) => {
    if (page >= 1 && page <= meta.value.totalPages) {
      config.page = page;
      refresh();
    }
  };

  const setLimit = (limit: number) => {
    config.limit = limit;
    refresh();
  };

  const setSort = (field: string, order: number) => {
    config.sortBy = [field];
    config.sortOrder = [order];
    refresh();
  };

  const setFilters = (filters: Record<string, any>) => {
    config.filters = filters;
    refresh();
  };

  const setSearch = (search: string) => {
    config.search = search; // Set the search property in the config
    refresh();
  };

  // Обработка изменений фильтров и сортировки
  watch(
    [() => config.filters, () => config.sortBy, () => config.sortOrder],
    () => {
      refresh();
    }
  );

  // Загрузка данных при создании компонента
  refresh();

  return {
    data,
    meta,
    setPage,
    setLimit,
    setSort,
    setFilters,
    setSearch, // Add setSearch
    refresh,
    error,
    config,
    loading: debounceOptions.enabled ? useIsLoading(pending, loading) : loading,
  };
}
