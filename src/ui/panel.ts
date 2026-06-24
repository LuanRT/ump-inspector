import { store } from '../state/store';
import { PANEL_STYLES } from './styles';
import { downloadJson, formatSize, formatTime } from '../helpers';
import type { EndpointFilter, UmpTrace, UmpTracePart, Segment, UmpTraceJson } from '../types';

import Prism from 'prismjs';

// Looks way too fucking ugly.
if (Prism.languages.json['operator']) delete Prism.languages.json['operator'];

// @ts-expect-error - ignore the jank.
import prismBaseCss from 'prismjs/themes/prism.css?raw';
// @ts-expect-error - please shut up, typescript.
import prismThemeCss from 'prismjs/themes/prism-twilight.min.css?raw';

import 'prismjs/components/prism-json';

let hostEl: HTMLDivElement | null = null;
let shadowRoot: ShadowRoot | null = null;

let panelEl: HTMLElement | null = null;
let toggleEl: HTMLButtonElement | null = null;
let toggleBadgeEl: HTMLElement | null = null;
let traceListEl: HTMLElement | null = null;
let detailBodyEl: HTMLElement | null = null;
let detailTitleEl: HTMLElement | null = null;
let headerBadgeEl: HTMLElement | null = null;
let btnPauseEl: HTMLButtonElement | null = null;
let btnClearEl: HTMLButtonElement | null = null;
let btnCloseEl: HTMLButtonElement | null = null;
let btnSortEl: HTMLButtonElement | null = null;
let btnExportEl: HTMLButtonElement | null = null;
let btnCopyEl: HTMLButtonElement | null = null;
let endpointSelectEl: HTMLSelectElement | null = null;

let panelVisible = false;
let unsubscribe: (() => void) | null = null;

//#region Icons

// NOTE: These are from https://flowbite.com/icons/

const UNPAUSED_ICON = `
<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z" clip-rule="evenodd"/>
</svg>
`;

const PAUSED_ICON = `
<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M8 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H8Zm7 0a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1Z" clip-rule="evenodd"/>
</svg>
`;

const CLEAR_ICON = `
<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clip-rule="evenodd"/>
</svg>
`;

const CLOSE_ICON = `
<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
</svg>
`;

const SIDEBAR_ICON = `
<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
  <path d="M13 21h6c1.1046 0 2-.8954 2-2V5c0-1.10457-.8954-2-2-2h-6v18Z"/>
  <path fill-rule="evenodd" d="M11 3H5c-1.10457 0-2 .89543-2 2v14c0 1.1046.89543 2 2 2h6V3Zm-5.70711 7.7071c-.39052-.3905-.39052-1.02368 0-1.41421.39053-.39052 1.02369-.39052 1.41422 0l1.99994 1.99991c.39052.3906.39052 1.0237 0 1.4142l-1.99994 2c-.39053.3905-1.02369.3905-1.41422 0-.39052-.3905-.39052-1.0237 0-1.4142l1.29284-1.2929-1.29284-1.2928Z" clip-rule="evenodd"/>
</svg>
`;

const CLIPBOARD_ICON = `
<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M8 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1h2a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2Zm6 1h-4v2H9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2h-1V4Zm-6 8a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z" clip-rule="evenodd"/>
</svg>
`;

const CLIPBOARD_COPIED_ICON = `
<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M9 2a1 1 0 0 0-1 1H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2a1 1 0 0 0-1-1H9Zm1 2h4v2h1a1 1 0 1 1 0 2H9a1 1 0 0 1 0-2h1V4Zm5.707 8.707a1 1 0 0 0-1.414-1.414L11 14.586l-1.293-1.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z" clip-rule="evenodd"/>
</svg>
`;

const CHEVRON_DOWN_ICON = `
<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m8 10 4 4 4-4"/>
</svg>
`;

const SORT_ICON = `
<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m0 14-4-4m4 4 4-4"/>
</svg>

`;

const EXPORT_ICON = `
<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v12m0 0 4-4m-4 4-4-4M4 16v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2"/>
</svg>
`;
//#endregion

let renderedDetailTraceId: string | null = null;


//#region Panel rendering and UI logic

/**
 * Creates an HTML element with the specified attributes, classes, and children.
 */
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  classes: string[] = [],
  children: (HTMLElement | DocumentFragment | Text)[] = []
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'title') e.title = v;
    else e.setAttribute(k, v);
  }
  if (classes.length) e.classList.add(...classes);
  if (children.length) e.append(...children);
  return e;
}

function buildSkeleton(): HTMLElement {
  const root = el('div');
  root.innerHTML = `
    <button class="ump-toggle" id="ump-toggle" title="Toggle UMP INSPECTOR" aria-label="Toggle UMP INSPECTOR">
      ${SIDEBAR_ICON}
      <span class="ump-toggle-label">UMP</span>
      <span class="ump-toggle-badge hidden" id="ump-toggle-badge">0</span>
    </button>

    <div class="ump-panel" id="ump-panel" role="complementary" aria-label="UMP INSPECTOR">
      <div class="ump-header">
        <span class="ump-header-title">UMP INSPECTOR</span>
        <span class="ump-header-badge" id="ump-header-badge">0 requests</span>
        <div class="ump-header-actions">
          <button class="ump-btn header-actions sort-order-arrow" id="ump-btn-sort" title="Toggle sort order">${SORT_ICON}</button>
          <button class="ump-btn header-actions" id="ump-btn-pause" title="Pause capture">${UNPAUSED_ICON}</button>
          <button class="ump-btn header-actions" id="ump-btn-clear" title="Clear traces">${CLEAR_ICON}</button>
          <button class="ump-btn header-actions" id="ump-btn-close" title="Close panel">${CLOSE_ICON}</button>
        </div>
      </div>

      <div class="ump-filters">
        <select class="ump-select" id="ump-filter-endpoint" aria-label="Filter by endpoint">
          <option value="all">All endpoints</option>
          <option value="/videoplayback">/videoplayback</option>
          <option value="/initplayback">/initplayback</option>
        </select>
      </div>

      <div class="ump-trace-list" id="ump-trace-list" role="list"></div>

      <div class="ump-detail" id="ump-detail">
        <div class="ump-detail-header">
          <span class="ump-detail-title" id="ump-detail-title"></span>
          <button class="ump-btn detail-header" id="ump-btn-detail-export" title="Export selected trace as JSON">${EXPORT_ICON}</button>
          <button class="ump-btn detail-header" id="ump-btn-detail-copy" title="Copy as JSON">${CLIPBOARD_ICON}</button>
        </div>
        <div class="ump-detail-body" id="ump-detail-body">
          <span class="ump-detail-empty">Select a request</span>
        </div>
      </div>
    </div>
  `;
  return root;
}

function renderText(str: string): Text {
  return document.createTextNode(str);
}

function createExportPayload(): UmpTraceJson {
  const request = getSelectedTrace();
  if (!request) throw new Error('No trace selected');

  return {
    exportedAt: new Date().toISOString(),
    pageUrl: window.location.href,
    request
  };
}

function getSelectedTrace(): UmpTrace | null {
  const { traces, selectedTraceId } = store.getState();
  const trace = traces.find((t) => t.id === selectedTraceId);
  return trace || null;
}

function exportSelectedTrace(): void {
  const safeStamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadJson(`ump-trace-${safeStamp}.json`, createExportPayload());
}

function copySelectedTrace(): void {
  const payload = createExportPayload();

  try {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
      if (btnCopyEl) {
        btnCopyEl.innerHTML = CLIPBOARD_COPIED_ICON;
        setTimeout(() => { btnCopyEl!.innerHTML = CLIPBOARD_ICON; }, 2000);
      }
    });
  } catch { /* no-op (Clipboard API may not be available) */ }
}

function renderTraceItem(trace: UmpTrace, selectedId: string | null): HTMLElement {
  const item = el('div', { role: 'listitem' }, ['ump-trace-item']);
  if (trace.id === selectedId) item.classList.add('selected');

  const row1 = el('div', {}, ['ump-trace-item-row']);
  const pathEl = el('span', {}, ['ump-trace-path', trace.pathname.split('/')[1]], [renderText(trace.pathname)]);
  row1.appendChild(pathEl);

  if (trace.parseError) {
    const badge = el('span', {}, ['ump-trace-error-badge'], [renderText('ERR')]);
    row1.appendChild(badge);
  }

  item.appendChild(row1);

  const meta = el('div', {}, ['ump-trace-meta']);

  const partsCount = trace.parts.length;
  const segmentsCount = trace.segments.length;

  const segmentsText = segmentsCount > 0
    ? ` · ${segmentsCount} segment${segmentsCount !== 1 ? 's' : ''}`
    : '';

  meta.appendChild(renderText(
    `${formatTime(trace.timestamp)}  ·  ${partsCount} part${partsCount !== 1 ? 's' : ''}${segmentsText}${trace.totalMediaSize > 0 ? '  ·  ' + formatSize(trace.totalMediaSize) : ''}`
  ));

  item.appendChild(meta);

  item.addEventListener('click', () => {
    store.selectTrace(trace.id === store.getState().selectedTraceId ? null : trace.id);
  });

  return item;
}

/**
 * Renders the list of requests.
 */
function renderTraceList(): void {
  if (!traceListEl) return;

  const { selectedTraceId } = store.getState();

  const filtered = store.getFilteredTraces();

  // Clear the liist first.
  traceListEl.replaceChildren();

  if (filtered.length === 0) {
    const empty = el('div', {}, ['ump-empty-state']);

    const msg = el('span', {}, ['ump-empty-text'], [
      renderText(store.getState().traces.length === 0
        ? 'Recording network activity'
        : 'No results')
    ]);

    const sub = el('span', {}, ['ump-empty-sub'], [
      renderText(store.getState().traces.length === 0
        ? 'Play a YouTube video to capture streaming traffic'
        : 'Try adjusting the endpoint filter')
    ]);

    empty.appendChild(msg);
    empty.appendChild(sub);

    traceListEl.appendChild(empty);

    return;
  }

  const frag = document.createDocumentFragment();

  for (const trace of filtered) {
    frag.appendChild(renderTraceItem(trace, selectedTraceId));
  }

  traceListEl.appendChild(frag);
}

function renderSvg(str: string): HTMLElement {
  return new DOMParser().parseFromString(str, 'image/svg+xml').documentElement; // Is there a better way to do this...?
}

function renderJson(value: unknown): DocumentFragment {
  const frag = document.createDocumentFragment();

  const pre = el('pre', {}, ['ump-pre']);
  const code = el('code', { class: 'language-json' });
  pre.appendChild(code);

  code.innerHTML = Prism.highlight(
    JSON.stringify(value, null, 2),
    Prism.languages.json,
    'json'
  );;

  frag.appendChild(pre);

  return frag;
}

interface CreateSectionResult {
  section: HTMLElement;
  content: HTMLElement;
}

function createSection(label: string, count: number | null, collapsed: boolean): CreateSectionResult {
  const section = el('div', {}, ['ump-section']);

  if (collapsed)
    section.classList.add('collapsed');

  const header = el('div', {}, ['ump-section-header']);

  const arrow = el('span', {}, ['ump-section-arrow'], [renderSvg(CHEVRON_DOWN_ICON)]);
  header.appendChild(arrow);

  const labelEl = el('span', {}, ['ump-section-label'], [renderText(label)]);
  header.appendChild(labelEl);

  if (count !== null) {
    const cnt = el('span', {}, ['ump-section-count'], [renderText(String(count))]);
    header.appendChild(cnt);
  }

  header.addEventListener('click', () => section.classList.toggle('collapsed'));

  const content = el('div', {}, ['ump-section-content']);
  section.appendChild(header);
  section.appendChild(content);

  return { section, content };
}

function renderParts(parts: UmpTracePart[]): HTMLElement {
  const partList = el('div', {}, ['ump-part-list']);

  for (const part of parts) {
    const row = el('div', {}, ['ump-part-row']);

    const typeHeader = el('div', {}, ['ump-part-type-header']);
    typeHeader.appendChild(el('span', {}, ['ump-section-arrow'], [renderSvg(CHEVRON_DOWN_ICON)]));

    const typeName = el('span', {}, ['ump-part-type-name'], [renderText(part.type)]);
    typeHeader.appendChild(typeName);

    row.appendChild(typeHeader);

    const body = el('div', {}, ['ump-part-body'], [renderJson(part.data)]);
    row.appendChild(body);

    typeHeader.addEventListener('click', () => row.classList.toggle('ump-part-collapsed'));

    partList.appendChild(row);
  }

  return partList;
}

function renderSegments(segments: Segment[]): HTMLElement {
  const mediaSegmentList = el('div', {}, ['ump-media-segment-list']);

  for (const segment of segments) {
    const segmentEl = el('div', {}, ['ump-media-segment', 'ump-media-segment-collapsed']);
    const header = el('div', {}, ['ump-media-segment-header']);

    const chevron = el('span', {}, ['ump-section-arrow'], [renderSvg(CHEVRON_DOWN_ICON)]);
    header.appendChild(chevron);

    const title = el('span', {}, ['ump-media-segment-title'], [renderText(`headerId=${segment.headerId}`)]);
    header.appendChild(title);

    if (segment.totalSize > 0) {
      const sizeSpan = el('span', {}, ['ump-media-segment-size'], [renderText(formatSize(segment.totalSize))]);
      header.appendChild(sizeSpan);
    }

    segmentEl.appendChild(header);

    const body = el('div', {}, ['ump-media-segment-body']);

    for (const part of segment.parts) {
      const partRow = el('div', {}, ['ump-media-part-row']);
      const partTypeEl = el('span', {}, ['ump-media-part-type'], [renderText(part.type + ': ')]);
      partRow.appendChild(partTypeEl);
      partRow.appendChild(renderText(JSON.stringify(part.data, null, 2)));
      body.appendChild(partRow);
    }

    segmentEl.appendChild(body);

    header.addEventListener('click', () => segmentEl.classList.toggle('ump-media-segment-collapsed'));

    mediaSegmentList.appendChild(segmentEl);
  }

  return mediaSegmentList;
}

/**
 * Renders the detail view for a given trace.
 * @param trace - The trace to render, or null to clear the detail view.
 */
function renderDetail(trace: UmpTrace | null): void {
  if (!detailBodyEl || !detailTitleEl) return;

  detailTitleEl.textContent = trace ? `${trace.pathname}  ·  ${formatTime(trace.timestamp)}` : '';

  // Clear any previous content first.
  detailBodyEl.replaceChildren();

  if (!trace) {
    detailBodyEl.appendChild(el('span', {}, ['ump-detail-empty'], [renderText('Select a request')]));
    return;
  }

  //#region Payload section.
  const { section, content } = createSection('Payload', null, false);

  if (trace.parseError && !trace.payload) {
    const errEl = el('pre', {}, ['ump-pre'], [renderText('Parse error: ' + trace.parseError)]);
    content.appendChild(errEl);
  } else {
    content.appendChild(renderJson(trace.payload));
  }

  detailBodyEl.appendChild(section);
  //#endregion

  //#region Metadata parts section.
  if (trace.parts.length > 0) {
    const { section, content } = createSection('Parts', trace.parts.length, false);
    content.appendChild(renderParts(trace.parts));
    detailBodyEl.appendChild(section);
  }
  //#endregion

  //#region Media segments section.
  if (trace.segments.length > 0) {
    const segmentSize = trace.totalMediaSize;
    const label = `Segments  ${segmentSize > 0 ? '(' + formatSize(segmentSize) + ')' : ''}`;

    const { section, content } = createSection(label, trace.segments.length, false);
    content.appendChild(renderSegments(trace.segments));

    detailBodyEl.appendChild(section);
  }
  //#endregion
}

function updateUI(): void {
  const { traces, paused, sortNewestFirst, selectedTraceId } = store.getState();
  const count = traces.length;

  if (headerBadgeEl) {
    headerBadgeEl.textContent = count + ' request' + (count !== 1 ? 's' : '');
  }

  if (toggleBadgeEl) {
    toggleBadgeEl.textContent = String(count);
    toggleBadgeEl.classList.toggle('hidden', count === 0);
  }

  if (btnPauseEl) {
    btnPauseEl.innerHTML = paused ? PAUSED_ICON : UNPAUSED_ICON;
    btnPauseEl.title = paused ? 'Resume capture' : 'Pause capture';
    btnPauseEl.classList.toggle('active', paused);
  }

  if (btnSortEl) {
    btnSortEl.classList.toggle('toggled', !sortNewestFirst);
    btnSortEl.title = sortNewestFirst ? 'Sort: newest first' : 'Sort: oldest first';
  }

  if (btnExportEl && btnCopyEl) {
    const hasSelectedTrace = Boolean(selectedTraceId && traces.some((t) => t.id === selectedTraceId));
    btnExportEl.disabled = !hasSelectedTrace;
    btnCopyEl.disabled = !hasSelectedTrace;
  }
}

/**
 * Rerenders the trace list and detail panes when the store changes. 
 */
function onStoreChange(): void {
  const { selectedTraceId, filters } = store.getState();

  if (endpointSelectEl) endpointSelectEl.value = filters.endpoint;

  renderTraceList();
  updateUI();

  // Only rerender the detail pane if the selected trace has changed to avoid jankyness when new traces come in.
  if (selectedTraceId !== renderedDetailTraceId) {
    const selectedTrace = selectedTraceId
      ? store.getState().traces.find((t) => t.id === selectedTraceId) ?? null
      : null;
    renderDetail(selectedTrace);
    renderedDetailTraceId = selectedTraceId;
  }
}

function showPanel(): void {
  panelEl?.classList.add('visible');
  panelVisible = true;
}

function hidePanel(): void {
  panelEl?.classList.remove('visible');
  panelVisible = false;
}
//#endregion

//#region Public API
export function mountPanel(): void {
  if (!document.body) return;
  if (hostEl && document.body.contains(hostEl)) return;

  hostEl = document.createElement('div');
  hostEl.id = 'ump-inspector-root';
  hostEl.style.cssText = 'all: initial; display: block; position: static;';

  shadowRoot = hostEl.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = PANEL_STYLES;
  shadowRoot.appendChild(styleEl);

  const prismBaseStyle = document.createElement('style');
  prismBaseStyle.textContent = prismBaseCss;
  shadowRoot.appendChild(prismBaseStyle);

  const prismStyle = document.createElement('style');
  prismStyle.textContent = prismThemeCss;
  shadowRoot.appendChild(prismStyle);

  const skeleton = buildSkeleton();
  shadowRoot.appendChild(skeleton);

  // Cache refs.
  panelEl = shadowRoot.getElementById('ump-panel') as HTMLElement;
  toggleEl = shadowRoot.getElementById('ump-toggle') as HTMLButtonElement;
  toggleBadgeEl = shadowRoot.getElementById('ump-toggle-badge') as HTMLElement;
  traceListEl = shadowRoot.getElementById('ump-trace-list') as HTMLElement;
  detailBodyEl = shadowRoot.getElementById('ump-detail-body') as HTMLElement;
  detailTitleEl = shadowRoot.getElementById('ump-detail-title') as HTMLElement;
  headerBadgeEl = shadowRoot.getElementById('ump-header-badge') as HTMLElement;
  btnPauseEl = shadowRoot.getElementById('ump-btn-pause') as HTMLButtonElement;
  btnClearEl = shadowRoot.getElementById('ump-btn-clear') as HTMLButtonElement;
  btnCloseEl = shadowRoot.getElementById('ump-btn-close') as HTMLButtonElement;
  btnSortEl = shadowRoot.getElementById('ump-btn-sort') as HTMLButtonElement;
  btnCopyEl = shadowRoot.getElementById('ump-btn-detail-copy') as HTMLButtonElement;
  btnExportEl = shadowRoot.getElementById('ump-btn-detail-export') as HTMLButtonElement;
  endpointSelectEl = shadowRoot.getElementById('ump-filter-endpoint') as HTMLSelectElement;

  //#region Event listeners
  toggleEl.addEventListener('click', () => panelVisible ? hidePanel() : showPanel());
  btnCloseEl.addEventListener('click', () => hidePanel());
  btnPauseEl.addEventListener('click', () => store.togglePause());
  btnClearEl.addEventListener('click', () => store.clearTraces());
  btnSortEl.addEventListener('click', () => store.toggleSortOrder());
  btnExportEl.addEventListener('click', () => exportSelectedTrace());
  btnCopyEl.addEventListener('click', () => copySelectedTrace());
  endpointSelectEl.addEventListener('change', () => store.setEndpointFilter(endpointSelectEl!.value as EndpointFilter));
  //#endregion

  if (unsubscribe) unsubscribe();
  unsubscribe = store.subscribe(onStoreChange);

  // Initial render.
  onStoreChange();

  document.body.appendChild(hostEl);
}

export function unmountPanel(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  hostEl?.remove();
  hostEl = null;
  shadowRoot = null;
  renderedDetailTraceId = null;
}
//#endregion