import { u8ToBase64 } from "googlevideo/utils";

export function isGoogleVideoRequest(input: string | URL): boolean {
  const url = input.toString();

  const urlPart = url.split('?')[0];
  const queryPart = url.split('?')[1] || '';

  if (urlPart.endsWith('/videoplayback')) {
    const params = new URLSearchParams(queryPart);
    if (params.get('source') === 'youtube' || params.has('sabr') || params.has('lsig') || params.has('expire')) {
      return true;
    }
  } else if (urlPart.includes('/videoplayback/')) { // For live content, post-live, etc.
    const pathParts = urlPart.split('/'); return ['videoplayback', 'sabr', 'lsig', 'expire'].some((part) => pathParts.includes(part));
  } else if (urlPart.includes('/initplayback')) {
    const params = new URLSearchParams(queryPart);
    return params.has('id') || params.has('oeis') || params.has('oavd') || params.has('expire');
  }

  return false;
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'kB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function isEmpty(obj: Record<string, unknown>): boolean {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }
  return true;
}


function sanitizeValue(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      value[i] = sanitizeValue(value[i]);
    }
    return value;
  }

  const record = value as Record<string, unknown>;

  // Meaning this is representing a byte array, convert it to base64 for easier display  (todo: maybe find a better way to do this?)
  if ('0' in record || isEmpty(record)) {
    return u8ToBase64(new Uint8Array(Object.values(record) as number[]));
  }

  const keys = Object.keys(record);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    record[key] = sanitizeValue(record[key]);
  }

  return record;
}

export function sanitizeJson(obj: unknown): unknown {
  try {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    const objMod = obj as Record<string, unknown>;
    const keys = Object.keys(objMod);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      objMod[key] = sanitizeValue(objMod[key]);
    }

    return objMod;
  } catch (err: unknown) {
    console.error(
      '%cump-inspector%c - error sanitizing JSON data.',
      'background-color: #dc3545; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
      'background-color: transparent; color: inherit;',
      err
    );
    return {};
  }
}

export function downloadJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}