// HTTP keeps the normal modules. Direct file opening uses the generated local snapshot.
if (location.protocol === 'file:') {
  const probe = document.createElement('script');
  probe.src = new URL('file/build-info.js', document.baseURI).href;
  probe.onload = () => location.replace(new URL('file/index.html' + location.search + location.hash, document.baseURI).href);
  probe.onerror = () => document.addEventListener('DOMContentLoaded', () => {
    const notice = document.createElement('div');
    notice.setAttribute('role', 'alert');
    notice.style.cssText = 'position:fixed;inset:12px 12px auto;z-index:10000;background:#fff3cd;color:#222;padding:16px;border:1px solid #b88900';
    notice.textContent = 'Direct file opening needs the local build. From the project root run: npm ci --prefix tools/file-build && npm run build --prefix tools/file-build. Then reopen this page.';
    document.body.append(notice);
  });
  document.head.append(probe);
}
