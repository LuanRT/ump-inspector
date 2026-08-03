import type {
  BridgeCommandMessage, BridgeEndpoint,
  Command, CommandHandler, CommandHandlers,
  CommandPayload, CommandResponse,
  SendCommandArgs, SendCommandOptions
} from './types';

export const BRIDGE_COMMAND_TYPE = 'ump-inspector:command' as const;

const DEFAULT_COMMAND_TIMEOUT_MS = 5000;

const COMMAND_HAS_PAYLOAD: { [K in Command]: CommandPayload<K> extends undefined ? false : true } = {
  'webpo-client-presence': false,
  'mint-webpo': true,
  'ump-trace': true
};

function createCommandId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isBridgeCommandMessage(value: unknown): value is BridgeCommandMessage {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<BridgeCommandMessage>;
  return candidate.type === BRIDGE_COMMAND_TYPE
    && (candidate.kind === 'request' || candidate.kind === 'response')
    && typeof candidate.id === 'string'
    && typeof candidate.command === 'string'
    && (candidate.sender === 'content' || candidate.sender === 'injected')
    && (candidate.target === 'content' || candidate.target === 'injected');
}

function postCommandMessage(message: BridgeCommandMessage): void {
  window.postMessage(message, window.location.origin || '*');
}

export function sendCommand<T extends Command>(
  sender: BridgeEndpoint,
  command: T,
  ...args: SendCommandArgs<T>
): Promise<CommandResponse<T>> {
  const [payload, options] = COMMAND_HAS_PAYLOAD[command]
    ? [args[0] as CommandPayload<T>, args[1] as SendCommandOptions | undefined]
    : [undefined as CommandPayload<T>, args[0] as SendCommandOptions | undefined];

  return new Promise<CommandResponse<T>>((resolve, reject) => {
    const id = createCommandId();
    const target = sender === 'content' ? 'injected' : 'content';
    const timeoutMs = options?.timeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS;

    let settled = false;

    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      window.clearTimeout(timeoutId);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (!isBridgeCommandMessage(event.data)) return;

      const message = event.data;
      if (message.kind !== 'response') return;
      if (message.id !== id || message.target !== sender) return;
      if (settled) return;

      settled = true;
      cleanup();

      if (message.success) {
        resolve(message.payload as CommandResponse<T>);
        return;
      }

      reject(new Error(message.error));
    };

    const timeoutId = window.setTimeout(() => {
      if (settled) return;

      settled = true;
      cleanup();
      reject(new Error(`Command "${command}" timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    window.addEventListener('message', onMessage);

    try {
      postCommandMessage({
        type: BRIDGE_COMMAND_TYPE,
        kind: 'request',
        id,
        sender,
        target,
        command,
        payload
      });
    } catch (error) {
      if (!settled) {
        settled = true;
        cleanup();
      }
      reject(error);
    }
  });
}

export function registerCommandHandlers(endpoint: BridgeEndpoint, handlers: CommandHandlers): () => void {
  const onMessage = async (event: MessageEvent) => {
    if (event.source !== window) return;
    if (!isBridgeCommandMessage(event.data)) return;

    const message = event.data;
    if (message.kind !== 'request' || message.target !== endpoint) return;

    const handler = handlers[message.command] as CommandHandler<typeof message.command> | undefined;
    if (!handler) return;

    try {
      const payload = await handler(message.payload as CommandPayload<typeof message.command>);
      postCommandMessage({
        type: BRIDGE_COMMAND_TYPE,
        kind: 'response',
        id: message.id,
        sender: endpoint,
        target: message.sender,
        command: message.command,
        success: true,
        payload
      });
    } catch (error) {
      postCommandMessage({
        type: BRIDGE_COMMAND_TYPE,
        kind: 'response',
        id: message.id,
        sender: endpoint,
        target: message.sender,
        command: message.command,
        success: false,
        error: error instanceof Error ? error.message : 'Command failed'
      });
    }
  };

  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}