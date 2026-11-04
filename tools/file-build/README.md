# Opening the editor with file://

Build the local snapshot from the repository root with Node.js and npm:

```sh
npm ci --prefix tools/file-build
npm run build --prefix tools/file-build
```

Open `docs/index.html` directly in the browser. It redirects to `docs/file/index.html` when opened with `file://`. HTTP continues to use native modules and model files.

The generated snapshot bundles the local JavaScript modules and packages model and example files as lazily loaded classic scripts. Model bytes, confidence thresholds, and reader decisions are unchanged. `docs/file/manifest.json` records the source paths, sizes, and SHA-256 hashes. The generated folder is approximately 130 MB and is ignored by Git. Rebuild after changing source code, models, confidence files, or example references; refresh the browser afterward.

This supports direct local opening, not fully offline operation: the pinned Transformers.js library and its WASM runtime still load from the internet. No browser security flags are needed. Local modules and fetch requests need this packaging because browsers restrict access to file URLs; see the [MDN module guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

## Browser verification

```sh
npm test --prefix tools/file-build
```

The test uses `/usr/bin/google-chrome` by default; set `CHROME_PATH` for another Chromium executable. It loads the actual models, waits for confidence files and the first end-to-end check, exercises all 35 scenario references and 13 quick examples, checks the Expected tab's Drawing/SOP Lang/Text views and existing view controls, and checks HTTP startup. Logs, result JSON, and screenshots are retained under `tmp/file-support/`. These checks validate loading and UI behavior, not reader accuracy.

Run `npm run test:help --prefix tools/file-build` for the Help navigation regression. It checks every Help page, browser history, closing, direct section links, all Expected subtabs, and the mobile menu under both `file://` and HTTP. Model downloads are disabled for this UI-only test. Its artifacts remain in `tmp/help-navigation/`.
