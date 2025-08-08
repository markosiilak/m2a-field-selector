# M2A Field Selector - Component Structure

This document describes the new modular structure of the M2A Field Selector component.

## Overview

The original monolithic `interface.vue` file has been split into multiple smaller, focused components for better maintainability, reusability, and testing.

## File Structure

```
src/
├── interface.vue                 # Main entry point (simplified wrapper)
├── types.ts                      # TypeScript type definitions
├── utils.ts                      # Utility functions
└── components/
    ├── index.ts                  # Component exports
    ├── DisplayValue.vue          # Read-only display component
    ├── SearchAndLimit.vue        # Search and limit selector
    ├── SelectedItemsList.vue     # Selected items with drag & drop
    ├── CollectionList.vue        # Collection items list
    ├── ButtonMode.vue            # Button display mode
    ├── DragMode.vue              # Drag display mode
    └── MainInterface.vue         # Main orchestration component
```

## Component Responsibilities

### `interface.vue`
- **Purpose**: Main entry point and public API
- **Responsibilities**: 
  - Props validation
  - Event forwarding to MainInterface
  - Minimal wrapper logic

### `types.ts`
- **Purpose**: Centralized TypeScript type definitions
- **Contains**:
  - `CollectionConfig` - Collection configuration interface
  - `SelectedItem` - Selected item structure
  - `EventPagination` - Pagination state
  - `LimitSelectorItem` - Limit selector options
  - `OutputItem` - Output format structure

### `utils.ts`
- **Purpose**: Reusable utility functions
- **Contains**:
  - `getItemIdentifier()` - Generate unique item identifiers
  - `getDisplayValue()` - Extract display values from items
  - `getTooltipValue()` - Generate tooltip text
  - `formatCollectionTitle()` - Format collection names
  - `getDisplayText()` - Format display text for different modes
  - `createOutputItem()` - Create output items with proper structure
  - `getLimitKey()` - Generate localStorage keys

### `components/DisplayValue.vue`
- **Purpose**: Display read-only values
- **Props**: `value`, `display`
- **Features**: Handles different display formats (raw, formatted, etc.)

### `components/SearchAndLimit.vue`
- **Purpose**: Search input and limit selector
- **Props**: `collections`, `disabled`, `useSharedLimit`
- **Events**: `update:searchQuery`, `update:sharedLimit`, `update:limit`
- **Features**: 
  - Search functionality
  - Limit selection with localStorage persistence
  - Shared vs individual limits

### `components/SelectedItemsList.vue`
- **Purpose**: Display and manage selected items
- **Props**: `selectedItems`, `showCollectionBadge`
- **Events**: `update:selectedItems`, `drag-end`
- **Features**:
  - Drag and drop reordering
  - Item removal
  - Visual feedback during drag operations

### `components/CollectionList.vue`
- **Purpose**: Display available collection items
- **Props**: `collections`, `collectionItems`, `selectedItems`, `searchQuery`, `showHeaders`
- **Events**: `toggle-item`
- **Features**:
  - Parent-child grouping
  - Search filtering
  - Item selection
  - Collection headers

### `components/ButtonMode.vue`
- **Purpose**: Button display mode with drawer
- **Props**: All interface props + mode-specific props
- **Events**: All interface events
- **Features**:
  - Button trigger
  - Drawer interface
  - Full functionality in modal context

### `components/DragMode.vue`
- **Purpose**: Drag display mode
- **Props**: All interface props + mode-specific props
- **Events**: All interface events
- **Features**:
  - Inline drag and drop
  - Direct item selection
  - Visual drag feedback

### `components/MainInterface.vue`
- **Purpose**: Main orchestration component
- **Responsibilities**:
  - State management
  - API communication
  - Event handling
  - Component coordination
  - Value processing and emission

## Benefits of This Structure

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be used independently
3. **Testability**: Smaller components are easier to test
4. **Readability**: Code is more organized and easier to understand
5. **Performance**: Better tree-shaking and lazy loading opportunities
6. **Debugging**: Easier to isolate and fix issues

## Usage

The main `interface.vue` file maintains the same public API, so existing usage remains unchanged. The internal structure is now modular and can be extended or modified more easily.

## Migration Notes

- All existing functionality is preserved
- No breaking changes to the public API
- Internal refactoring only affects maintainability
- Performance should be similar or better due to better component isolation
