"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// @ts-ignore
const stremio_addon_sdk_1 = require("stremio-addon-sdk");
const addon_1 = __importDefault(require("./addon"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT, 10) || 7000;
app.get('/', (req, res) => {
    res.redirect('/manifest.json');
});
(0, stremio_addon_sdk_1.serveHTTP)(addon_1.default, { port: PORT });
console.log(`Manga Add-on Server running at http://127.0.0.1:${PORT}`);
console.log(`Manifest URL: http://127.0.0.1:${PORT}/manifest.json`);
