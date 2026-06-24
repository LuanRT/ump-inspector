import type { UmpTrace } from './types';

export const BRIDGE_MESSAGE_TYPE = 'ump-inspector:trace' as const;

export interface BridgeMessage {
  type: typeof BRIDGE_MESSAGE_TYPE;
  trace: UmpTrace;
}

export function emitTrace(trace: UmpTrace): void {
  try {
    window.postMessage(
      { type: BRIDGE_MESSAGE_TYPE, trace } satisfies BridgeMessage,
      window.location.origin || '*'
    );
  } catch { /** no-op */ }
}
