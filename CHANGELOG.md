## [1.1.0] - 2025-08-08

### Added
- Version 1.1.0 release

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of the Directus M2A Field Selector extension
- **Multi-Collection Selection**: Select items from multiple collections in a single interface
- **Custom Field Output**: Specify which field to use as output for each collection
- **Multiple Display Modes**: 
  - Button: Opens a drawer with the selection interface
  - Drag: Shows selected items in a draggable list for reordering
  - Direct: Shows the selection interface directly in the field
- **Search Functionality**: Built-in search across all configured collections
- **Drag and Drop Reordering**: Reorder selected items in drag mode
- **Flexible Output Formats**: 
  - Detailed: Returns collection and ID information
  - Simple: Returns only the selected field values
  - IDs only: Returns only the item IDs
- **Validation**: Built-in validation for selected items
- **Customizable**: Configurable placeholders and display options

### Features
- Select items from multiple collections with custom field output
- Real-time search across all configured collections
- Drag and drop reordering of selected items
- Multiple output format options for different use cases
- Integration with Directus collections and fields
- Responsive design with Directus UI integration
- TypeScript support with full type definitions

### Technical
- TypeScript support with full type definitions
- Vue 3 composition API
- Directus Extensions SDK v9 compatibility
- Modular architecture with separate components
- Comprehensive error handling
- Performance optimized with efficient search
