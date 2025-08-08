<template>
  <div class="m2a-field-group">
    <v-input
      v-model="searchQuery"
      placeholder="Search..."
      :icon-left="'search'"
      class="search-input" />
    <template v-if="useSharedLimit">
      <LimitSelector
        v-if="!disabled"
        v-model="sharedLimit"
        :items="limitOptions"
        :disabled="disabled" />
    </template>
    <template v-else>
      <div v-for="config in collections" :key="config.collection">
        <LimitSelector
          v-if="!disabled"
          v-model="limit[config.collection]"
          :items="limitOptions"
          :disabled="disabled" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';

  import { CollectionConfig, LimitSelectorItem } from '../types';
  import { getLimitKey } from '../utils';
  import LimitSelector from '../LimitSelector.vue';

  const props = defineProps<{
    collections: CollectionConfig[];
    disabled?: boolean;
    useSharedLimit: boolean;
  }>();

  const emit = defineEmits<{
    'update:searchQuery': [value: string];
    'update:sharedLimit': [value: number];
    'update:limit': [value: Record<string, number>];
  }>();

  const searchQuery = ref('');
  const limit = ref<Record<string, number>>({});
  const sharedLimit = ref(25);

  const limitOptions: LimitSelectorItem[] = [
    { text: '25', value: 25 },
    { text: '50', value: 50 },
    { text: '100', value: 100 },
    { text: '500', value: 500 }
  ];

  // Initialize limits from localStorage
  const initializeLimits = () => {
    if (props.useSharedLimit) {
      const key = getLimitKey(true);
      const saved = localStorage.getItem(key);
      sharedLimit.value = saved !== null ? Number(saved) : 25;
    } else {
      for (const config of props.collections) {
        const key = getLimitKey(false, config.collection);
        const saved = localStorage.getItem(key);
        limit.value[config.collection] = saved !== null ? Number(saved) : 25;
      }
    }
  };

  // Watch for changes and emit events
  watch(searchQuery, (newValue) => {
    emit('update:searchQuery', newValue);
  });

  watch(sharedLimit, (newValue) => {
    if (props.useSharedLimit) {
      localStorage.setItem(getLimitKey(true), String(newValue));
      emit('update:sharedLimit', newValue);
    }
  });

  watch(limit, (newValue) => {
    if (!props.useSharedLimit) {
      Object.entries(newValue).forEach(([collection, limitValue]) => {
        localStorage.setItem(getLimitKey(false, collection), String(limitValue));
      });
      emit('update:limit', newValue);
    }
  }, { deep: true });

  // Initialize on mount
  initializeLimits();
</script>

<style scoped>
.m2a-field-group {
  display: flex;
  flex-direction: row;
  gap: 2px;
}

.search-input {
  margin-bottom: var(--input-padding);
}
</style>
