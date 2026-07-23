import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const htmlPath = resolve(root, "outputs/snake-game.html");
const assetsPath = resolve(root, "outputs/assets");
const html = readFileSync(htmlPath, "utf8");
const referenced = new Set([...html.matchAll(/assets\/([^"'\s)]+\.(?:png|webp|jpg|jpeg))/gi)].map(match => match[1]));
const assets = readdirSync(assetsPath).filter(file => /\.(png|webp|jpg|jpeg)$/i.test(file));
const bytes = files => files.reduce((sum, file) => sum + statSync(resolve(assetsPath, file)).size, 0);
const unused = assets.filter(file => !referenced.has(file));

console.log(`Referenced image files: ${referenced.size}`);
console.log(`Asset files on disk: ${assets.length}`);
console.log(`Referenced size: ${(bytes([...referenced].map(file => basename(file))) / 1024 / 1024).toFixed(1)} MB`);
console.log(`Archive candidates: ${unused.length} (${(bytes(unused) / 1024 / 1024).toFixed(1)} MB)`);
if (unused.length) console.log(`Archive candidates: ${unused.join(", ")}`);
