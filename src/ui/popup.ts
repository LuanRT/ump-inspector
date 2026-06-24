import { loadExtensionSettings, saveExtensionSettings } from '../state/extension-settings';
import type { EndpointFilter } from '../types';

async function initPopup(): Promise<void> {
  const enabledToggleEl = document.getElementById('setting-enabled') as HTMLInputElement | null;
  const endpointEl = document.getElementById('setting-endpoint') as HTMLSelectElement | null;
  const sortEl = document.getElementById('setting-sort') as HTMLSelectElement | null;

  if (!enabledToggleEl || !endpointEl || !sortEl) return;

  const settings = await loadExtensionSettings();

  enabledToggleEl.checked = settings.enabled;
  endpointEl.value = settings.endpoint;
  sortEl.value = settings.sortNewestFirst ? 'newest' : 'oldest';

  enabledToggleEl.addEventListener('change', async () => {
    try {
      await saveExtensionSettings({ enabled: enabledToggleEl.checked });
    } catch {
      enabledToggleEl.checked = !enabledToggleEl.checked;
    }
  });

  endpointEl.addEventListener('change', () => saveExtensionSettings({ endpoint: endpointEl.value as EndpointFilter }));
  sortEl.addEventListener('change', () => saveExtensionSettings({ sortNewestFirst: sortEl.value === 'newest' }));
}

initPopup();