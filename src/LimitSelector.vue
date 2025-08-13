<template>
  <div class="limit-selector" style="margin-bottom: 8px; max-width: 160px;">
    <v-select
      v-model="modelValueProxy"
      :items="items"
      :label="text"
      :dense="dense"
      :disabled="disabled"
      item-title="label"
      item-value="value" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    modelValue: number | string;
    items?: Array<{ text: string; value: number }>;
    text?: string;
    dense?: boolean;
    disabled?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    items: () => [
      { text: '25', value: 25 },
      { text: '50', value: 50 },
      { text: '100', value: 100 },
      { text: '500', value: 500 }
    ],
    text: 'Items per page',
    dense: true,
    disabled: false
  });

  const emit = defineEmits<{
    'update:modelValue': [value: number | string];
  }>();

  const modelValueProxy = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  });
</script>

<style scoped>
.limit-selector {
  margin-bottom: 8px;
  max-width: 160px;
  min-width: 100px;
}
</style>
