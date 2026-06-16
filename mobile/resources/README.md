# SquareBoards Capacitor assets

Source branding from the web app:

- `icon.png` — copied from `public/apple-touch-icon.png` (1024×1024 grid logo on `#020617`)
- `splash.png` — same logo placeholder until a dedicated splash is designed

Regenerate native icon/splash sizes:

```bash
npm run mobile:icons
npm run cap:sync
```

Optional: replace `splash.png` with a 2732×2732 centered logo on `#020617` for store-quality launch screens.
