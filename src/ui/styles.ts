const BASE_CSS = `
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:host {
  all: initial;
  --ump-font-mono: 'JetBrains Mono', 'Roboto Mono', 'Cascadia Code', Consolas, Monaco, 'Courier New', monospace;
  --ump-bg-0: #0b0c0f;
  --ump-bg-1: #111318;
  --ump-bg-2: #181b22;
  --ump-text-0: #f2f5f8;
  --ump-text-1: #d6dbe3;
  --ump-text-2: #9da6b5;
  --ump-text-3: #7a8497;
  --ump-accent: #58b8ff;
  --ump-accent-soft: rgba(88, 184, 255, 0.14);
  --ump-danger: #ff5d72;
  --ump-border-soft: rgba(255, 255, 255, 0.06);
  --ump-border-0: rgba(255, 255, 255, 0.08);
  --ump-border-1: rgba(255, 255, 255, 0.12);
  --ump-border-2: #58b8ff73;
  --ump-panel-glow: rgba(88, 184, 255, 0.08);
  --ump-scrollbar-thumb: rgba(255, 255, 255, 0.12);
  --ump-scrollbar-thumb-hover: rgba(255, 255, 255, 0.22);
  --ump-surface-subtle: rgba(255, 255, 255, 0.02);
  --ump-surface-faint: rgba(255, 255, 255, 0.015);
  --ump-item-hover: rgba(255, 255, 255, 0.04);
  --ump-item-selected: rgba(88, 184, 255, 0.14);
  --ump-toggle-bg: linear-gradient(180deg, #1f2430 0%, #171b24 100%);
  --ump-toggle-bg-hover: linear-gradient(180deg, #283043 0%, #1b2130 100%);
  --ump-panel-shadow: -14px 0 50px rgba(0, 0, 0, 0.52);
  --ump-toggle-shadow-hover: 0 12px 34px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(88, 184, 255, 0.15) inset;
  --ump-danger-soft: rgba(255, 93, 114, 0.12);
  --ump-danger-border-soft: rgba(255, 93, 114, 0.25);
  --ump-code-bg: rgba(255, 255, 255, 0.015);
  --ump-code-border: rgba(255, 255, 255, 0.09);
  --ump-section-border: rgba(255, 255, 255, 0.04);
  --ump-part-border: rgba(255, 255, 255, 0.07);
  --ump-media-segment-bg: #10151d;
  --ump-muted-strong: #b7c0cd;
  --ump-meta-muted: #666;
  font-family: var(--ump-font-mono);
  font-size: 13px;
  line-height: 1.45;
  color-scheme: dark;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:host,
:host * {
  font-family: var(--ump-font-mono);
}

::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--ump-scrollbar-thumb);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--ump-scrollbar-thumb-hover);
}

.ump-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: clamp(360px, 36vw, 520px);
  max-width: 100vw;
  height: 100dvh;
  background:
    radial-gradient(1200px 500px at 120% -10%, var(--ump-panel-glow) 0%, rgba(88, 184, 255, 0) 55%),
    linear-gradient(180deg, var(--ump-bg-1) 0%, var(--ump-bg-0) 100%);
  border-left: 1px solid var(--ump-border-0);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: var(--ump-text-0);
  transform: translateX(100%);
  transition: 
    transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), 
    box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1) 0.1s;
  overflow: hidden;
  pointer-events: auto;
}

.ump-panel.visible {
  transform: translateX(0);
  box-shadow: var(--ump-panel-shadow);
}

.ump-toggle {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  background: var(--ump-toggle-bg);
  border: 1px solid var(--ump-border-1);
  border-radius: 24px;
  cursor: pointer;
  color: var(--ump-text-0);
  font-size: 12px;
  font-weight: 700;
  /* too ugly? maybe i should experiment with it later: box-shadow: 0 10px 32px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.35); */
  transition: background 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  pointer-events: auto;
  user-select: none;
  letter-spacing: 0.03em;
}

.ump-toggle:hover {
  background: var(--ump-toggle-bg-hover);
  border-color: rgba(88, 184, 255, 0.45);
  box-shadow: var(--ump-toggle-shadow-hover);
  transform: translateY(-1px);
}

.ump-toggle-label {
  font-size: 12px;
  letter-spacing: 0.04em;
}

.ump-toggle-badge {
  background: var(--ump-danger);
  color: #fff;
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  text-align: center;
  line-height: 16px;
  letter-spacing: 0;
}

.ump-toggle-badge.hidden {
  display: none;
}

.ump-btn {
  background: rgba(41, 8, 8, 0.05);
  border: 1px solid var(--ump-border-0);
  color: var(--ump-text-2);
  cursor: pointer;
  border-radius: 5px;
  font-weight: 600;
  line-height: 1;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
  flex-shrink: 0;
}
.ump-btn:hover {
    background: rgba(88, 184, 255, 0.16);
  border-color: rgba(88, 184, 255, 0.45);
  color: var(--ump-text-0);
}

.ump-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.ump-btn:disabled:hover {
  background: rgba(255, 255, 255, 0.02);
  border-color: transparent;
  color: var(--ump-text-2);
}

.ump-btn.active {
  color: var(--ump-danger);
  background: var(--ump-danger-soft);
  border-color: var(--ump-danger-border-soft);
}

@media (max-width: 768px) {
  .ump-toggle {
    right: 12px;
    bottom: 70px;
  }

  .ump-panel {
    width: 100%;
  }
}
`;

const HEADER_CSS = `
.ump-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 12px;
  background: var(--ump-surface-subtle);
  border-bottom: 1px solid var(--ump-border-0);
  border-top: 1px solid var(--ump-border-0);
  border-right: 1px solid var(--ump-border-0);
  flex-shrink: 0;
}

.ump-header-title {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  color: var(--ump-text-0);
  letter-spacing: 0.015em;
}

.ump-header-badge {
  background: var(--ump-accent-soft);
  color: var(--ump-accent);
  border: 1px solid rgba(88, 184, 255, 0.28);
  border-radius: 20px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.ump-header-actions {
  display: flex;    
  gap: 8px;
}

.ump-btn.header-actions {
  padding: 5px 8px;
  font-size: 13px;
}

.ump-btn.header-actions.sort-order-arrow svg {
  transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  transform: rotate(0deg);
}

.ump-btn.header-actions.sort-order-arrow.toggled svg {
  transform: rotate(180deg);
}
`;

const FILTER_BAR_CSS = `
.ump-filters {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--ump-surface-faint);
  border-bottom: 1px solid var(--ump-border-soft);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.ump-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  min-width: 145px;
  background: var(--ump-bg-2);
  border: 1px solid var(--ump-border-0);
  color: var(--ump-text-1);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
  background-position: right 6px center;
  background-size: 16px;
  /* this is from https://flowbite.com/icons */
  background-image: url('data:image/svg+xml;utf8,<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="%23c0caf5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m8 10 4 4 4-4"/></svg>');
  background-repeat: no-repeat;
}

.ump-select:focus {
  border-color: var(--ump-border-2);
}
`;

const TRACE_LIST_CSS = `
.ump-trace-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.ump-trace-item {
  padding: 10px 12px 10px 14px;
  border-bottom: 1px solid var(--ump-section-border);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-left: 3px solid transparent;
  transition: background 0.12s, border-left-color 0.12s;
}

.ump-trace-item:hover {
  background: var(--ump-item-hover);
}

.ump-trace-item.selected {
  background: var(--ump-item-selected);
  border-left-color: var(--ump-accent);
}

.ump-trace-item-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.ump-trace-path {
  font-weight: 600;
  font-size: 12px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ump-trace-path.videoplayback {
  color: #4ecdc4;
}

.ump-trace-path.initplayback {
  color: #ffd93d;
}

.ump-trace-path.other {
  color: #a8b3cf;
}

.ump-trace-error-badge {
  background: rgba(220, 53, 69, 0.85);
  color: #fff;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.ump-trace-meta {
  color: var(--ump-text-3);
  font-size: 11px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ump-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  gap: 12px;
  height: 100%;
}

.ump-empty-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--ump-muted-strong);
}

.ump-empty-sub {
  font-size: 12px;
  color: var(--ump-text-3);
  max-width: 260px;
  line-height: 1.55;
}
`;

const DETAIL_PANE_CSS = `
.ump-detail {
  height: 42%;
  min-height: 120px;
  border-top: 1px solid var(--ump-border-0);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

.ump-detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--ump-surface-subtle);
  border-bottom: 1px solid var(--ump-border-soft);
  flex-shrink: 0;
}

.ump-detail-title {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: var(--ump-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ump-btn.detail-header {
  font-size: 12px;
  padding: 4px 10px;
}

.ump-detail-body {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.ump-detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 100%;
  color: var(--ump-text-3);
  font-size: 13px;
}

.ump-section {
  border-bottom: 1px solid var(--ump-section-border);
}

.ump-section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: var(--ump-surface-faint);
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
  color: var(--ump-text-3);
  user-select: none;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: background 0.1s, color 0.1s;
}

.ump-section-header:hover {
  background: var(--ump-item-hover);
  color: var(--ump-text-1);
}

.ump-section-arrow {
  font-style: normal;
  font-size: 8px;
  display: inline-block;
  transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  opacity: 0.6;
}

.ump-section.collapsed .ump-section-arrow {
  transform: rotate(-90deg);
}

.ump-section.collapsed .ump-section-content {
  display: none;
}

.ump-section-count {
  background: var(--ump-border-1);
  color: var(--ump-text-2);
  border-radius: 10px;
  padding: 0 7px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0;
}

.ump-section-content {
  padding: 10px 12px;
}

.ump-pre {
  font-size: 11px;
  color: #dce3ee;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.62;
  background: var(--ump-code-bg);
  border: 1px solid var(--ump-code-border);
  border-radius: 6px;
  padding: 10px 12px;
  overflow: auto;
}

.ump-part-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ump-part-row {
  border: 1px solid var(--ump-part-border);
  border-radius: 6px;
  overflow: hidden;
}

.ump-part-type-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: rgba(78, 205, 196, 0.07);
  cursor: pointer;
  user-select: none;
  font-size: 11px;
  font-weight: 600;
  color: #4ecdc4;
  transition: background 0.1s;
  letter-spacing: 0.01em;
}

.ump-part-type-header:hover {
  background: rgba(78, 205, 196, 0.12);
}

.ump-part-type-header .ump-section-arrow {
  color: rgba(78, 205, 196, 0.5);
}

.ump-part-collapsed .ump-part-type-header .ump-section-arrow {
  transform: rotate(-90deg);
}

.ump-part-collapsed .ump-part-body {
  display: none;
}

.ump-part-body {
  padding: 8px 10px;
  background: rgba(78, 205, 196, 0.07);
}

.ump-media-segment-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ump-media-segment {
  border: 1px solid var(--ump-part-border);
  border-radius: 6px;
  overflow: hidden;
}

.ump-media-segment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(245, 158, 11, 0.07);
  cursor: pointer;
  user-select: none;
  font-size: 11px;
  font-weight: 600;
  color: #f59e0b;
  transition: background 0.1s;
  letter-spacing: 0.01em;
}

.ump-media-segment-header:hover {
  background: rgba(245, 158, 11, 0.13);
}

.ump-media-segment-header .ump-section-arrow {
  color: rgba(245, 158, 11, 0.5);
}

.ump-media-segment-size {
  color: var(--ump-meta-muted);
  font-weight: 400;
  font-size: 10px;
  margin-left: auto;
}

.ump-media-segment-collapsed .ump-media-segment-header .ump-section-arrow {
  transform: rotate(-90deg);
}

.ump-media-segment-collapsed .ump-media-segment-body {
  display: none;
}

.ump-media-segment-body {
  padding: 8px 10px;
  background: var(--ump-media-segment-bg);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ump-media-part-row {
  font-size: 11px;
  color: #9fa8b8;
  line-height: 1.5;
}

.ump-media-part-type {
  font-weight: 600;
  color: #fbbf24;
}
`;

const LIGHT_THEME_CSS = `
@media (prefers-color-scheme: light) {
  :host {
    --ump-bg-0: #f6f8fc;
    --ump-bg-1: #eef3fb;
    --ump-bg-2: #ffffff;
    --ump-text-0: #17202f;
    --ump-text-1: #2c3a4e;
    --ump-text-2: #4a5b74;
    --ump-text-3: #667993;
    --ump-accent: #1f6fe5;
    --ump-accent-soft: rgba(31, 111, 229, 0.12);
    --ump-danger: #cc3247;
    --ump-border-soft: rgba(18, 33, 56, 0.12);
    --ump-border-0: rgba(18, 33, 56, 0.14);
    --ump-border-1: rgba(18, 33, 56, 0.2);
    --ump-border-2: rgba(31, 111, 229, 0.42);
    --ump-panel-glow: rgba(31, 111, 229, 0.1);
    --ump-scrollbar-thumb: rgba(21, 41, 70, 0.18);
    --ump-scrollbar-thumb-hover: rgba(21, 41, 70, 0.28);
    --ump-surface-subtle: rgba(255, 255, 255, 0.72);
    --ump-surface-faint: rgba(255, 255, 255, 0.6);
    --ump-item-hover: rgba(28, 83, 165, 0.08);
    --ump-item-selected: rgba(31, 111, 229, 0.14);
    --ump-toggle-bg: linear-gradient(180deg, #ffffff 0%, #ebf1fb 100%);
    --ump-toggle-bg-hover: linear-gradient(180deg, #ffffff 0%, #e2ecfa 100%);
    --ump-panel-shadow: -14px 0 42px rgba(22, 40, 70, 0.2);
    --ump-toggle-shadow-hover: 0 10px 26px rgba(22, 40, 70, 0.16), 0 0 0 1px rgba(31, 111, 229, 0.16) inset;
    --ump-danger-soft: rgba(204, 50, 71, 0.1);
    --ump-danger-border-soft: rgba(204, 50, 71, 0.22);
    --ump-code-bg: rgb(45 57 78); /* only color I could find that doesn't look like shit with prism on light theme... */
    --ump-code-border: rgba(31, 111, 229, 0.2);
    --ump-section-border: rgba(18, 33, 56, 0.12);
    --ump-part-border: rgba(18, 33, 56, 0.16);
    --ump-media-segment-bg: #f4f8ff;
    --ump-muted-strong: #3a4b63;
    --ump-meta-muted: #5f6f84;
    color-scheme: light;
  }

  .ump-trace-path.videoplayback {
    color: #007a73;
  }

  .ump-trace-path.initplayback {
    color: #9a6a00;
  }

  .ump-trace-path.other {
    color: #4e627c;
  }

  .ump-trace-error-badge {
    background: rgba(204, 50, 71, 0.9);
  }

  .ump-pre {
    color: #1f2d3d;
  }

  .ump-part-type-header {
    background: rgba(0, 122, 115, 0.09);
    color: #00645e;
  }

  .ump-part-type-header:hover {
    background: rgba(0, 122, 115, 0.15);
  }

  .ump-part-type-header .ump-section-arrow {
    color: rgba(0, 100, 94, 0.62);
  }

  .ump-part-body {
    background: rgba(0, 122, 115, 0.08);
  }

  .ump-media-segment-header {
    background: rgba(186, 122, 0, 0.1);
    color: #8b5c00;
  }

  .ump-media-segment-header:hover {
    background: rgba(186, 122, 0, 0.16);
  }

  .ump-media-segment-header .ump-section-arrow {
    color: rgba(139, 92, 0, 0.62);
  }

  .ump-media-part-row {
    color: #546780;
  }

  .ump-media-part-type {
    color: #8b5c00;
  }
}
`;

export const PANEL_STYLES = [BASE_CSS, HEADER_CSS, FILTER_BAR_CSS, TRACE_LIST_CSS, DETAIL_PANE_CSS, LIGHT_THEME_CSS].join('\n');