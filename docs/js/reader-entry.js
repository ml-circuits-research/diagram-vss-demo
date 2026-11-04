// The local snapshot has its own bundled entry; HTTP keeps native browser modules.
if (location.protocol !== 'file:') {
  const canonical = document.createElement('script');
  canonical.type = 'module'; canonical.src = new URL('js/bench-canon.js', document.baseURI).href;
  const start = () => { const ui = document.createElement('script'); ui.src = new URL('js/ui.js', document.baseURI).href; document.body.append(ui); };
  canonical.onload = start;
  canonical.onerror = start;
  document.body.append(canonical);
}
