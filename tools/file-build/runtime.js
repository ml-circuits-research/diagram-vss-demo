// Model files are supplied by classic scripts in this generated snapshot, never by file fetch.
(function () {
  const root = new URL(document.baseURI), files = new Map(), pending = new Map();
  const nativeFetch = globalThis.fetch.bind(globalThis);
  globalThis.SOPLocalData = (key, base64) => files.set(key, base64);
  const load = (key, record) => {
    if (!pending.has(key)) pending.set(key, new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL('file/' + record.script, root).href;
      script.onload = () => { script.remove(); files.has(key) ? resolve() : reject(new Error('Missing local payload: ' + key)); };
      script.onerror = () => { script.remove(); pending.delete(key); reject(new Error('Missing local snapshot asset: ' + key + '. Rebuild the file package.')); };
      document.head.append(script);
    }));
    return pending.get(key);
  };
  globalThis.fetch = async function (input, init = {}) {
    const url = new URL(input instanceof Request ? input.url : String(input), document.baseURI);
    if (url.protocol !== 'file:') return nativeFetch(input, init);
    if (!url.pathname.startsWith(root.pathname)) throw new Error('File is outside the local snapshot: ' + url.href);
    const key = decodeURIComponent(url.pathname.slice(root.pathname.length));
    const record = SOPLocalManifest.files[key];
    if (!record) return new Response('Not included in this local snapshot: ' + key, { status: 404 });
    const method = (init.method || (input instanceof Request && input.method) || 'GET').toUpperCase();
    const headers = { 'Content-Type': record.type, 'Content-Length': String(record.bytes) };
    if (method === 'HEAD') return new Response(null, { headers });
    if (method !== 'GET') return new Response(null, { status: 405 });
    const signal = init.signal || (input instanceof Request && input.signal);
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await load(key, record);
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const bytes = Uint8Array.from(atob(files.get(key)), c => c.charCodeAt(0));
    return new Response(bytes, { headers });
  };
})();
