<template>
  <MainInterface
    :value="value"
    :disabled="disabled"
    :collections="collections"
    :placeholder="placeholder"
    :output-format="outputFormat"
    :display-mode="displayMode"
    :display="display"
    @input="emit('input', $event)" />
</template>

<script setup lang="ts">
  import MainInterface from './components/MainInterface.vue';
  import { CollectionConfig } from './types';

  const props = defineProps<{
    value?: string | null;
    disabled?: boolean;
    collections: CollectionConfig[];
    placeholder?: string;
    outputFormat?: 'detailed' | 'simple' | 'ids' | 'languages' | 'event_info';
    displayMode?: 'button' | 'drag';
    display?: 'raw' | 'formatted' | 'related-values' | 'labels';
  }>();

  const emit = defineEmits(['input']);
</script>
