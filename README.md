# X-PIC

Paste an X, Pixiv or YouTube link (YouTube gives the video thumbnail), get its images, optionally auto-save them to Google Drive.

## Bookmarklet (Reddit, Weibo, Bilibili and rednote)
It can't be fetched from a pasted link (login wall)

### Desktop Browser
1. Drag the **XPIC** bookmarklet from *Settings* to your bookmarks bar.
2. Click it while viewing a post.

### Android Browser (idk if it works on apple stuff or not)
1. Tap the **copy bookmarklet** button in the *Settings*.
2. Make a new bookmark on any page, then manually edit that bookmark.
3. While viewing a post, update the address bar to the bookmark you just created from step 2 (don't just copy paste the content on the bookmarklet into the address bar, it won't work.)

## One-time Google setup (Drive saving)
1. Go to https://console.cloud.google.com, create a project.
2. APIs & Services → Library → enable **Google Drive API**.
3. APIs & Services → OAuth consent screen → External, fill in app name/email, add yourself under **Test users**.
4. Credentials → Create credentials → **OAuth client ID** → type **Web application**.
   Under **Authorized JavaScript origins** add `https://<you>.github.io` (origin only, no path).
5. Copy the Client ID into the app's *Settings*.

### Adding new email
1. Follow the same step 1-3.
2. In step 3 on OAuth consent screen, go to Audience menu on the sidebar.
3. Click the *Add users* button.

Scope used is `drive` (full access), so the app finds folders you made by hand and saves into them; any
missing folder in the configured path is created. It's a restricted scope, so Google shows an
"unverified app" warning — fine for personal use as a Test user. If you used an older version you'll be
asked to consent again.

## Image proxy (Cloudflare Worker, optional)
Needed to save Reddit, rednote and Weibo images to Drive: their image hosts don't send CORS headers, so the browser can't download them directly. The worker in `worker/image-proxy.js` fetches them for you. The free plan is plenty.

1. Sign up at https://dash.cloudflare.com (free).
2. Workers & Pages → **Create** → **Create Worker**, name it e.g. `xpic-proxy`, click **Deploy**.
3. Click **Edit code**, replace everything with the contents of `worker/image-proxy.js`.
4. Change `ORIGINS` at the top to your own Pages origin (origin only, no path), e.g. `https://<you>.github.io`. Only these pages can use the proxy.
5. Click **Deploy**.
6. Copy the worker URL (`https://xpic-proxy.<you>.workers.dev/`) into *Settings* → **Image proxy URL**.

Or with the CLI: `npx wrangler deploy worker/image-proxy.js --name xpic-proxy --compatibility-date 2024-01-01`.

To test locally, add `http://localhost:8080` to `ORIGINS` too. The worker only fetches images from `redd.it`, `xhscdn.com`, `rednotecdn.com` and `sinaimg.cn`; edit `HOSTS` to allow others.

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
