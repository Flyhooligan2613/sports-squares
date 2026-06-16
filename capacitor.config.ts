import type { CapacitorConfig } from "@capacitor/cli";

const isDev = process.env.CAPACITOR_DEV === "1";

const productionUrl = "https://www.squareboards.pro";
const devUrl = process.env.CAPACITOR_DEV_URL ?? "http://localhost:3000";

const config: CapacitorConfig = {
  appId: "com.squareboards.app",
  appName: "SquareBoards",
  webDir: "mobile/www",
  server: isDev
    ? {
        url: devUrl,
        cleartext: true,
        androidScheme: "http",
        allowNavigation: [
          "localhost",
          "127.0.0.1",
          "10.0.2.2",
          "*.squareboards.pro",
          "squareboards.pro",
          "*.stripe.com",
          "*.supabase.co",
        ],
      }
    : {
        url: productionUrl,
        androidScheme: "https",
        allowNavigation: [
          "*.squareboards.pro",
          "squareboards.pro",
          "*.stripe.com",
          "*.supabase.co",
          "checkout.stripe.com",
        ],
      },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#020617",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  android: {
    allowMixedContent: isDev,
  },
};

export default config;
