import { processUmpResponse } from './processor';
import { isGoogleVideoRequest } from '../helpers';

const originalFetch = window.fetch;

window.fetch = function (input: RequestInfo | URL, init: RequestInit | undefined) {
  const url = (input instanceof Request) ? input.url : input.toString();
  const method= (input instanceof Request) ? input.method : (init && init.method) ? init.method : 'GET';
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