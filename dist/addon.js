"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stremio_addon_sdk_1 = require("stremio-addon-sdk");
const MangaDexAdapter_1 = require("./adapters/MangaDexAdapter");
const mangaDex = new MangaDexAdapter_1.MangaDexAdapter();
const manifest = {
    id: 'org.harbor.manga.repository',
    version: '1.0.0',
    name: 'Harbor Manga Repository',
    description: 'Serverless Manga Add-on Repository for Harbor with MangaDex support.',
    resources: ['catalog', 'meta', 'stream'],
    types: ['series'], // We map Manga to 'series'
    idPrefixes: ['mdex_'], // Prefix for MangaDex IDs
    catalogs: [
        {
            type: 'series',
            id: 'mangadex_popular',
            name: 'MangaDex Popular',
        },
        {
            type: 'series',
            id: 'mangadex_search',
            name: 'MangaDex Search',
            extra: [{ name: 'search', isRequired: true }]
        }
    ],
};
const builder = new stremio_addon_sdk_1.addonBuilder(manifest);
builder.defineCatalogHandler(async ({ type, id, extra }) => {
    if (type === 'series') {
        if (id === 'mangadex_search' && extra.search) {
            const results = await mangaDex.search(extra.search);
            return {
                metas: results.map(r => ({
                    id: `mdex_${r.id}`,
                    type: 'series',
                    name: r.title,
                    poster: r.posterUrl,
                }))
            };
        }
        else if (id === 'mangadex_popular') {
            const skip = extra.skip || 0;
            const results = await mangaDex.getPopular(skip);
            return {
                metas: results.map(r => ({
                    id: `mdex_${r.id}`,
                    type: 'series',
                    name: r.title,
                    poster: r.posterUrl,
                }))
            };
        }
    }
    return { metas: [] };
});
builder.defineMetaHandler(async ({ type, id }) => {
    if (type === 'series' && id.startsWith('mdex_')) {
        const realId = id.replace('mdex_', '');
        const details = await mangaDex.getMangaDetails(realId);
        return {
            meta: {
                id: id,
                type: 'series',
                name: details.title,
                description: details.description,
                poster: details.posterUrl,
                genres: details.genres,
                status: details.status,
                videos: details.chapters.map(ch => ({
                    id: `mdex_ch_${ch.id}`,
                    title: ch.title,
                    season: 1,
                    episode: ch.chapterNumber,
                    released: ch.publishedAt
                }))
            }
        };
    }
    return { meta: {} };
});
builder.defineStreamHandler(async ({ type, id }) => {
    if (type === 'series' && id.startsWith('mdex_ch_')) {
        const chapterId = id.replace('mdex_ch_', '');
        const streams = await mangaDex.getChapterStream(chapterId);
        return {
            streams: streams.map(s => ({
                title: s.title,
                externalUrl: s.url, // Harbor will open this or use an internal reader if implemented
            }))
        };
    }
    return { streams: [] };
});
exports.default = builder.getInterface();
