# M2A Field Selector Extension

A Directus interface extension that allows selecting items from multiple collections with custom field output.

## Features

- **Multi-Collection Selection**: Select items from multiple collections in a single interface
- **Custom Field Output**: Specify which field to use as output for each collection
- **Translation Support**: Automatic detection and display of translation fields with proper language handling
- **Multiple Display Modes**: Choose between button, drag, and direct display modes
- **Search Functionality**: Built-in search across all configured collections
- **Drag and Drop Reordering**: Reorder selected items in drag mode
- **Flexible Output Formats**: Choose from detailed, simple, IDs-only, languages, or event_info output formats
- **Validation**: Built-in validation for selected items
- **Customizable**: Configurable placeholders and display options
- **Robust Error Handling**: Comprehensive error handling for API calls and data processing

## Installation

### From NPM (Recommended)

```bash
npm install directus-extension-m2a-field-selector
```

### Manual Installation

1. Download or clone this repository
2. Install dependencies with `npm install`
3. Build the extension with `npm run build`
4. Move the built extension to your Directus extensions folder

## Configuration

The interface has the following configuration options:

### Collections
Add one or more collections and specify which field should be used as the output value for each collection.

Format:
```json
[
  {
    "collection": "articles",
    "outputField": "title"
  },
  {
    "collection": "categories", 
    "outputField": "name"
  }
]
```

### Display Mode
Choose how the interface should be displayed:

- **Button**: Opens a drawer with the selection interface (default)
- **Drag**: Shows selected items in a draggable list for reordering
- **Direct**: Shows the selection interface directly in the field

### Output Format
Choose how the selected items should be formatted in the data:

- **Detailed**: Returns a standard Directus M2A relationship format
  ```json
  [
    {
      "collection": "category",
      "field": "title",
      "value": "Camps",
      "id": 94426642,
      "title": "Camps",
      "order": 1
    },
    {
      "collection": "category",
      "field": "title", 
      "value": "Film",
      "id": 3143044,
      "title": "Film",
      "order": 2
    }
  ]
  ```
- **Simple**: Returns an array of output field values
  ```json
  ["Item 1", "Item 2", "Item 3"]
  ```
- **IDs only**: Returns an array of item IDs
  ```json
  [1, 2, 3]
  ```
- **Languages**: Returns language-specific data (for language collections)
  ```json
  [
    {
      "language": "English",
      "code": "en",
      "order": 1
    },
    {
      "language": "Estonian", 
      "code": "et",
      "order": 2
    }
  ]
  ```
- **Event Info**: Returns event-specific data with additional metadata
  ```json
  [
    {
      "name": "Event Name",
      "id": 123,
      "event_id": "EVT-001",
      "order": 1
    }
  ]
  ```

### Placeholder
Customize the placeholder text shown in the selector.

### Translation Support
The extension automatically detects and handles translation collections:

- **Automatic Detection**: When a collection has a corresponding `{collection}_translations` collection, translation fields are automatically available
- **Smart Language Selection**: Prioritizes main language translations (English variants or explicitly marked primary translations)
- **Fallback Fields**: Uses common fallback fields (title, name, label) when specific translation fields are not available
- **Translation Fields**: Supports `translations.title`, `translations.name`, `translations.label`, etc.

Example with translations:
```json
[
  {
    "collection": "portfolio",
    "outputField": "translations.title"
  },
  {
    "collection": "news",
    "outputField": "translations.name"
  }
]
```

## Usage

1. **Field Setup**:
   - Create a field with type `json` or `alias`
   - Select "M2A Field Selector" as the interface
   - Configure the collections and output fields

2. **Configuration**:
   - Add collections you want to select from
   - Specify the output field for each collection
   - Choose your preferred display mode and output format

3. **Selection Process**:
   - Users can search across all configured collections
   - Select items from any collection
   - Reorder items if using drag mode
   - Items are automatically formatted according to your output format

## Example Configuration

```javascript
// Interface configuration
{
  collections: [
    {
      collection: 'articles',
      outputField: 'title'
    },
    {
      collection: 'categories',
      outputField: 'name'
    }
  ],
  displayMode: 'button',
  outputFormat: 'detailed',
  placeholder: 'Choose items...'
}
```

## Advanced Usage

### Custom Output Formats

You can extend the output formats by modifying the interface:

```javascript
// Custom output format example
const customFormat = (items) => {
  return items.map(item => ({
    id: item.id,
    collection: item.collection,
    label: item.value,
    url: `/admin/content/${item.collection}/${item.id}`
  }));
};
```

### Integration with Other Extensions

This extension works well with other Directus extensions:

- **Slug Generator**: Use with slug generator for URL-friendly identifiers
- **File Manager**: Select files from the file collection
- **User Management**: Select users for assignments or permissions

## Compatibility

- Directus 11.x and later
- Field types: json, alias
- Node.js >= 22.0.0
- Vue 3 with Composition API

## Development

### Project Setup

The project requires `@directus/extensions-sdk` to be installed as a development dependency:

```bash
npm install --save-dev @directus/extensions-sdk@^15.0.0
```

### Build Commands

```bash
# Build for production
npm run build

# Build for development (watch mode)
npm run dev

# Prepare for publishing
npm run prepublishOnly
```

### Project Structure

```
src/
├── components/          # Vue components
├── interface.vue        # Main interface component
├── index.ts            # Extension entry point
├── types.ts            # TypeScript type definitions
├── utils.ts            # Utility functions
└── LimitSelector.vue   # Limit selector component
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
