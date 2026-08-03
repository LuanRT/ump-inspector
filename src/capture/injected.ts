import { processUmpResponse } from './processor';
import { isGoogleVideoRequest } from '../helpers';
import { registerCommandHandlers } from '../bridge';
import type { WebPoClient } from '../types';

//#region Fetch and XHR interception
const originalFetch = window.fetch;

window.fetch = function (input: RequestInfo | URL, init: RequestInit | undefined) {
  const url = (input instanceof Request) ? input.url : input.toString();
  const method = (input instanceof Request) ? input.method : (init && init.method) ? init.method : 'GET';
  const isPost = method.toUpperCase() === 'POST';

  if (isGoogleVideoRequest(url) && isPost) {
    let requestClone: Request | undefined;

    if (input instanceof Request) {
      requestClone = input.clone();
    }

    return originalFetch(input, init).then((response) => {
      try {
        (async () => {
          const clonedResponse = response.clone();
          const requestBody = await (input instanceof Request ? requestClone!.arrayBuffer() : Promise.resolve(init!.body)) as ArrayBuffer;
          const responseBody = await clonedResponse.arrayBuffer();
          processUmpResponse(url, requestBody, responseBody);
        })();
      } catch (e) {
        console.error(
          '%cump-inspector%c - error processing fetch response.',
          'background-color: #dc3545; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
          'background-color: transparent; color: inherit;',
          e
        );
      }
      return response;
    });
  }

  return originalFetch(input, init);
};

const originalXhrOpen = XMLHttpRequest.prototype.open;
const originalXhrSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function (method, url) {
  this._method = method;
  this._url = url.toString();
  originalXhrOpen.apply(this, arguments as any);
};

XMLHttpRequest.prototype.send = function (body) {
  const isGoogleVideo = this._url && isGoogleVideoRequest(this._url);
  const isPost = this._method && this._method.toUpperCase() === 'POST';

  if (isGoogleVideo && isPost) {
    this.addEventListener('load', () => {
      if (this.response && this._url) {
        const requestBody = body as ArrayBuffer;
        const responseBody = this.response;
        processUmpResponse(this._url, requestBody, responseBody);
      }
    });
  }
  originalXhrSend.apply(this, arguments as any);
};
//#endregion

//#region WebPoClient handling
let webPoClient: WebPoClient;

registerCommandHandlers('injected', {
  'webpo-client-presence': async () => {
    const windowTop = window.top as Window & { [key: string]: any };
  
    let webPoClientKey: string | undefined = 'havuokmhhs-0';

    // NOTE (observed on ytmusic): 
    // Anything other than the first key seems to be a static WebPO client (only returns one potoken no matter the content binding).
    if (!(webPoClientKey in windowTop)) {
      webPoClientKey = Object.keys(windowTop).find((key) => key.startsWith('havuokmhhs'));
    }

    if (webPoClientKey && webPoClientKey in windowTop) {
      webPoClient = await windowTop[webPoClientKey as keyof Window].bevasrs.wpc();
      return true;
    }

    return false;
  },
  'mint-webpo': async (payload) => {
    let webpo: string | undefined;

    try {
      webpo = await webPoClient.mws({
        c: payload.contentBinding,
        mc: payload.mintColdStartTokens,
        me: payload.mintErrorTokens
      });
    } catch (e) {
      return { error: (e instanceof Error) ? e.message : 'Unknown error occurred while minting WEBPO token.' };
    }

    if (!webpo) {
      return { error: 'Tried to mint WebPO token, but got no response from the WebPoClient.' };
    }

    return { webpo };
  }
});
//#endregion