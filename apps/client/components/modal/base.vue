<template>
  <Sidebar
    v-model:visible="data"
    position="full"
    :class="backdropClass"
    @click.self="hideModal()"
    @hide="$emit('hide')"
    @show="$emit('show')"
  >
    <div
      class="modal-backdrop relative w-full h-full lg:flex align-items-start justify-content-center"
      @click.self="hideModal()"
    >
      <div class="modal-container py-4 sm:px-4">
        <div class="modal-animation">
          <div
            class="modal-title font-medium text-4xl text-white text-center mb-4"
          >
            <slot name="title">{{ title }}</slot>
          </div>
          <div class="modal-content" :class="contentClass">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script lang="ts" setup>
const props = defineProps<{
  backdropClass?: string;
  contentClass?: string;
  title?: string;
  disableEsc?: boolean;
  modalActive?: boolean;
}>();

const emit = defineEmits(["update:modalActive", "hide", "show"]);
const data = useVModel(props, "modalActive", emit);

function hideModal() {
  data.value = false;
}
</script>
