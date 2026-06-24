import type { EndpointFilter, StoreListener, StoreState, UmpTrace } from '../types';
import { loadExtensionSettings, saveExtensionSettings } from './extension-settings';

const MAX_TRACES = 200; // jus to make sure we don't eat up too much memory on long sessions.

class TraceStore {
  private state: StoreState = {
    traces: [],
    selectedTraceId: null,
    paused: false,
    filters: {
      endpoint: 'all'
    },
    sortNewestFirst: true
  };

  private listeners = new Set<StoreListener>();

  constructor() {
    this.initStore();
  }

  public getState(): Readonly<StoreState> {
    return this.state;
  }

  public addTrace(trace: UmpTrace): void {
    if (this.state.paused) return;
    let traces = [trace, ...this.state.traces];
    if (traces.length > MAX_TRACES) traces = traces.slice(0, MAX_TRACES);
    this.setState({ traces });
  }

  public selectTrace(id: string | null): void {
    this.setState({ selectedTraceId: id });
  }

  public clearTraces(): void {
    this.setState({ traces: [], selectedTraceId: null });
  }

  public togglePause(): void {
    this.setState({ paused: !this.state.paused });
  }

  public setEndpointFilter(endpoint: EndpointFilter): void {
    this.setState({ filters: { ...this.state.filters, endpoint } });
  }

  public toggleSortOrder(): void {
    this.setState({ sortNewestFirst: !this.state.sortNewestFirst });
  }

  public getFilteredTraces(): UmpTrace[] {
    const { traces, filters, sortNewestFirst } = this.state;
    
    let result = traces;

    if (filters.endpoint !== 'all') {
      result = result.filter((t) => t.pathname === filters.endpoint);
    }

    return sortNewestFirst ? result : [...result].reverse();
  }

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public async initStore(): Promise<void> {
    const settings = await loadExtensionSettings();

    this.setState({
      filters: {
        ...this.state.filters,
        endpoint: settings.endpoint
      },
      sortNewestFirst: settings.sortNewestFirst
    });
  }

  public setState(partial: Partial<StoreState>, saveToDb: boolean = true): void {
    this.state = { ...this.state, ...partial };
    if (saveToDb) {
      saveExtensionSettings({
        endpoint: this.state.filters.endpoint,
        sortNewestFirst: this.state.sortNewestFirst
      });
    }
    this.listeners.forEach((l) => l(this.state));
  }
}

export const store = new TraceStore();