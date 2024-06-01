<template>
  <ModalBase
    v-model:modal-active="data"
    title="Confirm Your Login"
    class="modal-mobile not-hidable-modal"
    contentClass="modal-content-large"
  >
    <div class="p-card p-card-white px-4 py-3 border-round-lg">
      <p>🔐 We need to confirm your web-panel access for security.</p>
      <h4 class="mt-4 mb-4">To Confirm:</h4>
      <Timeline :value="events" class="ml-2">
        <template #content="slotProps">
          {{ slotProps.item.status }}
          <Tag
            v-if="slotProps.item.icon"
            icon="bx bxs-check-square"
            severity="success"
            value="Confirm"
          ></Tag>
        </template>
      </Timeline>
      <div class="flex justify-content-end">
        <Button @click="logout()" severity="danger" label="Log out" outlined class="mt-4" />
      </div>
    </div>
  </ModalBase>
</template>

<script lang="ts" setup>
const { logout } = useAuthStore();
const props = defineProps<{
  modalActive?: boolean;
}>();

const emit = defineEmits(["update:modalActive"]);
const data = useVModel(props, "modalActive", emit);

const events = ref([
  {
    status: "Open Telegram",
  },
  {
    status: "Visit SmartCheckerBot chat",
  },
  {
    status: "Click:",
    icon: "bx bxs-check-square",
  },
]);
</script>
