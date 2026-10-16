# CH-54B iPad offline web app

This folder contains an installable, offline-capable version of `VR101.html`.

## Important hosting requirement

The app must be served from an HTTPS website so Safari can install its service worker. Opening `index.html` as a local file, from a OneDrive preview, or from a Google Drive preview will not enable offline-app installation.

## Publish with GitHub Pages\r\n\r\nGitHub Pages can serve this package over HTTPS, which is required for the offline cache. On a free GitHub account, the repository and published site must be public; the HTML source and embedded performance tables will be visible to anyone. Do not publish if that content must remain private.\r\n\r\n1. Create a new **public** GitHub repository.\r\n2. Upload every file from this folder to the repository root (not the ZIP itself).\r\n3. In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/(root)`, then save.\r\n4. Wait for GitHub Pages to publish the site URL.\r\n\r\n## Install on iPad

1. Publish the complete contents of this folder to an HTTPS static website. Keep `index.html`, `manifest.webmanifest`, `service-worker.js`, and the PNG icons together in the same folder.
2. On the iPad, open the website's `index.html` URL in Safari while online and wait for the calculator to load.
3. Tap Safari's Share button, choose **Add to Home Screen**, and add it.
4. Open the new CH-54B icon once while online. After that initial load, the service worker caches the calculator and its icons for offline use.
5. To confirm offline use, open the Home Screen app once, then enable Airplane Mode and reopen it.

## Data and privacy

The calculator sends no entered values to the host. Form entries are saved by the browser on that device. The browser fetches the app files from the host when online and uses the service-worker cache when offline. The website host will contain the calculator's HTML and embedded performance tables; use an access-controlled host if those should not be public.

A new release requires uploading the updated files and increasing `CACHE_NAME` in `service-worker.js` so installed copies refresh cleanly.
