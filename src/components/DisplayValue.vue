<template>
  <div class="display-value">
    {{ displayText }}
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import { getDisplayText } from '../utils';

  const props = defineProps<{
    value?: string | null;
    display?: 'raw' | 'formatted' | 'related-values' | 'labels';
  }>();

  const displayText = computed(() => {
    return getDisplayText(props.value, props.display || 'formatted');
  });
</script>

<style scoped>
.display-value {
  padding: var(--input-padding) 12px;
  background-color: var(--theme-background-subdued);
  border: var(--theme-border-width) solid var(--theme-border-color);
  border-radius: var(--theme-border-radius);
  color: var(--theme-foreground);
  font-size: var(--theme-font-size-base);
  line-height: 1.4;
  word-break: break-word;
  min-height: 20px;
}
</style>
