# X Pic Grabber

Paste an X post link, get its images, optionally auto-save them to Google Drive.

## One-time Google setup (Drive saving)
1. Go to https://console.cloud.google.com, create a project.
2. APIs & Services → Library → enable **Google Drive API**.
3. APIs & Services → OAuth consent screen → External, fill in app name/email, add yourself under **Test users**.
4. Credentials → Create credentials → **OAuth client ID** → type **Web application**.
   Under **Authorized JavaScript origins** add `https://<you>.github.io` (origin only, no path).
5. Copy the Client ID into the app's *Google Drive settings*.

Scope used is `drive` (full access), so the app finds folders you made by hand and saves into them; any
missing folder in the configured path is created. It's a restricted scope, so Google shows an
"unverified app" warning — fine for personal use as a Test user. If you used an older version you'll be
asked to consent again.

## Folder parameter
- Default folder is set in settings. `{user}` is replaced with the post author, e.g. `XPic/{user}`.
- Override per visit: `https://<you>.github.io/<repo>/?folder=Memes/Cats`
- Skip auto-save for a visit: `?auto=0`
- Android share target keeps these params only if you put them in the URL you open, not in the share.

## Layout
- `index.html`, `sw.js`, `manifest.webmanifest`, `icon-*.png`: the PWA (served from the repo root)
- `cli/xpic.mjs`: standalone terminal version, `node cli/xpic.mjs <link>` saves to `cli/downloads/`
- `tools/make-icons.mjs`: regenerates the icons, run `node tools/make-icons.mjs` from the root

## Run locally
`npm start`, then open http://localhost:8080 (add that origin to your OAuth client to test Drive).

## Deploy
Push this repo to GitHub, enable Pages (main branch, root).
Bump `VERSION` in `sw.js` whenever you change the app so installed copies update.
