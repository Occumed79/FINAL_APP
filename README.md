# Occu-Med Desktop

A separate static desktop that opens existing Occu-Med Render apps in movable, resizable windows. Larger 76px SmoothUI Dock icons magnify to 114px. The Applications window and Spotlight expose the complete app list. No database or changes to existing services are required.

## Run

Node 22.12+; `npm ci`, then `npm run dev`. Production: `npm run build`; publish `dist` on Render as a static site. Build command: `npm ci && npm run build`.

## Sources

- Dock: SmoothUI, https://smoothui.dev/docs/components/dock, installed from https://smoothui.dev/r/dock.json. Component code is MIT, Copyright Eduardo Calvo; license in `src/components/SmoothUI.LICENSE`.
- Window manager, traffic-light controls, menu bar, resize/drag/minimize/maximize, Spotlight and keyboard handling: https://github.com/saschb2b/react-ui-os at `36642e509e9ad5485763904fcfc09b00d95cee3d`. MIT, Copyright Sascha Becker. The compiled vendor file retains the original implementation. Rebuild with `npm run vendor`; `REACT_UI_OS_SOURCE` may point to that exact checkout. License in `src/vendor/react-ui-os.LICENSE`.
- Demonstration icon pack: SmoothUI's ImageKit-hosted macOS app icons. Apple marks are used as visual desktop references, not claims that these Occu-Med apps are Apple products. Replace per-app artwork in `src/apps.js` when original app icons are available.
- Lake wallpaper: Engin Akyurt / Pexels, https://www.pexels.com/video/a-lake-by-the-mountains-2344549/ (Pexels license). Video and poster load from Pexels CDN; reduced motion uses the poster, hidden tabs pause playback, and the pause preference persists locally.

## Add and edit apps

Open Applications, click **Add app**, enter the app name and URL, choose an icon, and optionally pin it to the Dock. **Edit apps** changes names, URLs, icons and pins for existing entries. Saved entries persist in the same browser using localStorage; a storage failure is reported and the app remains available for that session. Added apps participate in Spotlight and the existing window manager. New pins are shown at the front of the Dock; all apps remain accessible from Applications on narrow screens.

The icon picker includes the existing Apple app artwork and 16 bundled Microsoft Fluent color icons for maps, clinics, laboratory work, supplies, forms, signing, pricing and other tools. Fluent SVGs are bundled locally from https://github.com/microsoft/fluentui-system-icons, with license in `src/components/FluentUI.LICENSE`. App labels and the editor keep dark readable text even when saved desktop settings use dark chrome.

## App configuration

Edit `src/apps.js` for existing URLs and pinned apps. Older duplicate and suspended services are intentionally not registered. Browser embedding and login depend on each app's existing headers and authentication. Every window provides Reload, help, and Open in new tab. An iframe load event only means navigation finished; it cannot verify cross-origin app health. This shell never reads or forwards app credentials.
