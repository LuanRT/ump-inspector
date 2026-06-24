export type EndpointFilter = 'all' | '/videoplayback' | '/initplayback';

export interface StoreState {
  traces: UmpTrace[];
  selectedTraceId: string | null;
  paused: boolean;
  filters: {
    endpoint: EndpointFilter;
  };
  sortNewestFirst: boolean;
}

export type StoreListener = (state: Readonly<StoreState>) => void;

export interface UmpTracePart {
  type: string;
  data: unknown;
}

export interface Segment {
  headerId: number;
  parts: UmpTracePart[];
  totalSize: number;
}

export interface UmpTrace {
  id: string;
  timestamp: number;
  url: string;
  pathname: string;
  isOnesie: boolean;
  payload: unknown;
  parts: UmpTracePart[];
  segments: Segment[];
  totalMediaSize: number;
  parseError?: string;
}

export interface UmpTraceJson {
  exportedAt: string;
  pageUrl: string;
  request: UmpTrace;
}

export interface ExtensionSettings {
  enabled: boolean;
  endpoint: EndpointFilter;
  sortNewestFirst: boolean;
}