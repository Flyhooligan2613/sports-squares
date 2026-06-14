/**
 * Generate VAPID keys for Web Push.
 * Usage: npm run push:generate-vapid
 *
 * Add output to .env.local and Vercel:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
 *   VAPID_PUBLIC_KEY=... (same value)
 *   VAPID_PRIVATE_KEY=...
 *   VAPID_SUBJECT=mailto:support@squareboards.pro
 */
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("");
console.log("SquareBoards Web Push — VAPID keys");
console.log("====================================");
console.log("");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log("VAPID_SUBJECT=mailto:support@squareboards.pro");
console.log("");
console.log("Add these to .env.local and Vercel Environment Variables, then redeploy.");
console.log("");
