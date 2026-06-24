import { UmpReader, CompositeBuffer } from 'googlevideo/ump';
import { u8ToBase64 } from 'googlevideo/utils';
import type { Part } from 'googlevideo/shared-types';

import {
  FormatInitializationMetadata,
  FormatSelectionConfig,
  MediaHeader,
  NextRequestPolicy,
  OnesieHeader,
  OnesieRequest,
  PlaybackStartPolicy,
  ReloadPlaybackContext,
  RequestCancellationPolicy,
  RequestIdentifier,
  SabrError,
  SabrContextUpdate,
  SabrContextSendingPolicy,
  SabrRedirect,
  SnackbarMessage,
  StreamProtectionStatus,
  UMPPartId,
  VideoPlaybackAbrRequest
} from 'googlevideo/protos';

import type { UmpTracePart, Segment } from '../types';
import { emitTrace } from '../bridge';
import { sanitizeJson } from '../helpers';

type UmpPartHandler = (part: Part) => unknown;

const umpPartHandlers = new Map<UMPPartId, UmpPartHandler>([
  [UMPPartId.FORMAT_INITIALIZATION_METADATA, (part: Part) => FormatInitializationMetadata.decode(part.data.chunks[0])],
  [UMPPartId.NEXT_REQUEST_POLICY, (part: Part) => NextRequestPolicy.decode(part.data.chunks[0])],
  [UMPPartId.SABR_ERROR, (part: Part) => SabrError.decode(part.data.chunks[0])],
  [UMPPartId.SABR_REDIRECT, (part: Part) => SabrRedirect.decode(part.data.chunks[0])],
  [UMPPartId.SABR_CONTEXT_UPDATE, (part: Part) => SabrContextUpdate.decode(part.data.chunks[0])],
  [UMPPartId.SABR_CONTEXT_SENDING_POLICY, (part: Part) => SabrContextSendingPolicy.decode(part.data.chunks[0])],
  [UMPPartId.STREAM_PROTECTION_STATUS, (part: Part) => StreamProtectionStatus.decode(part.data.chunks[0])],
  [UMPPartId.RELOAD_PLAYER_RESPONSE, (part: Part) => ReloadPlaybackContext.decode(part.data.chunks[0])],
  [UMPPartId.MEDIA_HEADER, (part: Part) => MediaHeader.decode(part.data.chunks[0])],
  [UMPPartId.MEDIA, (part: Part) => ({ headerId: part.data.getUint8(0), size: part.data.getLength() })],
  [UMPPartId.MEDIA_END, (part: Part) => ({ headerId: part.data.getUint8(0) })],
  [UMPPartId.PLAYBACK_START_POLICY, (part: Part) => PlaybackStartPolicy.decode(part.data.chunks[0])],
  [UMPPartId.REQUEST_CANCELLATION_POLICY, (part: Part) => RequestCancellationPolicy.decode(part.data.chunks[0])],
  [UMPPartId.REQUEST_IDENTIFIER, (part: Part) => RequestIdentifier.decode(part.data.chunks[0])],
  [UMPPartId.ONESIE_HEADER, (part: Part) => OnesieHeader.decode(part.data.chunks[0])],
  [UMPPartId.ONESIE_DATA, (part: Part) => ({ size: part.data.getLength() })],
  [UMPPartId.ONESIE_ENCRYPTED_MEDIA, (part: Part) => ({ size: part.data.getLength() })],
  [UMPPartId.SNACKBAR_MESSAGE, (part: Part) => SnackbarMessage.decode(part.data.chunks[0])],
  [UMPPartId.FORMAT_SELECTION_CONFIG, (part: Part) => FormatSelectionConfig.decode(part.data.chunks[0])]
]);

let traceCounter = 0;

export function processUmpResponse(url: string, requestBody: ArrayBuffer, responseBuffer: ArrayBuffer): void {
  try {
    const requestURL = new URL(url);
    const isOnesie = requestURL.pathname === '/initplayback';
    const payloadBuffer = new Uint8Array(requestBody);

    let payload: unknown;
    let parseError: string | undefined;

    try {
      const raw = payloadBuffer.length === 2
        ? 'Nothing to see here.'
        : (isOnesie ? OnesieRequest.decode(payloadBuffer) : VideoPlaybackAbrRequest.decode(payloadBuffer));
      payload = sanitizeJson(raw);
    } catch (e) {
      payload = null;
      parseError = String(e);
    }

    const parts: UmpTracePart[] = [];
    const segmentMap = new Map<number, Segment>();

    let totalMediaSize = 0;

    try {
      const googUmp = new UmpReader(new CompositeBuffer([new Uint8Array(responseBuffer)]));

      googUmp.read((part) => {
        const partTypeName = UMPPartId[part.type] ?? `UNKNOWN_${part.type}`;
        const handler = umpPartHandlers.get(part.type);
        let data: unknown;

        try {
          data = handler
            ? sanitizeJson(handler(part))
            : (part.data.getLength() > 0 ? u8ToBase64(part.data.chunks[0]) : '');
        } catch {
          data = null;
        }

        if (partTypeName === 'MEDIA_HEADER' || partTypeName === 'MEDIA' || partTypeName === 'MEDIA_END') {
          const dataRecord = data as Record<string, unknown>;
          const headerId = typeof dataRecord?.headerId === 'number' ? dataRecord.headerId : 0;

          if (!segmentMap.has(headerId)) {
            segmentMap.set(headerId, { headerId, parts: [], totalSize: 0 });
          }

          const segment = segmentMap.get(headerId)!;
          segment.parts.push({ type: partTypeName, data });

          if (partTypeName === 'MEDIA') {
            const size = typeof dataRecord?.size === 'number' ? dataRecord.size : 0;
            segment.totalSize += size;
            totalMediaSize += size;
          }
        } else {
          parts.push({ type: partTypeName, data });
        }
      });
    } catch (e) {
      if (!parseError) parseError = String(e);
    }

    emitTrace({
      id: `${Date.now()}-${++traceCounter}`,
      timestamp: Date.now(),
      url,
      pathname: requestURL.pathname,
      isOnesie,
      payload,
      parts,
      segments: Array.from(segmentMap.values()),
      totalMediaSize,
      parseError
    });

  } catch (error) {
    console.error(
      '%cump-inspector%c - an unexpected error occurred while processing UMP response.',
      'background-color: #dc3545; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
      'background-color: transparent; color: inherit;',
      error
    );
  }
}