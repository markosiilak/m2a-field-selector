<template>
  <div class="collection-list">
    <div v-for="config in collections" :key="config.collection">
      <div v-if="showHeaders" class="collection-header">
        <v-list-item-content>{{ formatCollectionTitle(config.collection) }}</v-list-item-content>
      </div>

      <!-- Use parent grouping if available -->
      <template v-if="hasParentField(config.collection)">
        <div v-for="[parentId, items] in getItemsByParent(config)" :key="`parent-${parentId || 'none'}`">
          <!-- Parent group header -->
          <div v-if="parentId" class="parent-group-header">
            <span>{{ getParentName(config.collection, parentId) }}</span>
          </div>

          <v-list-item
            v-for="item in filterItemsBySearch(items, config.outputField, config.collection)"
            :key="`${config.collection}-${getItemIdentifier(item, config.outputField)}`"
            clickable
            @click="toggleItem(config, item)">
            <v-list-item-content class="item-content">
              <div class="item-row">
                <v-checkbox
                  :model-value="false"
                  @click.stop
                  @click="toggleItem(config, item)" />
                <span v-tooltip.bottom.center="getTooltipValue(item, config.outputField)" class="item-label">
                  {{ getDisplayValue(item, config.outputField) }}
                </span>
                <span v-if="item.date_created" class="date-created">
                  {{ formatDate(item.date_created) }}
                </span>
              </div>
            </v-list-item-content>
          </v-list-item>
        </div>
      </template>

      <!-- Regular non-grouped display -->
      <template v-else>
        <v-list-item
          v-for="item in filteredItems(config.collection, config.outputField)"
          :key="`${config.collection}-${getItemIdentifier(item, config.outputField)}`"
          clickable
          @click="toggleItem(config, item)">
          <v-list-item-content class="item-content">
            <div class="item-row">
              <v-checkbox
                :model-value="false"
                @click.stop
                @click="toggleItem(config, item)" />
              <span v-tooltip.bottom.center="getTooltipValue(item, config.outputField)" class="item-label">
                {{ getDisplayValue(item, config.outputField) }}
              </span>
              <span v-if="item.date_created" class="date-created">
                {{ formatDate(item.date_created) }}
              </span>
            </div>
          </v-list-item-content>
        </v-list-item>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { CollectionConfig } from '../types';
  import {
    formatCollectionTitle,
    formatDate,
    getDisplayValue,
    getItemIdentifier,
    getTooltipValue
  } from '../utils';

  const props = defineProps<{
    collections: CollectionConfig[];
    collectionItems: Record<string, any[]>;
    selectedItems: Array<{ collection: string; outputField: string; item: any }>;
    searchQuery: string;
    showHeaders?: boolean;
  }>();

  const emit = defineEmits<{
    'toggle-item': [config: CollectionConfig, item: any];
  }>();

  const filteredItems = (collection: string, outputField: string) => {
    const items = props.collectionItems[collection] || [];
    let filtered = items;

    if (props.searchQuery && collection !== 'event') {
      filtered = items.filter(item => {
        const displayValue = getDisplayValue(item, outputField);
        return String(displayValue).toLowerCase().includes(props.searchQuery.toLowerCase());
      });
    }

    // Only show unselected items
    const unselected = filtered.filter(item =>
      !isSelected(collection, getItemIdentifier(item, outputField))
    );

    // Sort by date_created (newest first) if available, otherwise alphabetically by display value
    return unselected.sort((a, b) => {
      const dateA = a.date_created ? new Date(a.date_created).getTime() : 0;
      const dateB = b.date_created ? new Date(b.date_created).getTime() : 0;
      
      if (dateA !== 0 || dateB !== 0) {
        return dateB - dateA; // Newest first
      }
      
      // Fallback to alphabetical sorting
      const aValue = getDisplayValue(a, outputField).toLowerCase();
      const bValue = getDisplayValue(b, outputField).toLowerCase();
      return aValue.localeCompare(bValue);
    });
  };

  const isSelected = (collection: string, itemId: string) => {
    return props.selectedItems.some(
      item => item.collection === collection && getItemIdentifier(item.item, item.outputField) === itemId
    );
  };

  const hasParentField = (collection: string): boolean => {
    if (!props.collectionItems[collection] || props.collectionItems[collection].length === 0) {
      return false;
    }
    return 'parent' in props.collectionItems[collection][0];
  };

  const getItemsByParent = (config: CollectionConfig) => {
    const items = filteredItems(config.collection, config.outputField);
    const groupedItems = new Map<string | null, any>();

    // First, collect items with no parent
    const noParentItems = items.filter(item => !item.parent);
    if (noParentItems.length > 0) {
      groupedItems.set(null, noParentItems);
    }

    // Then, collect items grouped by parent
    items.forEach(item => {
      if (item.parent) {
        const parentId = typeof item.parent === 'object' ? item.parent.id : item.parent;
        if (parentId) {
          if (!groupedItems.has(parentId)) {
            groupedItems.set(parentId, []);
          }
          groupedItems.get(parentId)!.push(item);
        }
      }
    });

    return groupedItems;
  };

  const getParentName = (collection: string, parentId: string): string => {
    const parentItem = props.collectionItems[collection]?.find(item =>
      getItemIdentifier(item, props.collectionItems[collection][0].outputField) === parentId
    );
    if (!parentItem) return `${parentId}`;

    const config = props.collections.find(c => c.collection === collection);
    if (config) {
      return getDisplayValue(parentItem, config.outputField);
    }

    return parentItem.name || parentItem.title || `${parentId}`;
  };

  const filterItemsBySearch = (items: any[], outputField: string, collection: string) => {
    let filtered = items;

    if (props.searchQuery && collection !== 'event') {
      filtered = items.filter(item => {
        const displayValue = getDisplayValue(item, outputField);
        return String(displayValue).toLowerCase().includes(props.searchQuery.toLowerCase());
      });
    }

    // Separate selected and unselected items
    const selected = filtered.filter(item =>
      isSelected(collection, getItemIdentifier(item, outputField))
    );
    const unselected = filtered.filter(item =>
      !isSelected(collection, getItemIdentifier(item, outputField))
    );

    // Sort both groups by date_created (newest first) if available, otherwise alphabetically
    const sortByDateOrDisplayValue = (a: any, b: any) => {
      const dateA = a.date_created ? new Date(a.date_created).getTime() : 0;
      const dateB = b.date_created ? new Date(b.date_created).getTime() : 0;
      
      if (dateA !== 0 || dateB !== 0) {
        return dateB - dateA; // Newest first
      }
      
      // Fallback to alphabetical sorting
      const aValue = getDisplayValue(a, outputField).toLowerCase();
      const bValue = getDisplayValue(b, outputField).toLowerCase();
      return aValue.localeCompare(bValue);
    };

    selected.sort(sortByDateOrDisplayValue);
    unselected.sort(sortByDateOrDisplayValue);

    // Return selected items first, then unselected items
    return [...selected, ...unselected];
  };

  const toggleItem = (config: CollectionConfig, item: any) => {
    emit('toggle-item', config, item);
  };
</script>

<style scoped>
.collection-list {
  flex-grow: 1;
  overflow-y: auto;
}

.collection-header {
  background-color: var(--theme-background-subdued);
  font-weight: var(--theme-font-weight-semibold);
  pointer-events: none;
  padding: 4px var(--input-padding);
}

.collection-header :deep(.v-list-item-content) {
  font-size: var(--theme-font-size-small);
  text-transform: uppercase;
  color: var(--theme-foreground-subdued);
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

.date-created {
  font-size: var(--theme-font-size-small);
  color: var(--theme-foreground-subdued);
  margin-right: var(--input-padding);
  white-space: nowrap;
}

.parent-group-header {
  background-color: var(--theme-background-normal);
  padding: 4px 12px;
  font-weight: var(--theme-font-weight-medium);
  font-size: var(--theme-font-size-small);
  color: var(--theme-foreground);
  border-top: var(--theme-border-width) solid var(--theme-border-color);
  border-bottom: var(--theme-border-width) solid var(--theme-border-color);
}

.parent-group-header span {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: block;
}

.v-list-item {
  user-select: none;
}

.v-list-item[draggable="true"]:active {
  opacity: 0.5;
  background-color: var(--theme-background-subdued);
}
</style>
