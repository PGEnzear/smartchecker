<template>
  <div>
    <div class="grid">
      <div class="col-12 xl:col-6">
        <div class="wallet-card border-round-md">
          <div
            class="flex justify-content-between align-items-center px-4 mt-4"
          >
            <div class="text-header">Proxies</div>
            <p class="text-xs text-400">Accept only SOCKS5</p>
          </div>
          <Dvider />
          <div class="px-4 pb-4" v-if="proxyLoading">
            <Skeleton class="w-full h-20rem" />
          </div>
          <div class="px-4 pb-4" v-else>
            <form @submit.prevent="proxyUpdate">
              <Textarea
                v-model="proxies"
                :disabled="isLoading"
                :placeholder="`username:password@ip:port\nip:port:username:password\nip:port`"
                class="w-full"
                rows="15"
              />
              <Button
                :disabled="isLoading"
                type="submit"
                size="large"
                class="w-full mt-4 flex justify-content-center"
                outlined
              >
                <i
                  v-if="proxyUpdateLoading"
                  class="bx bx-loader-alt bx-spin absolute left-0 ml-3 text-2xl"
                ></i>
                <span>Update proxies</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
      <!-- <div class="col-4">
        <div class="wallet-card border-round-md">
          <div class="px-4 mt-4 text-header">Subscription</div>
          <Dvider />
        </div>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
const proxies = ref();

const { execute: proxyLoad, loading: proxyLoading } = useApi<any[]>(
  "/proxy",
  "get",
  undefined,
  false
);
const { execute: proxyUpdateExecute, loading: proxyUpdateLoading } = useApi<
  any[]
>("/proxy", "patch", undefined, false);

const isLoading = useIsLoading(proxyLoading, proxyUpdateLoading);

const proxyUpdate = () => {
  const data = {
    items: proxies.value.split("\n"),
  };

  return proxyUpdateExecute({
    data,
  }).then((responseData) => {
    if (responseData)
      proxies.value = responseData.map(({ url }) => url).join("\n");
  });
};

onMounted(() => {
  proxyLoad().then((responseData) => {
    if (responseData)
      proxies.value = responseData.map(({ url }) => url).join("\n");
  });
});
</script>
