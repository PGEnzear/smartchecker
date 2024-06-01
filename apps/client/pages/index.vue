<template>
  <div>
    <div class="flex flex-column xl:flex-row mb-4 gap-3">
      <Button
        class="border-round-md px-3 py-2.5"
        label="Upload wallets"
        outlined
        :disabled="loadingFile"
        :icon="loadingFile ? 'bx bx-loader-alt bx-spin' : 'bx bxs-file-txt'"
        iconPos="right"
        @click="walletsInput.click()"
      />
      <SplitButton
        @click="download()"
        :model="donwloadItems"
        label="Export"
        outlined
        :disabled="downloadLoading"
        :icon="
          downloadLoading ? 'bx bx-loader-alt bx-spin' : 'bx bxs-file-export'
        "
        iconPos="right"
      />
      <Button
        class="border-round-md px-3 py-2.5"
        label="Delete all"
        outlined
        @click="deleteWallets"
        :disabled="deleteWalletsLoading"
        :icon="
          deleteWalletsLoading ? 'bx bx-loader-alt bx-spin' : 'bx bxs-trash'
        "
        iconPos="right"
        severity="danger"
      />
      <input
        type="file"
        ref="walletsInput"
        class="hidden"
        @change="uploadWallets()"
        accept=".txt"
      />
    </div>
    <div class="w-full">
      <Dvider />
      <Paginator
        v-model:first="currentPagePaginator"
        @page="({ page }) => setWalletsPage(page + 1)"
        :rows="walletsPaginationMeta.itemsPerPage"
        :totalRecords="walletsPaginationMeta.totalItems"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      >
        <template #end>
          <InputText
            class="border-round-md mr-2"
            v-model="search"
            @keyup.enter="setWalletsSearch(search)"
            placeholder="Search..."
          />
          <Button
            type="button"
            @click="refreshWallets"
            icon="bx bx-refresh"
            class="border-round-md"
            outlined
          />
        </template>
      </Paginator>
      <div class="flex flex-column gap-4 my-4" v-if="loadingWallets">
        <Skeleton class="border-round-md h-6rem" v-for="i in 6" :key="i" />
      </div>
      <div class="flex flex-column gap-4 my-4" v-else>
        <Message :closable="false" v-if="!wallets?.length"
          >No wallets found</Message
        >
        <div class="wallet-card border-round-md" v-for="wallet in wallets">
          <div class="px-4 mt-4 text-header">
            Balance:
            {{
              wallet.balance.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })
            }}
          </div>
          <Dvider />
          <div class="px-4 mb-4">
            <div class="flex gap-2">
              <div
                class="mnemonic p-2 flex-1 border-round-md flex align-items-center"
              >
                {{ wallet.mnemonic }}
              </div>
              <Button
                @click="loadWalletBalance(wallet.mnemonic_hash)"
                :disabled="loadingWalletBalance"
                :icon="
                  loadingWalletBalance &&
                  walletBalance.mnemonic_hash == wallet.mnemonic_hash
                    ? 'bx bx-loader-alt bx-spin'
                    : walletBalance.mnemonic_hash != wallet.mnemonic_hash
                    ? 'bx bxs-chevron-down'
                    : 'bx bxs-chevron-up'
                "
                class="border-round-md"
                outlined
              />
            </div>
            <div
              v-if="walletBalance.mnemonic_hash == wallet.mnemonic_hash"
              class="mt-4"
            >
              <div v-if="loadingWalletBalance">
                <div class="flex gap-2">
                  <Skeleton class="border-round-md h-2rem w-6rem" />
                  <Skeleton class="border-round-md h-2rem w-6rem" />
                  <Skeleton class="border-round-md h-2rem w-6rem" />
                </div>
                <Skeleton class="border-round-md h-6rem w-full mt-2" />
              </div>
              <div class="" v-else>
                <TabView scrollable>
                  <TabPanel
                    v-for="(wallets, network) in walletBalancesByNetwork"
                    :key="network"
                  >
                    <template #header>
                      <NetworkHeader :network="(network as string)" />
                    </template>
                    <div class="overflow-auto">
                      <table
                        class="w-full wallets-balances-table"
                        style="min-width: 700px"
                      >
                        <thead>
                          <td>Derivation</td>
                          <td>Address</td>
                          <td>Balance</td>
                        </thead>
                        <tbody>
                          <tr v-for="balance in wallets" :key="balance.address">
                            <td>
                              <InputText
                                readonly
                                :value="balance.derivationPath"
                                class="w-9rem"
                              />
                            </td>
                            <td>
                              <InputText
                                readonly
                                :value="balance.address"
                                class="w-25rem"
                              />
                            </td>
                            <td>
                              {{
                                balance.balance.toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                })
                              }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </TabPanel>
                </TabView>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Paginator
        v-model:first="currentPagePaginator"
        @page="({ page }) => setWalletsPage(page + 1)"
        :rows="walletsPaginationMeta.itemsPerPage"
        :totalRecords="walletsPaginationMeta.totalItems"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        class="mb-4"
      >
        <template #end>
          <Button
            type="button"
            @click="refreshWallets"
            icon="bx bx-refresh"
            class="border-round-md"
            outlined
          />
        </template>
      </Paginator>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import { groupBy } from "lodash";

const toast = useToast();
const { $events } = useNuxtApp();

// Upload wallets
const walletsInput = ref();
const { loading: loadingFile, uploadFile: uploadWalletsHandler } =
  useFileUpload("/wallets", walletsInput);
const uploadWallets = () =>
  uploadWalletsHandler()
    .then((data) => {
      $events.$emit("tasks.open");
      $events.$emit("wallet_task.added", data);
      toast.add({
        severity: "success",
        summary: "Task added",
        detail: "You can track your progress in the side menu",
        life: 3000,
      });
    })
    .catch(() => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "The file does not contain any mnemonics",
        life: 3000,
      });
    });

// Wallets
const currentPagePaginator = ref();
const search = ref();
const {
  data: wallets,
  meta: walletsPaginationMeta,
  setPage: setWalletsPage,
  loading: loadingWallets,
  refresh: refreshWallets,
  setSearch: setWalletsSearch,
} = usePagination<any>("/wallets");

// Wallet balances
const walletBalance = reactive({
  mnemonic_hash: undefined as string | undefined,
  data: undefined as any[] | undefined,
});
const walletBalancesByNetwork = computed(() =>
  groupBy(walletBalance?.data, "network")
);
const { execute: executeWalletBalanceHandler, loading: loadingWalletBalance } =
  useApi<any>("/wallets/balances/:mnemonic_hash", "get", undefined, false);
const loadWalletBalance = (mnemonic_hash: string) => {
  if (mnemonic_hash == walletBalance.mnemonic_hash) {
    walletBalance.data = undefined;
    walletBalance.mnemonic_hash = undefined;
  } else {
    walletBalance.mnemonic_hash = mnemonic_hash;
    return executeWalletBalanceHandler(
      `/wallets/balances/${mnemonic_hash}`
    ).then((data) => {
      walletBalance.data = data;
    });
  }
};

const { download, loading: downloadLoading } = useDownloadFile(
  "wallets/export",
  "mnemonics.txt"
);
const { execute: deleteWalletsExecute, loading: deleteWalletsLoading } = useApi(
  "wallets",
  "delete",
  undefined,
  false
);
const donwloadItems = ref([
  {
    icon: "bx bxs-file-export",
    label: "Export with Balances (All)",
    command: () =>
      download("wallets/exportWithBalances", "mnemonics-with-balances.txt"),
  },
  {
    icon: "bx bxs-file-export",
    label: "Export with Balances (Bitcoin)",
    command: () =>
      download("wallets/exportWithBalances/bitcoin", "mnemonics-with-balances-bitcoin.txt"),
  },
  {
    icon: "bx bxs-file-export",
    label: "Export with Balances (BCash)",
    command: () =>
      download("wallets/exportWithBalances/bitcoin-cash", "mnemonics-with-balances-bitcoin-cash.txt"),
  },
  {
    icon: "bx bxs-file-export",
    label: "Export with Balances (EVM)",
    command: () =>
      download("wallets/exportWithBalances/evm", "mnemonics-with-balances-evm.txt"),
  },
  {
    icon: "bx bxs-file-export",
    label: "Export with Balances (Litecoin)",
    command: () =>
      download("wallets/exportWithBalances/litecoin", "mnemonics-with-balances-litecoin.txt"),
  },
  {
    icon: "bx bxs-file-export",
    label: "Export with Balances (Solana)",
    command: () =>
      download("wallets/exportWithBalances/solana", "mnemonics-with-balances-solana.txt"),
  },
  {
    icon: "bx bxs-file-export",
    label: "Export with Balances (Tron)",
    command: () =>
      download("wallets/exportWithBalances/tron", "mnemonics-with-balances-tron.txt"),
  },
]);

const deleteWallets = () =>
  deleteWalletsExecute().then(() => {
    refreshWallets();
  });
</script>
