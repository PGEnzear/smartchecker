<template>
  <div>
    <div class="flex flex-column xl:flex-row mb-4 gap-4">
      <Button
          class="border-round-md px-3 py-2.5"
          label="Static adresses"
          outlined
          @click="openModal('modal1')"
      />
      <Button
          class="border-round-md px-3 py-2.5"
          label="Stats"
          outlined
          @click="openModal('modal2')"
      />
      <Button
          class="border-round-md px-3 py-2.5"
          label="Build"
          outlined
          @click="openModal('modal3')"
      />
    </div>
    <Dvider/>
    <Modal v-if="activeModal === 'modal1'" @close="activeModal = ''">
      <h2>Static addresses</h2>
      <Dvider/>
      <div class="xl:flex-column gap-3">
        <div class="flex xl:flex-row gap-3 mb-4 h-7rem w-150rem">
          <Button
              class="border-round-md px-3"
              outlined
          >
            <span class="button-content" style="color: #0057fd;">
        <i class='bx bx-slideshow' style="font-size: 50px"></i>
        Infected computers: {{ getInfectedComputers() }}
              </span>
          </Button>

          <Button
              class="border-round-md px-3"
              outlined
          >
            <span class="button-content" style="color:#0057fd;">
                <i class='bx bx-sitemap' style="font-size: 50px"></i>
                Computers online: {{ getComputersOnline() }}
            </span>
          </Button>

          <Button
              class="border-round-md px-3"
              outlined
          >
    <span class="button-content" style="color: #0057fd;">
        <i class='bx bx-dollar-circle' style="font-size: 50px"></i>
        Current balance: {{ getCurrentBalance() }}
    </span>
          </Button>

        </div>
        <Paginator
            :key="'paginator'"
            :rows="10"
            :totalRecords="100"
            class="mb-2"
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
        <div v-if="loading">
          <div v-for="i in 9" :key="i" class="border-round-md h-3 w-full mb-2">
            <div class="flex xl:flex-column">
              <Skeleton class="border-round-md h-4rem w-full"/>
            </div>
          </div>
        </div>

        <table v-else-if="tableData !== null && !loading">
          <thead>
          <tr>
            <th>Номер</th>
            <th>Адрес</th>
            <th>Чек</th>
            <th>Время создания</th>
            <th>Приваткей</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in tableData" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.address }}</td>
            <td><a :href="`https://scanner.com/${item.check}`">Ссылка на сканнер</a></td>
            <td>{{ item.creationTime }}</td>
            <td>{{ item.privateKey }}</td>
          </tr>
          </tbody>
        </table>
        <Paginator
            :key="'paginator'"
            :rows="10"
            :totalRecords="100"
            class="mb-2"
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
    </Modal>

    <Modal v-if="activeModal === 'modal2'" @close="activeModal = ''">
        <h2>Stats</h2>
      <Dvider/>
      <Button
          class="border-round-md px-3 mb-4"
          outlined
      >
            <span class="button-content" style="color:#0057fd;">
                <i class='bx bx-pie-chart-alt-2 w-full ' style="font-size: 50px"></i>
                Builds count: {{ getBuildsCount() }}
            </span>
      </Button>

      <Paginator
          :key="'paginator'"
          :rows="10"
          :totalRecords="100"
          class="mb-2"
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
      <div v-if="loading">
        <div v-for="i in 9" :key="i" class="border-round-md h-3 w-full mb-2">
          <div class="flex xl:flex-column">
            <Skeleton class="border-round-md h-4rem w-full"/>
          </div>
        </div>
      </div>
      <table v-else-if="tableData !== null && !loading">
        <thead>
        <tr>
          <th>Номер</th>
          <th>Адрес</th>
          <th>Чек</th>
          <th>Время создания</th>
          <th>Приваткей</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in tableData" :key="index">
          <td>{{ index + 1 }}</td>
          <td>{{ item.address }}</td>
          <td><a :href="`https://scanner.com/${item.check}`">Ссылка на сканнер</a></td>
          <td>{{ item.creationTime }}</td>
          <td>{{ item.privateKey }}</td>
        </tr>
        </tbody>
      </table>
      <Paginator
          :key="'paginator'"
          :rows="10"
          :totalRecords="100"
          class="mb-2"
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
    </Modal>

    <Modal v-if="activeModal === 'modal3'" @close="activeModal = ''">
      <h2>Build configuration</h2>
      <Dvider/>
      <Paginator
          :key="'paginator'"
          :rows="10"
          :totalRecords="100"
          class="mb-2"
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
      <div v-if="loading">
        <div v-for="i in 9" :key="i" class="border-round-md h-3 w-full mb-2">
          <div class="flex xl:flex-column">
            <Skeleton class="border-round-md h-4rem w-full"/>
          </div>
        </div>
      </div>
      <table v-else-if="tableData !== null && !loading">
        <thead>
        <tr>
          <th>Номер</th>
          <th>Адрес</th>
          <th>Чек</th>
          <th>Время создания</th>
          <th>Приваткей</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in tableData" :key="index">
          <td>{{ index + 1 }}</td>
          <td>{{ item.address }}</td>
          <td><a :href="`https://scanner.com/${item.check}`">Ссылка на сканнер</a></td>
          <td>{{ item.creationTime }}</td>
          <td>{{ item.privateKey }}</td>
        </tr>
        </tbody>
      </table>
      <Paginator
          :key="'paginator'"
          :rows="10"
          :totalRecords="100"
          class="mb-2"
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
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {onBeforeRouteLeave} from 'vue-router'

const search = ref();
const currentPagePaginator = ref(0);
const activeModal = ref('modal1')
const tableData = ref(null)
const loading = ref(true)
const error = ref(false)

const {
  refresh: refreshWallets,
  setSearch: setWalletsSearch,
} = usePagination<any>("/wallets");

const openModal = (modalName) => {
  currentPagePaginator.value = 0;
  setTimeout(() => {
    activeModal.value = modalName;
  }, 1);
};

const getInfectedComputers = () => {
  return "1236456"
}

const getComputersOnline = () => {
  return "341212"
}

const getCurrentBalance = () => {
  return "9023809823" + "$"
}

const getBuildsCount = () => {
  return "30"
}

onBeforeRouteLeave(() => {
  activeModal.value = ''
})
</script>
