<template>
  <div v-if="selectedItems.length > 0" class="selected-items-section">
    <div class="section-header">
      <span>Selected Items ({{ selectedItems.length }})</span>
      <span class="drag-hint">Drag to reorder</span>
    </div>
    <draggable
      v-model="selectedItems"
      class="selected-items-list"
      item-key="(item) => `${item.collection}-${getItemIdentifier(item.item, item.outputField)}`"
      handle=".drag-handle"
      ghost-class="ghost-item"
      chosen-class="chosen-item"
      @end="onDragEnd">
      <template #item="{ element: item }">
        <v-list-item class="selected-item">
          <v-list-item-content class="item-content">
            <div class="item-row">
              <v-icon name="drag_handle" class="drag-handle" />
              <v-checkbox
                model-value
                @click.stop="toggleItem({ collection: item.collection, outputField: item.outputField }, item.item)" />
              <span v-tooltip.bottom.center="getTooltipValue(item.item, item.outputField)" class="item-label">
                {{ getDisplayValue(item.item, item.outputField) }}
              </span>
              <span v-if="showCollectionBadge" class="collection-badge">
                {{ formatCollectionTitle(item.collection) }}
              </span>
            </div>
          </v-list-item-content>
        </v-list-item>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  // @ts-ignore
  import draggable from 'vuedraggable';

  import { SelectedItem } from '../types';
  import { formatCollectionTitle, getDisplayValue, getItemIdentifier, getTooltipValue } from '../utils';

  const props = defineProps<{
    selectedItems: SelectedItem[];
    showCollectionBadge?: boolean;
  }>();

  const emit = defineEmits<{
    'update:selectedItems': [value: SelectedItem[]];
    'drag-end': [];
  }>();

  const onDragEnd = () => {
    emit('drag-end');
  };

  const toggleItem = (config: { collection: string; outputField: string }, item: any) => {
    const identifier = getItemIdentifier(item, config.outputField);
    const filtered = props.selectedItems.filter(
      selected =>
        !(
          selected.collection === config.collection &&
          getItemIdentifier(selected.item, selected.outputField) === identifier
        )
    );

    // If it was not already selected, add it
    if (filtered.length === props.selectedItems.length) {
      filtered.push({
        collection: config.collection,
        outputField: config.outputField,
        item
      });
    }

    emit('update:selectedItems', filtered);
  };
</script>

<style scoped>
.selected-items-section {
  margin-bottom: 12px;
  border: var(--theme-border-width) solid var(--theme-border-color);
  border-radius: var(--theme-border-radius);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--input-padding) 12px;
  background-color: var(--theme-background-subdued);
  font-weight: var(--theme-font-weight-semibold);
  font-size: var(--theme-font-size-small);
  color: var(--theme-foreground);
  border-bottom: var(--theme-border-width) solid var(--theme-border-color);
}

.section-header span:first-child {
  text-transform: uppercase;
}

.drag-hint {
  font-size: var(--theme-font-size-small);
  color: var(--theme-foreground-subdued);
  font-weight: normal;
}

.selected-items-list {
  max-height: 200px;
  overflow-y: auto;
  position: relative;
}

.selected-items-list::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--theme-primary);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  z-index: 5;
}

.selected-items-list.drag-active::after {
  opacity: 1;
}

.selected-item {
  padding: 4px 0;
  border-bottom: 1px solid var(--theme-border-color-subdued);
  transition: all 0.2s ease;
}

.selected-item:last-child {
  border-bottom: none;
}

.selected-item:hover {
  background-color: var(--theme-background-subdued);
}

.selected-item.dragging {
  opacity: 0.5;
  background-color: var(--theme-background-subdued);
  transform: scale(0.98);
  box-shadow: var(--theme-elevation-medium);
  z-index: 10;
  position: relative;
}

.selected-item.drag-over {
  background-color: var(--theme-primary-background);
  border-left: 3px solid var(--theme-primary);
  transform: translateX(4px);
}

.selected-item.drag-over::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid var(--theme-primary);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
}

.selected-item[draggable="true"]:active {
  opacity: 0.5;
  background-color: var(--theme-background-subdued);
}

.item-content {
  padding: 4px 0;
}

.item-row {
  display: flex;
  align-items: center;
  gap: var(--input-padding);
}

.item-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drag-handle {
  cursor: move;
  color: var(--theme-foreground-subdued);
  margin-right: var(--input-padding);
}

.collection-badge {
  font-size: var(--theme-font-size-small);
  color: var(--theme-foreground-subdued);
  background-color: var(--theme-background-subdued);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}
</style>
