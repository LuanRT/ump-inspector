import type { EndpointFilter, ExtensionSettings } from '../types';

const STORAGE_KEY = 'umpInspector.settings';

const DEFAULT_EXTENSION_SETTINGS: ExtensionSettings = {
  enabled: true,
  endpoint: 'all',
  sortNewestFirst: true
};

function getStorage(): chrome.storage.LocalStorageArea {
  const runtime = globalThis as typeof globalThis & { browser?: typeof chrome };
  return runtime.browser?.storage?.local ?? chrome.storage.local;
}

function parseEndpoint(value: unknown): EndpointFilter {
  if (value === '/videoplayback' || value === '/initplayback') return value;
  return 'all';
}

function normalizeSettings(value: unknown): ExtensionSettings {
  const obj = (typeof value === 'object' && value !== null) ? value as Partial<ExtensionSettings> : {};

  return {
    enabled: typeof obj.enabled === 'boolean' ? obj.enabled : DEFAULT_EXTENSION_SETTINGS.enabled,
    endpoint: parseEndpoint(obj.endpoint),
    sortNewestFirst: typeof obj.sortNewestFirst === 'boolean'
      ? obj.sortNewestFirst
      : DEFAULT_EXTENSION_SETTINGS.sortNewestFirst
  };
}

export async function loadExtensionSettings(): Promise<ExtensionSettings> {
  try {
    const storage = getStorage();
    const payload = await storage.get(STORAGE_KEY);
    return normalizeSettings(payload[STORAGE_KEY]);
  } catch {
    return DEFAULT_EXTENSION_SETTINGS;
  }
}

export async function saveExtensionSettings(
  partial: Partial<ExtensionSettings>
): Promise<ExtensionSettings> {
  const storage = getStorage();
  const current = await loadExtensionSettings();
  const next = normalizeSettings({ ...current, ...partial });
  await storage.set({ [STORAGE_KEY]: next });
  return next;
}

export function subscribeExtensionSettings(
  listener: (settings: ExtensionSettings) => void
): () => void {
  const onChanged = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ): void => {
    if (areaName !== 'local') return;
    if (!changes[STORAGE_KEY]) return;

    listener(normalizeSettings(changes[STORAGE_KEY].newValue));
  };

  chrome.storage.onChanged.addListener(onChanged);
  return () => chrome.storage.onChanged.removeListener(onChanged);
}
