import type { CollectionConfig, OutputItem } from "./types";

export const getItemIdentifier = (item: any, outputField?: string): string => {
  if (outputField === "translations" && item.translations && Array.isArray(item.translations)) {
    const parentId = item.id;
    const languageCode = item.translations[0]?.languages_code || item.translations[0]?.language;
    if (parentId && languageCode) {
      return `${parentId}-${languageCode}`;
    }
  }
  return item.id ?? item.name ?? JSON.stringify(item);
};

export const getDisplayValue = (item: any, outputField: string): string => {
  if (!item) return "";

  // Special case: display only event_id if requested
  if (outputField === "event_id") {
    return String(item.event_id ?? "");
  }

  if (outputField === "translations") {
    if (item.translations && Array.isArray(item.translations) && item.translations.length > 0) {
      for (const translation of item.translations) {
        if (translation && translation.name) {
          return translation.name;
        }
      }
      return "Translation without name";
    }
    return item.name || item.title || "No translations";
  }

  // Try to get the value from the specified output field
  let value = item[outputField];

  // If the output field value is empty, null, or seems like an ID, try fallback fields
  if (!value || value === item.id || (typeof value === "string" && value.length > 20)) {
    // Try common display fields in order of preference
    const fallbackFields = ["name", "title", "label", "display_name", "displayName"];
    for (const field of fallbackFields) {
      if (item[field] && item[field] !== item.id) {
        value = item[field];
        break;
      }
    }
  }

  return value || "";
};

export const getTooltipValue = (item: any, outputField: string): string => {
  if (!item) return "";

  // Special case for events: show both event_id and name separately
  if (item.event_id && (item.name || item.title)) {
    const eventName = item.name || item.title || "";
    return `Event ID: ${item.event_id}\nName: ${eventName}`;
  }

  // Use the improved getDisplayValue function
  return getDisplayValue(item, outputField);
};

export const formatCollectionTitle = (collection: string) => {
  // Convert snake_case or kebab-case to Title Case
  return collection
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getDisplayText = (value: any, displayFormat: string) => {
  if (!value) return "";

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;

    switch (displayFormat) {
      case "raw":
        return typeof value === "string" ? value : JSON.stringify(value);

      case "formatted":
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => {
              if (typeof item === "object" && item.value) {
                return item.value;
              }
              // Handle language objects specifically
              if (typeof item === "object" && item.language) {
                return item.language;
              }
              if (typeof item === "object" && item.name) {
                return item.name;
              }
              if (typeof item === "object" && item.title) {
                return item.title;
              }
              return typeof item === "object" ? JSON.stringify(item) : item;
            })
            .join(", ");
        }
        return typeof parsed === "object" && parsed.value
          ? parsed.value
          : typeof parsed === "object" && parsed.language
            ? parsed.language
            : typeof parsed === "object" && parsed.name
              ? parsed.name
              : typeof parsed === "object" && parsed.title
                ? parsed.title
                : typeof parsed === "object"
                  ? JSON.stringify(parsed)
                  : String(parsed);

      case "related-values":
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => {
              if (typeof item === "object") {
                return `${item.collection || ""}: ${item.value || item.language || item.title || item.name || item.id || ""}`;
              }
              return item;
            })
            .join(", ");
        }
        return typeof parsed === "object"
          ? `${parsed.collection || ""}: ${parsed.value || parsed.language || parsed.title || parsed.name || parsed.id || ""}`
          : String(parsed);

      case "labels":
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => {
              if (typeof item === "object") {
                // Handle language objects specifically
                if (item.language) {
                  return item.language;
                }
                if (item.name) {
                  return item.name;
                }
                if (item.title) {
                  return item.title;
                }
                if (item.value) {
                  return item.value;
                }
                if (item.id) {
                  return item.id;
                }
                // If none of the expected properties exist, try to get a meaningful string
                return JSON.stringify(item);
              }
              return item;
            })
            .join(", ");
        }
        return typeof parsed === "object"
          ? parsed.language ||
              parsed.title ||
              parsed.name ||
              parsed.value ||
              parsed.id ||
              JSON.stringify(parsed)
          : String(parsed);

      default:
        return String(parsed);
    }
  } catch (error) {
    return String(value);
  }
};

export const createOutputItem = (
  item: any,
  config: CollectionConfig,
  index: number,
): OutputItem => {
  const baseOutput: OutputItem = {
    collection: item.collection,
    field: item.outputField,
    value: getDisplayValue(item.item, item.outputField),
    id: getItemIdentifier(item.item, item.outputField),
    title: item.item.title || item.item.name || getDisplayValue(item.item, item.outputField),
    event_id: item.item.event_id,
    order: index + 1, // Add order number starting from 1
  };

  // Include all language translations when the field is translations
  if (
    item.outputField === "translations" &&
    item.item.translations &&
    Array.isArray(item.item.translations)
  ) {
    baseOutput.translations = item.item.translations
      .filter((translation: any) => translation && translation.name)
      .map((translation: any) => ({
        language: translation.languages_code || translation.language || "",
        value: translation.name,
      }));
  }

  // Add parent information if it exists - ensure it's a string
  if (item.item.parent) {
    const parentId = typeof item.item.parent === "object" ? item.item.parent.id : item.item.parent;
    if (parentId) {
      baseOutput.parent = String(parentId);
    }
  }

  // Add slug field for category items
  if (item.collection === "category" && item.item.key) {
    baseOutput.slug = item.item.key;
  }

  // Add slug field for article_category items from the key field
  if (item.collection === "article_category" && item.item.key) {
    baseOutput.slug = item.item.key;
    // Fallback for article_category if key doesn't exist, use generated slug from display value
  } else if (item.collection === "article_category") {
    const displayValue = getDisplayValue(item.item, item.outputField);
    if (displayValue) {
      const slug = displayValue
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      baseOutput.slug = slug;
    }
  }

  return baseOutput;
};

// Helper to get the localStorage key for a collection or shared
export function getLimitKey(useSharedLimit: boolean, collection?: string): string {
  return useSharedLimit
    ? "m2a-limit-selector-shared-limit"
    : `m2a-limit-selector-limit-${collection}`;
}

export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return "";
  }
};
