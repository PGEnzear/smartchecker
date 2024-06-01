<template>
  <div class="flex justify-content-end xl:block">
    <div
      @click="visible = true"
      class="hidden cursor-pointer xl:block relative"
    >
      <i class="bx bx-bell text-white text-3xl"></i>
      <div
        v-if="tasks.items.find(({ completed }) => completed != true)"
        class="absolute w-1rem h-1rem bg-dark top-0 right-0 bg-dark rounded border-circle flex justify-content-center align-items-center"
      >
        <div
          style="width: 60%; height: 60%"
          class="bg-warning border-circle bx-flashing"
        ></div>
      </div>
    </div>
    <div
      @click="visible = true"
      class="text-white cursor-pointer xl:hidden notifications"
    >
      <div class="flex align-items-center">
        <div
          class="sidebar-icon flex align-items-center justify-content-center border-round-md"
        >
          <i class="bx bx-bell"></i>
        </div>
      </div>
    </div>
    <Sidebar
      v-model:visible="visible"
      position="right"
      class="w-full md:w-20rem lg:w-30rem"
    >
      <div class="flex flex-column gap-3">
        <div
          class="wallet-card border-round-md p-3"
          v-for="task in tasks.items"
          :key="task.uuid"
        >
          <div class="flex justify-content-between align-items-center">
            <div class="text-sm">UUID: {{ useMiddleTruncate(task.uuid) }}</div>
            <i
              v-if="task.completed"
              class="bx bxs-check-circle text-success"
            ></i>
            <Button
              v-else
              @click="cancelTask(task.uuid)"
              class="p-0 m-0"
              severity="danger"
              text
            >
              <i class="bx bx-stop-circle"></i>
            </Button>
          </div>
          <div v-if="task.completed" class="uppercase text-600 text-xs mt-3">
            Mnemonics: {{ task.totalMnemonics }}
            <span class="text-500">|</span> Balance
            {{
              task.totalBalance.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })
            }}
          </div>
          <div class="mt-2 uppercase text-600 text-xs mt-3" v-else>
            <div class="flex justify-content-between">
              <span
                >{{ task.totalMnemonics }} / {{ task.loadedMnemonics }}</span
              >
              <span
                >{{
                  Math.ceil((task.totalMnemonics / task.loadedMnemonics) * 100)
                }}%</span
              >
            </div>
            <ProgressBar
              style="height: 6px"
              class="mt-1"
              :value="(task.totalMnemonics / task.loadedMnemonics) * 100"
            >
              <span></span>
            </ProgressBar>
          </div>
        </div>
      </div>
    </Sidebar>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";

const toast = useToast();
const visible = ref(false);
const { $events } = useNuxtApp();
const { execute } = useApi<any[]>(
  "/wallets/tasks",
  undefined,
  undefined,
  false
);
const { execute: deleteTask } = useApi<any[]>(
  "/wallets/tasks",
  "delete",
  undefined,
  false
);
const tasks = reactive({
  items: [] as any[],
});

$events.$on("tasks.open", () => (visible.value = true));
$events.$on("wallet_task.added", (task) =>
  tasks.items?.unshift(reactive(task))
);
$events.$on("wallet_task.processed", (task) => {
  const index = tasks.items?.findIndex(({ uuid }) => uuid == task.taskId);
  if (index !== -1 && task.wallet > tasks.items[index!].totalMnemonics) {
    tasks.items[index!].totalMnemonics = task.wallet;
  }
});
$events.$on("wallet_task.completed", (task) => {
  const index = tasks.items?.findIndex(({ uuid }) => uuid == task.taskId);
  if (index !== -1) {
    tasks.items[index!].completed = true;
    tasks.items[index!].totalBalance = task.balance;
    tasks.items[index!].totalMnemonics = task.mnemonics;
  }
});

function cancelTask(uuid_: string) {
  const index = tasks.items?.findIndex(({ uuid }) => uuid == uuid_);
  tasks.items.splice(index, 1);
  deleteTask("/wallets/tasks/" + uuid_).then(() => {
    toast.add({
      severity: "success",
      summary: "Task canceled",
      life: 3000,
    });
  });
}

onMounted(() => {
  execute().then((data) => {
    if (data) tasks.items = data.map((i) => reactive(i));
  });
});
</script>
