"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaDexAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const BaseMangaAdapter_1 = require("../core/BaseMangaAdapter");
class MangaDexAdapter extends BaseMangaAdapter_1.BaseMangaAdapter {
    baseUrl = 'https://api.mangadex.org';
    constructor() {
        super('MangaDex');
    }
    async search(query) {
        const response = await axios_1.default.get(`${this.baseUrl}/manga`, {
            params: {
                title: query,
                limit: 10,
                includes: ['cover_art'],
            },
        });
        return response.data.data.map((item) => this.mapToSearchResult(item));
    }
    async getPopular(skip = 0) {
        const response = await axios_1.default.get(`${this.baseUrl}/manga`, {
            params: {
                limit: 20,
                offset: skip,
                includes: ['cover_art'],
                'order[followedCount]': 'desc', // A way to get popular manga on MangaDex
            },
        });
        return response.data.data.map((item) => this.mapToSearchResult(item));
    }
    async getMangaDetails(id) {
        // Fetch manga info
        const mangaRes = await axios_1.default.get(`${this.baseUrl}/manga/${id}`, {
            params: {
                includes: ['cover_art', 'author'],
            }
        });
        const manga = mangaRes.data.data;
        // Fetch chapters (simplified: english only, limited to 100 for example purposes)
        const chaptersRes = await axios_1.default.get(`${this.baseUrl}/manga/${id}/feed`, {
            params: {
                limit: 100,
                translatedLanguage: ['en'],
                order: { chapter: 'asc' },
            }
        });
        const chapters = chaptersRes.data.data.map((ch) => ({
            id: ch.id,
            title: ch.attributes.title || `Chapter ${ch.attributes.chapter}`,
            chapterNumber: parseFloat(ch.attributes.chapter) || 0,
            publishedAt: ch.attributes.publishAt,
        }));
        let posterUrl = '';
        const coverRel = manga.relationships.find((rel) => rel.type === 'cover_art');
        if (coverRel && coverRel.attributes) {
            posterUrl = `https://uploads.mangadex.org/covers/${id}/${coverRel.attributes.fileName}`;
        }
        return {
            id: manga.id,
            title: manga.attributes.title.en || Object.values(manga.attributes.title)[0] || 'Unknown',
            description: manga.attributes.description.en || 'No description',
            posterUrl,
            genres: manga.attributes.tags.map((tag) => tag.attributes.name.en),
            status: manga.attributes.status,
            chapters,
        };
    }
    async getChapterStream(chapterId) {
        // To stream a MangaDex chapter, we usually need to hit the /at-home/server endpoint
        // For Stremio, a stream usually resolves to a video URL or an external URL. 
        // We will provide a reading URL or encode the images depending on how Harbor reads them.
        // For now, we will provide the external URL to read on MangaDex, as Stremio addons often 
        // use external URLs for non-video content if the client supports it.
        return [
            {
                title: `Read on MangaDex`,
                url: `https://mangadex.org/chapter/${chapterId}`,
            }
        ];
    }
    mapToSearchResult(item) {
        let posterUrl = '';
        const coverRel = item.relationships.find((rel) => rel.type === 'cover_art');
        if (coverRel && coverRel.attributes) {
            posterUrl = `https://uploads.mangadex.org/covers/${item.id}/${coverRel.attributes.fileName}`;
        }
        return {
            id: item.id,
            title: item.attributes.title.en || Object.values(item.attributes.title)[0] || 'Unknown',
            posterUrl,
            type: 'series',
        };
    }
}
exports.MangaDexAdapter = MangaDexAdapter;
