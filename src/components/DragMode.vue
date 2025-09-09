<template>
  <div>
    <SearchAndLimit
      :collections="collections"
      :disabled="disabled"
      :use-shared-limit="useSharedLimit"
      @update:search-query="updateSearchQuery"
      @update:shared-limit="updateSharedLimit"
      @update:limit="updateLimit" />

    <div class="collection-list direct-list">
      <draggable
        v-model="selectedItemsComputed"
        class="draggable-container"
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
                <span v-if="item.item.date_created" class="date-created">
                  {{ formatDate(item.item.date_created) }}
                </span>
                <span class="collection-badge">{{ formatCollectionTitle(item.collection) }}</span>
              </div>
            </v-list-item-content>
          </v-list-item>
        </template>
      </draggable>
    </div>

    <v-divider v-if="selectedItems.length > 0" />

    <CollectionList
      :collections="collections"
      :collection-items="collectionItems"
      :selected-items="selectedItems"
      :search-query="searchQuery"
      show-headers
      @toggle-item="toggleItem" />

    <template v-if="collections.some(c => c.collection === 'event') && eventPagination.canLoadMore">
      <div class="load-more-container">
        <v-button
          :loading="eventPagination.loading"
          small
          secondary
          @click="loadMore">
          Load More
        </v-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  // @ts-ignore
  import draggable from 'vuedraggable';

  import { CollectionConfig, EventPagination, SelectedItem } from '../types';
  import { formatCollectionTitle, formatDate, getDisplayValue, getItemIdentifier, getTooltipValue } from '../utils';
  import CollectionList from './CollectionList.vue';
  import SearchAndLimit from './SearchAndLimit.vue';

  const props = defineProps<{
    collections: CollectionConfig[];
    selectedItems: SelectedItem[];
    collectionItems: Record<string, any[]>;
    searchQuery: string;
    sharedLimit: number;
    limit: Record<string, number>;
    useSharedLimit: boolean;
    disabled?: boolean;
    eventPagination: EventPagination;
  }>();

  const emit = defineEmits<{
    'update:selectedItems': [value: SelectedItem[]];
    'update:searchQuery': [value: string];
    'update:sharedLimit': [value: number];
    'update:limit': [value: Record<string, number>];
    'drag-end': [];
    'load-more': [];
  }>();

  const selectedItemsComputed = computed({
    get: () => {
      // Sort by date_created (newest first) if available
      return [...props.selectedItems].sort((a, b) => {
        const dateA = a.item.date_created ? new Date(a.item.date_created).getTime() : 0;
        const dateB = b.item.date_created ? new Date(b.item.date_created).getTime() : 0;
        return dateB - dateA; // Newest first
      });
    },
    set: (value: SelectedItem[]) => emit('update:selectedItems', value)
  });

  const updateSearchQuery = (value: string) => {
    emit('update:searchQuery', value);
  };

  const updateSharedLimit = (value: number) => {
    emit('update:sharedLimit', value);
  };

  const updateLimit = (value: Record<string, number>) => {
    emit('update:limit', value);
  };

  const onDragEnd = () => {
    emit('drag-end');
  };

  const toggleItem = (config: CollectionConfig, item: any) => {
    let filtered;
    if (config.outputField === 'translations' && item.translations && Array.isArray(item.translations)) {
      // Remove any selected item with the same base id (regardless of language)
      filtered = props.selectedItems.filter(
        selected =>
          !(
            selected.collection === config.collection &&
            selected.outputField === config.outputField &&
            selected.item.id === item.id
          )
      );
    } else {
      const identifier = getItemIdentifier(item, config.outputField);
      filtered = props.selectedItems.filter(
        selected =>
          !(
            selected.collection === config.collection &&
            getItemIdentifier(selected.item, selected.outputField) === identifier
          )
      );
    }

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

  const loadMore = () => {
    emit('load-more');
  };
</script>

<style scoped>
.direct-list {
  border: var(--theme-border-width) solid var(--theme-border-color);
  border-radius: var(--theme-border-radius);
  max-height: 400px;
  overflow-y: auto;
}

.draggable-container {
  position: relative;
}

.draggable-container::after {
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

.draggable-container.drag-active::after {
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

.date-created {
  font-size: var(--theme-font-size-small);
  color: var(--theme-foreground-subdued);
  margin-right: var(--input-padding);
  white-space: nowrap;
}

.collection-badge {
  font-size: var(--theme-font-size-small);
  color: var(--theme-foreground-subdued);
  background-color: var(--theme-background-subdued);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.load-more-container {
  display: flex;
  justify-content: center;
  padding: var(--input-padding);
}
</style>
