function injectScript(): void {
  try {
    const script = document.createElement('script');
    const runtime = (browser ?? chrome).runtime;
    script.src = runtime.getURL('dist/injected.bundle.js');
    (document.head || document.documentElement).appendChild(script);
    script.onload = () => script.remove();
  } catch (e) {
    console.error(
      '%cump-inspector%c - failed to inject script into page.',
      'background-color: #dc3545; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
      'background-color: transparent; color: inherit;',
      e
    );
  }
}

injectScript();