import { BRIDGE_COMMAND_TYPE } from "../bridge";

//#region General types
export type EndpointFilter = 'all' | '/videoplayback' | '/initplayback';

export interface StoreState {
  traces: UmpTrace[];
  selectedTraceId: string | null;
  paused: boolean;
  filters: {
    endpoint: EndpointFilter;
  };
  sortNewestFirst: boolean;
}

export type StoreListener = (state: Readonly<StoreState>) => void;

export interface UmpTracePart {
  type: string;
  data: unknown;
}

export interface Segment {
  headerId: number;
  parts: UmpTracePart[];
  totalSize: number;
}

export interface UmpTrace {
  id: string;
  timestamp: number;
  url: string;
  pathname: string;
  isOnesie: boolean;
  payload: unknown;
  parts: UmpTracePart[];
  segments: Segment[];
  totalMediaSize: number;
  parseError?: string;
}

export interface UmpTraceJson {
  exportedAt: string;
  pageUrl: string;
  request: UmpTrace;
}

export interface ExtensionSettings {
  enabled: boolean;
  endpoint: EndpointFilter;
  sortNewestFirst: boolean;
}

interface MintAsWebsafeStringOptions {
  /**
   * Content binding (Video ID, visitor data, or session/account ID).
   */
  c: string;
  /**
   * Mint cold start tokens (returns a cold start token if called too early).
   */
  mc?: boolean;
  /**
   * Mint error tokens (returns an error token if minting fails).
   */
  me?: boolean;
}

export interface WebPoClient {
  /**
   * Mints a WebPO token as a Uint8Array.
   */
  m: (options: MintAsWebsafeStringOptions) => Promise<Uint8Array>;
  /**
   * Mints a WebPO token as a websafe string.
   */
  mws: (options: MintAsWebsafeStringOptions) => Promise<string>;
}
//#endregion

//#region Bridge types
export type BridgeEndpoint = 'content' | 'injected';

interface CommandMap {
  'webpo-client-presence': {
    request: undefined;
    response: boolean;
  };
  'mint-webpo': {
    request: {
      contentBinding: string;
      mintErrorTokens: boolean;
      mintColdStartTokens: boolean;
    };
    response: { webpo?: string, error?: string };
  };
  'ump-trace': {
    request: UmpTrace;
    response: boolean;
  };
}

export type Command = keyof CommandMap;
export type CommandPayload<T extends Command> = CommandMap[T]['request'];
export type CommandResponse<T extends Command> = CommandMap[T]['response'];

export interface SendCommandOptions {
  timeoutMs?: number;
}

export type SendCommandArgs<T extends Command> = CommandPayload<T> extends undefined
  ? [options?: SendCommandOptions]
  : [payload: CommandPayload<T>, options?: SendCommandOptions];

type BridgeCommandRequest<T extends Command = Command> = {
  type: typeof BRIDGE_COMMAND_TYPE;
  kind: 'request';
  id: string;
  sender: BridgeEndpoint;
  target: BridgeEndpoint;
  command: T;
  payload: CommandPayload<T>;
};

type BridgeCommandSuccess<T extends Command = Command> = {
  type: typeof BRIDGE_COMMAND_TYPE;
  kind: 'response';
  id: string;
  sender: BridgeEndpoint;
  target: BridgeEndpoint;
  command: T;
  success: true;
  payload: CommandResponse<T>;
};

type BridgeCommandFailure<T extends Command = Command> = {
  type: typeof BRIDGE_COMMAND_TYPE;
  kind: 'response';
  id: string;
  sender: BridgeEndpoint;
  target: BridgeEndpoint;
  command: T;
  success: false;
  error: string;
};

export type BridgeCommandMessage<T extends Command = Command> =
  | BridgeCommandRequest<T>
  | BridgeCommandSuccess<T>
  | BridgeCommandFailure<T>;

export type CommandHandler<T extends Command> = (payload: CommandPayload<T>) => Promise<CommandResponse<T>> | CommandResponse<T>;

export type CommandHandlers = {
  [K in Command]?: CommandHandler<K>;
};
//#endregion