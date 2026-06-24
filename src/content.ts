import { BRIDGE_MESSAGE_TYPE, type BridgeMessage } from './bridge';
import { loadExtensionSettings, subscribeExtensionSettings } from './state/extension-settings';
import { store } from './state/store';
import { mountPanel, unmountPanel } from './ui/panel';

let scriptInjected = false;
let traceListenerAttached = false;
let panelObserver: MutationObserver | null = null;
let extensionEnabled = true;

function injectScript(): void {
  if (scriptInjected) return;

  try {
    const script = document.createElement('script');
    const runtime = (globalThis as typeof globalThis & { browser?: typeof chrome }).browser?.runtime ?? chrome.runtime;
    script.src = runtime.getURL('dist/injected.bundle.js');
    (document.head || document.documentElement).appendChild(script);
    script.onload = () => script.remove();
    scriptInjected = true;
  } catch (e) {
    console.error(
      '%cump-inspector%c - failed to inject script into page.',
      'background-color: #dc3545; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
      'background-color: transparent; color: inherit;',
      e
    );
  }
}

/**
 * Listen for stuff from our injected script.
 */
function listenForTraces(): void {
  if (traceListenerAttached) return;

  window.addEventListener('message', (event: MessageEvent) => {
    if (!extensionEnabled) return;
    if (event.source !== window) return;

    const msg = event.data as BridgeMessage | undefined;
    if (
      msg &&
      msg.type === BRIDGE_MESSAGE_TYPE &&
      msg.trace
    ) {
      store.addTrace(msg.trace);
    }
  });

  traceListenerAttached = true;
}

/**
 * Watch for the panel being removed (may or may not happen :p)
 */
function watchForPanelRemoval(): void {
  if (panelObserver || !document.body) return;

  panelObserver = new MutationObserver(() => {
    if (!extensionEnabled) return;

    const root = document.getElementById('ump-inspector-root');
    if (!root) mountPanel();
  });
  panelObserver.observe(document.body, { childList: true });
}

function ensurePanelMounted(): void {
  if (!extensionEnabled) return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!extensionEnabled) return;
      mountPanel();
      watchForPanelRemoval();
    }, { once: true });

    return;
  }

  mountPanel();
  watchForPanelRemoval();
}

function applyEnabledState(enabled: boolean): void {
  extensionEnabled = enabled;

  if (!extensionEnabled) {
    store.clearTraces();
    unmountPanel();
    return;
  }

  injectScript();
  listenForTraces();
  ensurePanelMounted();
}

async function init(): Promise<void> {
  const settings = await loadExtensionSettings();
  applyEnabledState(settings.enabled);

  subscribeExtensionSettings((nextSettings) => {
    store.setState({
      filters: {
        ...store.getState().filters,
        endpoint: nextSettings.endpoint
      },
      sortNewestFirst: nextSettings.sortNewestFirst
    }, /** saveToDb */ false);

    applyEnabledState(nextSettings.enabled);
  });

  document.addEventListener('yt-navigate-finish', () => {
    if (extensionEnabled) {
      mountPanel();
    } else {
      unmountPanel();
    }
  });
}

init();