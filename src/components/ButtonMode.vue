<template>
  <div>
    <v-button
      class="select-button"
      :disabled="disabled"
      secondary
      @click="drawerOpen = true">
      <span v-if="selectedItems.length" class="selected-values">
        {{ displayText }}
      </span>
      <span v-else>{{ placeholder || "Choose items..." }}</span>
      <v-icon name="arrow_right" />
    </v-button>

    <v-drawer
      v-model="drawerOpen"
      :title="placeholder || 'Choose items...'"
      @cancel="drawerOpen = false">
      <template #actions>
        <v-button secondary @click="drawerOpen = false">Done</v-button>
      </template>

      <div class="drawer-content">
        <SearchAndLimit
          :collections="collections"
          :disabled="disabled"
          :use-shared-limit="useSharedLimit"
          @update:search-query="updateSearchQuery"
          @update:shared-limit="updateSharedLimit"
          @update:limit="updateLimit" />

        <SelectedItemsList
          :selected-items="selectedItems"
          @update:selected-items="updateSelectedItems"
          @drag-end="onDragEnd" />

        <CollectionList
          :collections="collections"
          :collection-items="collectionItems"
          :selected-items="selectedItems"
          :search-query="searchQuery"
          :show-headers
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
    </v-drawer>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';

  import { CollectionConfig, EventPagination, SelectedItem } from '../types';
  import { getDisplayText, getItemIdentifier } from '../utils';
  import CollectionList from './CollectionList.vue';
  import SearchAndLimit from './SearchAndLimit.vue';
  import SelectedItemsList from './SelectedItemsList.vue';

  const props = defineProps<{
    collections: CollectionConfig[];
    selectedItems: SelectedItem[];
    collectionItems: Record<string, any[]>;
    searchQuery: string;
    sharedLimit: number;
    limit: Record<string, number>;
    useSharedLimit: boolean;
    disabled?: boolean;
    placeholder?: string;
    display?: 'raw' | 'formatted' | 'related-values' | 'labels';
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

  const drawerOpen = ref(false);

  const displayText = computed(() => {
    // Create a simple array of values for display
    const values = props.selectedItems.map(item => {
      const displayValue = getDisplayText(item.item, props.display || 'formatted');
      return displayValue;
    });
    return values.join(', ');
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

  const updateSelectedItems = (value: SelectedItem[]) => {
    emit('update:selectedItems', value);
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
.select-button {
  width: 100%;
  justify-content: space-between;
  text-align: left;
}

.drawer-content {
  height: 100%;
  display: block;
  box-sizing: border-box;
  padding: 12px;
}

.drawer-content > * + * {
  margin-top: 12px;
}

.selected-values {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: var(--input-padding);
}

.load-more-container {
  display: flex;
  justify-content: center;
  padding: var(--input-padding);
}
</style>
