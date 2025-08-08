export interface CollectionConfig {
  collection: string;
  outputField: string;
}

export interface SelectedItem {
  collection: string;
  outputField: string;
  item: any;
}

export interface EventPagination {
  page: number;
  loading: boolean;
  canLoadMore: boolean;
}

export interface LimitSelectorItem {
  text: string;
  value: number;
}

export interface OutputItem {
  collection: string;
  field: string;
  value: string;
  id: string;
  title: string;
  event_id?: string;
  name?: string;
  parent?: string;
  slug?: string;
  translations?: Array<{
    language: string;
    value: string;
  }>;
  order: number;
}
