<template>
  <div class="m2a-field-selector">
    <!-- Display mode for read-only fields -->
    <template v-if="disabled">
      <DisplayValue :value="value" :display="displayFormat" />
    </template>

    <!-- Edit mode -->
    <template v-else>
      <template v-if="displayMode === 'button'">
        <ButtonMode
          :collections="collections"
          :selected-items="selectedItems"
          :collection-items="collectionItems"
          :search-query="searchQuery"
          :shared-limit="sharedLimit"
          :limit="limit"
          :use-shared-limit="useSharedLimit"
          :disabled="disabled"
          :placeholder="placeholder"
          :display="displayFormat"
          :event-pagination="eventPagination"
          @update:selected-items="updateSelectedItems"
          @update:search-query="updateSearchQuery"
          @update:shared-limit="updateSharedLimit"
          @update:limit="updateLimit"
          @drag-end="onDragEnd"
          @load-more="loadMore" />
      </template>

      <template v-else-if="displayMode === 'drag'">
        <DragMode
          :collections="collections"
          :selected-items="selectedItems"
          :collection-items="collectionItems"
          :search-query="searchQuery"
          :shared-limit="sharedLimit"
          :limit="limit"
          :use-shared-limit="useSharedLimit"
          :disabled="disabled"
          :event-pagination="eventPagination"
          @update:selected-items="updateSelectedItems"
          @update:search-query="updateSearchQuery"
          @update:shared-limit="updateSharedLimit"
          @update:limit="updateLimit"
          @drag-end="onDragEnd"
          @load-more="loadMore" />
      </template>

      <template v-else>
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

        <div class="collection-list direct-list">
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
    </template>
  </div>
</template>

<script setup lang="ts">
  import { useApi } from '@directus/extensions-sdk';
  import { computed, onMounted, reactive, ref, watch } from 'vue';

  import { CollectionConfig, EventPagination,SelectedItem } from '../types';
  import { createOutputItem, getItemIdentifier } from '../utils';
  import ButtonMode from './ButtonMode.vue';
  import CollectionList from './CollectionList.vue';
  import DisplayValue from './DisplayValue.vue';
  import DragMode from './DragMode.vue';
  import SearchAndLimit from './SearchAndLimit.vue';
  import SelectedItemsList from './SelectedItemsList.vue';

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

  const api = useApi();

  // State
  const searchQuery = ref('');
  const limit = reactive<Record<string, number>>({});
  const sharedLimit = ref(25);
  const collectionItems = ref<Record<string, any[]>>({});
  const selectedItems = ref<SelectedItem[]>([]);
  const selectedOrder = ref<string[]>([]);

  const eventPagination = ref<EventPagination>({
    page: 1,
    loading: false,
    canLoadMore: true
  });

  // Computed
  const displayMode = computed(() => props.displayMode || 'button');
  const displayFormat = computed(() => props.display || 'formatted');
  const useSharedLimit = computed(() => props.collections.length > 1);

  const onDragEnd = () => {
    emitValue();
  };

  // Methods
  const fetchCollectionItems = async (collection: string, { loadMore = false, search = '' } = {}) => {
    if (!collection) return;

    // Use the correct limit value with fallback
    const limitValue = useSharedLimit.value ? sharedLimit.value : (limit[collection] || 25);

    if (collection === 'event') {
      if (eventPagination.value.loading) return;

      eventPagination.value.loading = true;

      if (!loadMore) {
        eventPagination.value.page = 1;
        eventPagination.value.canLoadMore = true;
      }

      try {
        const params = new URLSearchParams({
          limit: String(limitValue),
          page: String(eventPagination.value.page)
        });
        // Only sort by name if collection is 'event'
        params.append('sort', 'name');

        const config = props.collections.find(c => c.collection === collection);
        const outputField = config?.outputField || '';
        let filter;
        if (search) {
          filter = {
            _or: [
              { [outputField]: { _icontains: search } },
              { name: { _icontains: search } }
            ]
          };
        } else {
          filter = {
            _or: [
              { [outputField]: { _nempty: true } },
              { name: { _nempty: true } }
            ]
          };
        }
        params.append('filter', JSON.stringify(filter));

        const url = `/items/${collection}?${params.toString()}`;
        const response = await api.get(url);
        const newItems = response.data.data;

        if (loadMore) {
          collectionItems.value.event = [...(collectionItems.value.event || []), ...newItems];
        } else {
          collectionItems.value.event = newItems;
        }

        if (newItems.length < limitValue) {
          eventPagination.value.canLoadMore = false;
        }
        eventPagination.value.page += 1;
      } catch (error) {
        console.error(`Error fetching items for ${collection}:`, error);
      } finally {
        eventPagination.value.loading = false;
      }
      return;
    }

    // Fallback for other collections
    try {
      const params = new URLSearchParams({
        limit: String(limitValue)
      });
      // Only sort for event, so nothing here
      if (searchQuery.value) {
        params.append('filter', JSON.stringify({ name: { _eq: searchQuery.value } }));
      }

      if (props.collections.some(config => config.collection === collection && config.outputField === 'translations')) {
        params.append('fields', '*,translations.*');
      }

      const response = await api.get(`/items/${collection}?${params.toString()}`);
      const items = response.data.data;

      if (props.collections.some(config => config.collection === collection && config.outputField === 'translations')) {
        for (const item of items) {
          if (item.translations && Array.isArray(item.translations) && item.translations.length > 0) {
            if (item.translations[0] && !item.translations[0].name && item.translations[0].id) {
              try {
                const translationsResponse = await api.get(`/items/translations?filter[id][_in]=${
                  item.translations.map((t: any) => t.id).join(',')
                }`);
                if (translationsResponse.data && translationsResponse.data.data) {
                  item.translations = translationsResponse.data.data;
                }
              } catch (error) {
                console.error('Error fetching translations:', error);
              }
            }
          }
        }
      }

      collectionItems.value[collection] = items;
    } catch (error) {
      console.error(`Error fetching items for ${collection}:`, error);
      collectionItems.value[collection] = [];
    }
  };

  const toggleItem = (config: CollectionConfig, item: any) => {
    let filtered;
    if (config.outputField === 'translations' && item.translations && Array.isArray(item.translations)) {
      // Remove any selected item with the same base id (regardless of language)
      filtered = selectedItems.value.filter(
        selected =>
          !(
            selected.collection === config.collection &&
            selected.outputField === config.outputField &&
            selected.item.id === item.id
          )
      );
    } else {
      const identifier = getItemIdentifier(item, config.outputField);
      filtered = selectedItems.value.filter(
        selected =>
          !(
            selected.collection === config.collection &&
            getItemIdentifier(selected.item, selected.outputField) === identifier
          )
      );
    }

    // If it was not already selected, add it
    if (filtered.length === selectedItems.value.length) {
      filtered.push({
        collection: config.collection,
        outputField: config.outputField,
        item
      });
    }

    selectedItems.value = filtered;
    emitValue();
  };

  const emitValue = () => {
    if (selectedItems.value.length === 0) {
      emit('input', null);
      return;
    }

    // Create the output array
    const output = selectedItems.value.map((item, index) => {
      return createOutputItem(item, item, index);
    });

    // Determine what to output based on format
    let finalOutput;
    switch (props.outputFormat) {
      case 'simple':
        finalOutput = output.map(item => item.value);
        break;
      case 'ids':
        finalOutput = output.map(item => item.id);
        break;
      case 'event_info':
        finalOutput = output.map(item => {
          if (item.collection === 'event') {
            return {
              name: item.title,
              id: item.id,
              event_id: item.event_id,
              order: item.order // Include order in event_info format
            };
          }
          return item.id;
        });
        break;
      case 'languages':
        finalOutput = output
          .filter(item => item.collection === 'languages')
          .map(item => {
            const languageItem = collectionItems.value.languages?.find(i => getItemIdentifier(i) === item.id);
            if (languageItem) {
              return {
                language: item.value,
                code: languageItem.code,
                order: item.order // Include order in languages format
              };
            }
            return null;
          })
          .filter(Boolean);
        break;
      default:
        // Use the output as is
        finalOutput = output;
    }

    // Special direct fix for the detailed format JSON structure
    // We'll manually create the JSON to ensure parent is a string
    let jsonOutput;

    // Output format is detailed, simple, ids, or languages
    if (props.outputFormat !== 'simple' && props.outputFormat !== 'ids' && props.outputFormat !== 'languages') {
      // Create a clean representation for the JSON
      const cleanOutput = finalOutput.map((item: any) => {
        // Create a fresh object with only the properties we want
        const clean: Record<string, any> = {
          collection: item.collection,
          field: item.field,
          value: item.value,
          id: item.id,
          title: item.title,
          order: item.order // Include order in detailed format
        };

        if (item.event_id) {
          clean.event_id = item.event_id;
        }

        if (item.name) {
          clean.name = item.name;
        }

        // Explicitly add parent as string if it exists
        if (item.parent) {
          clean.parent = item.parent;
        }

        // Add slug if it exists
        if (item.slug) {
          clean.slug = item.slug;
        }

        // Add translations if they exist
        if (item.translations) {
          clean.translations = item.translations;
        }

        return clean;
      });

      jsonOutput = JSON.stringify(cleanOutput);
    } else {
      // For other formats, use standard JSON stringification
      jsonOutput = JSON.stringify(finalOutput);
    }

    // Skip the intermediate step that might be causing issues
    emit('input', jsonOutput);
  };

  const processValue = async (value: any): Promise<any[]> => {
    if (!value) return [];

    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : (() => {
        try { return JSON.parse(value); } catch { return value; }
      })();

      const resolveItem = async (collection: string, outputField: string, id: string | number) => {
        let foundItem = collectionItems.value[collection]?.find(
          i => getItemIdentifier(i, outputField) === id
        );

        if (!foundItem) {
          try {
            let idToFetch = id;
            if (outputField === 'translations' && typeof id === 'string' && id.includes('-')) {
              idToFetch = id.split('-')[0];
            }
            const response = await api.get(`/items/${collection}/${idToFetch}`);
            foundItem = response.data.data;
            if (foundItem) {
              if (!collectionItems.value[collection]) {
                collectionItems.value[collection] = [];
              }
              if (!collectionItems.value[collection].some(i => i.id === foundItem.id)) {
                collectionItems.value[collection].push(foundItem);
              }
            }
          } catch (error) {
            console.error(`Error fetching individual item ${id} from ${collection}:`, error);
            return null;
          }
        }

        if (foundItem) {
          return {
            collection,
            outputField,
            item: foundItem
          };
        }
        return null;
      };

      if (props.outputFormat === 'languages' && Array.isArray(parsed)) {
        const items = await Promise.all(parsed.map(async item => {
          const languageItem = collectionItems.value.languages?.find(lang => lang.code === item.code);
          if (languageItem) {
            return {
              collection: 'languages',
              outputField: 'name',
              item: languageItem
            };
          }
          return null;
        }));
        return items.filter(Boolean);
      }

      if (props.outputFormat === 'event_info' && Array.isArray(parsed)) {
        const items = await Promise.all(parsed.map(async item => {
          if (item && typeof item === 'object' && item.id) {
            const config = props.collections.find(c => c.collection === 'event');
            if (config) {
              return await resolveItem('event', config.outputField, item.id);
            }
          }
          return null;
        }));
        return items.filter(Boolean);
      }

      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
        const promises = Object.entries(collectionItems.value)
          .flatMap(([collection, items]) => {
            const config = props.collections.find(c => c.collection === collection);
            if (!config) return [];
            return items
              .filter(item => parsed.includes(item[config.outputField]))
              .map(item => ({
                collection,
                outputField: config.outputField,
                item
              }));
          });
        return promises;
      }

      if (Array.isArray(parsed) && parsed.length > 0 && (typeof parsed[0] === 'number' || typeof parsed[0] === 'string')) {
        const promises = Object.entries(collectionItems.value)
          .flatMap(([collection, items]) => {
            const config = props.collections.find(c => c.collection === collection);
            if (!config) return [];
            return items
              .filter(item => parsed.includes(getItemIdentifier(item, config.outputField)))
              .map(item => ({
                collection,
                outputField: config.outputField,
                item
              }));
          });
        return promises;
      }

      if (Array.isArray(parsed)) {
        const items = await Promise.all(parsed.map(async (item) => {
          const config = props.collections.find(c => c.collection === item.collection);
          if (!config) return null;
          return await resolveItem(item.collection, item.field || config.outputField, item.id);
        }));
        return items.filter(Boolean);
      }

      return [];
    } catch (error) {
      console.error('Error processing value:', error);
      return [];
    }
  };

  const updateSelectedItems = (items: SelectedItem[]) => {
    selectedItems.value = items;
    emitValue();
  };

  const updateSearchQuery = (query: string) => {
    searchQuery.value = query;
  };

  const updateSharedLimit = (limit: number) => {
    sharedLimit.value = limit;
  };

  const updateLimit = (newLimit: Record<string, number>) => {
    Object.assign(limit, newLimit);
  };

  const loadMore = () => {
    fetchCollectionItems('event', { loadMore: true, search: searchQuery.value });
  };

  onMounted(async () => {
    // Initialize limit values for each collection
    for (const config of props.collections) {
      if (!limit[config.collection]) {
        limit[config.collection] = 25; // Default limit
      }
    }

    for (const config of props.collections) {
      await fetchCollectionItems(config.collection, { search: searchQuery.value });
    }

    if (props.value) {
      try {
        const parsed = typeof props.value === 'string' ? JSON.parse(props.value) : props.value;
        const items = Array.isArray(parsed) ? parsed : [parsed];

        items.forEach(parsed => {
          const config = props.collections.find(c => c.collection === parsed.collection);
          if (config) {
            const item = collectionItems.value[parsed.collection]?.find(
              item => getItemIdentifier(item, parsed.field) === parsed.id
            );
            if (item) {
              selectedItems.value.push({
                collection: parsed.collection,
                outputField: parsed.field,
                item
              });
            }
          }
        });
      } catch (error) {
        console.error('Error parsing initial value:', error);
      }
    }
  });

  watch(selectedItems, (items) => {
    selectedOrder.value = items.map(item => `${item.collection}-${getItemIdentifier(item.item, item.outputField)}`);
  }, { immediate: true });

  watch(() => props.collections, async (newCollections) => {
    for (const config of newCollections) {
      if (!collectionItems.value[config.collection]) {
        await fetchCollectionItems(config.collection, {});
      }
    }
  }, { deep: true });

  watch(
    () => props.value,
    async (newValue) => {
      if (newValue) {
        await Promise.all(props.collections.map(async (config) => {
          if (!collectionItems.value[config.collection]) {
            await fetchCollectionItems(config.collection, {});
          }
        }));

        const processedItems = await processValue(newValue);
        selectedItems.value = processedItems.filter((item): item is SelectedItem => item !== null);
      } else {
        selectedItems.value = [];
      }
    },
    { immediate: true }
  );

  watch(searchQuery, (newValue) => {
    const eventConfig = props.collections.find(c => c.collection === 'event');
    if (eventConfig) {
      fetchCollectionItems('event', { search: newValue });
    }
  });

  watch(() => props.collections, (newCollections) => {
    // Initialize limit values for new collections
    newCollections.forEach(config => {
      if (!limit[config.collection]) {
        limit[config.collection] = 25; // Default limit
      }
    });

    if (useSharedLimit.value) {
      watch(sharedLimit, (newLimit) => {
        newCollections.forEach(config => {
          fetchCollectionItems(config.collection, { search: searchQuery.value });
        });
      });
    } else {
      newCollections.forEach((config) => {
        watch(
          () => limit[config.collection],
          (newLimit: number) => {
            // Refetch event items when limit changes
            if (config.collection === 'event') {
              fetchCollectionItems('event', { search: searchQuery.value });
            }
          }
        );
      });
    }
  });
</script>

<style scoped>
.m2a-field-selector {
  display: flex;
  flex-direction: column;
  gap: var(--input-padding);
}

.direct-list {
  border: var(--theme-border-width) solid var(--theme-border-color);
  border-radius: var(--theme-border-radius);
  max-height: 400px;
}

.load-more-container {
  display: flex;
  justify-content: center;
  padding: var(--input-padding);
}
</style>
